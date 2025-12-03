<template>
  <div class="music-study" :class="{ 'theme-dark': currentTheme === 'dark', 'theme-green': currentTheme === 'green' }">
    <!-- 顶部标题栏 -->
    <div class="study-header">
      <h1 class="title">
        音乐伴学
        <span class="focus-indicator" v-if="isFocusing">专注中...</span>
      </h1>
      <div class="header-actions">
        <el-button type="text" @click="showStudyRecords">
          <i class="el-icon-document"></i> 我的学习记录
        </el-button>
        <el-input
          v-model="searchQuery"
          placeholder="搜索学习场景、音乐风格、专注时长"
          class="search-input"
          @keyup.enter.native="search"
        >
          <i slot="prefix" class="el-icon-search"></i>
        </el-input>
      </div>
    </div>

    <!-- 顶部场景筛选区 -->
    <div class="filter-section">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="热门场景" name="hot"></el-tab-pane>
        <el-tab-pane label="分类筛选" name="category">
          <div class="category-filters">
            <el-select v-model="studyType" placeholder="学习类型" class="filter-select">
              <el-option label="刷题" value="practice"></el-option>
              <el-option label="背书" value="memorize"></el-option>
              <el-option label="写作" value="write"></el-option>
              <el-option label="编程" value="code"></el-option>
            </el-select>
            <el-select v-model="focusIntensity" placeholder="专注强度" class="filter-select">
              <el-option label="轻度专注" value="light"></el-option>
              <el-option label="中度专注" value="medium"></el-option>
              <el-option label="深度专注" value="deep"></el-option>
            </el-select>
            <el-select v-model="duration" placeholder="时长" class="filter-select">
              <el-option label="25分钟" value="25"></el-option>
              <el-option label="45分钟" value="45"></el-option>
              <el-option label="90分钟" value="90"></el-option>
              <el-option label="自定义" value="custom"></el-option>
            </el-select>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的收藏" name="favorite"></el-tab-pane>
      </el-tabs>

      <!-- 专注统计 -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">今日专注时长</span>
          <span class="stat-value">已专注2小时15分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">连续专注天数</span>
          <span class="stat-value">连续7天</span>
        </div>
      </div>
    </div>

    <!-- 中间专注核心区 -->
    <div class="focus-section">
      <!-- 专注计时面板 -->
      <div class="timer-panel">
        <div class="timer-display">
          <span class="time">{{ formatTime(remainingTime) }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <div class="timer-buttons">
          <el-button @click="toggleTimer" :type="isFocusing ? 'warning' : 'success'">
            {{ isFocusing ? '暂停' : '开始专注' }}
          </el-button>
          <el-button @click="resetTimer" type="danger">结束</el-button>
        </div>
      </div>

      <!-- 伴学歌单信息 -->
      <div class="playlist-section">
        <div class="playlist-header">
          <h3>当前伴学歌单</h3>
          <el-button type="text" @click="toggleView">
            {{ isFocusView ? '切换到歌单视图' : '切换到专注视图' }}
          </el-button>
        </div>
        <div class="playlist-info">
          <h4>{{ currentPlaylist.name }}</h4>
          <div class="playlist-tags">
            <span class="tag" v-for="tag in currentPlaylist.tags" :key="tag">{{ tag }}</span>
          </div>
          <p>{{ currentPlaylist.songCount }}首歌曲</p>
        </div>

        <!-- 歌单详情（歌单视图） -->
        <div class="playlist-detail" v-if="!isFocusView">
          <el-table :data="currentPlaylist.songs" border>
            <el-table-column prop="name" label="歌曲名"></el-table-column>
            <el-table-column prop="artist" label="歌手"></el-table-column>
            <el-table-column prop="duration" label="时长"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部功能控制区 -->
    <div class="control-section">
      <div v-if="!isFocusing" class="control-buttons">
        <el-button type="success" class="start-button" @click="startFocus">
          <i class="el-icon-play"></i> 开始专注
        </el-button>
        <el-button type="primary" @click="addTask">
          <i class="el-icon-plus"></i> 添加任务
        </el-button>
        <el-button type="info" @click="settingsDialogVisible = true">
          <i class="el-icon-setting"></i> 抗干扰设置
        </el-button>
      </div>

      <div v-else class="focus-controls">
        <div class="music-controls">
          <el-button type="text" @click="prevSong">
            <i class="el-icon-arrow-left"></i>
          </el-button>
          <el-button type="text" @click="togglePlay">
            <i :class="isPlaying ? 'el-icon-pause' : 'el-icon-play'"></i>
          </el-button>
          <el-button type="text" @click="nextSong">
            <i class="el-icon-arrow-right"></i>
          </el-button>
          <el-slider v-model="volume" class="volume-slider"></el-slider>
        </div>
        <div class="timer-controls">
          <el-button type="text" @click="pauseTimer">
            <i class="el-icon-pause"></i> 暂停
          </el-button>
          <el-button type="text" @click="endTimer">
            <i class="el-icon-close"></i> 结束
          </el-button>
          <el-button type="text" @click="skipBreak">
            <i class="el-icon-skip-forward"></i> 跳过休息
          </el-button>
        </div>
        <el-button type="danger" class="emergency-button" @click="emergencyPause">
          紧急暂停
        </el-button>
      </div>
    </div>

    <!-- 任务添加弹窗 -->
    <el-dialog title="添加学习任务" :visible.sync="taskDialogVisible">
      <el-form ref="taskForm" :model="newTask" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name"></el-input>
        </el-form-item>
        <el-form-item label="预计时长">
          <el-input v-model="newTask.duration" type="number" placeholder="分钟"></el-input>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="taskDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTask">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 设置弹窗 -->
    <el-dialog title="抗干扰设置" :visible.sync="settingsDialogVisible" width="600px">
      <StudySettings @close="settingsDialogVisible = false"></StudySettings>
    </el-dialog>
  </div>
</template>

<script>
import StudySettings from '@/components/studySettings/StudySettings'

export default {
  name: 'MusicStudy',
  components: { StudySettings },
  data() {
    return {
      isFocusing: false,
      isPlaying: false,
      remainingTime: 1500, // 25分钟
      progressPercent: 0,
      activeTab: 'hot',
      studyType: '',
      focusIntensity: '',
      duration: '25',
      searchQuery: '',
      isFocusView: true,
      volume: 50,
      taskDialogVisible: false,
      settingsDialogVisible: false,
      currentTheme: 'light',
      newTask: {
        name: '',
        duration: '',
        priority: 'medium'
      },
      currentPlaylist: {
        name: '刷题必备纯音乐',
        tags: ['无歌词纯音乐', '轻节奏'],
        songCount: 20,
        songs: [
          { name: '安静的旋律', artist: '纯音乐', duration: '3:45' },
          { name: '专注时光', artist: '纯音乐', duration: '4:20' },
          { name: '思维跳跃', artist: '纯音乐', duration: '5:10' }
        ]
      }
    }
  },
  methods: {
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    toggleTimer() {
      this.isFocusing = !this.isFocusing
      if (this.isFocusing) {
        this.startTimer()
      } else {
        this.pauseTimer()
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
          this.progressPercent = ((1500 - this.remainingTime) / 1500) * 100
        } else {
          this.endTimer()
        }
      }, 1000)
    },
    pauseTimer() {
      clearInterval(this.timerInterval)
    },
    resetTimer() {
      this.remainingTime = 1500
      this.progressPercent = 0
      this.isFocusing = false
      clearInterval(this.timerInterval)
    },
    endTimer() {
      this.isFocusing = false
      clearInterval(this.timerInterval)
      // 计时结束逻辑
    },
    skipBreak() {
      // 跳过休息逻辑
    },
    emergencyPause() {
      this.isFocusing = false
      this.isPlaying = false
      clearInterval(this.timerInterval)
    },
    startFocus() {
      this.isFocusing = true
      this.isPlaying = true
      this.startTimer()
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    prevSong() {
      // 上一首逻辑
    },
    nextSong() {
      // 下一首逻辑
    },
    toggleView() {
      this.isFocusView = !this.isFocusView
    },
    addTask() {
      this.taskDialogVisible = true
    },
    saveTask() {
      // 保存任务逻辑
      this.taskDialogVisible = false
      this.$message.success('任务添加成功')
    },
    // 应用主题
    applyTheme() {
      const savedSettings = localStorage.getItem('studySettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        this.currentTheme = settings.theme || 'light'
      }
    },
    showStudyRecords() {
      this.$router.push('/home/study-records')
    },
    search() {
      // 搜索逻辑
    },
    handleTabClick(tab) {
      // 标签切换逻辑
    }
  },
  created() {
    this.applyTheme()
  },
  beforeDestroy() {
    clearInterval(this.timerInterval)
  }
}
</script>

<style scoped>
.music-study {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 顶部标题栏 */
.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.focus-indicator {
  font-size: 14px;
  color: #4CAF50;
  margin-left: 10px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 300px;
}

/* 筛选区 */
.filter-section {
  padding: 15px 20px;
  background-color: #fff;
  margin-bottom: 15px;
}

.category-filters {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.filter-select {
  width: 150px;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 专注核心区 */
.focus-section {
  flex: 1;
  display: flex;
  padding: 0 20px 15px;
  gap: 15px;
  overflow: hidden;
}

.timer-panel {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.timer-display {
  text-align: center;
  margin-bottom: 30px;
}

.time {
  font-size: 72px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.timer-buttons {
  display: flex;
  gap: 15px;
}

.playlist-section {
  width: 400px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.playlist-info h4 {
  margin: 0 0 10px;
  font-size: 18px;
}

.playlist-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  padding: 4px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
}

/* 控制区 */
.control-section {
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.start-button {
  animation: breathe 2s infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.focus-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.music-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-slider {
  width: 100px;
}

.emergency-button {
  background-color: #f44336;
  border-color: #f44336;
}

.emergency-button:hover {
  background-color: #d32f2f;
  border-color: #d32f2f;
}

/* 主题样式 */
.music-study.theme-dark {
  background-color: #1a1a1a;
  color: #fff;
}

.music-study.theme-dark .study-header,
.music-study.theme-dark .filter-section,
.music-study.theme-dark .timer-panel,
.music-study.theme-dark .playlist-section,
.music-study.theme-dark .control-section {
  background-color: #2c2c2c;
  color: #fff;
}

.music-study.theme-dark .stat-item .stat-label,
.music-study.theme-dark .playlist-info p {
  color: #ccc;
}

.music-study.theme-green {
  background-color: #e8f5e9;
}

.music-study.theme-green .study-header,
.music-study.theme-green .filter-section,
.music-study.theme-green .timer-panel,
.music-study.theme-green .playlist-section,
.music-study.theme-green .control-section {
  background-color: #c8e6c9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .focus-section {
    flex-direction: column;
  }
  
  .playlist-section {
    width: 100%;
    height: 300px;
  }
  
  .search-input {
    width: 200px;
  }
  
  .focus-controls {
    flex-direction: column;
    gap: 15px;
  }
}
</style>