<template>
  <div class="playlist-tag-container">
    <div class="tag-header">
      <h2>歌单标签管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddTagDialog">新建标签</el-button>
    </div>

    <div class="tag-content">
      <div class="tag-list-section">
        <div class="section-title">标签列表</div>
        <div class="tag-list">
          <div v-for="tag in tags" :key="tag.id" class="tag-item" :class="{ 'active': selectedTagId === tag.id }" @click="selectTag(tag)">
            <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">({{ getPlaylistCount(tag.id) }})</span>
            <div class="tag-actions">
              <i class="el-icon-edit" @click.stop="editTag(tag)"></i>
              <i class="el-icon-delete" @click.stop="deleteTag(tag)"></i>
            </div>
          </div>
          <div v-if="tags.length === 0" class="empty-tip">
            暂无标签，点击上方按钮创建
          </div>
        </div>
      </div>

      <div class="playlist-section">
        <div class="section-title">
          <span>歌单列表</span>
          <el-select v-model="filterTagId" placeholder="全部标签" clearable @change="filterPlaylists" class="filter-select">
            <el-option label="全部标签" :value="null"></el-option>
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </div>
        <div class="playlist-list">
          <div class="batch-actions" v-if="selectedPlaylists.length > 0">
            <span>已选择 {{ selectedPlaylists.length }} 个歌单</span>
            <el-button size="mini" type="primary" @click="showBatchBindDialog">批量绑定标签</el-button>
            <el-button size="mini" @click="batchUnbindTags">批量解绑标签</el-button>
            <el-button size="mini" @click="clearSelection">取消选择</el-button>
          </div>
          <div v-for="playlist in filteredPlaylists" :key="playlist.id" class="playlist-item" :class="{ 'selected': isPlaylistSelected(playlist.id) }" @click="toggleSelectPlaylist(playlist.id)">
            <el-checkbox v-model="selectedPlaylists" :label="playlist.id" @change="toggleSelectPlaylist(playlist.id)" @click.native.stop></el-checkbox>
            <img :src="playlist.coverImgUrl" alt="" class="playlist-cover">
            <div class="playlist-info">
              <div class="playlist-name">{{ playlist.name }}</div>
              <div class="playlist-tags">
                <span v-for="tagId in getPlaylistTags(playlist.id)" :key="tagId" class="playlist-tag" :style="{ backgroundColor: getTagColor(tagId) }">
                  {{ getTagName(tagId) }}
                  <i class="el-icon-close" @click.stop="unbindTag(playlist.id, tagId)"></i>
                </span>
              </div>
            </div>
            <el-button size="mini" type="text" @click.stop="showBindDialog(playlist)">绑定标签</el-button>
          </div>
          <div v-if="filteredPlaylists.length === 0" class="empty-tip">
            暂无歌单
          </div>
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px">
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <div v-for="color in presetColors" :key="color" class="color-option" :class="{ 'selected': tagForm.color === color }" :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
            <input type="color" v-model="tagForm.color" class="custom-color">
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="绑定标签" :visible.sync="bindDialogVisible" width="400px">
      <div class="bind-tags">
        <el-checkbox-group v-model="bindTagIds">
          <el-checkbox v-for="tag in tags" :key="tag.id" :label="tag.id">
            <span class="tag-checkbox-label">
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              {{ tag.name }}
            </span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBind">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mockPlaylists, mockTags, mockBindings } from '@/utils/mockData'

const STORAGE_KEY_TAGS = 'playlist_tags'
const STORAGE_KEY_BINDINGS = 'playlist_tag_bindings'

const PRESET_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#fd79a8', '#a29bfe', '#6c5ce7', '#00b894',
  '#e17055', '#fdcb6e', '#74b9ff', '#55efc4', '#fab1a0'
]

export default {
  name: 'playlistTag',
  data() {
    return {
      tags: [],
      bindings: {},
      selectedTagId: null,
      filterTagId: null,
      selectedPlaylists: [],
      dialogVisible: false,
      dialogTitle: '新建标签',
      tagForm: {
        id: null,
        name: '',
        color: PRESET_COLORS[0]
      },
      bindDialogVisible: false,
      bindPlaylistId: null,
      bindTagIds: [],
      presetColors: PRESET_COLORS
    }
  },
  computed: {
    ...mapState(['personalList']),
    filteredPlaylists() {
      let playlists = this.personalList.length ? this.personalList : this.getMockPlaylists()
      if (this.filterTagId) {
        playlists = playlists.filter(playlist => {
          const tagIds = this.getPlaylistTags(playlist.id)
          return tagIds.includes(this.filterTagId)
        })
      }
      return playlists
    }
  },
  created() {
    this.loadFromStorage()
    this.initMockData()
  },
  methods: {
    initMockData() {
      const hasMockData = localStorage.getItem('mock_data_initialized')
      if (!hasMockData) {
        this.tags = [...mockTags]
        this.bindings = { ...mockBindings }
        localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(this.tags))
        localStorage.setItem(STORAGE_KEY_BINDINGS, JSON.stringify(this.bindings))
        localStorage.setItem('mock_data_initialized', 'true')
      }
    },
    getMockPlaylists() {
      return mockPlaylists
    },
    loadFromStorage() {
      const tags = localStorage.getItem(STORAGE_KEY_TAGS)
      const bindings = localStorage.getItem(STORAGE_KEY_BINDINGS)
      if (tags) {
        this.tags = JSON.parse(tags)
      }
      if (bindings) {
        this.bindings = JSON.parse(bindings)
      }
    },
    saveToStorage() {
      localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(this.tags))
      localStorage.setItem(STORAGE_KEY_BINDINGS, JSON.stringify(this.bindings))
    },
    showAddTagDialog() {
      this.dialogTitle = '新建标签'
      this.tagForm = {
        id: null,
        name: '',
        color: PRESET_COLORS[0]
      }
      this.dialogVisible = true
    },
    editTag(tag) {
      this.dialogTitle = '编辑标签'
      this.tagForm = {
        id: tag.id,
        name: tag.name,
        color: tag.color
      }
      this.dialogVisible = true
    },
    saveTag() {
      if (!this.tagForm.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }
      if (this.tagForm.id) {
        const index = this.tags.findIndex(t => t.id === this.tagForm.id)
        if (index !== -1) {
          this.tags[index] = { ...this.tagForm }
        }
      } else {
        this.tags.push({
          id: Date.now(),
          name: this.tagForm.name,
          color: this.tagForm.color
        })
      }
      this.saveToStorage()
      this.dialogVisible = false
      this.$message.success('保存成功')
    },
    deleteTag(tag) {
      this.$confirm('确定要删除这个标签吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tags = this.tags.filter(t => t.id !== tag.id)
        Object.keys(this.bindings).forEach(playlistId => {
          this.bindings[playlistId] = this.bindings[playlistId].filter(tagId => tagId !== tag.id)
        })
        this.saveToStorage()
        if (this.selectedTagId === tag.id) {
          this.selectedTagId = null
        }
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    selectTag(tag) {
      this.selectedTagId = tag.id
      this.filterTagId = tag.id
      this.filterPlaylists()
    },
    selectColor(color) {
      this.tagForm.color = color
    },
    getPlaylistCount(tagId) {
      let count = 0
      Object.values(this.bindings).forEach(tagIds => {
        if (tagIds.includes(tagId)) {
          count++
        }
      })
      return count
    },
    getPlaylistTags(playlistId) {
      return this.bindings[playlistId] || []
    },
    getTagName(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.name : ''
    },
    getTagColor(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.color : '#ccc'
    },
    filterPlaylists() {
      this.filterTagId = this.selectedTagId
    },
    showBindDialog(playlist) {
      this.bindPlaylistId = playlist.id
      this.bindTagIds = [...(this.bindings[playlist.id] || [])]
      this.bindDialogVisible = true
    },
    saveBind() {
      if (!this.bindings[this.bindPlaylistId]) {
        this.bindings[this.bindPlaylistId] = []
      }
      this.bindings[this.bindPlaylistId] = [...this.bindTagIds]
      this.saveToStorage()
      this.bindDialogVisible = false
      this.$message.success('绑定成功')
    },
    unbindTag(playlistId, tagId) {
      if (this.bindings[playlistId]) {
        this.bindings[playlistId] = this.bindings[playlistId].filter(id => id !== tagId)
        this.saveToStorage()
      }
    },
    isPlaylistSelected(playlistId) {
      return this.selectedPlaylists.includes(playlistId)
    },
    toggleSelectPlaylist(playlistId) {
      const index = this.selectedPlaylists.indexOf(playlistId)
      if (index !== -1) {
        this.selectedPlaylists.splice(index, 1)
      } else {
        this.selectedPlaylists.push(playlistId)
      }
    },
    clearSelection() {
      this.selectedPlaylists = []
    },
    showBatchBindDialog() {
      this.bindPlaylistId = null
      this.bindTagIds = []
      this.bindDialogVisible = true
    },
    saveBatchBind() {
      this.selectedPlaylists.forEach(playlistId => {
        if (!this.bindings[playlistId]) {
          this.bindings[playlistId] = []
        }
        this.bindTagIds.forEach(tagId => {
          if (!this.bindings[playlistId].includes(tagId)) {
            this.bindings[playlistId].push(tagId)
          }
        })
      })
      this.saveToStorage()
      this.bindDialogVisible = false
      this.clearSelection()
      this.$message.success('批量绑定成功')
    },
    batchUnbindTags() {
      this.$confirm('确定要解绑这些歌单的所有标签吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedPlaylists.forEach(playlistId => {
          this.bindings[playlistId] = []
        })
        this.saveToStorage()
        this.clearSelection()
        this.$message.success('批量解绑成功')
      }).catch(() => {})
    }
  },
  watch: {
    bindDialogVisible(newVal) {
      if (!newVal) {
        this.bindPlaylistId = null
        this.bindTagIds = []
      }
    }
  }
}
</script>

<style scoped>
.playlist-tag-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tag-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.tag-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.tag-list-section,
.playlist-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-select {
  width: 200px;
}

.tag-list {
  max-height: 500px;
  overflow-y: auto;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.tag-item:hover {
  background: #f5f5f5;
}

.tag-item.active {
  background: #e6f7ff;
  border: 1px solid #1890ff;
}

.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 14px;
}

.tag-count {
  color: #999;
  font-size: 12px;
  margin-right: 10px;
}

.tag-actions {
  display: none;
  gap: 8px;
}

.tag-item:hover .tag-actions {
  display: flex;
}

.tag-actions i {
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.tag-actions i:hover {
  color: #1890ff;
}

.playlist-list {
  max-height: 600px;
  overflow-y: auto;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  margin-bottom: 16px;
}

.batch-actions span {
  color: #1890ff;
  font-size: 14px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
  border: 1px solid transparent;
}

.playlist-item:hover {
  background: #f5f5f5;
}

.playlist-item.selected {
  background: #e6f7ff;
  border-color: #1890ff;
}

.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 12px;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.playlist-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
}

.playlist-tag i {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.7;
}

.playlist-tag i:hover {
  opacity: 1;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.3);
}

.custom-color {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.bind-tags {
  max-height: 300px;
  overflow-y: auto;
}

.bind-tags .el-checkbox {
  display: block;
  margin-bottom: 12px;
}

.tag-checkbox-label {
  display: inline-flex;
  align-items: center;
}

.tag-checkbox-label .tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

@media screen and (max-width: 768px) {
  .tag-content {
    grid-template-columns: 1fr;
  }

  .tag-list-section,
  .playlist-section {
    padding: 15px;
  }

  .tag-header h2 {
    font-size: 20px;
  }

  .playlist-item {
    flex-wrap: wrap;
  }

  .playlist-cover {
    width: 50px;
    height: 50px;
  }

  .batch-actions {
    flex-wrap: wrap;
  }
}
</style>
