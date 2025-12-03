<template>
  <div class="music-buddy">
    <!-- 顶部动态标题 -->
    <div class="header">
      <h1 class="title" :class="{ 'focus-flash': isFocusMode }">音乐伴学</h1>
      <div class="header-actions">
        <button class="record-btn" @click="showStudyRecord">我的学习记录</button>
        <i class="el-icon-search search-icon" @click="showSearch"></i>
      </div>
    </div>

    <!-- 顶部场景筛选区 -->
    <div class="filter-section">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="热门场景" name="hot"></el-tab-pane>
        <el-tab-pane label="分类筛选" name="category"></el-tab-pane>
        <el-tab-pane label="我的收藏" name="favorite"></el-tab-pane>
      </el-tabs>

      <!-- 分类筛选内容 -->
      <div class="category-filters" v-show="activeTab === 'category'">
        <el-select v-model="studyType" placeholder="学习类型" style="width: 150px; margin-right: 10px">
          <el-option label="刷题" value="brush-questions"></el-option>
          <el-option label="背书" value="recite"></el-option>
          <el-option label="写作" value="write"></el-option>
          <el-option label="编程" value="code"></el-option>
        </el-select>
        <el-select v-model="focusIntensity" placeholder="专注强度" style="width: 150px; margin-right: 10px">
          <el-option label="轻度专注" value="light"></el-option>
          <el-option label="中度专注" value="medium"></el-option>
          <el-option label="深度专注" value="deep"></el-option>
        </el-select>
        <el-select v-model="duration" placeholder="时长" style="width: 150px">
          <el-option label="25分钟" value="25"></el-option>
          <el-option label="45分钟" value="45"></el-option>
          <el-option label="90分钟" value="90"></el-option>
          <el-option label="自定义" value="custom"></el-option>
        </el-select>
      </div>

      <!-- 今日专注统计 -->
      <div class="focus-stats">
        <span>已专注 {{ todayFocusTime }}</span>
        <span class="divider">|</span>
        <span>连续 {{ consecutiveDays }} 天</span>
      </div>
    </div>

    <!-- 中间专注核心区 -->
    <div class="focus-core">
      <!-- 专注计时面板 -->
      <div class="timer-panel" :class="{ 'maximized': viewMode === 'focus' }">
        <div class="timer-display">
          <div class="time-remaining">{{ formattedTime }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <div class="timer-controls">
          <button class="control-btn" @click="toggleTimer" :class="{ 'active': isTimerRunning }">
            {{ isTimerRunning ? '暂停' : '开始专注' }}
          </button>
          <button class="control-btn" @click="resetTimer">重置</button>
          <button class="control-btn" @click="switchMode">{{ timerMode === 'pomodoro' ? '自定义模式' : '番茄钟模式' }}</button>
        </div>
      </div>

      <!-- 伴学歌单信息 -->
      <div class="playlist-info" :class="{ 'minimized': viewMode === 'focus' }">
        <div class="playlist-header">
          <h3>{{ currentPlaylist.name }}</h3>
          <div class="playlist-tags">
            <span class="tag" v-for="tag in currentPlaylist.tags" :key="tag">{{ tag }}</span>
          </div>
          <span class="song-count">{{ currentPlaylist.songCount }} 首歌曲</span>
        </div>
        <div class="playlist-songs" v-show="viewMode === 'playlist'">
          <div class="song-item" v-for="(song, index) in currentPlaylist.songs" :key="song.id">
            <span class="song-index">{{ index + 1 }}</span>
            <span class="song-name">{{ song.name }}</span>
            <span class="song-artist">{{ song.artist }}</span>
            <i class="el-icon-more"></i>
          </div>
        </div>
      </div>

      <!-- 视图切换按钮 -->
      <div class="view-toggle">
        <button class="toggle-btn" @click="switchView" :class="{ 'active': viewMode === 'focus' }">
          <i class="el-icon-full-screen"></i> 专注视图
        </button>
        <button class="toggle-btn" @click="switchView" :class="{ 'active': viewMode === 'playlist' }">
          <i class="el-icon-menu"></i> 歌单视图
        </button>
      </div>
    </div>

    <!-- 底部功能控制区 -->
    <div class="control-section">
      <div v-if="!isTimerRunning" class="pre-start-controls">
        <button class="start-btn" @click="startFocus">开始专注</button>
        <button class="task-btn" @click="addTask">添加任务</button>
        <button class="setting-btn" @click="showSettings">抗干扰设置</button>
      </div>
      <div v-else class="focus-controls">
        <div class="music-controls">
          <i class="el-icon-back"></i>
          <i class="el-icon-play" :class="{ 'playing': isMusicPlaying }" @click="toggleMusic"></i>
          <i class="el-icon-forward"></i>
          <el-slider v-model="volume" :max="100" style="width: 100px"></el-slider>
        </div>
        <div class="timer-controls">
          <button class="control-btn" @click="toggleTimer">暂停</button>
          <button class="control-btn" @click="endFocus">结束</button>
          <button class="control-btn" @click="skipBreak">跳过休息</button>
        </div>
        <button class="emergency-btn" @click="emergencyPause">紧急暂停</button>
      </div>
    </div>

    <!-- 搜索弹窗 -->
    <el-dialog title="搜索" :visible.sync="searchVisible" width="400px">
      <el-input v-model="searchKeyword" placeholder="搜索学习场景、音乐风格、专注时长" @keyup.enter.native="search"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="searchVisible = false">取消</el-button>
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
    </el-dialog>

    <!-- 任务添加弹窗 -->
    <el-dialog title="添加学习任务" :visible.sync="taskVisible" width="400px">
      <el-form ref="taskForm" :model="newTask" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name"></el-input>
        </el-form-item>
        <el-form-item label="预计时长">
          <el-input v-model="newTask.duration" placeholder="分钟"></el-input>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="taskVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </div>
    </el-dialog>

    <!-- 抗干扰设置弹窗 -->
    <el-dialog title="抗干扰设置" :visible.sync="settingsVisible" width="400px">
      <el-form ref="settingsForm" :model="settings" label-width="120px">
        <el-form-item label="深度抗干扰模式">
          <el-switch v-model="settings.deepFocusMode"></el-switch>
        </el-form-item>
        <el-form-item label="屏幕常亮">
          <el-switch v-model="settings.keepScreenOn"></el-switch>
        </el-form-item>
        <el-form-item label="提示音">
          <el-select v-model="settings.notificationSound">
            <el-option label="自然音效" value="nature"></el-option>
            <el-option label="电子音效" value="electronic"></el-option>
            <el-option label="静音" value="mute"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="背景主题">
          <el-select v-model="settings.theme">
            <el-option label="极简白" value="light"></el-option>
            <el-option label="深夜黑" value="dark"></el-option>
            <el-option label="护眼绿" value="green"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="settingsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicBuddy',
  data() {
    return {
      // 顶部状态
      isFocusMode: false,
      showSearch: false,
      searchVisible: false,
      searchKeyword: '',
      studyRecordVisible: false,

      // 筛选状态
      activeTab: 'hot',
      studyType: '',
      focusIntensity: '',
      duration: '',
      todayFocusTime: '2小时15分钟',
      consecutiveDays: 7,

      // 计时状态
      timerMode: 'pomodoro', // 'pomodoro' 或 'custom'
      isTimerRunning: false,
      remainingTime: 25 * 60, // 秒
      totalTime: 25 * 60, // 秒
      isBreakTime: false,

      // 视图状态
      viewMode: 'focus', // 'focus' 或 'playlist'

      // 音乐状态
      isMusicPlaying: false,
      volume: 50,

      // 当前歌单
      currentPlaylist: {
        name: '刷题专用纯音乐',
        tags: ['无歌词', '纯音乐', '专注'],
        songCount: 20,
        songs: [
          { id: 1, name: '学习专用音乐1', artist: '艺术家1' },
          { id: 2, name: '学习专用音乐2', artist: '艺术家2' },
          { id: 3, name: '学习专用音乐3', artist: '艺术家3' }
        ]
      },

      // 任务状态
      taskVisible: false,
      newTask: {
        name: '',
        duration: '',
        priority: 'medium'
      },

      // 设置状态
      settingsVisible: false,
      settings: {
        deepFocusMode: false,
        keepScreenOn: true,
        notificationSound: 'nature',
        theme: 'light'
      }
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.remainingTime / 60)
      const seconds = this.remainingTime % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    progressPercent() {
      return ((this.totalTime - this.remainingTime) / this.totalTime) * 100
    }
  },
  mounted() {
    // 初始化计时器
    this.startTimer()
  },
  methods: {
    // 处理标签页切换
    handleTabClick(tab) {
      console.log('切换到标签页:', tab.name)
    },

    // 显示搜索弹窗
    showSearch() {
      this.searchVisible = true
    },

    // 搜索
    search() {
      console.log('搜索:', this.searchKeyword)
      this.searchVisible = false
    },

    // 显示学习记录
    showStudyRecord() {
      this.studyRecordVisible = true
    },

    // 切换计时器
    toggleTimer() {
      this.isTimerRunning = !this.isTimerRunning
    },

    // 重置计时器
    resetTimer() {
      this.isTimerRunning = false
      this.remainingTime = this.totalTime
    },

    // 切换计时模式
    switchMode() {
      this.timerMode = this.timerMode === 'pomodoro' ? 'custom' : 'pomodoro'
      this.totalTime = this.timerMode === 'pomodoro' ? 25 * 60 : 45 * 60
      this.remainingTime = this.totalTime
    },

    // 切换视图
    switchView() {
      this.viewMode = this.viewMode === 'focus' ? 'playlist' : 'focus'
    },

    // 开始专注
    startFocus() {
      this.isTimerRunning = true
      this.isFocusMode = true
    },

    // 结束专注
    endFocus() {
      this.isTimerRunning = false
      this.isFocusMode = false
    },

    // 跳过休息
    skipBreak() {
      this.isBreakTime = false
      this.remainingTime = this.totalTime
    },

    // 紧急暂停
    emergencyPause() {
      this.isTimerRunning = false
      this.isMusicPlaying = false
    },

    // 切换音乐播放
    toggleMusic() {
      this.isMusicPlaying = !this.isMusicPlaying
    },

    // 添加任务
    addTask() {
      this.taskVisible = true
    },

    // 保存任务
    saveTask() {
      console.log('保存任务:', this.newTask)
      this.taskVisible = false
      this.newTask = {
        name: '',
        duration: '',
        priority: 'medium'
      }
    },

    // 显示设置
    showSettings() {
      this.settingsVisible = true
    },

    // 保存设置
    saveSettings() {
      console.log('保存设置:', this.settings)
      this.settingsVisible = false
    },

    // 开始计时器
    startTimer() {
      setInterval(() => {
        if (this.isTimerRunning && this.remainingTime > 0) {
          this.remainingTime--
          if (this.remainingTime === 0) {
            this.handleTimerComplete()
          }
        }
      }, 1000)
    },

    // 处理计时器完成
    handleTimerComplete() {
      this.isTimerRunning = false
      if (this.timerMode === 'pomodoro') {
        if (this.isBreakTime) {
          // 休息结束，开始学习
          this.isBreakTime = false
          this.remainingTime = 25 * 60
          this.totalTime = 25 * 60
        } else {
          // 学习结束，开始休息
          this.isBreakTime = true
          this.remainingTime = 5 * 60
          this.totalTime = 5 * 60
        }
      }
      // 播放提示音
      this.playNotificationSound()
    },

    // 播放提示音
    playNotificationSound() {
      // 这里可以添加提示音播放逻辑
      console.log('播放提示音')
    }
  }
}
</script>

<style scoped>
.music-buddy {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.focus-flash {
  animation: flash 3s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.header-actions {
  display: flex;
  align-items: center;
}

.record-btn {
  margin-right: 15px;
  padding: 8px 16px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-icon {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

/* 筛选区域样式 */
.filter-section {
  padding: 20px;
  background-color: #fff;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-filters {
  margin-top: 15px;
}

.focus-stats {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.divider {
  margin: 0 10px;
}

/* 专注核心区域样式 */
.focus-core {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.timer-panel {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.timer-panel.maximized {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.timer-display {
  text-align: center;
  margin-bottom: 30px;
}

.time-remaining {
  font-size: 64px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #409EFF;
  transition: width 0.3s ease;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.control-btn {
  padding: 10px 20px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.control-btn:hover {
  background-color: #66b1ff;
}

.control-btn.active {
  background-color: #f56c6c;
}

/* 歌单信息样式 */
.playlist-info {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.playlist-info.minimized {
  max-height: 100px;
  overflow: hidden;
}

.playlist-header {
  margin-bottom: 15px;
}

.playlist-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.playlist-tags {
  margin-bottom: 5px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  margin-right: 5px;
}

.song-count {
  font-size: 12px;
  color: #999;
}

.playlist-songs {
  max-height: 300px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.song-item:last-child {
  border-bottom: none;
}

.song-index {
  width: 30px;
  font-size: 12px;
  color: #999;
  margin-right: 15px;
}

.song-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.song-artist {
  width: 100px;
  font-size: 12px;
  color: #999;
}

/* 视图切换样式 */
.view-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.toggle-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background-color: #e0e0e0;
}

.toggle-btn.active {
  background-color: #409EFF;
  color: #fff;
}

/* 底部控制区域样式 */
.control-section {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}

.pre-start-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.start-btn {
  padding: 12px 24px;
  background-color: #67c23a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  animation: breathe 2s infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.task-btn, .setting-btn {
  padding: 12px 24px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
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

.music-controls i {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.music-controls i.playing {
  color: #409EFF;
}

.emergency-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 15px;
  }

  .title {
    font-size: 24px;
  }

  .record-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .filter-section {
    padding: 15px;
    margin: 5px;
  }

  .category-filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-filters .el-select {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .timer-panel {
    padding: 20px;
  }

  .time-remaining {
    font-size: 48px;
  }

  .control-section {
    padding: 15px;
  }

  .pre-start-controls {
    flex-direction: column;
    gap: 10px;
  }

  .focus-controls {
    flex-direction: column;
    gap: 15px;
  }
}
</style>