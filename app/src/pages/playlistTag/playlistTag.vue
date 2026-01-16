<template>
  <div class="playlist-tag-container">
    <div class="header">
      <h1>歌单标签管理</h1>
      <el-button type="primary" @click="showAddTagDialog = true">+ 新建标签</el-button>
    </div>
    
    <div class="main-content">
      <!-- 标签管理区域 -->
      <div class="tag-section">
        <h2>标签列表</h2>
        <div class="tag-list">
          <div 
            v-for="tag in tags" 
            :key="tag.id"
            class="tag-item"
            :class="{ active: selectedTagId === tag.id }"
            @click="selectTag(tag.id)"
          >
            <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <div class="tag-actions">
              <el-button type="text" size="mini" @click.stop="editTag(tag)">编辑</el-button>
              <el-button type="text" size="mini" @click.stop="deleteTag(tag.id)" style="color: #f56c6c;">删除</el-button>
            </div>
          </div>
        </div>
        
        <div v-if="tags.length === 0" class="empty-tip">
          暂无标签，点击右上角创建新标签
        </div>
      </div>
      
      <!-- 歌单关联区域 -->
      <div class="playlist-section">
        <h2>
          我的歌单
          <span v-if="selectedTagId" class="filter-info">
            已筛选：{{ tags.find(t => t.id === selectedTagId)?.name }}
            <el-button type="text" size="mini" @click="selectedTagId = null">清除筛选</el-button>
          </span>
        </h2>
        
        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedTagId && selectedPlaylistIds.length > 0">
          <el-button 
            type="success" 
            size="small"
            @click="bindTagsToPlaylists"
            :disabled="selectedPlaylistIds.length === 0"
          >
            绑定选中歌单到标签
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            @click="unbindTagsFromPlaylists"
            :disabled="selectedPlaylistIds.length === 0"
          >
            解绑选中歌单的标签
          </el-button>
        </div>
        
        <div class="playlist-list">
          <div 
            v-for="playlist in filteredPlaylists" 
            :key="playlist.id"
            class="playlist-item"
            @click="togglePlaylistSelection(playlist.id)"
          >
            <el-checkbox 
              v-model="selectedPlaylistIds"
              :value="playlist.id"
              @change="handlePlaylistCheck"
            ></el-checkbox>
            <img :src="playlist.coverImgUrl" class="playlist-cover" alt="">
            <div class="playlist-info">
              <h3>{{ playlist.name }}</h3>
              <p>{{ playlist.trackCount }} 首歌曲</p>
              <div class="playlist-tags">
                <span 
                  v-for="tagId in getPlaylistTags(playlist.id)" 
                  :key="tagId"
                  class="tag-badge"
                  :style="{ backgroundColor: getTagById(tagId)?.color }"
                >
                  {{ getTagById(tagId)?.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredPlaylists.length === 0" class="empty-tip">
          暂无歌单，请先登录
        </div>
      </div>
    </div>
    
    <!-- 新增/编辑标签对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑标签' : '新建标签'" 
      :visible.sync="showAddTagDialog"
      width="400px"
    >
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="tagForm.color" :predefine="predefinedColors"></el-color-picker>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddTagDialog = false; resetTagForm">取消</el-button>
        <el-button type="primary" @click="saveTag" :loading="savingTag">保存</el-button>
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
      showAddTagDialog: false,
      isEditing: false,
      editingTagId: null,
      savingTag: false,
      selectedTagId: null,
      selectedPlaylistIds: [],
      tagForm: {
        name: '',
        color: '#409EFF'
      },
      predefinedColors: [
        '#409EFF',
        '#67C23A',
        '#E6A23C',
        '#F56C6C',
        '#909399',
        '#00CED1',
        '#FF69B4',
        '#8A2BE2'
      ],
      // 本地数据缓存
      tagsData: [],
      playlistTagMapData: {}
    }
  },
  computed: {
    ...mapState(['personalList']),
    tags() {
      return this.tagsData
    },
    filteredPlaylists() {
      if (!this.selectedTagId) return this.personalList || []
      
      // 筛选包含选中标签的歌单
      return this.personalList.filter(playlist => {
        const playlistTags = this.playlistTagMapData[playlist.id] || []
        return playlistTags.includes(this.selectedTagId)
      })
    }
  },
  methods: {
    // 从localStorage获取标签列表
    getTagsFromLocalStorage() {
      const tags = localStorage.getItem('playlistTags')
      return tags ? JSON.parse(tags) : []
    },
    // 保存标签列表到localStorage
    saveTagsToLocalStorage(tags) {
      localStorage.setItem('playlistTags', JSON.stringify(tags))
      this.tagsData = tags
    },
    // 从localStorage获取歌单标签映射
    getPlaylistTagMapFromLocalStorage() {
      const map = localStorage.getItem('playlistTagMap')
      return map ? JSON.parse(map) : {}
    },
    // 保存歌单标签映射到localStorage
    savePlaylistTagMapToLocalStorage(map) {
      localStorage.setItem('playlistTagMap', JSON.stringify(map))
      this.playlistTagMapData = map
    },
    // 重置标签表单
    resetTagForm() {
      this.tagForm = {
        name: '',
        color: '#409EFF'
      }
      this.isEditing = false
      this.editingTagId = null
    },
    // 新建标签
    showAddTag() {
      this.resetTagForm()
      this.showAddTagDialog = true
    },
    // 编辑标签
    editTag(tag) {
      this.isEditing = true
      this.editingTagId = tag.id
      this.tagForm = { ...tag }
      this.showAddTagDialog = true
    },
    // 保存标签
    saveTag() {
      if (!this.tagForm.name.trim()) {
        this.$message.warning('请输入标签名称')
        return
      }
      
      this.savingTag = true
      let tags = [...this.tagsData]
      
      if (this.isEditing) {
        // 编辑现有标签
        const index = tags.findIndex(t => t.id === this.editingTagId)
        if (index !== -1) {
          tags[index] = { ...tags[index], ...this.tagForm }
        }
      } else {
        // 新增标签
        const newTag = {
          id: Date.now(),
          name: this.tagForm.name,
          color: this.tagForm.color,
          createdAt: new Date().toISOString()
        }
        tags.push(newTag)
      }
      
      this.saveTagsToLocalStorage(tags)
      this.showAddTagDialog = false
      this.savingTag = false
      this.$message.success(this.isEditing ? '标签编辑成功' : '标签创建成功')
    },
    // 删除标签
    deleteTag(tagId) {
      this.$confirm('确定要删除这个标签吗？删除后将解除与该标签关联的所有歌单绑定', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let tags = this.tagsData.filter(t => t.id !== tagId)
        this.saveTagsToLocalStorage(tags)
        
        // 同时从歌单映射中删除该标签
        let playlistTagMap = { ...this.playlistTagMapData }
        Object.keys(playlistTagMap).forEach(playlistId => {
          playlistTagMap[playlistId] = playlistTagMap[playlistId].filter(id => id !== tagId)
        })
        this.savePlaylistTagMapToLocalStorage(playlistTagMap)
        
        if (this.selectedTagId === tagId) {
          this.selectedTagId = null
        }
        
        this.$message.success('标签删除成功')
      }).catch(() => {
        // 取消删除
      })
    },
    // 选择标签
    selectTag(tagId) {
      this.selectedTagId = tagId === this.selectedTagId ? null : tagId
      this.selectedPlaylistIds = []
    },
    // 切换歌单选中状态
    togglePlaylistSelection(playlistId) {
      const index = this.selectedPlaylistIds.indexOf(playlistId)
      if (index > -1) {
        this.selectedPlaylistIds.splice(index, 1)
      } else {
        this.selectedPlaylistIds.push(playlistId)
      }
    },
    // 处理歌单复选框变更
    handlePlaylistCheck() {
      // 这里可以做一些额外的处理
    },
    // 绑定标签到选中歌单
    bindTagsToPlaylists() {
      if (!this.selectedTagId || this.selectedPlaylistIds.length === 0) {
        this.$message.warning('请先选择标签和歌单')
        return
      }
      
      let playlistTagMap = { ...this.playlistTagMapData }
      
      this.selectedPlaylistIds.forEach(playlistId => {
        if (!playlistTagMap[playlistId]) {
          playlistTagMap[playlistId] = []
        }
        if (!playlistTagMap[playlistId].includes(this.selectedTagId)) {
          playlistTagMap[playlistId].push(this.selectedTagId)
        }
      })
      
      this.savePlaylistTagMapToLocalStorage(playlistTagMap)
      this.selectedPlaylistIds = []
      this.$message.success(`已成功将 ${this.selectedPlaylistIds.length} 个歌单绑定到标签`)
    },
    // 从选中歌单解绑标签
    unbindTagsFromPlaylists() {
      if (!this.selectedTagId || this.selectedPlaylistIds.length === 0) {
        this.$message.warning('请先选择标签和歌单')
        return
      }
      
      let playlistTagMap = { ...this.playlistTagMapData }
      
      this.selectedPlaylistIds.forEach(playlistId => {
        if (playlistTagMap[playlistId]) {
          playlistTagMap[playlistId] = playlistTagMap[playlistId].filter(id => id !== this.selectedTagId)
        }
      })
      
      this.savePlaylistTagMapToLocalStorage(playlistTagMap)
      this.selectedPlaylistIds = []
      this.$message.success(`已成功从 ${this.selectedPlaylistIds.length} 个歌单解绑标签`)
    },
    // 获取歌单的标签列表
    getPlaylistTags(playlistId) {
      return this.playlistTagMapData[playlistId] || []
    },
    // 根据ID获取标签
    getTagById(tagId) {
      return this.tagsData.find(t => t.id === tagId)
    }
  },
  created() {
    // 初始化数据
    this.tagsData = this.getTagsFromLocalStorage()
    this.playlistTagMapData = this.getPlaylistTagMapFromLocalStorage()
    
    if (!localStorage.getItem('playlistTags')) {
      this.saveTagsToLocalStorage([])
    }
    if (!localStorage.getItem('playlistTagMap')) {
      this.savePlaylistTagMapToLocalStorage({})
    }
  }
}
</script>

<style scoped>
.playlist-tag-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.tag-section, .playlist-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-section h2, .playlist-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-info {
  font-size: 14px;
  color: #909399;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tag-item:hover {
  background-color: #f5f5f5;
}

.tag-item.active {
  background-color: #ecf5ff;
  border-color: #409EFF;
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
}

.tag-name {
  flex: 1;
  font-size: 14px;
}

.tag-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.tag-item:hover .tag-actions {
  opacity: 1;
}

.playlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.playlist-item {
  display: flex;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.playlist-item:hover {
  background-color: #f5f5f5;
  border-color: #409EFF;
}

.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.playlist-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.playlist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.tag-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #fff;
  background-color: #409EFF;
}

.batch-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .tag-section {
    order: 2;
  }
  
  .playlist-section {
    order: 1;
  }
  
  .tag-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .tag-item {
    flex-direction: column;
    align-items: flex-start;
    width: calc(50% - 5px);
  }
  
  .tag-actions {
    opacity: 1;
    margin-top: 8px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .playlist-list {
    grid-template-columns: 1fr;
  }
  
  .tag-item {
    width: 100%;
  }
}
</style>