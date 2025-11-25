<template>
  <div class="music-time-machine">
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>时间范围:</label>
        <el-select v-model="timeRange" placeholder="选择时间范围" @change="onFilterChange">
          <el-option label="近一周" value="week" />
          <el-option label="近一月" value="month" />
          <el-option label="近一年" value="year" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </div>
      <div class="filter-group">
        <label>音乐风格:</label>
        <el-select v-model="musicStyle" placeholder="选择音乐风格" @change="onFilterChange">
          <el-option label="流行" value="pop" />
          <el-option label="摇滚" value="rock" />
          <el-option label="古典" value="classical" />
          <el-option label="电子" value="electronic" />
          <el-option label="民谣" value="folk" />
        </el-select>
      </div>
      <div class="filter-group">
        <label>场景:</label>
        <el-select v-model="scene" placeholder="选择场景" @change="onFilterChange">
          <el-option label="通勤" value="commute" />
          <el-option label="学习" value="study" />
          <el-option label="睡前" value="sleep" />
          <el-option label="运动" value="sports" />
          <el-option label="聚会" value="party" />
        </el-select>
      </div>
    </div>

    <!-- 中间时光轴区 -->
    <div class="timeline-section">
      <div class="timeline-item" v-for="(item, index) in timelineData" :key="index">
        <div class="timeline-card" @click="toggleCard(item)">
          <div class="card-header">
            <div class="time-period">{{ item.timePeriod }}</div>
            <div class="mood-tag">{{ item.moodTag }}</div>
          </div>
          <div class="card-content">
            <img :src="item.cover" alt="代表歌曲封面" class="cover-image" />
            <div class="card-info">
              <div class="listen-count">聆听次数: {{ item.listenCount }}</div>
              <div class="avg-duration">平均每日时长: {{ item.avgDuration }}</div>
            </div>
          </div>
          <div class="card-expand" v-if="item.expanded">
            <div class="song-list">
              <div class="song-item" v-for="(song, songIndex) in item.songs" :key="songIndex">
                <div class="song-info">
                  <div class="song-name">{{ song.name }}</div>
                  <div class="song-artist">{{ song.artist }}</div>
                </div>
                <div class="play-time">{{ song.playTime }}</div>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small">批量添加到歌单</el-button>
              <el-button type="success" size="small">时光穿梭</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <div class="play-control-section">
      <div class="current-song-info">
        <img :src="currentSong.cover" alt="当前歌曲封面" class="current-cover" />
        <div class="song-details">
          <div class="current-song-name">{{ currentSong.name }}</div>
          <div class="current-song-artist">{{ currentSong.artist }}</div>
        </div>
      </div>
      <div class="play-controls">
        <el-button icon="el-icon-skip-prev" size="small" />
        <el-button :icon="isPlaying ? 'el-icon-pause' : 'el-icon-play'" size="small" @click="togglePlay" />
        <el-button icon="el-icon-skip-next" size="small" />
        <el-button icon="el-icon-loop" size="small" class="time-loop" />
      </div>
      <div class="progress-bar">
        <el-slider v-model="progress" :max="100" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicTimeMachine',
  data() {
    return {
      timeRange: '',
      musicStyle: '',
      scene: '',
      isPlaying: false,
      progress: 0,
      currentSong: {
        name: '当前播放歌曲',
        artist: '艺术家',
        cover: 'https://via.placeholder.com/80'
      },
      timelineData: [
        {
          timePeriod: '2023年夏天',
          moodTag: '快乐',
          cover: 'https://via.placeholder.com/200',
          listenCount: 1234,
          avgDuration: '2小时30分',
          expanded: false,
          songs: [
            { name: '歌曲1', artist: '艺术家1', playTime: '2023-07-15' },
            { name: '歌曲2', artist: '艺术家2', playTime: '2023-07-20' },
            { name: '歌曲3', artist: '艺术家3', playTime: '2023-08-05' }
          ]
        },
        {
          timePeriod: '2023年秋天',
          moodTag: '治愈',
          cover: 'https://via.placeholder.com/200',
          listenCount: 987,
          avgDuration: '1小时45分',
          expanded: false,
          songs: [
            { name: '歌曲4', artist: '艺术家4', playTime: '2023-10-10' },
            { name: '歌曲5', artist: '艺术家5', playTime: '2023-10-25' }
          ]
        },
        {
          timePeriod: '2023年冬天',
          moodTag: '怀旧',
          cover: 'https://via.placeholder.com/200',
          listenCount: 765,
          avgDuration: '2小时15分',
          expanded: false,
          songs: [
            { name: '歌曲6', artist: '艺术家6', playTime: '2023-12-20' },
            { name: '歌曲7', artist: '艺术家7', playTime: '2023-12-30' },
            { name: '歌曲8', artist: '艺术家8', playTime: '2024-01-05' }
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
        // 这里可以添加筛选逻辑，调用API获取筛选后的数据
        console.log('筛选条件变化:', this.timeRange, this.musicStyle, this.scene)
      }, 300)
    },
    toggleCard(item) {
      item.expanded = !item.expanded
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    }
  }
}
</script>

<style scoped>
.music-time-machine {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-section {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
}

.timeline-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.timeline-item {
  margin-bottom: 30px;
}

.timeline-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.time-period {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.mood-tag {
  background-color: #e0f7fa;
  color: #00695c;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.card-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.cover-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.listen-count,
.avg-duration {
  font-size: 14px;
  color: #666;
}

.card-expand {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.song-list {
  margin-bottom: 15px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.song-item:last-child {
  border-bottom: none;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.song-artist {
  font-size: 12px;
  color: #666;
}

.play-time {
  font-size: 12px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.play-control-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background-color: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.current-song-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.current-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.current-song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.current-song-artist {
  font-size: 12px;
  color: #666;
}

.play-controls {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.time-loop {
  color: #1890ff;
}

.progress-bar {
  flex: 2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .play-control-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .current-song-info,
  .play-controls,
  .progress-bar {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
