<template>
  <div class="music-study">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1 class="title">音乐伴学</h1>
      <div class="header-actions">
        <el-button @click="goToStudyRecords">我的学习记录</el-button>
        <el-input v-model="searchText" placeholder="搜索学习场景、音乐风格、专注时长" style="width: 300px; margin-left: 10px;">
          <i slot="prefix" class="el-icon-search"></i>
        </el-input>
      </div>
    </div>

    <!-- 顶部场景筛选区 -->
    <div class="scene-filter">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="热门场景" name="hot">
          <!-- 热门场景内容 -->
        </el-tab-pane>
        <el-tab-pane label="分类筛选" name="category">
          <!-- 分类筛选内容 -->
        </el-tab-pane>
        <el-tab-pane label="我的收藏" name="favorites">
          <!-- 我的收藏内容 -->
        </el-tab-pane>
      </el-tabs>

      <!-- 专注统计 -->
      <div class="focus-stats">
        <el-card style="width: 250px; margin-right: 20px;">
          <div slot="header" class="clearfix">
            <span>今日专注时长</span>
          </div>
          <div class="text-center">
            <span style="font-size: 24px;">2小时15分钟</span>
          </div>
        </el-card>

        <el-card style="width: 250px;">
          <div slot="header" class="clearfix">
            <span>连续专注天数</span>
          </div>
          <div class="text-center">
            <span style="font-size: 24px;">7天</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 中间专注核心区 -->
    <div class="focus-core">
      <!-- 专注计时面板 -->
      <div class="timer-panel">
        <el-card>
          <div slot="header" class="clearfix">
            <span>专注计时</span>
          </div>
          <div class="timer-content">
            <div class="timer-display">25:00</div>
            <div class="timer-controls">
              <el-button @click="startTimer">开始专注</el-button>
              <el-button @click="pauseTimer">暂停</el-button>
              <el-button @click="resetTimer">重置</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 伴学歌单信息 -->
      <div class="playlist-info">
        <el-card>
          <div slot="header" class="clearfix">
            <span>伴学歌单</span>
          </div>
          <div class="playlist-content">
            <h3>刷题专用-无歌词纯音乐</h3>
            <div class="playlist-tags">
              <el-tag>无歌词纯音乐</el-tag>
              <el-tag>轻节奏</el-tag>
              <el-tag>20首</el-tag>
            </div>
            <el-button @click="switchPlaylist" style="margin-top: 10px;">切换歌单</el-button>
          </div>
        </el-card>
      </div>

      <!-- 视图切换 -->
      <div class="view-switch">
        <el-button-group>
          <el-button @click="switchView('focus')" :class="{active: currentView === 'focus'}">专注视图</el-button>
          <el-button @click="switchView('playlist')" :class="{active: currentView === 'playlist'}">歌单视图</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 底部功能控制区 -->
    <div class="control-area">
      <!-- 未开始专注时的控制按钮 -->
      <div v-if="!timerRunning" class="control-buttons">
        <el-button class="start-button" @click="startTimer">开始专注</el-button>
        <el-button @click="addTask">任务添加</el-button>
        <el-button @click="openAntiDisturb">抗干扰设置</el-button>
      </div>

      <!-- 专注进行中的控制按钮 -->
      <div v-else class="control-buttons">
        <el-button @click="pauseTimer">暂停</el-button>
        <el-button @click="endTimer">结束</el-button>
        <el-button @click="skipBreak">跳过休息</el-button>
        <el-button class="emergency-button" @click="emergencyPause">紧急暂停</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'musicStudy',
  data() {
    return {
      activeTab: 'hot',
      searchText: '',
      timerRunning: false,
      currentView: 'focus'
    }
  },
  methods: {
    goToStudyRecords() {
      // 跳转到学习记录页面
    },
    startTimer() {
      this.timerRunning = true
    },
    pauseTimer() {
      this.timerRunning = false
    },
    resetTimer() {
      this.timerRunning = false
    },
    endTimer() {
      this.timerRunning = false
    },
    skipBreak() {
      // 跳过休息
    },
    emergencyPause() {
      this.timerRunning = false
    },
    switchPlaylist() {
      // 切换歌单
    },
    switchView(view) {
      this.currentView = view
    },
    addTask() {
      // 添加任务
    },
    openAntiDisturb() {
      // 打开抗干扰设置
    }
  }
}
</script>

<style scoped>
.music-study {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f5f5;
}

.title {
  margin: 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.scene-filter {
  padding: 20px;
  background-color: #fafafa;
}

.focus-stats {
  display: flex;
  margin-top: 20px;
}

.focus-core {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.timer-panel {
  margin-bottom: 20px;
}

.timer-content {
  text-align: center;
}

.timer-display {
  font-size: 48px;
  margin: 20px 0;
}

.playlist-info {
  margin-bottom: 20px;
}

.playlist-tags {
  margin-top: 10px;
}

.playlist-tags .el-tag {
  margin-right: 10px;
}

.view-switch {
  text-align: center;
}

.control-area {
  padding: 10px 20px;
  background-color: #f5f5f5;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-buttons .el-button {
  margin: 0 10px;
}

.start-button {
  background-color: #409eff;
  color: white;
}

.emergency-button {
  background-color: #f56c6c;
  color: white;
}
</style>