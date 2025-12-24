<template>
  <div class="custom-shortcut-container">
    <h2 class="page-title">自定义快捷播放</h2>
    
    <div class="shortcut-list">
      <div 
        class="shortcut-item" 
        v-for="(item, index) in shortcutItems" 
        :key="item.id"
        @click="playItem(item)"
      >
        <div class="shortcut-item-info">
          <div class="shortcut-item-icon">{{ item.icon || '🎵' }}</div>
          <div class="shortcut-item-content">
            <div class="shortcut-item-name">{{ item.name }}</div>
            <div class="shortcut-item-description">{{ item.description }}</div>
          </div>
        </div>
        <div class="shortcut-item-actions">
          <el-button 
            icon="el-icon-edit" 
            size="mini" 
            @click.stop="editItem(item)"
          ></el-button>
          <el-button 
            icon="el-icon-delete" 
            size="mini" 
            type="danger" 
            @click.stop="deleteItem(index)"
          ></el-button>
        </div>
      </div>
    </div>
    
    <el-button 
      type="primary" 
      icon="el-icon-plus" 
      @click="showAddDialog = true"
      :disabled="shortcutItems.length >= 8"
    >
      添加快捷项
    </el-button>
    
    <!-- 添加/编辑快捷项对话框 -->
    <el-dialog 
      :title="editingItem ? '编辑快捷项' : '添加快捷项'" 
      :visible.sync="showAddDialog"
      width="400px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="请输入快捷项名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" placeholder="请输入快捷项描述" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="formData.icon" placeholder="请输入表情图标（如🎵）" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="歌曲" value="song" />
            <el-option label="歌单" value="playlist" />
          </el-select>
        </el-form-item>
        <el-form-item label="ID">
          <el-input v-model="formData.id" placeholder="请输入歌曲/歌单ID" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveItem">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'customShortcut',
  data() {
    return {
      shortcutItems: [],
      showAddDialog: false,
      editingItem: null,
      formData: {
        name: '',
        description: '',
        icon: '',
        type: 'song',
        id: ''
      }
    }
  },
  mounted() {
    this.loadShortcutItems()
  },
  methods: {
    loadShortcutItems() {
      const items = localStorage.getItem('customShortcutItems')
      if (items) {
        this.shortcutItems = JSON.parse(items)
      } else {
        // 初始化一些模拟数据
        this.shortcutItems = [
          {
            id: '1',
            name: '最爱听的歌',
            description: '周杰伦 - 晴天',
            icon: '🎵',
            type: 'song'
          },
          {
            id: '2',
            name: '我的歌单',
            description: '华语流行精选',
            icon: '📋',
            type: 'playlist'
          },
          {
            id: '3',
            name: '工作放松',
            description: '轻音乐合集',
            icon: '🌿',
            type: 'playlist'
          }
        ]
        this.saveShortcutItems()
      }
    },
    saveShortcutItems() {
      localStorage.setItem('customShortcutItems', JSON.stringify(this.shortcutItems))
    },
    showAddDialogHandler() {
      this.editingItem = null
      this.formData = {
        name: '',
        description: '',
        icon: '',
        type: 'song',
        id: ''
      }
      this.showAddDialog = true
    },
    editItem(item) {
      this.editingItem = item
      this.formData = Object.assign({}, item)
      this.showAddDialog = true
    },
    deleteItem(index) {
      this.$confirm('确定要删除这个快捷项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.shortcutItems.splice(index, 1)
        this.saveShortcutItems()
        this.$message({ type: 'success', message: '删除成功！' })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },
    saveItem() {
      if (!this.formData.name) {
        this.$message.error('请输入快捷项名称')
        return
      }
      if (!this.formData.id) {
        this.$message.error('请输入歌曲/歌单ID')
        return
      }
      
      if (this.editingItem) {
        // 编辑模式
        const index = this.shortcutItems.findIndex(item => item.id === this.editingItem.id)
        if (index !== -1) {
          this.shortcutItems[index] = Object.assign({}, this.formData)
        }
      } else {
        // 添加模式
        this.shortcutItems.push(Object.assign({}, this.formData))
      }
      
      this.saveShortcutItems()
      this.showAddDialog = false
      this.$message({ type: 'success', message: this.editingItem ? '修改成功！' : '添加成功！' })
    },
    playItem(item) {
      this.$message({ type: 'success', message: `开始播放：${item.name}` })
      // 这里可以添加实际的播放逻辑
    }
  }
}
</script>

<style scoped>
.custom-shortcut-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.shortcut-list {
  margin-bottom: 20px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.shortcut-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.shortcut-item-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.shortcut-item-icon {
  font-size: 32px;
  margin-right: 15px;
}

.shortcut-item-content {
  flex: 1;
}

.shortcut-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.shortcut-item-description {
  font-size: 14px;
  color: #666;
}

.shortcut-item-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .custom-shortcut-container {
    padding: 10px;
  }
  
  .shortcut-item {
    padding: 12px;
  }
  
  .shortcut-item-icon {
    font-size: 24px;
    margin-right: 10px;
  }
  
  .shortcut-item-name {
    font-size: 14px;
  }
  
  .shortcut-item-description {
    font-size: 12px;
  }
}
</style>