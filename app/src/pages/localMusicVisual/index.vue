<template>
  <div class="local-music-visual">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>本地音乐可视化</h1>
      <button class="refresh-btn" @click="refreshLocalList">
        <i class="el-icon-refresh"></i> 刷新本地列表
      </button>
    </div>

    <!-- 双分区布局 -->
    <div class="main-container">
      <!-- 左侧本地音乐列表区 -->
      <div class="music-list-container">
        <!-- 搜索和排序 -->
        <div class="list-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索本地音乐"
            prefix-icon="el-icon-search"
            class="search-input"
          ></el-input>
          <el-select
            v-model="sortBy"
            placeholder="排序"
            class="sort-select"
            @change="sortMusicList"
          >
            <el-option label="按歌曲名" value="title"></el-option>
            <el-option label="按时长" value="duration"></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-upload" @click="importMusic">
            导入音乐
          </el-button>
        </div>

        <!-- 音乐列表 -->
        <div class="music-list">
          <div
            v-for="(music, index) in filteredMusicList"
            :key="index"
            class="music-item"
            :class="{ active: currentPlayingIndex === index }"
            @click="playMusic(index)"
          >
            <div class="music-info">
              <div class="music-title">
                {{ music.title || '未知歌曲' }}
                <i v-if="currentPlayingIndex === index" class="el-icon-sound"></i>
              </div>
              <div class="music-artist">{{ music.artist || '未知歌手' }}</div>
            </div>
            <div class="music-duration">{{ formatDuration(music.duration) }}</div>
            <div class="music-size">{{ formatFileSize(music.size) }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧可视化播放区 -->
      <div class="visual-container">
        <!-- 可视化画布 -->
        <div class="visual-canvas-wrapper">
          <canvas ref="visualCanvas" class="visual-canvas"></canvas>
        </div>

        <!-- 播放控制栏 -->
        <div class="control-bar">
          <!-- 播放/暂停按钮 -->
          <el-button
            type="primary"
            icon="el-icon-video-play"
            class="play-btn"
            @click="togglePlay"
            v-if="!isPlaying"
          ></el-button>
          <el-button
            type="primary"
            icon="el-icon-video-pause"
            class="play-btn"
            @click="togglePlay"
            v-else
          ></el-button>

          <!-- 进度条 -->
          <div class="progress-container">
            <span class="time">{{ formatTime(currentTime) }}</span>
            <el-slider
              v-model="currentTime"
              :max="duration"
              class="progress-slider"
              @change="seek"
            ></el-slider>
            <span class="time">{{ formatTime(duration) }}</span>
          </div>

          <!-- 音量调节 -->
          <div class="volume-container">
            <i class="el-icon-volume-up"></i>
            <el-slider
              v-model="volume"
              class="volume-slider"
              @change="adjustVolume"
            ></el-slider>
          </div>

          <!-- 可视化样式切换 -->
          <el-select
            v-model="visualStyle"
            placeholder="可视化样式"
            class="style-select"
          >
            <el-option label="频谱波形" value="spectrum"></el-option>
            <el-option label="粒子跟随" value="particles"></el-option>
            <el-option label="环形律动" value="ring"></el-option>
          </el-select>

          <!-- 倍速播放 -->
          <el-select
            v-model="playbackRate"
            placeholder="倍速"
            class="speed-select"
            @change="adjustSpeed"
          >
            <el-option label="0.5x" value="0.5"></el-option>
            <el-option label="1x" value="1"></el-option>
            <el-option label="1.5x" value="1.5"></el-option>
            <el-option label="2x" value="2"></el-option>
          </el-select>

          <!-- 播放模式 -->
          <el-select
            v-model="playMode"
            placeholder="播放模式"
            class="mode-select"
          >
            <el-option label="顺序播放" value="sequence"></el-option>
            <el-option label="单曲循环" value="loop"></el-option>
          </el-select>

          <!-- 配色方案 -->
          <el-select
            v-model="colorScheme"
            placeholder="配色方案"
            class="color-select"
          >
            <el-option label="蓝白" value="blue-white"></el-option>
            <el-option label="粉紫" value="pink-purple"></el-option>
            <el-option label="青绿" value="cyan-green"></el-option>
            <el-option label="橙红" value="orange-red"></el-option>
            <el-option label="黄绿" value="yellow-green"></el-option>
            <el-option label="紫蓝" value="purple-blue"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 文件导入隐藏input -->
    <input
      ref="fileInput"
      type="file"
      accept="audio/mp3,audio/wav"
      multiple
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script>
export default {
  name: 'LocalMusicVisual',
  data() {
    return {
      // 本地音乐列表
      musicList: [],
      // 搜索关键词
      searchKeyword: '',
      // 排序方式
      sortBy: 'title',
      // 当前播放索引
      currentPlayingIndex: -1,
      // 音频元素
      audio: null,
      // Web Audio API相关
      audioContext: null,
      analyser: null,
      source: null,
      // 播放状态
      isPlaying: false,
      // 当前播放时间
      currentTime: 0,
      // 总时长
      duration: 0,
      // 音量
      volume: 50,
      // 可视化样式
      visualStyle: 'spectrum',
      // 倍速播放
      playbackRate: 1,
      // 播放模式
      playMode: 'sequence',
      // 配色方案
      colorScheme: 'blue-white',
      // 动画帧ID
      animationId: null,
      // 粒子数组（用于粒子跟随效果）
      particles: [],
    }
  },
  computed: {
    // 过滤后的音乐列表
    filteredMusicList() {
      let filtered = this.musicList

      // 搜索过滤
      if (this.searchKeyword) {
        filtered = filtered.filter(
          (music) =>
            music.title &&
            music.title.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      // 排序
      filtered.sort((a, b) => {
        if (this.sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '')
        } else if (this.sortBy === 'duration') {
          return a.duration - b.duration
        }
        return 0
      })

      return filtered
    },
  },
  mounted() {
    // 初始化音频元素
    this.initAudio()
    // 初始化Web Audio API
    this.initWebAudio()
    // 加载本地存储的音乐列表
    this.loadLocalMusicList()
    // 获取canvas元素
    this.canvas = this.$refs.visualCanvas
    this.ctx = this.canvas.getContext('2d')
    // 设置canvas尺寸
    this.resizeCanvas()
    // 监听窗口大小变化
    window.addEventListener('resize', this.resizeCanvas)
  },
  beforeDestroy() {
    // 清理资源
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    window.removeEventListener('resize', this.resizeCanvas)
  },
  methods: {
    // 初始化音频元素
    initAudio() {
      this.audio = new Audio()
      this.audio.volume = this.volume / 100
      this.audio.addEventListener('timeupdate', this.updateProgress)
      this.audio.addEventListener('loadedmetadata', this.updateDuration)
      this.audio.addEventListener('ended', this.handleSongEnd)
    },
    // 初始化Web Audio API
    initWebAudio() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 256
      } catch (error) {
        console.error('Web Audio API not supported:', error)
      }
    },
    // 加载本地存储的音乐列表
    loadLocalMusicList() {
      const savedMusicList = localStorage.getItem('localMusicList')
      if (savedMusicList) {
        this.musicList = JSON.parse(savedMusicList)
      }
    },
    // 保存音乐列表到本地存储
    saveMusicList() {
      localStorage.setItem('localMusicList', JSON.stringify(this.musicList))
    },
    // 刷新本地列表
    refreshLocalList() {
      this.loadLocalMusicList()
      this.$message.success('本地列表已刷新')
    },
    // 导入音乐
    importMusic() {
      this.$refs.fileInput.click()
    },
    // 处理文件导入
    handleFileImport(event) {
      const files = event.target.files
      if (files.length === 0) return

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith('audio/')) {
          this.processAudioFile(file)
        }
      }

      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    },
    // 处理音频文件
    processAudioFile(file) {
      // 创建文件URL
      const fileUrl = URL.createObjectURL(file)
      // 创建音频对象以获取元数据
      const audio = new Audio(fileUrl)

      audio.addEventListener('loadedmetadata', () => {
        // 尝试从文件名解析歌曲名和歌手
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        let title = fileName
        let artist = ''

        // 尝试解析常见格式：歌手 - 歌曲名
        const match = fileName.match(/(.+)\s*-\s*(.+)/)
        if (match) {
          artist = match[1].trim()
          title = match[2].trim()
        }

        // 添加到音乐列表
        this.musicList.push({
          id: Date.now() + Math.random(),
          title,
          artist,
          duration: audio.duration,
          size: file.size,
          url: fileUrl,
          file: file,
        })

        // 保存到本地存储
        this.saveMusicList()
      })
    },
    // 播放音乐
    playMusic(index) {
      if (index < 0 || index >= this.filteredMusicList.length) return

      const music = this.filteredMusicList[index]
      this.currentPlayingIndex = index

      // 停止当前播放
      if (this.audio) {
        this.audio.pause()
      }

      // 设置新的音频源
      this.audio.src = music.url
      this.audio.load()
      this.audio.play()
      this.isPlaying = true

      // 连接Web Audio API
      if (this.audioContext && this.analyser) {
        if (this.source) {
          this.source.disconnect()
        }
        this.source = this.audioContext.createMediaElementSource(this.audio)
        this.source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
      }

      // 开始可视化
      this.startVisualization()
    },
    // 切换播放/暂停
    togglePlay() {
      if (!this.audio || this.currentPlayingIndex === -1) return

      if (this.isPlaying) {
        this.audio.pause()
      } else {
        this.audio.play()
      }
      this.isPlaying = !this.isPlaying
    },
    // 更新播放进度
    updateProgress() {
      this.currentTime = this.audio.currentTime
    },
    // 更新总时长
    updateDuration() {
      this.duration = this.audio.duration
    },
    // 处理歌曲结束
    handleSongEnd() {
      if (this.playMode === 'loop') {
        // 单曲循环
        this.audio.currentTime = 0
        this.audio.play()
      } else if (this.playMode === 'sequence') {
        // 顺序播放下一首
        const nextIndex = this.currentPlayingIndex + 1
        if (nextIndex < this.filteredMusicList.length) {
          this.playMusic(nextIndex)
        } else {
          // 播放完毕
          this.isPlaying = false
          this.currentPlayingIndex = -1
        }
      }
    },
    // 跳转播放位置
    seek(time) {
      if (this.audio) {
        this.audio.currentTime = time
      }
    },
    // 调节音量
    adjustVolume(volume) {
      if (this.audio) {
        this.audio.volume = volume / 100
      }
    },
    // 调节倍速
    adjustSpeed(speed) {
      if (this.audio) {
        this.audio.playbackRate = speed
      }
    },
    // 排序音乐列表
    sortMusicList() {
      // 排序逻辑在computed属性中处理
    },
    // 格式化时长
    formatDuration(duration) {
      if (!duration) return '0:00'
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    },
    // 格式化时间
    formatTime(seconds) {
      if (!seconds) return '0:00'
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    // 设置canvas尺寸
    resizeCanvas() {
      if (!this.canvas) return
      const container = this.canvas.parentElement
      this.canvas.width = container.clientWidth
      this.canvas.height = container.clientHeight
    },
    // 开始可视化
    startVisualization() {
      if (!this.analyser || !this.canvas) return

      const bufferLength = this.analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        this.animationId = requestAnimationFrame(draw)

        // 获取音频数据
        this.analyser.getByteFrequencyData(dataArray)

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // 根据当前可视化样式绘制
        if (this.visualStyle === 'spectrum') {
          this.drawSpectrum(dataArray)
        } else if (this.visualStyle === 'particles') {
          this.drawParticles(dataArray)
        } else if (this.visualStyle === 'ring') {
          this.drawRing(dataArray)
        }
      }

      draw()
    },
    // 绘制频谱波形
    drawSpectrum(dataArray) {
      const barWidth = (this.canvas.width / dataArray.length) * 2.5
      let x = 0

      // 获取当前配色
      const colors = this.getColorScheme()

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * this.canvas.height

        // 创建渐变
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0)
        gradient.addColorStop(0, colors[0])
        gradient.addColorStop(1, colors[1])

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    },
    // 绘制粒子跟随
    drawParticles(dataArray) {
      // 初始化粒子
      if (this.particles.length === 0) {
        for (let i = 0; i < 50; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 5 + 2,
            speedX: Math.random() * 3 - 1.5,
            speedY: Math.random() * 3 - 1.5,
            baseSize: Math.random() * 5 + 2,
          })
        }
      }

      // 获取平均音频能量
      const averageEnergy = dataArray.reduce((a, b) => a + b) / dataArray.length
      const scale = 1 + (averageEnergy / 255) * 2

      // 获取当前配色
      const colors = this.getColorScheme()

      // 绘制粒子
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i]

        // 更新粒子位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界检测
        if (particle.x < 0 || particle.x > this.canvas.width) {
          particle.speedX *= -1
        }
        if (particle.y < 0 || particle.y > this.canvas.height) {
          particle.speedY *= -1
        }

        // 根据音频能量调整粒子大小
        particle.size = particle.baseSize * scale

        // 绘制粒子
        this.ctx.beginPath()
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
        this.ctx.fill()
        this.ctx.closePath()
      }
    },
    // 绘制环形律动
    drawRing(dataArray) {
      // 获取平均音频能量
      const averageEnergy = dataArray.reduce((a, b) => a + b) / dataArray.length
      const scale = 1 + (averageEnergy / 255) * 1.5

      // 获取当前配色
      const colors = this.getColorScheme()

      // 绘制外圆环
      this.ctx.beginPath()
      const outerRadius = Math.min(this.canvas.width, this.canvas.height) / 3 * scale
      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        outerRadius,
        0,
        Math.PI * 2
      )
      this.ctx.strokeStyle = colors[0]
      this.ctx.lineWidth = 10
      this.ctx.stroke()
      this.ctx.closePath()

      // 绘制内圆环
      this.ctx.beginPath()
      const innerRadius = Math.min(this.canvas.width, this.canvas.height) / 6 * scale
      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        innerRadius,
        0,
        Math.PI * 2
      )
      this.ctx.strokeStyle = colors[1]
      this.ctx.lineWidth = 5
      this.ctx.stroke()
      this.ctx.closePath()

      // 绘制连接线条
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12
        const x1 = this.canvas.width / 2 + Math.cos(angle) * innerRadius
        const y1 = this.canvas.height / 2 + Math.sin(angle) * innerRadius
        const x2 = this.canvas.width / 2 + Math.cos(angle) * outerRadius
        const y2 = this.canvas.height / 2 + Math.sin(angle) * outerRadius

        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
        this.ctx.strokeStyle = colors[2]
        this.ctx.lineWidth = 2
        this.ctx.stroke()
        this.ctx.closePath()
      }
    },
    // 获取当前配色方案
    getColorScheme() {
      const colorSchemes = {
        'blue-white': ['#4A90E2', '#FFFFFF'],
        'pink-purple': ['#E91E63', '#9C27B0'],
        'cyan-green': ['#00BCD4', '#4CAF50'],
        'orange-red': ['#FF9800', '#F44336'],
        'yellow-green': ['#FFEB3B', '#8BC34A'],
        'purple-blue': ['#9C27B0', '#2196F3'],
      }

      return colorSchemes[this.colorScheme] || ['#4A90E2', '#FFFFFF']
    },
  },
}
</script>

<style scoped>
.local-music-visual {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.refresh-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background-color: #66b1ff;
}

/* 双分区布局 */
.main-container {
  display: flex;
  height: calc(100% - 80px);
  gap: 20px;
}

/* 左侧音乐列表区 */
.music-list-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 列表头部 */
.list-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.sort-select,
.style-select,
.speed-select,
.mode-select,
.color-select {
  min-width: 120px;
}

/* 音乐列表 */
.music-list {
  flex: 1;
  overflow-y: auto;
}

.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.music-item:hover {
  background-color: #f5f5f5;
}

.music-item.active {
  background-color: #e6f7ff;
  color: #409EFF;
}

.music-info {
  flex: 1;
}

.music-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.music-title i {
  font-size: 12px;
}

.music-artist {
  font-size: 12px;
  color: #999;
}

.music-duration,
.music-size {
  font-size: 12px;
  color: #999;
  margin-left: 16px;
}

/* 右侧可视化播放区 */
.visual-container {
  flex: 2;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 可视化画布 */
.visual-canvas-wrapper {
  flex: 1;
  background-color: #000;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-canvas {
  width: 100%;
  height: 100%;
}

/* 播放控制栏 */
.control-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 进度条 */
.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.time {
  font-size: 12px;
  color: #666;
  min-width: 45px;
}

.progress-slider {
  flex: 1;
}

/* 音量调节 */
.volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.volume-slider {
  width: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .music-list-container,
  .visual-container {
    flex: none;
    height: 50%;
  }

  .control-bar {
    justify-content: center;
  }

  .progress-container {
    order: -1;
    width: 100%;
  }
}
</style>
