<template>
  <div class="music-time-machine">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>音乐时光机</h1>
      <i class="el-icon-share-alt share-icon" @click="showShareDialog = true"></i>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="timeFilter" placeholder="选择时间范围" @change="onFilterChange">
        <el-option label="近7天" value="7d"></el-option>
        <el-option label="近30天" value="30d"></el-option>
        <el-option label="近1年" value="1y"></el-option>
        <el-option label="全部时间" value="all"></el-option>
      </el-select>

      <el-select v-model="typeFilter" placeholder="选择音乐类型" @change="onFilterChange">
        <el-option label="流行" value="pop"></el-option>
        <el-option label="摇滚" value="rock"></el-option>
        <el-option label="古典" value="classic"></el-option>
        <el-option label="电子" value="electronic"></el-option>
        <el-option label="说唱" value="rap"></el-option>
      </el-select>

      <el-select v-model="sceneFilter" placeholder="选择场景" @change="onFilterChange">
        <el-option label="通勤" value="commute"></el-option>
        <el-option label="学习" value="study"></el-option>
        <el-option label="睡前" value="sleep"></el-option>
        <el-option label="运动" value="sports"></el-option>
        <el-option label="工作" value="work"></el-option>
      </el-select>

      <el-button type="primary" @click="generatePlaylist">生成历史歌单</el-button>
    </div>

    <!-- 听歌偏好雷达图 -->
    <div class="radar-chart">
      <h3>听歌偏好</h3>
      <!-- 这里可以集成ECharts雷达图 -->
      <div id="radarChart" style="width: 100%; height: 300px;"></div>
    </div>

    <!-- 时光轴内容区 -->
    <div class="timeline-container">
      <div class="timeline-item" v-for="(item, index) in timelineData" :key="index">
        <div class="timeline-node" :class="{ 'high-frequency': item.playCount > 10 }" @click="toggleNode(index)">
          <span class="node-dot"></span>
          <span class="node-date">{{ item.date }}</span>
        </div>
        <div class="timeline-content" v-show="item.expanded">
          <div class="song-carousel">
            <div class="song-card" v-for="(song, songIndex) in item.songs" :key="songIndex">
              <img :src="song.cover" :alt="song.name" class="song-cover" loading="lazy">
              <div class="song-info">
                <h4>{{ song.name }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <div class="song-actions">
                <i class="el-icon-play" @click="playSong(song)"></i>
                <i class="el-icon-collection" @click="addToPlaylist(song)"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享对话框 -->
    <el-dialog title="分享到" :visible.sync="showShareDialog" width="30%">
      <div class="share-options">
        <i class="el-icon-wechat" @click="shareTo('wechat')">微信</i>
        <i class="el-icon-weibo" @click="shareTo('weibo')">微博</i>
        <i class="el-icon-qq" @click="shareTo('qq')">QQ</i>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicTimeMachine',
  data() {
    return {
      timeFilter: '7d',
      typeFilter: '',
      sceneFilter: '',
      showShareDialog: false,
      timelineData: [
        {
          date: '2023-12-01',
          playCount: 15,
          expanded: true,
          songs: [
            {
              name: '晴天',
              artist: '周杰伦',
              cover: 'https://picsum.photos/200/200?random=1'
            },
            {
              name: '七里香',
              artist: '周杰伦',
              cover: 'https://picsum.photos/200/200?random=2'
            },
            {
              name: '以父之名',
              artist: '周杰伦',
              cover: 'https://picsum.photos/200/200?random=3'
            }
          ]
        },
        {
          date: '2023-11-25',
          playCount: 8,
          expanded: false,
          songs: [
            {
              name: '青花瓷',
              artist: '周杰伦',
              cover: 'https://picsum.photos/200/200?random=4'
            },
            {
              name: '东风破',
              artist: '周杰伦',
              cover: 'https://picsum.photos/200/200?random=5'
            }
          ]
        }
      ]
    }
  },
  methods: {
    onFilterChange() {
      // 防抖处理，避免频繁请求
      clearTimeout(this.filterTimeout)
      this.filterTimeout = setTimeout(() => {
        this.loadTimelineData()
      }, 300)
    },
    loadTimelineData() {
      // 模拟加载数据
      console.log('加载数据:', this.timeFilter, this.typeFilter, this.sceneFilter)
    },
    toggleNode(index) {
      this.timelineData[index].expanded = !this.timelineData[index].expanded
    },
    playSong(song) {
      console.log('播放歌曲:', song)
    },
    addToPlaylist(song) {
      console.log('加入歌单:', song)
    },
    generatePlaylist() {
      console.log('生成历史歌单')
    },
    shareTo(platform) {
      console.log('分享到:', platform)
      this.showShareDialog = false
    }
  },
  mounted() {
    // 初始化雷达图
    this.initRadarChart()
  },
  beforeDestroy() {
    // 清理定时器
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout)
    }
  }
}
</script>

<style scoped>
.music-time-machine {
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

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.share-icon {
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.share-icon:hover {
  color: #c20c0c;
}

.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-bar .el-select {
  width: 150px;
}

.radar-chart {
  margin-bottom: 40px;
}

.radar-chart h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
}

.timeline-container {
  position: relative;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-node {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  margin-bottom: 15px;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #c20c0c;
  transition: all 0.3s;
}

.high-frequency .node-dot {
  width: 16px;
  height: 16px;
  background-color: #ff0000;
}

.node-date {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.timeline-content {
  margin-left: 50px;
}

.song-carousel {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.song-card {
  width: 150px;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.song-card:hover {
  transform: translateY(-5px);
}

.song-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.song-info {
  margin-top: 10px;
  text-align: center;
}

.song-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-card:hover .song-actions {
  opacity: 1;
}

.song-actions i {
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s;
}

.song-actions i:hover {
  transform: scale(1.2);
}

.share-options {
  display: flex;
  justify-content: space-around;
  padding: 20px;
}

.share-options i {
  font-size: 32px;
  cursor: pointer;
  transition: color 0.3s;
}

.share-options i:nth-child(1):hover {
  color: #07c160;
}

.share-options i:nth-child(2):hover {
  color: #ff6600;
}

.share-options i:nth-child(3):hover {
  color: #12b7f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-time-machine {
    padding: 10px;
  }

  .header h1 {
    font-size: 24px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 10px;
  }

  .filter-bar .el-select {
    width: 100%;
  }

  .song-card {
    width: 120px;
  }

  .song-cover {
    width: 120px;
    height: 120px;
  }

  .song-actions {
    height: 120px;
  }
}
</style>