<template>
  <div class="listening-footprint">
    <div class="container">
      <div class="header">
        <h2>我的听歌足迹</h2>
        <el-button type="danger" size="small" @click="clearAll">清空全部</el-button>
      </div>
      <div class="footprint-list">
        <div v-if="footprintData.length === 0" class="empty-state">
          <p>暂无听歌记录</p>
        </div>
        <div v-else>
          <div v-for="(group, date) in groupedFootprintData" :key="date" class="date-group">
            <div class="date-header">{{ date }}</div>
            <div class="song-list">
              <div v-for="(item, index) in group" :key="item.id" class="song-item">
                <div class="song-info">
                  <div class="song-name">{{ item.name }}</div>
                  <div class="song-artist">{{ item.artist }}</div>
                </div>
                <div class="song-stats">
                  <div class="play-count">播放 {{ item.playCount }} 次</div>
                  <div class="last-played">最后播放: {{ item.lastPlayed }}</div>
                </div>
                <el-button type="text" icon="el-icon-delete" @click="deleteItem(item.id)" class="delete-btn"></el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'listeningFootprint',
  data() {
    return {
      footprintData: []
    }
  },
  computed: {
    groupedFootprintData() {
      const groups = {}
      this.footprintData.forEach(item => {
        const date = item.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(item)
      })
      return groups
    }
  },
  created() {
    this.loadFootprintData()
    this.mockData()
  },
  methods: {
    loadFootprintData() {
      const data = localStorage.getItem('listeningFootprint')
      if (data) {
        this.footprintData = JSON.parse(data)
      }
    },
    saveFootprintData() {
      localStorage.setItem('listeningFootprint', JSON.stringify(this.footprintData))
    },
    mockData() {
      if (this.footprintData.length === 0) {
        const mockData = [
          { id: 1, name: '晴天', artist: '周杰伦', date: '2025-12-24', playCount: 5, lastPlayed: '15:30' },
          { id: 2, name: '告白气球', artist: '周杰伦', date: '2025-12-24', playCount: 3, lastPlayed: '16:45' },
          { id: 3, name: '稻香', artist: '周杰伦', date: '2025-12-23', playCount: 2, lastPlayed: '14:20' },
          { id: 4, name: '成都', artist: '赵雷', date: '2025-12-23', playCount: 4, lastPlayed: '13:15' },
          { id: 5, name: '理想', artist: '赵雷', date: '2025-12-22', playCount: 1, lastPlayed: '17:50' }
        ]
        this.footprintData = mockData
        this.saveFootprintData()
      }
    },
    deleteItem(id) {
      this.$confirm('确定要删除这条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.footprintData = this.footprintData.filter(item => item.id !== id)
        this.saveFootprintData()
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    clearAll() {
      this.$confirm('确定要清空所有听歌记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.footprintData = []
        this.saveFootprintData()
        this.$message.success('清空成功')
      }).catch(() => {
        this.$message.info('已取消清空')
      })
    }
  }
}
</script>

<style scoped>
.listening-footprint {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.footprint-list {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.date-group {
  margin-bottom: 20px;
}

.date-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.song-list {
  margin-top: 10px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #f0f0f0;
}

.song-info {
  flex: 1;
  margin-right: 20px;
}

.song-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.song-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 20px;
  min-width: 120px;
}

.play-count {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.last-played {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .listening-footprint {
    padding: 10px;
  }
  
  .container {
    padding: 10px;
  }
  
  .header h2 {
    font-size: 20px;
  }
  
  .song-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
  
  .song-info {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .song-stats {
    align-items: flex-start;
    margin-right: 0;
    margin-bottom: 10px;
    min-width: auto;
  }
  
  .delete-btn {
    align-self: flex-end;
  }
}
</style>