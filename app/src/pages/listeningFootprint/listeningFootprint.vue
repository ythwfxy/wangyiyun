<template>
  <div class="listening-footprint">
    <div class="page-header">
      <h2>我的听歌足迹</h2>
      <el-button type="text" icon="el-icon-delete" @click="clearAllFootprints" class="clear-button">
        清空全部
      </el-button>
    </div>

    <div v-if="groupedFootprints.length > 0" class="footprint-list">
      <div v-for="(group, date) in groupedFootprints" :key="date" class="date-group">
        <div class="date-header">
          <span class="date-text">{{ date }}</span>
        </div>
        <div class="song-list">
          <div v-for="item in group" :key="item.id" class="song-item">
            <div class="song-info">
              <img :src="item.al.picUrl" alt="专辑封面" class="album-cover" />
              <div class="song-details">
                <div class="song-name">{{ item.name }}</div>
                <div class="artist-name">{{ getArtistNames(item.ar) }}</div>
                <div class="play-info">
                  <i class="el-icon-time"></i>
                  <span>{{ item.playTime }}</span>
                  <span class="play-count">播放 {{ item.playCount }} 次</span>
                </div>
              </div>
            </div>
            <el-button type="text" icon="el-icon-delete" @click="deleteFootprint(item.id, date)" class="delete-button">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="el-icon-headset"></i>
      <p>暂无听歌记录</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'ListeningFootprint',
  computed: {
    ...mapState(['listeningFootprints']),
    groupedFootprints() {
      const groups = {}
      this.listeningFootprints.forEach(item => {
        const date = item.playDate
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(item)
      })
      return groups
    }
  },
  methods: {
    ...mapMutations(['deleteFootprint', 'clearAllFootprints']),
    getArtistNames(artists) {
      return artists.map(ar => ar.name).join(' / ')
    },
    deleteFootprint(id, date) {
      this.$confirm('确定要删除这条听歌记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('deleteFootprint', id)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    clearAllFootprints() {
      this.$confirm('确定要清空所有听歌记录吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('clearAllFootprints')
        this.$message.success('清空成功')
      }).catch(() => {})
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.clear-button {
  color: #ff4d4f;
}

.date-group {
  margin-bottom: 30px;
}

.date-header {
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.date-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.song-item:hover {
  background-color: #f5f5f5;
}

.song-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.album-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 15px;
}

.song-details {
  flex: 1;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.artist-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.play-info {
  font-size: 12px;
  color: #999;
}

.play-info i {
  margin-right: 4px;
}

.play-count {
  margin-left: 15px;
}

.delete-button {
  color: #999;
}

.delete-button:hover {
  color: #ff4d4f;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state i {
  font-size: 60px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .listening-footprint {
    padding: 10px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .album-cover {
    width: 50px;
    height: 50px;
  }

  .song-name {
    font-size: 13px;
  }

  .artist-name {
    font-size: 11px;
  }

  .play-info {
    font-size: 11px;
  }
}
</style>