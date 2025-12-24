<template>
  <div class="custom-shortcut">
    <h1 class="page-title">自定义快捷播放</h1>
    
    <div class="shortcut-list">
      <div 
        v-for="(item, index) in shortcutList" 
        :key="item.id"
        class="shortcut-item"
        :class="{ 'editing': editingId === item.id }"
        @click="playShortcut(item)"
      >
        <div class="item-content">
          <div class="item-icon">
            <i class="el-icon-music"></i>
          </div>
          <div class="item-info">
            <div class="item-name" v-if="editingId !== item.id">
              {{ item.name }}
            </div>
            <el-input 
              v-else
              v-model="item.name"
              @blur="saveItem(item)"
              @keyup.enter="saveItem(item)"
              class="item-edit-input"
              ref="editInput"
            />
            <div class="item-type">
              {{ item.type === 'song' ? '歌曲' : '歌单' }}
            </div>
          </div>
          <div class="item-actions">
            <i class="el-icon-edit" @click.stop="editItem(item)"></i>
            <i class="el-icon-delete" @click.stop="deleteItem(item)"></i>
          </div>
        </div>
        <div class="drag-handle" @mousedown="startDrag(index)">
          <i class="el-icon-s-tools"></i>
        </div>
      </div>
      
      <div 
        v-if="shortcutList.length < 8"
        class="shortcut-item add-item"
        @click="showAddDialog = true"
      >
        <div class="add-icon">
          <i class="el-icon-plus"></i>
        </div>
        <div class="add-text">
          添加快捷项
        </div>
      </div>
    </div>

    <el-dialog
      title="添加快捷播放项"
      :visible.sync="showAddDialog"
      width="40%"
    >
      <el-form :model="newItem" label-width="100px">
        <el-form-item label="类型">
          <el-select v-model="newItem.type" placeholder="请选择类型">
            <el-option label="歌曲" value="song"></el-option>
            <el-option label="歌单" value="playlist"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="newItem.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="ID">
          <el-input v-model="newItem.contentId" placeholder="请输入歌曲/歌单ID"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'customShortcut',
  data() {
    return {
      shortcutList: [],
      editingId: null,
      showAddDialog: false,
      newItem: {
        type: 'song',
        name: '',
        contentId: ''
      },
      dragIndex: -1,
      dragOverIndex: -1
    }
  },
  computed: {
    ...mapState(['musicDetail', 'songId', 'isPlaying', 'playList', 'hasPlayList', 'hisMusicList'])
  },
  methods: {
    ...mapActions(['saveMusicDetail', 'saveSongId', 'saveMusicUrl', 'saveIsPlaying', 'unshiftPlayList', 'pushPlayList', 'deletePlayListSong', 'deleteHisListSong', 'unshiftHisMusicList', 'deleteHasListSong', 'pushHasPlayList']),
    loadShortcuts() {
      const shortcuts = localStorage.getItem('customShortcuts')
      if (shortcuts) {
        this.shortcutList = JSON.parse(shortcuts)
      } else {
        // 加载mock数据
        this.shortcutList = [
          { id: 1, name: '晴天', type: 'song', contentId: '186573' },
          { id: 2, name: '以父之名', type: 'song', contentId: '186566' },
          { id: 3, name: '夜曲', type: 'song', contentId: '186555' },
          { id: 4, name: '青花瓷', type: 'song', contentId: '186537' }
        ]
        this.saveShortcuts()
      }
    },
    saveShortcuts() {
      localStorage.setItem('customShortcuts', JSON.stringify(this.shortcutList))
    },
    addItem() {
      if (!this.newItem.name || !this.newItem.contentId) {
        this.$message.warning('请填写完整信息')
        return
      }
      const newShortcut = {
        id: Date.now(),
        name: this.newItem.name,
        type: this.newItem.type,
        contentId: this.newItem.contentId
      }
      this.shortcutList.push(newShortcut)
      this.saveShortcuts()
      this.showAddDialog = false
      this.newItem = { type: 'song', name: '', contentId: '' }
    },
    deleteItem(item) {
      this.$confirm('此操作将永久删除该快捷项, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.shortcutList.findIndex(i => i.id === item.id)
        if (index > -1) {
          this.shortcutList.splice(index, 1)
          this.saveShortcuts()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    editItem(item) {
      this.editingId = item.id
      this.$nextTick(() => {
        const editInputs = this.$refs.editInput
        if (Array.isArray(editInputs)) {
          editInputs.find(input => input.$vnode.key === item.id).focus()
        } else {
          editInputs.focus()
        }
      })
    },
    saveItem(item) {
      this.editingId = null
      this.saveShortcuts()
    },
    startDrag(index) {
      this.dragIndex = index
      const dragElement = document.querySelector(`.shortcut-item:nth-child(${index + 1})`)
      
      const handleDragOver = (e) => {
        e.preventDefault()
        const hoverElement = document.elementFromPoint(e.clientX, e.clientY)
        if (!hoverElement) return
        
        const hoverIndex = Array.from(document.querySelectorAll('.shortcut-item')).indexOf(hoverElement)
        if (hoverIndex > -1 && hoverIndex !== this.dragIndex && hoverIndex !== this.shortcutList.length) {
          this.dragOverIndex = hoverIndex
          const temp = this.shortcutList[this.dragIndex]
          this.shortcutList[this.dragIndex] = this.shortcutList[hoverIndex]
          this.shortcutList[hoverIndex] = temp
          this.dragIndex = hoverIndex
        }
      }
      
      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragOver)
        document.removeEventListener('mouseup', handleDragEnd)
        this.saveShortcuts()
      }
      
      document.addEventListener('mousemove', handleDragOver)
      document.addEventListener('mouseup', handleDragEnd)
    },
    async playShortcut(item) {
      if (editingId === item.id) return
      
      if (item.type === 'song') {
        // 播放单曲
        const songId = item.contentId
        
        // 获取歌曲详情
        const songDetail = await this.getSongDetail(songId)
        
        if (songDetail) {
          // 开始播放歌曲
          this.startSong(songDetail)
        }
      } else if (item.type === 'playlist') {
        // 播放歌单
        const playlistId = item.contentId
        
        // 获取歌单详情
        const playlistDetail = await this.getPlaylistDetail(playlistId)
        
        if (playlistDetail && playlistDetail.tracks && playlistDetail.tracks.length > 0) {
          // 清空当前播放列表
          this.$store.dispatch('deleteAllList')
          
          // 添加所有歌曲到播放列表
          playlistDetail.tracks.forEach(track => {
            this.pushPlayList(track)
            this.pushHasPlayList(track)
          })
          
          // 开始播放第一首歌曲
          this.startSong(playlistDetail.tracks[0])
        }
      }
    },
    async getSongDetail(songId) {
      try {
        const res = await this.$http.get('song/detail', {
          params: {
            ids: songId
          }
        })
        if (res.data.code === 200 && res.data.songs && res.data.songs.length > 0) {
          return res.data.songs[0]
        }
      } catch (error) {
        console.error('获取歌曲详情失败:', error)
      }
      return null
    },
    async getPlaylistDetail(playlistId) {
      try {
        const res = await this.$http.get('playlist/detail', {
          params: {
            id: playlistId
          }
        })
        if (res.data.code === 200 && res.data.playlist) {
          return res.data.playlist
        }
      } catch (error) {
        console.error('获取歌单详情失败:', error)
      }
      return null
    },
    async startSong(musicDetail) {
      if (musicDetail.id === this.songId) {
        // 如果是当前正在播放的歌曲，切换播放状态
        this.saveIsPlaying(!this.isPlaying)
        return
      }
      
      // 获取音乐URL
      const res = await this.$http.get('song/url', {
        params: {
          id: musicDetail.id
        }
      })
      
      if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
        const musicUrl = res.data.data[0].url
        
        // 保存音乐URL
        this.saveMusicUrl(musicUrl)
        
        // 保存音乐详情
        this.saveMusicDetail(musicDetail)
        
        // 保存歌曲ID
        this.saveSongId(musicDetail.id)
        
        // 设置播放状态为播放中
        this.saveIsPlaying(true)
        
        // 添加到播放列表
        this.deletePlayListSong(musicDetail.id)
        this.unshiftPlayList(musicDetail)
        
        // 添加到历史播放列表
        this.deleteHisListSong(musicDetail.id)
        this.unshiftHisMusicList(musicDetail)
        
        // 添加到已播放列表
        this.deleteHasListSong(musicDetail.id)
        this.pushHasPlayList(musicDetail)
        
        this.$message.success('开始播放: ' + musicDetail.name)
      } else {
        this.$message.error('获取音乐URL失败')
      }
    }
  },
  created() {
    this.loadShortcuts()
  }
}
</script>

<style scoped>
.custom-shortcut {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #333;
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.shortcut-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.shortcut-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.shortcut-item.editing {
  cursor: default;
}

.item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 50px;
  height: 50px;
  background-color: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.item-type {
  font-size: 12px;
  color: #999;
}

.item-edit-input {
  width: 100%;
}

.item-actions {
  display: flex;
  gap: 10px;
  color: #999;
  font-size: 18px;
  margin-left: 15px;
}

.item-actions i:hover {
  color: #ff6b6b;
  cursor: pointer;
}

.drag-handle {
  color: #999;
  font-size: 20px;
  cursor: grab;
  margin-left: 10px;
}

.drag-handle:hover {
  color: #ff6b6b;
}

.add-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #dcdfe6;
  background-color: #fafafa;
  cursor: pointer;
}

.add-item:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.add-icon {
  width: 60px;
  height: 60px;
  border: 2px dashed currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 10px;
}

.add-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .shortcut-list {
    grid-template-columns: 1fr;
  }
  
  .custom-shortcut {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
}
</style>