<template>
  <div class="music-theater-container">
    <!-- 顶部筛选区 -->
    <div class="top-filter-section">
      <div class="page-title">音乐氛围剧场</div>
      <div class="top-right-controls">
        <button class="my-collection-btn">我的收藏剧场</button>
        <div class="search-box">
          <input type="text" placeholder="搜索剧场主题、氛围标签、歌单风格" v-model="searchKeyword" @input="handleSearchInput">
          <i class="search-icon el-icon-search"></i>
        </div>
      </div>
      
      <!-- 标签页 -->
      <div class="tab-nav">
        <div class="tab-item active" @click="switchTab('hot')">热门剧场</div>
        <div class="tab-item" @click="switchTab('category')">分类筛选</div>
        <div class="tab-item" @click="switchTab('collection')">我的收藏</div>
      </div>
      
      <!-- 分类筛选内容 -->
      <div class="category-filter" v-show="currentTab === 'category'">
        <div class="filter-group">
          <label>氛围:</label>
          <div class="filter-options">
            <span class="filter-option" :class="{ active: selectedAtmospheres.includes('治愈') }" @click="toggleFilter('atmospheres', '治愈')">治愈</span>
            <span class="filter-option" :class="{ active: selectedAtmospheres.includes('放松') }" @click="toggleFilter('atmospheres', '放松')">放松</span>
            <span class="filter-option" :class="{ active: selectedAtmospheres.includes('专注') }" @click="toggleFilter('atmospheres', '专注')">专注</span>
            <span class="filter-option" :class="{ active: selectedAtmospheres.includes('热血') }" @click="toggleFilter('atmospheres', '热血')">热血</span>
          </div>
        </div>
        <div class="filter-group">
          <label>场景:</label>
          <div class="filter-options">
            <span class="filter-option" :class="{ active: selectedScenes.includes('自然') }" @click="toggleFilter('scenes', '自然')">自然</span>
            <span class="filter-option" :class="{ active: selectedScenes.includes('城市') }" @click="toggleFilter('scenes', '城市')">城市</span>
            <span class="filter-option" :class="{ active: selectedScenes.includes('室内') }" @click="toggleFilter('scenes', '室内')">室内</span>
          </div>
        </div>
        <div class="filter-group">
          <label>时长:</label>
          <div class="filter-options">
            <span class="filter-option" :class="{ active: selectedDurations.includes('15分钟') }" @click="toggleFilter('durations', '15分钟')">15分钟</span>
            <span class="filter-option" :class="{ active: selectedDurations.includes('30分钟') }" @click="toggleFilter('durations', '30分钟')">30分钟</span>
            <span class="filter-option" :class="{ active: selectedDurations.includes('1小时') }" @click="toggleFilter('durations', '1小时')">1小时</span>
            <span class="filter-option" :class="{ active: selectedDurations.includes('自定义') }" @click="toggleFilter('durations', '自定义')">自定义</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 中间剧场推荐区 -->
    <div class="theater-recommendation-section">
      <!-- 视图切换 -->
      <div class="view-switcher">
        <i class="view-icon el-icon-s-grid" :class="{ active: currentView === 'grid' }" @click="switchView('grid')"></i>
        <i class="view-icon el-icon-full-screen" :class="{ active: currentView === 'immersive' }" @click="switchView('immersive')"></i>
      </div>
      
      <!-- 剧场卡片列表 -->
      <div class="theater-list" :class="currentView">
        <div class="theater-card" v-for="theater in theaterList" :key="theater.id" @click="enterTheater(theater)">
          <div class="theater-preview">
            <img :src="theater.previewImage" :alt="theater.name">
            <div class="theater-overlay">
              <i class="play-icon el-icon-video-play"></i>
            </div>
          </div>
          <div class="theater-info">
            <div class="theater-name">{{ theater.name }}</div>
            <div class="theater-tags">
              <span class="tag" v-for="tag in theater.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="theater-stats">
              <span>{{ theater.playlists }}个歌单</span>
              <span>{{ theater.playCount }}次播放</span>
              <span>评分 {{ theater.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部沉浸控制栏 -->
    <div class="bottom-control-bar" v-show="currentTheater">
      <div class="control-section">
        <div class="section-title">场景控制</div>
        <div class="control-options">
          <div class="control-item">
            <label>亮度</label>
            <input type="range" min="0" max="100" v-model="sceneControls.brightness">
          </div>
          <div class="control-item">
            <label>音效强度</label>
            <input type="range" min="0" max="100" v-model="sceneControls.soundEffect">
          </div>
          <div class="control-item">
            <label>视觉动效</label>
            <input type="checkbox" v-model="sceneControls.visualEffect">
          </div>
        </div>
      </div>
      
      <div class="control-section">
        <div class="section-title">音乐控制</div>
        <div class="control-options">
          <i class="control-icon el-icon-skip-previous" @click="previousSong"></i>
          <i class="control-icon el-icon-video-play" :class="{ 'el-icon-video-pause': isPlaying }" @click="togglePlay"></i>
          <i class="control-icon el-icon-skip-next" @click="nextSong"></i>
          <div class="progress-bar">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="control-section">
        <div class="section-title">互动功能</div>
        <div class="control-options">
          <input type="text" placeholder="发送氛围弹幕" v-model="danmakuContent" @keyup.enter="sendDanmaku">
          <i class="control-icon el-icon-camera" @click="takeScreenshot"></i>
          <i class="control-icon el-icon-comment" @click="showComments"></i>
        </div>
      </div>
      
      <div class="control-section">
        <div class="section-title">播放模式</div>
        <div class="control-options">
          <span class="mode-option" :class="{ active: playMode === 'loop' }" @click="setPlayMode('loop')">循环模式</span>
          <span class="mode-option" :class="{ active: playMode === 'timer' }" @click="setPlayMode('timer')">定时关闭</span>
          <span class="mode-option" :class="{ active: playMode === 'background' }" @click="setPlayMode('background')">后台播放</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicTheater',
  data() {
    return {
      searchKeyword: '',
      currentTab: 'hot',
      selectedAtmospheres: [],
      selectedScenes: [],
      selectedDurations: [],
      currentView: 'grid',
      currentTheater: null,
      isPlaying: false,
      progress: 0,
      sceneControls: {
        brightness: 80,
        soundEffect: 50,
        visualEffect: true
      },
      danmakuContent: '',
      playMode: 'loop',
      theaterList: [
        {
          id: 1,
          name: '星空露营',
          tags: ['自然', '治愈', '放松'],
          previewImage: 'https://picsum.photos/300/200?random=1',
          playlists: 3,
          playCount: 123456,
          rating: 4.8
        },
        {
          id: 2,
          name: '雨天咖啡馆',
          tags: ['室内', '治愈', '专注'],
          previewImage: 'https://picsum.photos/300/200?random=2',
          playlists: 2,
          playCount: 98765,
          rating: 4.7
        },
        {
          id: 3,
          name: '深夜书房',
          tags: ['室内', '专注', '放松'],
          previewImage: 'https://picsum.photos/300/200?random=3',
          playlists: 1,
          playCount: 76543,
          rating: 4.6
        },
        {
          id: 4,
          name: '城市霓虹',
          tags: ['城市', '热血', '放松'],
          previewImage: 'https://picsum.photos/300/200?random=4',
          playlists: 3,
          playCount: 154321,
          rating: 4.9
        }
      ]
    }
  },
  methods: {
    handleSearchInput() {
      // 搜索逻辑
      console.log('搜索关键词:', this.searchKeyword)
    },
    switchTab(tab) {
      this.currentTab = tab
    },
    toggleFilter(type, value) {
      const selected = this[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]
      const index = selected.indexOf(value)
      if (index > -1) {
        selected.splice(index, 1)
      } else {
        selected.push(value)
      }
    },
    switchView(view) {
      this.currentView = view
    },
    enterTheater(theater) {
      this.currentTheater = theater
      this.isPlaying = true
      // 自动播放剧场预览效果
      console.log('进入剧场:', theater.name)
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    previousSong() {
      console.log('上一曲')
    },
    nextSong() {
      console.log('下一曲')
    },
    sendDanmaku() {
      if (this.danmakuContent.trim()) {
        console.log('发送弹幕:', this.danmakuContent)
        this.danmakuContent = ''
      }
    },
    takeScreenshot() {
      console.log('截图功能')
    },
    showComments() {
      console.log('显示评论')
    },
    setPlayMode(mode) {
      this.playMode = mode
    }
  },
  mounted() {
    // 默认进入页面时自动播放首个推荐剧场的预览效果
    if (this.theaterList.length > 0) {
      setTimeout(() => {
        this.enterTheater(this.theaterList[0])
      }, 1000)
    }
  }
}
</script>

<style scoped>
.music-theater-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.top-filter-section {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073; }
  to { text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6; }
}

.top-right-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.my-collection-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.my-collection-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 32px 8px 16px;
  border-radius: 20px;
  width: 300px;
  outline: none;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
}

.tab-nav {
  display: flex;
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-item.active {
  border-bottom-color: #e60073;
  color: #e60073;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-option {
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-option.active {
  background: #e60073;
}

.theater-recommendation-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.view-switcher {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 10px;
}

.view-icon {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-icon.active {
  color: #e60073;
}

.theater-list {
  display: grid;
  gap: 20px;
}

.theater-list.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.theater-list.immersive {
  grid-template-columns: 1fr;
}

.theater-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theater-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.theater-preview {
  position: relative;
  overflow: hidden;
}

.theater-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.theater-card:hover .theater-preview img {
  transform: scale(1.1);
}

.theater-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.theater-card:hover .theater-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 48px;
  color: white;
}

.theater-info {
  padding: 15px;
}

.theater-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.theater-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tag {
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
}

.theater-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.bottom-control-bar {
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.control-options {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-icon {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-icon:hover {
  color: #e60073;
}

.progress-bar {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #e60073;
  transition: width 0.3s ease;
}

.mode-option {
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-option.active {
  background: #e60073;
}
</style>