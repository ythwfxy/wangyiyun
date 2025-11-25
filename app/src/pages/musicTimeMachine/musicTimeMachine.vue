<template>
  <div class="music-time-machine">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>时间维度:</label>
        <el-radio-group v-model="timeFilter">
          <el-radio label="7">近7天</el-radio>
          <el-radio label="30">近30天</el-radio>
          <el-radio label="365">近1年</el-radio>
          <el-radio label="all">全部时间</el-radio>
        </el-radio-group>
      </div>
      <div class="filter-group">
        <label>音乐类型:</label>
        <el-select v-model="typeFilter" placeholder="请选择">
          <el-option label="流行" value="pop"></el-option>
          <el-option label="摇滚" value="rock"></el-option>
          <el-option label="古典" value="classical"></el-option>
          <el-option label="电子" value="electronic"></el-option>
          <el-option label="说唱" value="rap"></el-option>
        </el-select>
      </div>
      <div class="filter-group">
        <label>场景:</label>
        <el-select v-model="sceneFilter" placeholder="请选择">
          <el-option label="通勤" value="commute"></el-option>
          <el-option label="学习" value="study"></el-option>
          <el-option label="睡前" value="sleep"></el-option>
          <el-option label="运动" value="sports"></el-option>
          <el-option label="工作" value="work"></el-option>
        </el-select>
      </div>
      <div class="filter-group">
        <el-button type="primary" @click="generatePlaylist">生成歌单</el-button>
      </div>
    </div>

    <!-- 听歌偏好雷达图 -->
    <div class="radar-chart">
      <h3>听歌偏好</h3>
      <!-- 这里可以使用echarts或其他图表库实现雷达图 -->
      <div id="radarChart" style="width: 100%; height: 300px;"></div>
    </div>

    <!-- 时光轴内容区 -->
    <div class="timeline-container">
      <div class="timeline">
        <div 
          v-for="(node, index) in timelineData" 
          :key="index"
          class="timeline-node"
          :class="{ 'high-frequency': node.playCount > 10 }"
          @click="toggleNode(index)"
          @mouseenter="showTooltip(index)"
          @mouseleave="hideTooltip(index)"
        >
          <div class="node-dot"></div>
          <div class="node-content">
            <div class="node-date">{{ node.date }}</div>
            <div class="node-songs" v-show="node.expanded">
              <div class="song-card" v-for="(song, songIndex) in node.songs" :key="songIndex">
                <img :src="song.cover" :alt="song.name" class="song-cover">
                <div class="song-info">
                  <div class="song-name">{{ song.name }}</div>
                  <div class="song-artist">{{ song.artist }}</div>
                </div>
                <div class="song-actions">
                  <el-button type="text" icon="el-icon-plus" @click.stop="addToPlaylist(song)">加入歌单</el-button>
                  <el-button type="text" icon="el-icon-play" @click.stop="playSong(song)">播放</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 时光回溯播放提示 -->
    <div class="time-travel-indicator" v-show="isTimeTraveling">
      <i class="el-icon-time"></i>
      <span>时光回溯中</span>
    </div>

    <!-- Tooltip -->
    <div 
      class="tooltip" 
      v-show="showTooltipIndex !== -1"
      :style="tooltipStyle"
    >
      <h4>该时段听歌TOP3</h4>
      <ul>
        <li v-for="(song, index) in timelineData[showTooltipIndex].top3" :key="index">
          {{ index + 1 }}. {{ song.name }} - {{ song.artist }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicTimeMachine',
  data() {
    return {
      timeFilter: '30',
      typeFilter: '',
      sceneFilter: '',
      isTimeTraveling: false,
      showTooltipIndex: -1,
      tooltipStyle: {},
      timelineData: [
        {
          date: '2023-06-01',
          playCount: 15,
          expanded: true,
          songs: [
            {
              name: '晴天',
              artist: '周杰伦',
              cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
            },
            {
              name: '以父之名',
              artist: '周杰伦',
              cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
            },
            {
              name: '七里香',
              artist: '周杰伦',
              cover: 'https://p3.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
            }
          ],
          top3: [
            {
              name: '晴天',
              artist: '周杰伦'
            },
            {
              name: '以父之名',
              artist: '周杰伦'
            },
            {
              name: '七里香',
              artist: '周杰伦'
            }
          ]
        },
        {
          date: '2023-07-01',
          playCount: 8,
          expanded: false,
          songs: [
            {
              name: '海阔天空',
              artist: 'Beyond',
              cover: 'https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
            },
            {
              name: '光辉岁月',
              artist: 'Beyond',
              cover: 'https://p5.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
            }
          ],
          top3: [
            {
              name: '海阔天空',
              artist: 'Beyond'
            },
            {
              name: '光辉岁月',
              artist: 'Beyond'
            },
            {
              name: '真的爱你',
              artist: 'Beyond'
            }
          ]
        }
      ]
    }
  },
  methods: {
    toggleNode(index) {
      this.timelineData[index].expanded = !this.timelineData[index].expanded;
    },
    showTooltip(index, event) {
      this.showTooltipIndex = index;
      // 计算tooltip位置
      const node = event.currentTarget;
      const rect = node.getBoundingClientRect();
      this.tooltipStyle = {
        left: rect.left + rect.width / 2 + 'px',
        top: rect.top - 10 + 'px'
      };
    },
    hideTooltip() {
      this.showTooltipIndex = -1;
    },
    addToPlaylist(song) {
      // 加入歌单逻辑
      this.$message.success(`${song.name} 已加入歌单`);
    },
    playSong(song) {
      // 播放歌曲逻辑
      this.$message.success(`正在播放 ${song.name}`);
    },
    generatePlaylist() {
      // 生成历史歌单逻辑
      this.$message.success('历史歌单已生成');
    },
    startTimeTravel(node) {
      // 时光回溯播放逻辑
      this.isTimeTraveling = true;
      this.$message.success(`开始时光回溯到 ${node.date}`);
    }
  },
  mounted() {
    // 初始化雷达图
    this.initRadarChart();
  },
  watch: {
    // 监听筛选条件变化，防抖更新数据
    timeFilter: _.debounce(function() {
      this.updateTimelineData();
    }, 300),
    typeFilter: _.debounce(function() {
      this.updateTimelineData();
    }, 300),
    sceneFilter: _.debounce(function() {
      this.updateTimelineData();
    }, 300)
  },
  computed: {
    // 根据筛选条件过滤时光轴数据
    filteredTimelineData() {
      let data = [...this.timelineData];
      // 时间过滤
      if (this.timeFilter !== 'all') {
        const days = parseInt(this.timeFilter);
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        data = data.filter(node => new Date(node.date) >= cutoffDate);
      }
      // 类型过滤
      if (this.typeFilter) {
        // 这里需要根据实际数据结构进行过滤
      }
      // 场景过滤
      if (this.sceneFilter) {
        // 这里需要根据实际数据结构进行过滤
      }
      return data;
    }
  }
}
</script>

<style scoped>
.music-time-machine {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: background 0.5s ease;
}

/* 顶部筛选栏 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

/* 雷达图 */
.radar-chart {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.radar-chart h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

/* 时光轴 */
.timeline-container {
  margin-bottom: 80px; /* 为底部播放控制栏留出空间 */
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.3);
}

.timeline-node {
  position: relative;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-node:hover {
  transform: translateX(5px);
}

.node-dot {
  position: absolute;
  left: -35px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #409eff;
  transition: all 0.3s ease;
}

.timeline-node.high-frequency .node-dot {
  background: #f56c6c;
  border-color: #f56c6c;
  transform: scale(1.2);
}

.node-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.node-date {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.node-songs {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.song-card {
  min-width: 150px;
  max-width: 150px;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.song-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.song-card:hover .song-actions {
  opacity: 1;
}

.song-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.song-info {
  padding: 10px;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
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
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-actions button {
  color: #fff;
}

/* 时光回溯提示 */
.time-travel-indicator {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(245, 108, 108, 0.95);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 1000;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

/* Tooltip */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
  transform: translateX(-50%);
  min-width: 200px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.tooltip h4 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.tooltip ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tooltip li {
  font-size: 12px;
  margin-bottom: 5px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .song-card {
    min-width: 120px;
    max-width: 120px;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .timeline {
    padding-left: 30px;
  }

  .node-dot {
    left: -25px;
  }

  .song-card {
    min-width: 100px;
    max-width: 100px;
  }

  .node-songs {
    gap: 10px;
  }
}
</style>