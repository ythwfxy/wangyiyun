<template>
  <div class="playlist-tag-page">
    <div class="page-header">
      <h2>歌单标签管理</h2>
      <p class="subtitle">创建自定义标签，轻松管理您的歌单</p>
    </div>

    <div class="content-wrapper">
      <div class="tags-section">
        <div class="section-header">
          <h3>我的标签</h3>
          <el-button type="primary" size="small" @click="showAddTagDialog">
            <i class="el-icon-plus"></i> 新建标签
          </el-button>
        </div>

        <div class="tags-container">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            :class="{ active: selectedTagId === tag.id }"
            @click="selectTag(tag.id)"
          >
            <span
              class="tag-color"
              :style="{ backgroundColor: tag.color }"
            ></span>
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">({{ getTagPlaylistCount(tag.id) }})</span>
            <div class="tag-actions">
              <i class="el-icon-edit" @click.stop="showEditTagDialog(tag)"></i>
              <i class="el-icon-delete" @click.stop="deleteTag(tag.id)"></i>
            </div>
          </div>

          <div
            v-if="tags.length === 0"
            class="empty-tips"
          >
            <i class="el-icon-tickets"></i>
            <p>暂无标签，点击上方按钮创建您的第一个标签</p>
          </div>
        </div>
      </div>

      <div class="playlists-section">
        <div class="section-header">
          <h3>
            {{ selectedTagId ? (getTagById(selectedTagId)?.name || '全部歌单') : '全部歌单' }}
            <span v-if="selectedTagId" class="playlist-count">({{ filteredPlaylists.length }})</span>
          </h3>
          <el-button
            v-if="selectedTagId"
            type="text"
            size="small"
            @click="clearTagFilter"
          >
            查看全部
          </el-button>
        </div>

        <div class="playlists-grid">
          <div
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="playlist-card"
            @click="togglePlaylistTag(playlist.id)"
          >
            <div class="playlist-cover">
              <img :src="playlist.coverImgUrl" alt="">
              <div class="playlist-actions" v-if="selectedTagId">
                <i
                  :class="isPlaylistHasTag(playlist.id, selectedTagId) ? 'el-icon-check' : 'el-icon-plus'"
                ></i>
                <span>{{ isPlaylistHasTag(playlist.id, selectedTagId) ? '已绑定' : '绑定标签' }}</span>
              </div>
            </div>
            <div class="playlist-info">
              <h4 class="playlist-name">{{ playlist.name }}</h4>
              <p class="playlist-track">共 {{ playlist.trackCount }} 首</p>
              <div class="playlist-tags">
                <span
                  v-for="tagId in getPlaylistTags(playlist.id)"
                  :key="tagId"
                  class="mini-tag"
                  :style="{ backgroundColor: getTagById(tagId)?.color || '#ccc' }"
                >
                  {{ getTagById(tagId)?.name }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="filteredPlaylists.length === 0" class="empty-tips">
            <i class="el-icon-document-copy"></i>
            <p>{{ selectedTagId ? '该标签下暂无歌单' : '暂无歌单' }}</p>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="isEditTag ? '编辑标签' : '新建标签'"
      :visible.sync="tagDialogVisible"
      width="400px"
      class="tag-dialog"
    >
      <el-form :model="currentTag" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="currentTag.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ active: currentTag.color === color }"
              :style="{ backgroundColor: color }"
              @click="currentTag.color = color"
            ></div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const STORAGE_KEY = 'playlist_tags'
const RELATION_KEY = 'playlist_tag_relations'
const INIT_FLAG_KEY = 'playlist_tags_initialized'

const mockTags = [
  { id: 'tag_1', name: '通勤听', color: '#ff6b6b' },
  { id: 'tag_2', name: '睡前放松', color: '#5f27cd' },
  { id: 'tag_3', name: '运动燃曲', color: '#ff8e53' },
  { id: 'tag_4', name: '学习专注', color: '#1dd1a1' },
  { id: 'tag_5', name: '心情治愈', color: '#ff9ff3' }
]

const mockRelations = [
  { playlistId: 'mock_1', tagId: 'tag_1' },
  { playlistId: 'mock_2', tagId: 'tag_1' },
  { playlistId: 'mock_3', tagId: 'tag_1' },
  { playlistId: 'mock_4', tagId: 'tag_2' },
  { playlistId: 'mock_5', tagId: 'tag_2' },
  { playlistId: 'mock_6', tagId: 'tag_3' },
  { playlistId: 'mock_7', tagId: 'tag_3' },
  { playlistId: 'mock_8', tagId: 'tag_3' },
  { playlistId: 'mock_9', tagId: 'tag_4' },
  { playlistId: 'mock_10', tagId: 'tag_5' },
  { playlistId: 'mock_1', tagId: 'tag_3' },
  { playlistId: 'mock_4', tagId: 'tag_5' }
]

const mockPlaylists = [
  { id: 'mock_1', name: '早晨唤醒歌单', coverImgUrl: 'https://p2.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg', trackCount: 45 },
  { id: 'mock_2', name: '地铁时光', coverImgUrl: 'https://p2.music.126.net/BPl8s4fBPf8jKbKqJ6pQAA==/109951164266608866.jpg', trackCount: 32 },
  { id: 'mock_3', name: '公交上的风景', coverImgUrl: 'https://p2.music.126.net/sOiuFkSyPLkrSzh7z_P79Q==/109951164134365258.jpg', trackCount: 28 },
  { id: 'mock_4', name: '晚安曲', coverImgUrl: 'https://p2.music.126.net/BPl8s4fBPf8jKbKqJ6pQAA==/109951164266608866.jpg', trackCount: 25 },
  { id: 'mock_5', name: '深度睡眠', coverImgUrl: 'https://p2.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg', trackCount: 18 },
  { id: 'mock_6', name: '跑步必备', coverImgUrl: 'https://p2.music.126.net/sOiuFkSyPLkrSzh7z_P79Q==/109951164134365258.jpg', trackCount: 40 },
  { id: 'mock_7', name: '健身节拍', coverImgUrl: 'https://p2.music.126.net/BPl8s4fBPf8jKbKqJ6pQAA==/109951164266608866.jpg', trackCount: 35 },
  { id: 'mock_8', name: '动感单车', coverImgUrl: 'https://p2.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg', trackCount: 22 },
  { id: 'mock_9', name: '专注学习', coverImgUrl: 'https://p2.music.126.net/sOiuFkSyPLkrSzh7z_P79Q==/109951164134365258.jpg', trackCount: 50 },
  { id: 'mock_10', name: '治愈系', coverImgUrl: 'https://p2.music.126.net/BPl8s4fBPf8jKbKqJ6pQAA==/109951164266608866.jpg', trackCount: 28 }
]

export default {
  name: 'playlistTag',
  data() {
    return {
      tags: [],
      relations: [],
      selectedTagId: null,
      tagDialogVisible: false,
      isEditTag: false,
      currentTag: {
        id: '',
        name: '',
        color: '#ff6b6b'
      },
      colorOptions: [
        '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#1dd1a1',
        '#5f27cd', '#ff9ff3', '#54a0ff', '#00d2d3', '#636e72'
      ]
    }
  },
  computed: {
    ...mapState(['personalList']),
    allPlaylists() {
      return this.personalList && this.personalList.length > 0 
        ? this.personalList 
        : mockPlaylists
    },
    filteredPlaylists() {
      const playlists = this.allPlaylists
      if (!this.selectedTagId) {
        return playlists
      }
      return playlists.filter(p => this.isPlaylistHasTag(p.id, this.selectedTagId))
    }
  },
  created() {
    this.loadTagsFromStorage()
    this.loadRelationsFromStorage()
  },
  methods: {
    loadTagsFromStorage() {
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
          this.tags = JSON.parse(data)
        } else {
          this.tags = [...mockTags]
          this.saveTagsToStorage()
        }
      } catch (e) {
        this.tags = [...mockTags]
      }
    },

    saveTagsToStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tags))
    },

    loadRelationsFromStorage() {
      try {
        const data = localStorage.getItem(RELATION_KEY)
        if (data) {
          this.relations = JSON.parse(data)
        } else {
          this.initMockRelations()
        }
      } catch (e) {
        this.relations = []
      }
    },

    initMockRelations() {
      const playlists = this.personalList || []
      if (playlists.length > 0) {
        const relations = []
        playlists.forEach((playlist, index) => {
          const tagIndex = index % mockTags.length
          relations.push({
            playlistId: playlist.id,
            tagId: mockTags[tagIndex].id
          })
          if (index % 3 === 0 && index > 0) {
            const secondTagIndex = (tagIndex + 1) % mockTags.length
            relations.push({
              playlistId: playlist.id,
              tagId: mockTags[secondTagIndex].id
            })
          }
        })
        this.relations = relations
        this.saveRelationsToStorage()
      }
    },

    saveRelationsToStorage() {
      localStorage.setItem(RELATION_KEY, JSON.stringify(this.relations))
    },

    showAddTagDialog() {
      this.isEditTag = false
      this.currentTag = {
        id: '',
        name: '',
        color: '#ff6b6b'
      }
      this.tagDialogVisible = true
    },

    showEditTagDialog(tag) {
      this.isEditTag = true
      this.currentTag = { ...tag }
      this.tagDialogVisible = true
    },

    saveTag() {
      if (!this.currentTag.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }

      if (this.isEditTag) {
        const index = this.tags.findIndex(t => t.id === this.currentTag.id)
        if (index !== -1) {
          this.tags[index] = { ...this.currentTag }
        }
      } else {
        const newTag = {
          id: Date.now().toString(),
          name: this.currentTag.name,
          color: this.currentTag.color
        }
        this.tags.push(newTag)
      }

      this.saveTagsToStorage()
      this.tagDialogVisible = false
      this.$message.success(this.isEditTag ? '标签更新成功' : '标签创建成功')
    },

    deleteTag(tagId) {
      this.$confirm('确定要删除该标签吗？相关的歌单关联也会被移除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tags = this.tags.filter(t => t.id !== tagId)
        this.relations = this.relations.filter(r => r.tagId !== tagId)
        this.saveTagsToStorage()
        this.saveRelationsToStorage()
        if (this.selectedTagId === tagId) {
          this.selectedTagId = null
        }
        this.$message.success('标签删除成功')
      }).catch(() => {})
    },

    selectTag(tagId) {
      this.selectedTagId = this.selectedTagId === tagId ? null : tagId
    },

    clearTagFilter() {
      this.selectedTagId = null
    },

    getTagById(tagId) {
      return this.tags.find(t => t.id === tagId)
    },

    getTagPlaylistCount(tagId) {
      return this.relations.filter(r => r.tagId === tagId).length
    },

    isPlaylistHasTag(playlistId, tagId) {
      return this.relations.some(r => r.playlistId === playlistId && r.tagId === tagId)
    },

    getPlaylistTags(playlistId) {
      return this.relations
        .filter(r => r.playlistId === playlistId)
        .map(r => r.tagId)
    },

    togglePlaylistTag(playlistId) {
      if (!this.selectedTagId) return

      const exists = this.relations.find(
        r => r.playlistId === playlistId && r.tagId === this.selectedTagId
      )

      if (exists) {
        this.relations = this.relations.filter(r => r !== exists)
        this.$message.success('已解绑标签')
      } else {
        this.relations.push({
          playlistId,
          tagId: this.selectedTagId
        })
        this.$message.success('已绑定标签')
      }

      this.saveRelationsToStorage()
    }
  }
}
</script>

<style scoped>
.playlist-tag-page {
  padding: 20px;
  min-height: 100%;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header .subtitle {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.content-wrapper {
  display: flex;
  gap: 30px;
}

.tags-section {
  width: 280px;
  flex-shrink: 0;
}

.playlists-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header .playlist-count {
  font-weight: 400;
  color: #999;
  font-size: 14px;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tag-item:hover {
  background: #e8e8e8;
}

.tag-item.active {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.tag-count {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
}

.tag-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tag-item:hover .tag-actions {
  opacity: 1;
}

.tag-actions i {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.tag-actions i:hover {
  color: #666;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .playlist-actions {
  opacity: 1;
}

.playlist-actions i {
  font-size: 24px;
  margin-bottom: 4px;
}

.playlist-actions span {
  font-size: 12px;
}

.playlist-info {
  padding: 0 4px;
}

.playlist-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-track {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
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
  white-space: nowrap;
}

.empty-tips {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-tips i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-tips p {
  margin: 0;
  font-size: 14px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .tags-section {
    width: 100%;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .playlist-tag-page {
    padding: 16px;
  }

  .playlists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tag-actions {
    opacity: 1;
  }
}
</style>