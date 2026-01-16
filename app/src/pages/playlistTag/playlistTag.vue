<template>
  <div class="playlist-tag-container">
    <div class="page-header">
      <h2>歌单标签管理</h2>
      <p class="subtitle">自定义标签，轻松管理您的歌单</p>
    </div>

    <div class="main-content">
      <div class="tag-management-section">
        <div class="section-header">
          <h3>标签管理</h3>
          <el-button type="primary" size="small" @click="showAddTagDialog">
            <i class="el-icon-plus"></i> 新建标签
          </el-button>
        </div>

        <div class="tag-list" v-if="tags.length > 0">
          <div class="tag-item" v-for="tag in tags" :key="tag.id">
            <div class="tag-info">
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <div class="tag-actions">
              <el-button type="text" size="small" @click="showEditTagDialog(tag)">
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-button type="text" size="small" @click="deleteTag(tag.id)">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <i class="el-icon-folder-opened"></i>
          <p>暂无标签，点击上方按钮创建第一个标签</p>
        </div>
      </div>

      <div class="playlist-section">
        <div class="section-header">
          <h3>我的歌单</h3>
          <div class="filter-controls">
            <span class="filter-label">按标签筛选：</span>
            <el-select v-model="selectedTagFilter" placeholder="全部" size="small" @change="filterPlaylistsByTag">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
            </el-select>
          </div>
        </div>

        <div class="playlist-list">
          <div class="playlist-card" v-for="playlist in filteredPlaylists" :key="playlist.id">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" class="playlist-cover">
            <div class="playlist-info">
              <h4 class="playlist-name">{{ playlist.name }}</h4>
              <p class="playlist-tracks">{{ playlist.trackCount }} 首歌曲</p>
              <div class="playlist-tags">
                <span 
                  v-for="tagId in getPlaylistTags(playlist.id)" 
                  :key="tagId"
                  class="playlist-tag-badge"
                  :style="{ backgroundColor: getTagColor(tagId) }"
                >
                  {{ getTagName(tagId) }}
                </span>
              </div>
            </div>
            <div class="playlist-actions">
              <el-button type="text" size="small" @click="showTagSelectionDialog(playlist)">
                <i class="el-icon-tickets"></i> 绑定标签
              </el-button>
            </div>
          </div>
        </div>

        <div class="empty-state" v-if="filteredPlaylists.length === 0">
          <i class="el-icon-music"></i>
          <p>暂无匹配的歌单</p>
        </div>
      </div>
    </div>

    <el-dialog 
      title="新建标签" 
      :visible.sync="addTagDialogVisible" 
      width="400px"
      @close="resetAddTagForm">
      <el-form :model="addTagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="addTagForm.name" placeholder="例如：通勤听、睡前放松"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <span 
              v-for="color in colorOptions" 
              :key="color"
              class="color-option"
              :class="{ selected: addTagForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="addTagForm.color = color"
            ></span>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addTagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTag" :loading="loading">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog 
      title="编辑标签" 
      :visible.sync="editTagDialogVisible" 
      width="400px">
      <el-form :model="editTagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="editTagForm.name"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <span 
              v-for="color in colorOptions" 
              :key="color"
              class="color-option"
              :class="{ selected: editTagForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="editTagForm.color = color"
            ></span>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editTagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateTag" :loading="loading">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog 
      :title="`为歌单 ${currentPlaylist.name} 绑定标签`" 
      :visible.sync="tagSelectionDialogVisible" 
      width="500px">
      <div class="tag-selection-list">
        <div 
          v-for="tag in tags" 
          :key="tag.id"
          class="tag-checkbox-item"
          :class="{ selected: isTagSelected(tag.id) }"
          @click="toggleTagSelection(tag.id)">
          <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
          <span class="tag-name">{{ tag.name }}</span>
          <el-checkbox 
            v-model="selectedTagsForPlaylist[tag.id]" 
            @change="toggleTagSelection(tag.id)"
            @click.stop
          ></el-checkbox>
        </div>
      </div>
      <div class="selection-footer">
        <el-button type="text" size="small" @click="selectAllTags">全选</el-button>
        <el-button type="text" size="small" @click="deselectAllTags">取消全选</el-button>
      </div>
      <span slot="footer">
        <el-button @click="tagSelectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlaylistTags" :loading="loading">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog 
      title="确认删除" 
      :visible.sync="deleteConfirmDialogVisible" 
      width="350px">
      <p>确定要删除标签「{{ tagToDelete }}」吗？</p>
      <p class="warning-text">删除后，该标签将从所有绑定的歌单中移除。</p>
      <span slot="footer">
        <el-button @click="deleteConfirmDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteTag" :loading="loading">确定删除</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlaylistTag',
  data() {
    return {
      tags: [],
      playlists: [],
      selectedTagFilter: '',
      addTagDialogVisible: false,
      editTagDialogVisible: false,
      tagSelectionDialogVisible: false,
      deleteConfirmDialogVisible: false,
      loading: false,
      tagToDelete: '',
      tagIdToDelete: null,
      currentPlaylist: {},
      selectedTagsForPlaylist: {},
      addTagForm: {
        name: '',
        color: '#1890ff'
      },
      editTagForm: {
        id: null,
        name: '',
        color: ''
      },
      colorOptions: [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
        '#eb2f96', '#13c2c2', '#fa8c16', '#a0d911', '#2f54eb'
      ]
    }
  },
  computed: {
    ...mapState(['personalList']),
    filteredPlaylists() {
      if (!this.selectedTagFilter) {
        return this.playlists
      }
      return this.playlists.filter(playlist => {
        const playlistTags = this.getPlaylistTags(playlist.id)
        return playlistTags.includes(this.selectedTagFilter)
      })
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loadTags()
      this.loadPlaylists()
    },
    loadTags() {
      const storedTags = localStorage.getItem('playlistTags')
      if (storedTags) {
        this.tags = JSON.parse(storedTags)
      } else {
        this.tags = []
      }
    },
    saveTags() {
      localStorage.setItem('playlistTags', JSON.stringify(this.tags))
    },
    loadPlaylists() {
      if (this.personalList && this.personalList.length > 0) {
        this.playlists = this.personalList
      } else {
        this.playlists = this.getMockPlaylists()
      }
    },
    getMockPlaylists() {
      return [
        {
          id: '1',
          name: '通勤必备',
          coverImgUrl: 'https://p2.music.126.net/Kn6dF2VnI9Q1D8e5x9Q6RQ==/18696837975508106.jpg',
          trackCount: 32
        },
        {
          id: '2',
          name: '睡前放松',
          coverImgUrl: 'https://p2.music.126.net/7xkT9XZ-31X8N07qJfLkEA==/109951168315993490.jpg',
          trackCount: 25
        },
        {
          id: '3',
          name: '运动健身',
          coverImgUrl: 'https://p2.music.126.net/99F30d5b78F5d5786b79F3d5b78F5d57==/18696837975508107.jpg',
          trackCount: 45
        },
        {
          id: '4',
          name: '经典老歌',
          coverImgUrl: 'https://p2.music.126.net/6e8c8c8a7a7a6e8c8c8a7a7a6e8c8c8a==/18696837975508108.jpg',
          trackCount: 58
        },
        {
          id: '5',
          name: '电子音乐',
          coverImgUrl: 'https://p2.music.126.net/3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e==/18696837975508109.jpg',
          trackCount: 38
        },
        {
          id: '6',
          name: '轻音乐',
          coverImgUrl: 'https://p2.music.126.net/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d==/18696837975508110.jpg',
          trackCount: 22
        },
        {
          id: '7',
          name: '欧美流行',
          coverImgUrl: 'https://p2.music.126.net/abcdef1234567890abcdef1234567890==/18696837975508111.jpg',
          trackCount: 41
        },
        {
          id: '8',
          name: '学习BGM',
          coverImgUrl: 'https://p2.music.126.net/0123456789abcdef0123456789abcdef==/18696837975508112.jpg',
          trackCount: 29
        }
      ]
    },
    showAddTagDialog() {
      this.resetAddTagForm()
      this.addTagDialogVisible = true
    },
    resetAddTagForm() {
      this.addTagForm = {
        name: '',
        color: '#1890ff'
      }
    },
    addTag() {
      if (!this.addTagForm.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }
      
      const newTag = {
        id: Date.now().toString(),
        name: this.addTagForm.name.trim(),
        color: this.addTagForm.color
      }
      
      this.tags.push(newTag)
      this.saveTags()
      this.addTagDialogVisible = false
      this.$message.success('标签创建成功')
    },
    showEditTagDialog(tag) {
      this.editTagForm = {
        id: tag.id,
        name: tag.name,
        color: tag.color
      }
      this.editTagDialogVisible = true
    },
    updateTag() {
      if (!this.editTagForm.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }
      
      const index = this.tags.findIndex(t => t.id === this.editTagForm.id)
      if (index !== -1) {
        this.tags[index].name = this.editTagForm.name.trim()
        this.tags[index].color = this.editTagForm.color
        this.saveTags()
        this.editTagDialogVisible = false
        this.$message.success('标签更新成功')
      }
    },
    deleteTag(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      if (tag) {
        this.tagToDelete = tag.name
        this.tagIdToDelete = tagId
        this.deleteConfirmDialogVisible = true
      }
    },
    confirmDeleteTag() {
      if (this.tagIdToDelete) {
        this.tags = this.tags.filter(t => t.id !== this.tagIdToDelete)
        this.saveTags()
        this.removeTagFromAllPlaylists(this.tagIdToDelete)
        this.deleteConfirmDialogVisible = false
        this.$message.success('标签删除成功')
        this.tagIdToDelete = null
        this.tagToDelete = ''
      }
    },
    removeTagFromAllPlaylists(tagId) {
      this.playlists.forEach(playlist => {
        const playlistTags = this.getPlaylistTags(playlist.id)
        const updatedTags = playlistTags.filter(tid => tid !== tagId)
        this.setPlaylistTags(playlist.id, updatedTags)
      })
    },
    showTagSelectionDialog(playlist) {
      this.currentPlaylist = playlist
      this.selectedTagsForPlaylist = {}
      
      const existingTags = this.getPlaylistTags(playlist.id)
      existingTags.forEach(tagId => {
        this.$set(this.selectedTagsForPlaylist, tagId, true)
      })
      
      this.tagSelectionDialogVisible = true
    },
    isTagSelected(tagId) {
      return this.selectedTagsForPlaylist[tagId] || false
    },
    toggleTagSelection(tagId) {
      this.$set(this.selectedTagsForPlaylist, tagId, !this.selectedTagsForPlaylist[tagId])
    },
    selectAllTags() {
      this.tags.forEach(tag => {
        this.$set(this.selectedTagsForPlaylist, tag.id, true)
      })
    },
    deselectAllTags() {
      this.tags.forEach(tag => {
        this.$set(this.selectedTagsForPlaylist, tag.id, false)
      })
    },
    savePlaylistTags() {
      const selectedTagIds = Object.keys(this.selectedTagsForPlaylist)
        .filter(tagId => this.selectedTagsForPlaylist[tagId])
        .map(tagId => tagId.toString())
      
      this.setPlaylistTags(this.currentPlaylist.id, selectedTagIds)
      this.tagSelectionDialogVisible = false
      this.$message.success('标签绑定成功')
    },
    getPlaylistTags(playlistId) {
      const key = `playlist_${playlistId}_tags`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    },
    setPlaylistTags(playlistId, tagIds) {
      const key = `playlist_${playlistId}_tags`
      localStorage.setItem(key, JSON.stringify(tagIds))
    },
    getTagName(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.name : ''
    },
    getTagColor(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.color : '#d9d9d9'
    },
    filterPlaylistsByTag() {
    }
  }
}
</script>

<style scoped>
.playlist-tag-container {
  padding: 30px;
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 28px;
  color: #262626;
  margin-bottom: 8px;
}

.page-header .subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

.main-content {
  display: flex;
  gap: 24px;
}

.tag-management-section,
.playlist-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tag-management-section {
  flex: 0 0 320px;
}

.playlist-section {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  font-size: 18px;
  color: #262626;
  margin: 0;
}

.tag-list {
  max-height: 500px;
  overflow-y: auto;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fafafa;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.tag-item:hover {
  background: #f0f0f0;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.tag-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.tag-actions {
  display: flex;
  gap: 8px;
}

.playlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.playlist-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.playlist-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.playlist-info {
  padding: 16px;
}

.playlist-name {
  font-size: 16px;
  color: #262626;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-tracks {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0 0 12px 0;
}

.playlist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.playlist-tag-badge {
  padding: 2px 10px;
  font-size: 12px;
  color: white;
  border-radius: 12px;
}

.playlist-actions {
  padding: 0 16px 12px;
  text-align: right;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #595959;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #262626;
}

.tag-selection-list {
  max-height: 300px;
  overflow-y: auto;
}

.tag-checkbox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-checkbox-item:hover {
  background: #e6e6e6;
}

.tag-checkbox-item.selected {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.tag-checkbox-item .tag-info {
  flex: 1;
}

.selection-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.warning-text {
  color: #faad14;
  font-size: 12px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .playlist-tag-container {
    padding: 16px;
  }

  .main-content {
    flex-direction: column;
  }

  .tag-management-section {
    flex: none;
    width: 100%;
  }

  .tag-list {
    max-height: 250px;
  }

  .playlist-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-controls .el-select {
    width: 100%;
  }
}
</style>