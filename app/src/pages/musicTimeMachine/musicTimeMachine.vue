<template>
  <div class="music-time-machine">
    <!-- 顶部导航栏 -->
    <div class="time-machine-header">
      <h1 class="page-title">音乐时光机</h1>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-box">我的时光胶囊</el-button>
        <el-input
          placeholder="搜索年份、月份或歌曲"
          prefix-icon="el-icon-search"
          style="width: 300px; margin-left: 20px"
        ></el-input>
      </div>
    </div>

    <!-- 顶部时间筛选区 -->
    <div class="time-filter-section">
      <!-- 时间粒度切换 -->
      <div class="time-granularity">
        <el-radio-group v-model="timeGranularity">
          <el-radio label="day">日</el-radio>
          <el-radio label="week">周</el-radio>
          <el-radio label="month">月</el-radio>
          <el-radio label="year">年</el-radio>
        </el-radio-group>
      </div>

      <!-- 时间罗盘/年份轮盘 -->
      <div class="time-compass">
        <div class="compass-container">
          <!-- 这里可以添加时间罗盘的SVG或Canvas实现 -->
          <div class="compass-center">2023</div>
          <div class="compass-ring">
            <div class="compass-item" v-for="year in years" :key="year">
              {{ year }}
            </div>
          </div>
        </div>
      </div>

      <!-- 水平时间轴 -->
      <div class="time-axis">
        <div class="axis-container">
          <div class="axis-item" v-for="item in timeAxisItems" :key="item.id">
            <div class="axis-marker"></div>
            <div class="axis-label">{{ item.label }}</div>
            <div class="axis-milestone" v-if="item.milestone">
              {{ item.milestone }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间时光画廊区 -->
    <div class="time-gallery-section">
      <!-- 视图切换 -->
      <div class="view-switcher">
        <el-button-group>
          <el-button :type="currentView === 'album' ? 'primary' : 'default'">
            时光相册
          </el-button>
          <el-button :type="currentView === 'emotion' ? 'primary' : 'default'">
            情感光谱
          </el-button>
        </el-button-group>
      </div>

      <!-- 时光相册视图 -->
      <div v-if="currentView === 'album'" class="photo-album">
        <div class="photo-card" v-for="song in songList" :key="song.id">
          <div class="album-cover">
            <img :src="song.cover" alt="{{ song.name }}" />
            <div class="play-overlay">
              <i class="el-icon-play"></i>
            </div>
          </div>
          <div class="song-info">
            <h3 class="song-name">{{ song.name }}</h3>
            <p class="singer-name">{{ song.singer }}</p>
            <p class="listen-time">{{ song.listenTime }}</p>
          </div>
        </div>
      </div>

      <!-- 情感光谱视图 -->
      <div v-if="currentView === 'emotion'" class="emotion-spectrum">
        <!-- 这里可以添加情感光谱的可视化实现 -->
        <div class="spectrum-container">
          <div class="emotion-bar" v-for="emotion in emotionData" :key="emotion.type">
            <div class="emotion-label">{{ emotion.label }}</div>
            <div class="emotion-value" :style="{ width: emotion.value + '%', backgroundColor: emotion.color }">
              {{ emotion.value }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部时光播放栏 -->
    <div class="time-player-bar">
      <div class="player-info">
        <div class="current-song-cover">
          <img :src="currentSong.cover" alt="{{ currentSong.name }}" />
        </div>
        <div class="current-song-info">
          <h3 class="current-song-name">{{ currentSong.name }}</h3>
          <p class="current-song-singer">{{ currentSong.singer }}</p>
        </div>
      </div>

      <div class="player-controls">
        <el-button icon="el-icon-back"></el-button>
        <el-button type="primary" size="large" icon="el-icon-play"></el-button>
        <el-button icon="el-icon-right"></el-button>
      </div>

      <div class="player-progress">
        <el-slider v-model="progress" style="width: 400px"></el-slider>
      </div>

      <div class="player-actions">
        <el-button icon="el-icon-collection">生成时光歌单</el-button>
        <el-button icon="el-icon-share">分享时光</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicTimeMachine',
  data() {
    return {
      timeGranularity: 'year',
      currentView: 'album',
      progress: 50,
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      timeAxisItems: [
        { id: 1, label: '2018', milestone: '你在这一年听了1200首歌' },
        { id: 2, label: '2019', milestone: '你的年度歌手是周杰伦' },
        { id: 3, label: '2020', milestone: '你循环了100遍《Mojito》' },
        { id: 4, label: '2021', milestone: '你发现了150首独立音乐人作品' },
        { id: 5, label: '2022', milestone: '你在疫情期间听了大量治愈系音乐' },
        { id: 6, label: '2023', milestone: '你的年度歌单播放量突破10万' },
        { id: 7, label: '2024', milestone: '你开始探索古典音乐领域' }
      ],
      songList: [
        { id: 1, name: '晴天', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=1', listenTime: '2023-07-15 14:30' },
        { id: 2, name: '七里香', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=2', listenTime: '2023-08-20 20:15' },
        { id: 3, name: '以父之名', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=3', listenTime: '2023-09-10 11:20' },
        { id: 4, name: '青花瓷', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=4', listenTime: '2023-10-05 16:45' },
        { id: 5, name: '双截棍', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=5', listenTime: '2023-11-18 19:30' },
        { id: 6, name: '夜曲', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=6', listenTime: '2023-12-25 21:00' }
      ],
      emotionData: [
        { type: 'happy', label: '开心', value: 35, color: '#FFD700' },
        { type: 'sad', label: '伤感', value: 20, color: '#87CEEB' },
        { type: 'calm', label: '平静', value: 30, color: '#98FB98' },
        { type: 'excited', label: '激昂', value: 15, color: '#FF6B6B' }
      ],
      currentSong: {
        id: 1, name: '晴天', singer: '周杰伦', cover: 'https://picsum.photos/200/200?random=1'
      }
    }
  },
  methods: {
    // 这里可以添加各种交互方法
  }
}
</script>

<style scoped>
.music-time-machine {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.time-machine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  /* 复古胶片颗粒感 */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-blend-mode: overlay;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
}

.time-filter-section {
  padding: 30px 40px;
  background: rgba(0, 0, 0, 0.2);
}

.time-granularity {
  margin-bottom: 30px;
  text-align: center;
}

.time-compass {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.compass-container {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
}

.compass-center {
  font-size: 24px;
  font-weight: bold;
  z-index: 2;
}

.compass-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.compass-item {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compass-item:hover {
  background: rgba(255, 215, 0, 0.6);
  transform: scale(1.2);
}

/* 简单布局罗盘年份 */
.compass-item:nth-child(1) { top: 10px; left: 50%; transform: translateX(-50%); }
.compass-item:nth-child(2) { top: 50px; right: 50px; }
.compass-item:nth-child(3) { top: 50%; right: 10px; transform: translateY(-50%); }
.compass-item:nth-child(4) { bottom: 50px; right: 50px; }
.compass-item:nth-child(5) { bottom: 10px; left: 50%; transform: translateX(-50%); }
.compass-item:nth-child(6) { bottom: 50px; left: 50px; }
.compass-item:nth-child(7) { top: 50%; left: 10px; transform: translateY(-50%); }
.compass-item:nth-child(8) { top: 50px; left: 50px; }

.time-axis {
  overflow-x: auto;
  padding: 20px 0;
}

.axis-container {
  display: flex;
  align-items: center;
  min-width: 800px;
}

.axis-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.axis-item:hover {
  transform: translateY(-5px);
}

.axis-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFD700;
  margin-bottom: 10px;
}

.axis-label {
  font-size: 16px;
  font-weight: bold;
}

.axis-milestone {
  font-size: 12px;
  background: rgba(255, 215, 0, 0.2);
  padding: 5px 10px;
  border-radius: 15px;
  margin-top: 5px;
}

.time-gallery-section {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
}

.view-switcher {
  margin-bottom: 30px;
  text-align: center;
}

.photo-album {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.photo-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.photo-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.album-cover {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.photo-card:hover .album-cover img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.photo-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  font-size: 48px;
  color: #FFD700;
}

.song-info {
  padding: 20px;
  text-align: left;
}

.song-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.singer-name {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.listen-time {
  font-size: 12px;
  opacity: 0.6;
}

.emotion-spectrum {
  padding: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.spectrum-container {
  max-width: 600px;
  margin: 0 auto;
}

.emotion-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.emotion-label {
  width: 80px;
  font-weight: bold;
}

.emotion-value {
  flex: 1;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  color: #000;
  font-weight: bold;
  margin-left: 20px;
}

.time-player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.player-info {
  display: flex;
  align-items: center;
}

.current-song-cover {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 15px;
}

.current-song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.current-song-info {
  text-align: left;
}

.current-song-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
}

.current-song-singer {
  font-size: 12px;
  opacity: 0.8;
}

.player-controls {
  display: flex;
  align-items: center;
}

.player-controls button {
  margin: 0 10px;
}

.player-progress {
  flex: 1;
  margin: 0 30px;
}

.player-actions button {
  margin-left: 15px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .time-machine-header {
    padding: 15px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .header-actions .el-input {
    margin-left: 0;
    margin-top: 10px;
    width: 200px;
  }

  .time-filter-section {
    padding: 20px;
  }

  .time-gallery-section {
    padding: 20px;
  }

  .photo-album {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .time-player-bar {
    padding: 10px 20px;
  }

  .player-progress {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .music-time-machine {
    height: calc(100vh - 60px); /* 假设底部导航栏高度为60px */
  }

  .time-machine-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    align-items: stretch;
    margin-top: 15px;
  }

  .header-actions .el-input {
    width: 100%;
  }

  .time-compass {
    display: none; /* 在移动端隐藏时间罗盘 */
  }

  .time-axis {
    padding: 10px 0;
  }

  .axis-container {
    min-width: 600px;
  }

  .axis-item {
    margin: 0 15px;
  }

  .photo-album {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .time-player-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .player-info,
  .player-controls,
  .player-progress,
  .player-actions {
    width: 100%;
    justify-content: center;
  }

  .player-progress {
    width: 100%;
    margin: 0;
  }
}
</style>