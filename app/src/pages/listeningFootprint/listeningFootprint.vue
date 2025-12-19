<template>
  <div class="listening-footprint">
    <div class="footprint-header">
      <h2>我的听歌足迹</h2>
      <el-button type="text" icon="el-icon-delete" @click="clearAll" :disabled="!hasFootprints">
        清空全部
      </el-button>
    </div>
    
    <div v-if="hasFootprints" class="footprint-list">
      <div v-for="(group, date) in groupedFootprints" :key="date" class="footprint-group">
        <div class="group-date">{{ date }}</div>
        <div class="group-songs">
          <div v-for="item in group" :key="item.id" class="song-item">
            <div class="song-info">
              <div class="song-name">{{ item.name }}</div>
              <div class="song-artist">{{ item.artist }}</div>
              <div class="song-meta">
                <span class="play-time">{{ item.playTime }}</span>
                <span class="play-count">播放 {{ item.count }} 次</span>
              </div>
            </div>
            <el-button type="text" icon="el-icon-delete" @click="deleteItem(item.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <i class="el-icon-headset"></i>
      <p>暂无听歌记录</p>
      <p class="empty-desc">开始你的音乐之旅吧</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListeningFootprint',
  data() {
    return {
      footprints: []
    }
  },
  computed: {
    hasFootprints() {
      return this.footprints.length > 0
    },
    groupedFootprints() {
      const groups = {}
      this.footprints.forEach(item => {
        const date = item.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(item)
      })
      return groups
    }
  },
  mounted() {
    this.loadFootprints()
    // 如果没有数据，添加一些模拟数据用于展示
    if (!this.hasFootprints) {
      this.addMockData()
    }
  },
  methods: {
    loadFootprints() {
      const stored = localStorage.getItem('listeningFootprints')
      this.footprints = stored ? JSON.parse(stored) : []
    },
    saveFootprints() {
      localStorage.setItem('listeningFootprints', JSON.stringify(this.footprints))
    },
    deleteItem(id) {
      this.$confirm('确定要删除这条听歌记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.footprints = this.footprints.filter(item => item.id !== id)
        this.saveFootprints()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    clearAll() {
      this.$confirm('确定要清空所有听歌记录吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.footprints = []
        this.saveFootprints()
        this.$message.success('清空成功')
      }).catch(() => {})
    },
    // 添加模拟数据
    addMockData() {
      const mockData = [
        {
          id: 1001,
          name: '晴天',
          artist: '周杰伦',
          date: new Date().toLocaleDateString('zh-CN'),
          playTime: '14:30:25',
          count: 5
        },
        {
          id: 1002,
          name: '七里香',
          artist: '周杰伦',
          date: new Date().toLocaleDateString('zh-CN'),
          playTime: '15:45:12',
          count: 3
        },
        {
          id: 1003,
          name: '以父之名',
          artist: '周杰伦',
          date: new Date(Date.now() - 86400000).toLocaleDateString('zh-CN'),
          playTime: '19:20:33',
          count: 2
        },
        {
          id: 1004,
          name: '夜曲',
          artist: '周杰伦',
          date: new Date(Date.now() - 86400000).toLocaleDateString('zh-CN'),
          playTime: '20:15:47',
          count: 4
        },
        {
          id: 1005,
          name: '青花瓷',
          artist: '周杰伦',
          date: new Date(Date.now() - 172800000).toLocaleDateString('zh-CN'),
          playTime: '16:50:11',
          count: 6
        }
      ]
      this.footprints = mockData
      this.saveFootprints()
    }
  }
}
</script>

<style scoped>
.listening-footprint {
  padding: 20px;
  min-height: 100vh;
}

.footprint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.footprint-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.footprint-list {
  max-width: 100%;
}

.footprint-group {
  margin-bottom: 30px;
}

.group-date {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
}

.group-songs {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.song-item:last-child {
  margin-bottom: 0;
}

.song-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.song-meta {
  font-size: 11px;
  color: #c0c4cc;
}

.song-meta span {
  margin-right: 15px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #c0c4cc;
}

.empty-state p {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.empty-desc {
  font-size: 14px;
  color: #c0c4cc;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .listening-footprint {
    padding: 15px;
  }
  
  .footprint-header h2 {
    font-size: 20px;
  }
  
  .song-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .song-item .el-button {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>