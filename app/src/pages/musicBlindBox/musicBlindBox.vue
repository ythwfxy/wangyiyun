<template>
  <div class="music-blind-box">
    <!-- 顶部主题筛选区 -->
    <div class="top-section">
      <div class="title-container">
        <h1 class="dynamic-title">音乐盲盒</h1>
        <div class="top-buttons">
          <el-button type="text" @click="goToMyBoxes">我的盲盒记录</el-button>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索盲盒主题、风格标签"
            prefix-icon="el-icon-search"
            size="small"
            style="width: 200px"
          ></el-input>
        </div>
      </div>
      
      <div class="tab-container">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="热门盲盒" name="hot"></el-tab-pane>
          <el-tab-pane label="分类筛选" name="category"></el-tab-pane>
          <el-tab-pane label="限定盲盒" name="limited"></el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="daily-limit">
        <span>今日剩余拆盒次数：{{ remainingTimes }}</span>
        <el-button type="primary" size="small" @click="getExtraTimes">获取额外次数</el-button>
      </div>
      
      <!-- 分类筛选内容 -->
      <div class="category-filters" v-if="activeTab === 'category'">
        <div class="filter-group">
          <label>风格：</label>
          <el-checkbox-group v-model="selectedStyles">
            <el-checkbox label="流行">流行</el-checkbox>
            <el-checkbox label="摇滚">摇滚</el-checkbox>
            <el-checkbox label="民谣">民谣</el-checkbox>
            <el-checkbox label="电子">电子</el-checkbox>
            <el-checkbox label="古典">古典</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-group">
          <label>年代：</label>
          <el-checkbox-group v-model="selectedDecades">
            <el-checkbox label="80s">80s</el-checkbox>
            <el-checkbox label="90s">90s</el-checkbox>
            <el-checkbox label="00s">00s</el-checkbox>
            <el-checkbox label="10s">10s</el-checkbox>
            <el-checkbox label="20s">20s</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-group">
          <label>情绪：</label>
          <el-checkbox-group v-model="selectedMoods">
            <el-checkbox label="开心">开心</el-checkbox>
            <el-checkbox label="治愈">治愈</el-checkbox>
            <el-checkbox label="伤感">伤感</el-checkbox>
            <el-checkbox label="热血">热血</el-checkbox>
            <el-checkbox label="平静">平静</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-group">
          <label>场景：</label>
          <el-checkbox-group v-model="selectedScenes">
            <el-checkbox label="通勤">通勤</el-checkbox>
            <el-checkbox label="学习">学习</el-checkbox>
            <el-checkbox label="睡前">睡前</el-checkbox>
            <el-checkbox label="运动">运动</el-checkbox>
            <el-checkbox label="聚会">聚会</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    
    <!-- 中间盲盒展示区 -->
    <div class="middle-section">
      <div class="view-switcher">
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
            <i class="el-icon-s-grid"></i> 网格视图
          </el-button>
          <el-button :type="viewMode === 'immersive' ? 'primary' : 'default'" @click="viewMode = 'immersive'">
            <i class="el-icon-full-screen"></i> 沉浸式视图
          </el-button>
        </el-button-group>
      </div>
      
      <!-- 网格视图 -->
      <div class="grid-view" v-if="viewMode === 'grid'">
        <div class="blind-box-card" v-for="(box, index) in blindBoxes" :key="index" @click="openBox(box)">
          <div class="box-visual">
            <img :src="box.image" :alt="box.name" class="box-image">
            <div class="box-overlay">
              <div class="surprise-rate">惊喜概率：{{ box.surpriseRate }}</div>
              <div class="unlock-count">已解锁：{{ box.unlockCount }}人</div>
            </div>
          </div>
          <div class="box-info">
            <h3 class="box-name">{{ box.name }}</h3>
            <div class="box-tags">
              <span class="tag" v-for="(tag, tagIndex) in box.tags" :key="tagIndex">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 沉浸式视图 -->
      <div class="immersive-view" v-if="viewMode === 'immersive'">
        <div class="large-box-container">
          <!-- 这里可以实现360°拖动查看细节的功能 -->
          <div class="large-box">
            <img :src="currentBox.image" alt="盲盒" class="large-box-image">
            <div class="large-box-info">
              <h2>{{ currentBox.name }}</h2>
              <div class="box-tags">
                <span class="tag" v-for="(tag, tagIndex) in currentBox.tags" :key="tagIndex">{{ tag }}</span>
              </div>
              <p class="box-description">{{ currentBox.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部拆盒控制区 -->
    <div class="bottom-section">
      <div v-if="!isBoxOpened" class="unopened-controls">
        <div class="box-preview">
          <h3>{{ currentBox.name }}</h3>
          <p>{{ currentBox.description }}</p>
          <div class="surprise-preview">
            <i class="el-icon-gift"></i> {{ currentBox.surprisePreview }}
          </div>
        </div>
        <el-button type="primary" size="large" class="open-button" @click="startOpening()">
          <i class="el-icon-unlock"></i> 立即拆盒
        </el-button>
      </div>
      
      <div v-if="isBoxOpened" class="opened-controls">
        <div class="mini-player">
          <div class="current-song">
            <img :src="currentSong.cover" :alt="currentSong.name" class="song-cover">
            <div class="song-info">
              <h4>{{ currentSong.name }}</h4>
              <p>{{ currentSong.artist }}</p>
            </div>
          </div>
          <div class="player-controls">
            <el-button type="text" @click="previousSong">
              <i class="el-icon-back"></i>
            </el-button>
            <el-button type="primary" size="small" @click="togglePlay">
              <i :class="isPlaying ? 'el-icon-pause' : 'el-icon-play'"></i>
            </el-button>
            <el-button type="text" @click="nextSong">
              <i class="el-icon-right"></i>
            </el-button>
            <el-button type="text" @click="addToPlaylist">
              <i class="el-icon-plus"></i>
            </el-button>
          </div>
        </div>
        <div class="post-open-buttons">
          <el-button type="default" @click="reopenBox">
            <i class="el-icon-refresh"></i> 一键重开
          </el-button>
          <el-button type="primary" @click="shareBox">
            <i class="el-icon-share"></i> 分享盲盒
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'musicBlindBox',
  data() {
    return {
      activeTab: 'hot',
      remainingTimes: 3,
      searchKeyword: '',
      selectedStyles: [],
      selectedDecades: [],
      selectedMoods: [],
      selectedScenes: [],
      viewMode: 'grid',
      isBoxOpened: false,
      isPlaying: false,
      currentBox: {
        name: '冷门宝藏',
        description: '探索那些被遗忘的好音乐',
        tags: ['冷门', '宝藏', '小众'],
        image: '@/assets/logo.jpg',
        surpriseRate: '10%概率开出独家Live版歌曲',
        unlockCount: 12345,
        surprisePreview: '内含5首未知歌曲，可能解锁歌手签名壁纸'
      },
      currentSong: {
        name: '未知歌曲',
        artist: '未知歌手',
        cover: '@/assets/logo.jpg'
      },
      blindBoxes: [
        {
          name: '冷门宝藏',
          description: '探索那些被遗忘的好音乐',
          tags: ['冷门', '宝藏', '小众'],
          image: '@/assets/logo.jpg',
          surpriseRate: '10%概率开出独家Live版歌曲',
          unlockCount: 12345,
          surprisePreview: '内含5首未知歌曲，可能解锁歌手签名壁纸'
        },
        {
          name: '年代怀旧',
          description: '回到过去，重温经典',
          tags: ['怀旧', '经典', '年代'],
          image: '@/assets/logo.jpg',
          surpriseRate: '15%概率开出黑胶唱片复刻版',
          unlockCount: 23456,
          surprisePreview: '内含6首年代金曲，可能解锁复古主题皮肤'
        },
        {
          name: '小众独立',
          description: '发现独立音乐的魅力',
          tags: ['独立', '小众', '原创'],
          image: '@/assets/logo.jpg',
          surpriseRate: '20%概率开出歌手亲笔签名照',
          unlockCount: 34567,
          surprisePreview: '内含7首独立佳作，可能解锁独立音乐人专属徽章'
        },
        {
          name: '情绪匹配',
          description: '找到与你心情共鸣的音乐',
          tags: ['情绪', '共鸣', '治愈'],
          image: '@/assets/logo.jpg',
          surpriseRate: '25%概率开出歌手语音祝福',
          unlockCount: 45678,
          surprisePreview: '内含5首心情适配曲，可能解锁情绪主题动态壁纸'
        }
      ]
    }
  },
  methods: {
    goToMyBoxes() {
      // 跳转到我的盲盒记录页面
      console.log('跳转到我的盲盒记录页面')
    },
    getExtraTimes() {
      // 获取额外拆盒次数
      console.log('获取额外拆盒次数')
    },
    openBox(box) {
      // 选择盲盒
      this.currentBox = box
      this.isBoxOpened = false
    },
    startOpening() {
      // 开始拆盒动画
      if (this.remainingTimes <= 0) {
        this.$message.warning('今日拆盒次数已用完，请明天再来或获取额外次数')
        return
      }
      
      this.remainingTimes--
      this.isBoxOpened = true
      
      // 模拟拆盒动画和歌曲加载
      setTimeout(() => {
        this.currentSong = {
          name: '随机歌曲',
          artist: '随机歌手',
          cover: '@/assets/default-cover.png'
        }
        this.$message.success('盲盒已解锁！')
      }, 2000)
    },
    togglePlay() {
      // 播放/暂停
      this.isPlaying = !this.isPlaying
    },
    previousSong() {
      // 上一首
      console.log('上一首')
    },
    nextSong() {
      // 下一首
      console.log('下一首')
    },
    addToPlaylist() {
      // 加入歌单
      this.$message.success('已加入歌单')
    },
    reopenBox() {
      // 一键重开
      this.isBoxOpened = false
      console.log('一键重开')
    },
    shareBox() {
      // 分享盲盒
      this.$message.success('分享成功')
    }
  }
}
</script>

<style scoped>
.music-blind-box {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

/* 顶部主题筛选区 */
.top-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dynamic-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  animation: rotate 2s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.top-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-container {
  margin-bottom: 20px;
}

.daily-limit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 20px;
}

.category-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
  color: #333;
}

/* 中间盲盒展示区 */
.middle-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.view-switcher {
  margin-bottom: 20px;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.blind-box-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.blind-box-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% {
    transform: translateY(-5px) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(1deg);
  }
  75% {
    transform: translateY(-5px) rotate(-1deg);
  }
}

.box-visual {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.box-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.box-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 10px;
}

.surprise-rate {
  font-size: 12px;
  margin-bottom: 5px;
}

.unlock-count {
  font-size: 12px;
}

.box-info {
  padding: 15px;
}

.box-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.box-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.immersive-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.large-box-container {
  position: relative;
  width: 300px;
  height: 400px;
}

.large-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.large-box-image {
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.large-box-info {
  padding: 20px;
}

.large-box-info h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.box-description {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* 底部拆盒控制区 */
.bottom-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.unopened-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.box-preview {
  flex: 1;
}

.box-preview h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.box-preview p {
  color: #666;
  margin-bottom: 10px;
}

.surprise-preview {
  color: #ff6b6b;
  font-weight: bold;
}

.open-button {
  padding: 15px 30px;
  font-size: 18px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.opened-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.mini-player {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.song-cover {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  object-fit: cover;
}

.song-info h4 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.song-info p {
  color: #666;
  font-size: 14px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-open-buttons {
  display: flex;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .dynamic-title {
    font-size: 24px;
  }
  
  .top-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .category-filters {
    grid-template-columns: 1fr;
  }
  
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .unopened-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .opened-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mini-player {
    flex-direction: column;
    text-align: center;
  }
}
</style>