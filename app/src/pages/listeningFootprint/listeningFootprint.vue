<template>
  <div class="listening-footprint">
    <div class="header">
      <h2>我的听歌足迹</h2>
      <el-button type="danger" @click="clearAll" size="mini">清空全部</el-button>
    </div>
    <div class="footprint-list">
      <div v-for="(group, date) in footprintGroups" :key="date" class="date-group">
        <div class="date-title">{{ date }}</div>
        <div class="song-list">
          <div v-for="song in group" :key="song.id" class="song-item">
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
              <div class="song-time">播放时间: {{ song.playTime }}</div>
              <div class="song-count">播放次数: {{ song.playCount }}</div>
            </div>
            <el-button type="text" @click="deleteSong(song.id)" size="mini">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="Object.keys(footprintGroups).length === 0" class="empty-state">
      <p>暂无听歌足迹</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'listeningFootprint',
  data() {
    return {
      footprints: []
    }
  },
  computed: {
    footprintGroups() {
      const groups = {}
      this.footprints.forEach(song => {
        const date = song.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(song)
      })
      return groups
    }
  },
  created() {
    this.loadFootprints()
    // 模拟一些数据
    this.mockFootprints()
  },
  methods: {
    loadFootprints() {
      const savedFootprints = localStorage.getItem('listeningFootprints')
      if (savedFootprints) {
        this.footprints = JSON.parse(savedFootprints)
      }
    },
    saveFootprints() {
      localStorage.setItem('listeningFootprints', JSON.stringify(this.footprints))
    },
    mockFootprints() {
      if (this.footprints.length === 0) {
        const mockData = [
          { id: 1, name: '晴天', artist: '周杰伦', date: '2025-12-24', playTime: '10:30:00', playCount: 5 },
          { id: 2, name: '告白气球', artist: '周杰伦', date: '2025-12-24', playTime: '14:20:00', playCount: 3 },
          { id: 3, name: '稻香', artist: '周杰伦', date: '2025-12-23', playTime: '09:15:00', playCount: 2 },
          { id: 4, name: '一路向北', artist: '周杰伦', date: '2025-12-23', playTime: '16:45:00', playCount: 4 },
          { id: 5, name: '青花瓷', artist: '周杰伦', date: '2025-12-22', playTime: '21:05:00', playCount: 1 }
        ]
        this.footprints = mockData
        this.saveFootprints()
      }
    },
    deleteSong(id) {
      this.footprints = this.footprints.filter(song => song.id !== id)
      this.saveFootprints()
      this.$message.success('删除成功')
    },
    clearAll() {
      this.$confirm('确定要清空全部听歌足迹吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.footprints = []
        this.saveFootprints()
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
  max-width: 1200px;
  margin: 0 auto;
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
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.date-group {
  margin-bottom: 30px;
}

.date-title {
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.song-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.song-item:last-child {
  border-bottom: none;
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.song-time, .song-count {
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #999;
}

@media (max-width: 768px) {
  .listening-footprint {
    padding: 10px;
  }
  
  .header h2 {
    font-size: 20px;
  }
  
  .song-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .song-item el-button {
    margin-top: 10px;
  }
}
</style>