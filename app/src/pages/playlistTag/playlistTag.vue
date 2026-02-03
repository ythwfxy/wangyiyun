<template>
  <div class="playlist-tag-page">
    <div class="page-header">
      <h2 class="page-title">歌单标签管理</h2>
      <p class="page-desc">为歌单添加自定义标签，方便分类管理</p>
    </div>

    <div class="content-wrapper">
      <div class="tag-section">
        <div class="section-header">
          <h3>标签列表</h3>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddTagDialog">
            新建标签
          </el-button>
        </div>

        <div class="tag-list" v-if="tags.length > 0">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            :style="{ backgroundColor: tag.color + '20', borderColor: tag.color }"
            :class="{ active: selectedTagId === tag.id }"
            @click="selectTag(tag.id)"
          >
            <span class="tag-name" :style="{ color: tag.color }">{{ tag.name }}</span>
            <span class="tag-count" v-if="getTagPlaylistCount(tag.id) > 0">
              {{ getTagPlaylistCount(tag.id) }}
            </span>
            <div class="tag-actions">
              <i class="el-icon-edit" @click.stop="editTag(tag)"></i>
              <i class="el-icon-delete" @click.stop="deleteTag(tag.id)"></i>
            </div>
          </div>
        </div>
        <div class="empty-tags" v-else>
          <i class="el-icon-collection-tag"></i>
          <p>暂无标签，点击上方按钮创建</p>
        </div>
      </div>

      <div class="playlist-section">
        <div class="section-header">
          <h3>{{ selectedTagId ? '已绑定歌单' : '全部歌单' }}</h3>
          <div class="filter-actions">
            <el-button
              v-if="selectedTagId"
              size="small"
              @click="clearTagFilter"
            >
              清除筛选
            </el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-connection"
              @click="showBatchBindDialog"
              :disabled="!selectedTagId"
            >
              批量绑定
            </el-button>
          </div>
        </div>

        <div class="playlist-grid" v-if="filteredPlaylists.length > 0">
          <div
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="playlist-card"
            @click="toPlaylistDetail(playlist.id)"
          >
            <div class="playlist-cover">
              <img :src="playlist.coverImgUrl || playlist.picUrl || defaultCover" alt="">
              <div class="playlist-overlay">
                <i class="el-icon-video-play"></i>
              </div>
            </div>
            <div class="playlist-info">
              <h4 class="playlist-name">{{ playlist.name }}</h4>
              <p class="playlist-count">{{ playlist.trackCount || 0 }}首</p>
              <div class="playlist-tags">
                <span
                  v-for="tagId in getPlaylistTags(playlist.id)"
                  :key="tagId"
                  class="mini-tag"
                  :style="{ backgroundColor: getTagColor(tagId) }"
                >
                  {{ getTagName(tagId) }}
                </span>
              </div>
            </div>
            <div class="playlist-actions" @click.stop>
              <el-dropdown trigger="click" @command="handleTagCommand($event, playlist.id)">
                <span class="el-dropdown-link">
                  <i class="el-icon-s-operation"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="manage">管理标签</el-dropdown-item>
                  <el-dropdown-item divided v-if="getPlaylistTags(playlist.id).length > 0">
                    <span class="dropdown-subtitle">已绑定标签:</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-for="tagId in getPlaylistTags(playlist.id)"
                    :key="tagId"
                    :command="{ action: 'unbind', tagId }"
                  >
                    <span class="unbind-item">
                      <i class="el-icon-close"></i>
                      {{ getTagName(tagId) }}
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
        <div class="empty-playlists" v-else>
          <i class="el-icon-folder-opened"></i>
          <p>{{ selectedTagId ? '该标签下暂无歌单' : '暂无歌单' }}</p>
        </div>
      </div>
    </div>

    <el-dialog
      :title="isEdit ? '编辑标签' : '新建标签'"
      :visible.sync="tagDialogVisible"
      width="400px"
    >
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <div
              v-for="color in presetColors"
              :key="color"
              class="color-item"
              :style="{ backgroundColor: color }"
              :class="{ selected: tagForm.color === color }"
              @click="tagForm.color = color"
            ></div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="批量绑定标签"
      :visible.sync="batchBindVisible"
      width="500px"
    >
      <div class="batch-bind-content">
        <p class="bind-hint">选择要绑定「{{ getTagName(selectedTagId) }}」标签的歌单：</p>
        <el-checkbox-group v-model="selectedPlaylistsForBind">
          <el-checkbox
            v-for="playlist in unboundPlaylists"
            :key="playlist.id"
            :label="playlist.id"
            class="playlist-checkbox"
          >
            <img :src="playlist.coverImgUrl || playlist.picUrl || defaultCover" class="checkbox-img">
            <span>{{ playlist.name }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer">
        <el-button @click="batchBindVisible = false">取消</el-button>
        <el-button type="primary" @click="batchBindTag" :disabled="selectedPlaylistsForBind.length === 0">
          绑定选中歌单 ({{ selectedPlaylistsForBind.length }})
        </el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="管理标签"
      :visible.sync="manageTagVisible"
      width="400px"
    >
      <div class="manage-tag-content">
        <p class="manage-hint">为歌单绑定或解绑标签：</p>
        <el-checkbox-group v-model="currentPlaylistTags">
          <el-checkbox
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.id"
            class="tag-checkbox"
          >
            <span
              class="tag-dot"
              :style="{ backgroundColor: tag.color }"
            ></span>
            {{ tag.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer">
        <el-button @click="manageTagVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlaylistTags">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const STORAGE_KEY = 'playlist_tags'
const BINDING_KEY = 'playlist_tag_bindings'

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
]

export default {
  name: 'PlaylistTag',
  data() {
    return {
      tags: [],
      bindings: {},
      selectedTagId: null,
      tagDialogVisible: false,
      batchBindVisible: false,
      manageTagVisible: false,
      isEdit: false,
      editingTagId: null,
      tagForm: {
        name: '',
        color: PRESET_COLORS[0]
      },
      presetColors: PRESET_COLORS,
      defaultCover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
      selectedPlaylistsForBind: [],
      currentPlaylistId: null,
      currentPlaylistTags: []
    }
  },
  computed: {
    ...mapState(['personalList']),
    filteredPlaylists() {
      if (!this.selectedTagId) {
        return this.personalList || []
      }
      const playlistIds = this.bindings[this.selectedTagId] || []
      return (this.personalList || []).filter(p => playlistIds.includes(p.id))
    },
    unboundPlaylists() {
      if (!this.selectedTagId) return []
      const boundIds = this.bindings[this.selectedTagId] || []
      return (this.personalList || []).filter(p => !boundIds.includes(p.id))
    }
  },
  mounted() {
    this.loadTags()
    this.loadBindings()
  },
  methods: {
    loadTags() {
      const stored = localStorage.getItem(STORAGE_KEY)
      this.tags = stored ? JSON.parse(stored) : []
    },
    saveTags() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tags))
    },
    loadBindings() {
      const stored = localStorage.getItem(BINDING_KEY)
      this.bindings = stored ? JSON.parse(stored) : {}
    },
    saveBindings() {
      localStorage.setItem(BINDING_KEY, JSON.stringify(this.bindings))
    },
    showAddTagDialog() {
      this.isEdit = false
      this.editingTagId = null
      this.tagForm = { name: '', color: PRESET_COLORS[0] }
      this.tagDialogVisible = true
    },
    editTag(tag) {
      this.isEdit = true
      this.editingTagId = tag.id
      this.tagForm = { name: tag.name, color: tag.color }
      this.tagDialogVisible = true
    },
    saveTag() {
      if (!this.tagForm.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }
      if (this.isEdit) {
        const index = this.tags.findIndex(t => t.id === this.editingTagId)
        if (index !== -1) {
          this.tags[index] = { ...this.tags[index], ...this.tagForm }
        }
      } else {
        const newTag = {
          id: Date.now().toString(),
          ...this.tagForm
        }
        this.tags.push(newTag)
      }
      this.saveTags()
      this.tagDialogVisible = false
      this.$message.success(this.isEdit ? '标签修改成功' : '标签创建成功')
    },
    deleteTag(tagId) {
      this.$confirm('确定要删除该标签吗？绑定该标签的歌单将自动解绑。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tags = this.tags.filter(t => t.id !== tagId)
        delete this.bindings[tagId]
        if (this.selectedTagId === tagId) {
          this.selectedTagId = null
        }
        this.saveTags()
        this.saveBindings()
        this.$message.success('标签删除成功')
      })
    },
    selectTag(tagId) {
      this.selectedTagId = this.selectedTagId === tagId ? null : tagId
    },
    clearTagFilter() {
      this.selectedTagId = null
    },
    getTagPlaylistCount(tagId) {
      const playlistIds = this.bindings[tagId] || []
      return playlistIds.length
    },
    getPlaylistTags(playlistId) {
      const tags = []
      for (const [tagId, playlistIds] of Object.entries(this.bindings)) {
        if (playlistIds.includes(playlistId)) {
          tags.push(tagId)
        }
      }
      return tags
    },
    getTagName(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.name : ''
    },
    getTagColor(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.color : '#999'
    },
    showBatchBindDialog() {
      if (!this.selectedTagId) {
        this.$message.warning('请先选择一个标签')
        return
      }
      this.selectedPlaylistsForBind = []
      this.batchBindVisible = true
    },
    batchBindTag() {
      if (!this.bindings[this.selectedTagId]) {
        this.bindings[this.selectedTagId] = []
      }
      this.bindings[this.selectedTagId].push(...this.selectedPlaylistsForBind)
      this.saveBindings()
      this.batchBindVisible = false
      this.$message.success(`成功绑定 ${this.selectedPlaylistsForBind.length} 个歌单`)
    },
    handleTagCommand(command, playlistId) {
      if (command === 'manage') {
        this.currentPlaylistId = playlistId
        this.currentPlaylistTags = this.getPlaylistTags(playlistId)
        this.manageTagVisible = true
      } else if (command.action === 'unbind') {
        this.unbindTag(command.tagId, playlistId)
      }
    },
    unbindTag(tagId, playlistId) {
      const playlistIds = this.bindings[tagId] || []
      const index = playlistIds.indexOf(playlistId)
      if (index > -1) {
        playlistIds.splice(index, 1)
        this.saveBindings()
        this.$message.success('标签解绑成功')
      }
    },
    savePlaylistTags() {
      for (const tagId of this.tags.map(t => t.id)) {
        if (!this.bindings[tagId]) {
          this.bindings[tagId] = []
        }
        const index = this.bindings[tagId].indexOf(this.currentPlaylistId)
        if (this.currentPlaylistTags.includes(tagId)) {
          if (index === -1) {
            this.bindings[tagId].push(this.currentPlaylistId)
          }
        } else {
          if (index > -1) {
            this.bindings[tagId].splice(index, 1)
          }
        }
      }
      this.saveBindings()
      this.manageTagVisible = false
      this.$message.success('标签绑定更新成功')
    },
    toPlaylistDetail(id) {
      this.$router.push(`/home/songList/${id}`)
    }
  }
}
</script>

<style scoped>
.playlist-tag-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.page-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.content-wrapper {
  display: flex;
  gap: 24px;
}

.tag-section {
  width: 280px;
  flex-shrink: 0;
}

.playlist-section {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tag-item:hover {
  transform: translateX(4px);
}

.tag-item.active {
  border-width: 2px;
  border-style: solid;
}

.tag-name {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.tag-count {
  font-size: 12px;
  color: #999;
  background: rgba(0,0,0,0.05);
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.tag-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tag-item:hover .tag-actions {
  opacity: 1;
}

.tag-actions i {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.tag-actions i:hover {
  background: rgba(0,0,0,0.1);
  color: #333;
}

.empty-tags,
.empty-playlists {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-tags i,
.empty-playlists i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-tags p,
.empty-playlists p {
  font-size: 14px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  margin-bottom: 8px;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.playlist-overlay i {
  font-size: 48px;
  color: #fff;
}

.playlist-info {
  padding: 0 4px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-count {
  font-size: 12px;
  color: #999;
  margin: 0 0 6px;
}

.playlist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mini-tag {
  font-size: 10px;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.playlist-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-actions {
  opacity: 1;
}

.el-dropdown-link {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.el-dropdown-link i {
  font-size: 16px;
  color: #333;
}

.dropdown-subtitle {
  font-size: 12px;
  color: #999;
  pointer-events: none;
}

.unbind-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.unbind-item i {
  font-size: 12px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.selected {
  border-color: #333;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #333;
}

.batch-bind-content,
.manage-tag-content {
  max-height: 400px;
  overflow-y: auto;
}

.bind-hint,
.manage-hint {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.playlist-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.playlist-checkbox span {
  margin-left: 8px;
  font-size: 14px;
}

.checkbox-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-left: 8px;
  margin-right: 8px;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
}

@media (max-width: 768px) {
  .playlist-tag-page {
    padding: 12px;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .tag-section {
    width: 100%;
  }

  .tag-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .tag-item {
    padding: 8px 12px;
  }

  .tag-actions {
    opacity: 1;
  }

  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .playlist-actions {
    opacity: 1;
  }

  .page-title {
    font-size: 20px;
  }

  .section-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .playlist-name {
    font-size: 12px;
  }
}
</style>
