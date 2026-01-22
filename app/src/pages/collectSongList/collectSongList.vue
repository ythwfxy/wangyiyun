<template>
  <div class="collectSongList">
    <div class="page-header">
      <h2>我的收藏歌单</h2>
    </div>
    
    <div class="list-container">
      <div class="list-header">
        <div class="header-row">
          <div class="col-checkbox">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          </div>
          <div class="col-id">
            <h3>ID</h3>
          </div>
          <div class="col-song-name">
            <h3>歌曲名</h3>
          </div>
          <div class="col-singer">
            <h3>歌手</h3>
          </div>
          <div class="col-duration">
            <h3>时长</h3>
          </div>
          <div class="col-collect-time">
            <h3>收藏时间</h3>
          </div>
          <div class="col-action">
            <h3>操作</h3>
          </div>
        </div>
      </div>
      
      <div class="list-body">
        <div 
          v-for="song in sortedSongs" 
          :key="song.id"
          class="list-item"
          @mouseenter="hoveredItem = song.id"
          @mouseleave="hoveredItem = null"
          :class="{ 'hovered': hoveredItem === song.id }"
        >
          <div class="col-checkbox">
            <el-checkbox v-model="selectedSongs" :label="song.id"></el-checkbox>
          </div>
          <div class="col-id">{{ song.id }}</div>
          <div class="col-song-name">{{ song.name }}</div>
          <div class="col-singer">{{ song.singer }}</div>
          <div class="col-duration">{{ formatDuration(song.duration) }}</div>
          <div class="col-collect-time">{{ song.collectTime }}</div>
          <div class="col-action">
            <el-button type="text" @click="confirmRemove(song.id)">取消收藏</el-button>
          </div>
        </div>
      </div>
      
      <div class="list-footer">
        <div class="footer-left">
          <el-button type="primary" @click="confirmBatchRemove" :disabled="selectedSongs.length === 0">
            批量取消收藏
          </el-button>
        </div>
        <div class="footer-right">
          <span>共 {{ songs.length }} 首歌曲</span>
        </div>
      </div>
    </div>
    
    <!-- 二次确认弹窗 -->
    <el-dialog
      title="确认操作"
      :visible.sync="dialogVisible"
      width="400px"
    >
      <span>{{ dialogMessage }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'collectSongList',
  data() {
    return {
      songs: [],
      selectedSongs: [],
      selectAll: false,
      hoveredItem: null,
      dialogVisible: false,
      dialogMessage: '',
      removeType: '', // 'single' 或 'batch'
      removeId: null
    }
  },
  computed: {
    sortedSongs() {
      return [...this.songs].sort((a, b) => {
        return new Date(b.collectTime) - new Date(a.collectTime)
      })
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      // 从localStorage获取数据
      const storedSongs = localStorage.getItem('collectSongs')
      if (storedSongs) {
        this.songs = JSON.parse(storedSongs)
      } else {
        // 生成模拟数据
        this.generateMockData()
      }
    },
    generateMockData() {
      const mockSongs = []
      const songNames = ['起风了', '追光者', '演员', '海阔天空', '光辉岁月', '七里香', '青花瓷', '稻香', '十年', '浮夸']
      const singers = ['买辣椒也用券', '岑宁儿', '薛之谦', 'Beyond', 'Beyond', '周杰伦', '周杰伦', '周杰伦', '陈奕迅', '陈奕迅']
      
      for (let i = 1; i <= 50; i++) {
        const randomName = songNames[Math.floor(Math.random() * songNames.length)]
        const randomSinger = singers[Math.floor(Math.random() * singers.length)]
        const randomDuration = Math.floor(Math.random() * 180) + 60 // 1-4分钟
        const randomDate = new Date()
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))
        randomDate.setHours(Math.floor(Math.random() * 24))
        randomDate.setMinutes(Math.floor(Math.random() * 60))
        
        mockSongs.push({
          id: i,
          name: randomName + (i > 10 ? ` (${i})` : ''),
          singer: randomSinger,
          duration: randomDuration,
          collectTime: randomDate.toLocaleString()
        })
      }
      
      this.songs = mockSongs
      localStorage.setItem('collectSongs', JSON.stringify(mockSongs))
    },
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    handleSelectAll(val) {
      if (val) {
        this.selectedSongs = this.songs.map(song => song.id)
      } else {
        this.selectedSongs = []
      }
    },
    confirmRemove(id) {
      this.removeType = 'single'
      this.removeId = id
      this.dialogMessage = '确定要取消收藏这首歌曲吗？'
      this.dialogVisible = true
    },
    confirmBatchRemove() {
      if (this.selectedSongs.length === 0) return
      this.removeType = 'batch'
      this.dialogMessage = `确定要取消收藏选中的 ${this.selectedSongs.length} 首歌曲吗？`
      this.dialogVisible = true
    },
    handleConfirm() {
      if (this.removeType === 'single') {
        this.removeSong(this.removeId)
      } else if (this.removeType === 'batch') {
        this.removeBatchSongs()
      }
      this.dialogVisible = false
    },
    removeSong(id) {
      this.songs = this.songs.filter(song => song.id !== id)
      this.selectedSongs = this.selectedSongs.filter(songId => songId !== id)
      this.saveToLocalStorage()
    },
    removeBatchSongs() {
      this.songs = this.songs.filter(song => !this.selectedSongs.includes(song.id))
      this.selectedSongs = []
      this.selectAll = false
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      localStorage.setItem('collectSongs', JSON.stringify(this.songs))
    }
  }
}
</script>

<style scoped>
.collectSongList {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.list-container {
  border: 1px solid #e0e0e0;
}

.list-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.list-body {
  max-height: 600px;
  overflow-y: auto;
}

.header-row {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
}

.header-row h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.list-item {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.list-item:hover {
  background-color: #fafafa;
}

.list-item.hovered {
  background-color: #f0f0f0;
}

.col-checkbox {
  width: 60px;
}

.col-id {
  width: 80px;
  color: #999;
}

.col-song-name {
  flex: 1;
  color: #333;
  font-weight: 400;
}

.col-singer {
  width: 150px;
  color: #666;
}

.col-duration {
  width: 100px;
  color: #999;
  text-align: center;
}

.col-collect-time {
  width: 200px;
  color: #999;
  text-align: center;
}

.col-action {
  width: 120px;
  text-align: center;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.footer-left {
  display: flex;
  gap: 10px;
}

.footer-right {
  color: #999;
}

/* 响应式调整 */
@media screen and (min-width: 1920px) {
  .col-duration {
    width: 120px;
  }
  
  .col-collect-time {
    width: 220px;
  }
}
</style>