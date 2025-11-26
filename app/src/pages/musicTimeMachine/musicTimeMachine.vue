<template>
  <div class="music-time-machine">
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <div class="filter-header">
        <h1>音乐时光机</h1>
        <div class="header-actions">
          <i class="el-icon-filter filter-icon" @click="showFilterModal = true"></i>
          <i class="el-icon-share share-icon" @click="showShareModal = true"></i>
        </div>
      </div>
      
      <!-- 快速筛选标签 -->
      <div class="quick-filters">
        <el-tag v-for="filter in quickFilters" :key="filter.value" :type="filter.value === activeFilter ? 'primary' : ''" @click="setActiveFilter(filter.value)">
          {{ filter.label }}
        </el-tag>
      </div>
    </div>

    <!-- 中间时光轴区 -->
    <div class="timeline-section">
      <div class="timeline-container">
        <div class="timeline-item" v-for="(item, index) in timelineData" :key="index">
          <div class="timeline-card" @click="toggleCard(item)">
            <div class="card-header">
              <div class="time-period">{{ item.period }}</div>
              <div class="mood-tag" :style="{ backgroundColor: item.moodColor }">
                {{ item.mood }}
              </div>
            </div>
            <div class="card-content">
              <img :src="item.cover" :alt="item.period" class="cover-image">
              <div class="card-info">
                <div class="listen-count">播放次数: {{ item.listenCount }}</div>
                <div class="song-count">歌曲数量: {{ item.songCount }}</div>
              </div>
            </div>
            <div class="music-wave" v-if="item.isHovered"></div>
          </div>
          
          <!-- 展开的歌曲列表 -->
          <div class="song-list" v-if="item.isExpanded">
            <div class="song-item" v-for="(song, songIndex) in item.songs" :key="songIndex">
              <div class="song-info">
                <span class="song-name">{{ song.name }}</span>
                <span class="artist-name">{{ song.artist }}</span>
              </div>
              <div class="play-time">{{ song.playTime }}</div>
            </div>
            <div class="song-list-actions">
              <el-button type="primary" size="small">批量添加到歌单</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <div class="play-control-section">
      <div class="current-song-info">
        <img :src="currentSong.cover" :alt="currentSong.name" class="current-song-cover">
        <div class="song-details">
          <div class="current-song-name">{{ currentSong.name }}</div>
          <div class="current-song-artist">{{ currentSong.artist }}</div>
        </div>
      </div>
      <div class="play-controls">
        <i class="el-icon-skip-prev control-icon"></i>
        <i class="el-icon-video-play control-icon" @click="togglePlay"></i>
        <i class="el-icon-skip-next control-icon"></i>
        <i class="el-icon-loop control-icon" :class="{ active: isTimeLoop }" @click="toggleTimeLoop"></i>
      </div>
      <div class="progress-bar">
        <el-slider v-model="progress" :max="100" style="width: 200px"></el-slider>
      </div>
    </div>

    <!-- 筛选模态框 -->
    <el-dialog title="筛选条件" v-model="showFilterModal" width="500px">
      <el-form>
        <el-form-item label="时间范围">
          <el-select v-model="filterParams.timeRange" placeholder="请选择时间范围">
            <el-option label="近一周" value="week"></el-option>
            <el-option label="近一月" value="month"></el-option>
            <el-option label="近一年" value="year"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="音乐风格" v-if="filterParams.timeRange">
          <el-select v-model="filterParams.style" placeholder="请选择音乐风格">
            <el-option label="流行" value="pop"></el-option>
            <el-option label="摇滚" value="rock"></el-option>
            <el-option label="古典" value="classical"></el-option>
            <el-option label="电子" value="electronic"></el-option>
            <el-option label="说唱" value="rap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="场景" v-if="filterParams.timeRange">
          <el-select v-model="filterParams.scene" placeholder="请选择场景">
            <el-option label="通勤" value="commute"></el-option>
            <el-option label="学习" value="study"></el-option>
            <el-option label="睡前" value="sleep"></el-option>
            <el-option label="运动" value="sport"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showFilterModal = false">取消</el-button>
        <el-button type="primary" @click="applyFilters">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分享模态框 -->
    <el-dialog title="分享时光轴" v-model="showShareModal" width="400px">
      <div class="share-options">
        <el-button type="primary" icon="el-icon-wechat" block>分享到微信</el-button>
        <el-button type="success" icon="el-icon-qq" block>分享到QQ</el-button>
        <el-button type="warning" icon="el-icon-weibo" block>分享到微博</el-button>
        <el-button type="info" icon="el-icon-link" block>复制链接</el-button>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showShareModal = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicTimeMachine',
  data() {
    return {
      // 筛选相关
      showFilterModal: false,
      showShareModal: false,
      activeFilter: 'all',
      quickFilters: [
        { label: '全部', value: 'all' },
        { label: '近一周', value: 'week' },
        { label: '近一月', value: 'month' },
        { label: '近一年', value: 'year' }
      ],
      filterParams: {
        timeRange: '',
        style: '',
        scene: ''
      },

      // 时光轴数据
      timelineData: [
        {
          period: '2023年夏天',
          mood: '快乐',
          moodColor: '#FFD700',
          cover: 'https://picsum.photos/seed/summer2023/300/300',
          listenCount: 1250,
          songCount: 25,
          isExpanded: false,
          isHovered: false,
          songs: [
            { name: '晴天', artist: '周杰伦', playTime: '2023-07-15' },
            { name: '七里香', artist: '周杰伦', playTime: '2023-07-20' },
            { name: '夏天的风', artist: '温岚', playTime: '2023-08-05' }
          ]
        },
        {
          period: '2023年秋天',
          mood: '治愈',
          moodColor: '#FFA500',
          cover: 'https://picsum.photos/seed/autumn2023/300/300',
          listenCount: 980,
          songCount: 18,
          isExpanded: false,
          isHovered: false,
          songs: [
            { name: '枫', artist: '周杰伦', playTime: '2023-10-10' },
            { name: '秋天不回来', artist: '王强', playTime: '2023-10-25' }
          ]
        },
        {
          period: '2023年冬天',
          mood: '怀旧',
          moodColor: '#4169E1',
          cover: 'https://picsum.photos/seed/winter2023/300/300',
          listenCount: 1560,
          songCount: 32,
          isExpanded: false,
          isHovered: false,
          songs: [
            { name: '一路向北', artist: '周杰伦', playTime: '2023-12-05' },
            { name: '雪落下的声音', artist: '陆虎', playTime: '2023-12-20' }
          ]
        }
      ],

      // 播放控制相关
      currentSong: {
        name: '晴天',
        artist: '周杰伦',
        cover: 'https://picsum.photos/seed/summer2023/300/300'
      },
      isPlaying: false,
      isTimeLoop: false,
      progress: 30
    }
  },
  methods: {
    // 筛选方法
    setActiveFilter(value) {
      this.activeFilter = value;
      // 这里可以添加筛选逻辑
    },
    applyFilters() {
      this.showFilterModal = false;
      // 这里可以添加应用筛选条件的逻辑
    },

    // 时光轴卡片方法
    toggleCard(item) {
      item.isExpanded = !item.isExpanded;
    },

    // 播放控制方法
    togglePlay() {
      this.isPlaying = !this.isPlaying;
    },
    toggleTimeLoop() {
      this.isTimeLoop = !this.isTimeLoop;
    }
  }
}
</script>

<style scoped>
.music-time-machine {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 顶部筛选区 */
.filter-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.filter-icon, .share-icon {
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.filter-icon:hover, .share-icon:hover {
  color: #409EFF;
}

.quick-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 中间时光轴区 */
.timeline-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
}

.timeline-item {
  margin-bottom: 30px;
}

.timeline-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timeline-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.time-period {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.mood-tag {
  padding: 5px 12px;
  border-radius: 15px;
  color: white;
  font-size: 14px;
  font-weight: 500;
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
  color: #666;
}

.music-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: scaleX(0.8); }
  50% { transform: scaleX(1); }
}

/* 展开的歌曲列表 */
.song-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 12px 12px;
  padding: 20px;
  margin-top: -10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
  font-weight: 500;
  color: #333;
}

.artist-name {
  font-size: 14px;
  color: #666;
}

.play-time {
  font-size: 14px;
  color: #999;
}

.song-list-actions {
  margin-top: 15px;
  text-align: right;
}

/* 底部播放控制栏 */
.play-control-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.current-song-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-song-cover {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.current-song-name {
  font-weight: 500;
  color: #333;
}

.current-song-artist {
  font-size: 14px;
  color: #666;
}

.play-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-icon {
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.control-icon:hover {
  color: #409EFF;
}

.control-icon.active {
  color: #409EFF;
}

.progress-bar {
  flex: 1;
  max-width: 300px;
  margin: 0 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-header h1 {
    font-size: 22px;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .cover-image {
    width: 100px;
    height: 100px;
  }

  .play-control-section {
    flex-direction: column;
    gap: 15px;
  }

  .progress-bar {
    max-width: 100%;
  }
}
</style>