<template>
  <div class="playlist-tag-container">
    <div class="header">
      <h2>歌单标签管理</h2>
      <el-button type="primary" @click="showAddTagDialog = true">
        <i class="el-icon-plus"></i>
        新建标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <div class="tag-list">
      <div class="tag-item" v-for="tag in tags" :key="tag.id">
        <div class="tag-color" :style="{ backgroundColor: tag.color }"></div>
        <div class="tag-name">{{ tag.name }}</div>
        <div class="tag-actions">
          <el-button size="mini" icon="el-icon-edit" @click="editTag(tag)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteTag(tag.id)"></el-button>
        </div>
      </div>
      <div v-if="tags.length === 0" class="empty-state">
        <i class="el-icon-collection-tag"></i>
        <p>暂无标签，点击上方按钮创建</p>
      </div>
    </div>

    <!-- 歌单列表 -->
    <div class="playlist-section">
      <div class="section-header">
        <h3>我的歌单</h3>
        <div class="filter-tags">
          <el-select v-model="selectedTag" placeholder="按标签筛选" clearable @change="filterPlaylists">
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id">
              <span class="tag-option">
                <span class="tag-color-dot" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </span>
            </el-option>
          </el-select>
        </div>
      </div>
      
      <div class="playlist-grid">
        <div 
          class="playlist-card" 
          v-for="playlist in filteredPlaylists" 
          :key="playlist.id"
          @click="selectPlaylist(playlist)"
          :class="{ selected: selectedPlaylists.includes(playlist.id) }"
        >
          <img :src="getPlaylistCover(playlist)" alt="歌单封面" class="playlist-cover">
          <div class="playlist-info">
            <p class="playlist-name">{{ playlist.name }}</p>
            <div class="playlist-tags">
              <span 
                v-for="tagId in getPlaylistTags(playlist.id)" 
                :key="tagId"
                class="playlist-tag"
                :style="{ backgroundColor: getTagColor(tagId) }"
              >
                {{ getTagName(tagId) }}
              </span>
            </div>
          </div>
          <div class="playlist-select" v-if="selectedPlaylists.includes(playlist.id)">
            <i class="el-icon-check"></i>
          </div>
          <!-- 快速操作按钮 -->
          <div class="playlist-actions">
            <el-dropdown @command="handleQuickTag" trigger="click">
              <span class="action-btn">
                <i class="el-icon-plus"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  v-for="tag in tags" 
                  :key="tag.id" 
                  :command="{ playlistId: playlist.id, tagId: tag.id }"
                  :disabled="getPlaylistTags(playlist.id).includes(tag.id)"
                >
                  <span class="tag-option">
                    <span class="tag-color-dot" :style="{ backgroundColor: tag.color }"></span>
                    {{ tag.name }}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown @command="handleQuickRemoveTag" trigger="click">
              <span class="action-btn">
                <i class="el-icon-minus"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  v-for="tagId in getPlaylistTags(playlist.id)" 
                  :key="tagId" 
                  :command="{ playlistId: playlist.id, tagId: tagId }"
                >
                  <span class="tag-option">
                    <span class="tag-color-dot" :style="{ backgroundColor: getTagColor(tagId) }"></span>
                    {{ getTagName(tagId) }}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      
      <div v-if="filteredPlaylists.length === 0" class="empty-state">
        <i class="el-icon-document-remove"></i>
        <p>{{ selectedTag ? '该标签下暂无歌单' : '暂无歌单' }}</p>
      </div>
    </div>

    <!-- 批量操作区域 -->
    <div class="batch-operations" v-show="selectedPlaylists.length > 0 || showBatchOperations">
      <div class="batch-header">
        <span v-if="selectedPlaylists.length > 0">已选择 {{ selectedPlaylists.length }} 个歌单</span>
        <span v-else>批量操作</span>
        <el-button type="text" @click="toggleBatchOperations" v-if="selectedPlaylists.length === 0">
          {{ showBatchOperations ? '收起' : '展开' }}
        </el-button>
      </div>
      <div class="operations" v-if="selectedPlaylists.length > 0 || showBatchOperations">
        <el-dropdown @command="handleBatchTag" :disabled="selectedPlaylists.length === 0">
          <el-button size="small" :disabled="selectedPlaylists.length === 0">
            添加标签<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              v-for="tag in tags" 
              :key="tag.id" 
              :command="tag.id"
            >
              <span class="tag-option">
                <span class="tag-color-dot" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown @command="handleBatchRemoveTag" :disabled="selectedPlaylists.length === 0">
          <el-button size="small" type="warning" :disabled="selectedPlaylists.length === 0">
            移除标签<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              v-for="tag in tags" 
              :key="tag.id" 
              :command="tag.id"
            >
              <span class="tag-option">
                <span class="tag-color-dot" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button size="small" @click="selectAll" v-if="selectedPlaylists.length === 0">
          全选
        </el-button>
        <el-button size="small" @click="clearSelection" v-if="selectedPlaylists.length > 0">
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 添加/编辑标签对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑标签' : '新建标签'" 
      :visible.sync="showAddTagDialog" 
      width="400px"
      @close="resetTagForm"
    >
      <el-form :model="tagForm" :rules="tagRules" ref="tagForm" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <div class="color-picker-container">
            <el-color-picker v-model="tagForm.color" show-alpha></el-color-picker>
            <div class="preset-colors">
              <span 
                v-for="color in presetColors" 
                :key="color" 
                class="preset-color"
                :style="{ backgroundColor: color }"
                @click="tagForm.color = color"
              ></span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddTagDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveTag">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'playlistTag',
  data() {
    return {
      tags: [],
      playlistTags: {}, // 歌单与标签的关联关系
      selectedTag: '',
      selectedPlaylists: [],
      showAddTagDialog: false,
      isEditing: false,
      currentEditId: null,
      showBatchOperations: false, // 控制批量操作区域的显示
      tagForm: {
        name: '',
        color: '#409EFF'
      },
      tagRules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择标签颜色', trigger: 'change' }
        ]
      },
      presetColors: [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
        '#909399', '#C71585', '#FF8C00', '#1E90FF',
        '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'
      ],
      defaultCover: 'https://p2.music.126.net/tBTNafivJdYwM-4d_1yq5w==/109951165409198210.jpg'
    }
  },
  computed: {
    ...mapState(['personalList']),
    filteredPlaylists() {
      // 获取所有歌单，包括模拟歌单
      let allPlaylists = this.personalList.slice(1) // 排除"我喜欢的音乐"
      
      // 如果没有真实歌单数据，使用模拟歌单数据
      if (allPlaylists.length === 0) {
        allPlaylists = [
          { id: '1001', name: '我的华语歌单', coverImgUrl: 'https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951165629004049.jpg' },
          { id: '1002', name: '欧美流行精选', coverImgUrl: 'https://p1.music.126.net/SBqrR5d67zIEJ2Zx7jJ9Rw==/109951165629052119.jpg' },
          { id: '1003', name: '轻音乐纯音乐', coverImgUrl: 'https://p1.music.126.net/5Zs91UIpXOwJ3Xx7ZrJ5gw==/109951165629059928.jpg' },
          { id: '1004', name: '摇滚不死', coverImgUrl: 'https://p1.music.126.net/5yq8mEcTc0Tn3V6oJ8C5wA==/109951165629067737.jpg' },
          { id: '1005', name: '古风音乐合集', coverImgUrl: 'https://p1.music.126.net/8wTjxqZqZyT5rJ3Zx7jJ9Rw==/109951165629075546.jpg' }
        ]
        
        // 如果没有模拟标签关联数据，创建默认关联
        if (Object.keys(this.playlistTags).length === 0) {
          this.playlistTags = {
            '1001': ['1', '7'], // 通勤听、怀旧经典
            '1002': ['1', '5'], // 通勤听、聚会派对
            '1003': ['2', '4'], // 睡前放松、工作学习
            '1004': ['3', '5'], // 运动健身、聚会派对
            '1005': ['2', '7', '8'] // 睡前放松、怀旧经典、浪漫情歌
          }
        }
      }
      
      // 如果没有选择标签，返回所有歌单
      if (!this.selectedTag) {
        return allPlaylists
      }
      
      // 否则返回包含所选标签的歌单
      return allPlaylists.filter(playlist => {
        const tags = this.playlistTags[playlist.id] || []
        return tags.includes(this.selectedTag)
      })
    }
  },
  created() {
    this.loadData()
    // 如果没有数据，则创建模拟数据
    if (this.tags.length === 0) {
      this.createMockData()
    }
  },
  methods: {
    // 从localStorage加载数据
    loadData() {
      const savedTags = localStorage.getItem('playlistTags')
      const savedPlaylistTags = localStorage.getItem('playlistTagRelations')
      
      if (savedTags) {
        this.tags = JSON.parse(savedTags)
      }
      
      if (savedPlaylistTags) {
        this.playlistTags = JSON.parse(savedPlaylistTags)
      }
    },
    
    // 创建模拟数据
    createMockData() {
      // 创建模拟标签
      this.tags = [
        { id: '1', name: '通勤听', color: '#409EFF' },
        { id: '2', name: '睡前放松', color: '#67C23A' },
        { id: '3', name: '运动健身', color: '#E6A23C' },
        { id: '4', name: '工作学习', color: '#F56C6C' },
        { id: '5', name: '聚会派对', color: '#909399' },
        { id: '6', name: '心情低落', color: '#C71585' },
        { id: '7', name: '怀旧经典', color: '#FF8C00' },
        { id: '8', name: '浪漫情歌', color: '#FF69B4' }
      ]
      
      // 创建模拟歌单与标签的关联关系
      // 假设personalList中有歌单数据，为它们分配标签
      if (this.personalList && this.personalList.length > 1) {
        // 跳过第一个歌单（"我喜欢的音乐"）
        const playlists = this.personalList.slice(1)
        
        // 为每个歌单随机分配1-3个标签
        playlists.forEach((playlist, index) => {
          const tagCount = Math.floor(Math.random() * 3) + 1 // 1-3个标签
          const selectedTags = []
          
          // 随机选择标签
          for (let i = 0; i < tagCount; i++) {
            const randomTagIndex = Math.floor(Math.random() * this.tags.length)
            const tagId = this.tags[randomTagIndex].id
            
            if (!selectedTags.includes(tagId)) {
              selectedTags.push(tagId)
            }
          }
          
          if (selectedTags.length > 0) {
            this.playlistTags[playlist.id] = selectedTags
          }
        })
      } else {
        // 如果没有真实歌单数据，创建一些模拟歌单数据
        const mockPlaylists = [
          { id: '1001', name: '我的华语歌单', coverImgUrl: 'https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951165629004049.jpg' },
          { id: '1002', name: '欧美流行精选', coverImgUrl: 'https://p1.music.126.net/SBqrR5d67zIEJ2Zx7jJ9Rw==/109951165629052119.jpg' },
          { id: '1003', name: '轻音乐纯音乐', coverImgUrl: 'https://p1.music.126.net/5Zs91UIpXOwJ3Xx7ZrJ5gw==/109951165629059928.jpg' },
          { id: '1004', name: '摇滚不死', coverImgUrl: 'https://p1.music.126.net/5yq8mEcTc0Tn3V6oJ8C5wA==/109951165629067737.jpg' },
          { id: '1005', name: '古风音乐合集', coverImgUrl: 'https://p1.music.126.net/8wTjxqZqZyT5rJ3Zx7jJ9Rw==/109951165629075546.jpg' }
        ]
        
        // 为模拟歌单分配标签
        this.playlistTags = {
          '1001': ['1', '7'], // 通勤听、怀旧经典
          '1002': ['1', '5'], // 通勤听、聚会派对
          '1003': ['2', '4'], // 睡前放松、工作学习
          '1004': ['3', '5'], // 运动健身、聚会派对
          '1005': ['2', '7', '8'] // 睡前放松、怀旧经典、浪漫情歌
        }
        
        // 将模拟歌单添加到personalList中用于展示
        if (this.personalList.length <= 1) {
          this.personalList.push(...mockPlaylists)
        }
      }
      
      // 保存模拟数据到localStorage
      this.saveData()
    },
    
    // 保存数据到localStorage
    saveData() {
      localStorage.setItem('playlistTags', JSON.stringify(this.tags))
      localStorage.setItem('playlistTagRelations', JSON.stringify(this.playlistTags))
    },
    
    // 添加或更新标签
    saveTag() {
      this.$refs.tagForm.validate((valid) => {
        if (valid) {
          if (this.isEditing) {
            // 编辑模式
            const index = this.tags.findIndex(tag => tag.id === this.currentEditId)
            if (index !== -1) {
              this.tags[index] = {
                ...this.tags[index],
                name: this.tagForm.name,
                color: this.tagForm.color
              }
            }
          } else {
            // 添加模式
            const newTag = {
              id: Date.now().toString(),
              name: this.tagForm.name,
              color: this.tagForm.color
            }
            this.tags.push(newTag)
          }
          
          this.saveData()
          this.showAddTagDialog = false
          this.$message.success(this.isEditing ? '标签更新成功' : '标签创建成功')
        }
      })
    },
    
    // 编辑标签
    editTag(tag) {
      this.isEditing = true
      this.currentEditId = tag.id
      this.tagForm = {
        name: tag.name,
        color: tag.color
      }
      this.showAddTagDialog = true
    },
    
    // 删除标签
    deleteTag(tagId) {
      this.$confirm('确定要删除这个标签吗？删除后，所有使用该标签的歌单将取消关联。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从标签列表中删除
        this.tags = this.tags.filter(tag => tag.id !== tagId)
        
        // 从所有歌单中移除该标签
        Object.keys(this.playlistTags).forEach(playlistId => {
          this.playlistTags[playlistId] = this.playlistTags[playlistId].filter(id => id !== tagId)
          if (this.playlistTags[playlistId].length === 0) {
            delete this.playlistTags[playlistId]
          }
        })
        
        this.saveData()
        this.$message.success('标签删除成功')
      }).catch(() => {
        // 用户取消删除
      })
    },
    
    // 重置表单
    resetTagForm() {
      this.isEditing = false
      this.currentEditId = null
      this.tagForm = {
        name: '',
        color: '#409EFF'
      }
      if (this.$refs.tagForm) {
        this.$refs.tagForm.resetFields()
      }
    },
    
    // 筛选歌单
    filterPlaylists() {
      // 筛选逻辑已在computed中实现
    },
    
    // 选择/取消选择歌单
    selectPlaylist(playlist) {
      const index = this.selectedPlaylists.indexOf(playlist.id)
      if (index === -1) {
        this.selectedPlaylists.push(playlist.id)
      } else {
        this.selectedPlaylists.splice(index, 1)
      }
    },
    
    // 清除选择
    clearSelection() {
      this.selectedPlaylists = []
    },
    
    // 切换批量操作区域的显示
    toggleBatchOperations() {
      this.showBatchOperations = !this.showBatchOperations
    },
    
    // 全选歌单
    selectAll() {
      this.selectedPlaylists = this.filteredPlaylists.map(playlist => playlist.id)
    },
    
    // 批量添加标签
    handleBatchTag(tagId) {
      this.selectedPlaylists.forEach(playlistId => {
        if (!this.playlistTags[playlistId]) {
          this.playlistTags[playlistId] = []
        }
        if (!this.playlistTags[playlistId].includes(tagId)) {
          this.playlistTags[playlistId].push(tagId)
        }
      })
      
      this.saveData()
      this.$message.success('标签添加成功')
    },
    
    // 批量移除标签
    handleBatchRemoveTag(tagId) {
      this.selectedPlaylists.forEach(playlistId => {
        if (this.playlistTags[playlistId]) {
          this.playlistTags[playlistId] = this.playlistTags[playlistId].filter(id => id !== tagId)
          if (this.playlistTags[playlistId].length === 0) {
            delete this.playlistTags[playlistId]
          }
        }
      })
      
      this.saveData()
      this.$message.success('标签移除成功')
    },
    
    // 快速添加标签
    handleQuickTag({ playlistId, tagId }) {
      if (!this.playlistTags[playlistId]) {
        this.playlistTags[playlistId] = []
      }
      if (!this.playlistTags[playlistId].includes(tagId)) {
        this.playlistTags[playlistId].push(tagId)
        this.saveData()
        this.$message.success('标签添加成功')
      }
    },
    
    // 快速移除标签
    handleQuickRemoveTag({ playlistId, tagId }) {
      if (this.playlistTags[playlistId]) {
        this.playlistTags[playlistId] = this.playlistTags[playlistId].filter(id => id !== tagId)
        if (this.playlistTags[playlistId].length === 0) {
          delete this.playlistTags[playlistId]
        }
        this.saveData()
        this.$message.success('标签移除成功')
      }
    },
    
    // 获取歌单的标签
    getPlaylistTags(playlistId) {
      return this.playlistTags[playlistId] || []
    },
    
    // 获取标签名称
    getTagName(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.name : ''
    },
    
    // 获取标签颜色
    getTagColor(tagId) {
      const tag = this.tags.find(t => t.id === tagId)
      return tag ? tag.color : '#409EFF'
    },
    
    // 获取歌单封面
    getPlaylistCover(playlist) {
      // 如果有封面URL且不为空，直接返回
      if (playlist.coverImgUrl) {
        return playlist.coverImgUrl
      }
      
      // 否则根据歌单ID生成一个固定的封面URL
      // 这里使用一些网易云音乐的默认封面图片
      const defaultCovers = [
        'https://p2.music.126.net/tBTNafivJdYwM-4d_1yq5w==/109951165409198210.jpg',
        'https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951165629004049.jpg',
        'https://p1.music.126.net/SBqrR5d67zIEJ2Zx7jJ9Rw==/109951165629052119.jpg',
        'https://p1.music.126.net/5Zs91UIpXOwJ3Xx7ZrJ5gw==/109951165629059928.jpg',
        'https://p1.music.126.net/5yq8mEcTc0Tn3V6oJ8C5wA==/109951165629067737.jpg',
        'https://p1.music.126.net/8wTjxqZqZyT5rJ3Zx7jJ9Rw==/109951165629075546.jpg'
      ]
      
      // 根据ID选择一个固定的封面
      const index = Math.abs(playlist.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % defaultCovers.length
      return defaultCovers[index]
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 40px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
}

.tag-name {
  font-weight: 500;
  margin-right: 10px;
}

.tag-actions {
  display: flex;
  gap: 5px;
}

.playlist-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.filter-tags {
  width: 200px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.playlist-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.playlist-card.selected {
  border: 2px solid #409EFF;
}

.playlist-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-actions {
  opacity: 1;
}

.action-btn {
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.playlist-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.playlist-info {
  padding: 15px;
}

.playlist-name {
  font-weight: 500;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.playlist-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.playlist-select {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.batch-operations {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  min-width: 300px;
  max-width: 90%;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.operations {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.preset-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.tag-option {
  display: flex;
  align-items: center;
}

.tag-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .playlist-tag-container {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filter-tags {
    width: 100%;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .batch-operations {
    flex-direction: column;
    gap: 10px;
    width: 90%;
  }
  
  .operations {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>