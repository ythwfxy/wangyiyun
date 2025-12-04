<template>
  <div class="local-music-visual">
    <!-- 顶部标题栏 -->
    <div class="visual-header">
      <h2>本地音乐可视化</h2>
      <el-button type="primary" @click="refreshLocalList">
        <i class="el-icon-refresh"></i> 刷新本地列表
      </el-button>
    </div>

    <!-- 核心布局 -->
    <div class="visual-container">
      <!-- 左侧本地音乐列表区 -->
      <div class="music-list-section">
        <div class="search-bar">
          <el-input
            placeholder="搜索歌曲"
            prefix-icon="el-icon-search"
            v-model="searchQuery"
            clearable
          ></el-input>
        </div>

        <el-table
          :data="filteredMusicList"
          stripe
          border
          style="width: 100%"
          @row-click="playMusic"
        >
          <el-table-column
            prop="name"
            label="歌曲名"
            width="200"
          >
            <template slot-scope="scope">
              <span :class="{ 'playing': currentMusic && currentMusic.id === scope.row.id }">
                <i v-if="currentMusic && currentMusic.id === scope.row.id" class="el-icon-sound"></i>
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="artist"
            label="歌手"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="duration"
            label="时长"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="size"
            label="文件大小"
            width="120"
          ></el-table-column>
        </el-table>

        <div class="import-section">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".mp3,.wav"
          >
            <el-button type="success">
              <i class="el-icon-plus"></i> 导入本地音乐
            </el-button>
          </el-upload>
        </div>
      </div>

      <!-- 右侧可视化播放区 -->
      <div class="visual-play-section">
        <!-- 可视化画布 -->
        <div class="visual-canvas-container">
          <canvas ref="visualCanvas"></canvas>
        </div>

        <!-- 播放控制栏 -->
        <div class="play-control">
          <div class="control-buttons">
            <el-button
              type="primary"
              circle
              icon="el-icon-arrow-left"
              @click="playPrevious"
            ></el-button>
            <el-button
              type="primary"
              circle
              :icon="isPlaying ? 'el-icon-pause' : 'el-icon-video-play'"
              @click="togglePlay"
              size="large"
            ></el-button>
            <el-button
              type="primary"
              circle
              icon="el-icon-arrow-right"
              @click="playNext"
            ></el-button>
          </div>

          <div class="progress-section">
            <span>{{ formatTime(currentTime) }}</span>
            <el-slider
              v-model="progress"
              @change="seekTo"
              style="width: 200px"
            ></el-slider>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <div class="volume-section">
            <i class="el-icon-volume-2"></i>
            <el-slider
              v-model="volume"
              @change="adjustVolume"
              style="width: 100px"
            ></el-slider>
          </div>

          <div class="visual-style-section">
            <el-select
              v-model="currentVisualStyle"
              @change="changeVisualStyle"
              style="width: 120px"
            >
              <el-option label="频谱波形" value="spectrum"></el-option>
              <el-option label="粒子跟随" value="particles"></el-option>
              <el-option label="环形律动" value="circle"></el-option>
            </el-select>
          </div>

          <div class="playback-rate-section">
            <el-select
              v-model="playbackRate"
              @change="changePlaybackRate"
              style="width: 80px"
            >
              <el-option label="0.5x" value="0.5"></el-option>
              <el-option label="1x" value="1"></el-option>
              <el-option label="1.5x" value="1.5"></el-option>
              <el-option label="2x" value="2"></el-option>
            </el-select>
          </div>

          <div class="loop-mode-section">
            <el-button
              type="primary"
              circle
              :icon="loopMode === 'single' ? 'el-icon-refresh-left' : 'el-icon-refresh'"
              @click="toggleLoopMode"
            ></el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="audioElement" @timeupdate="updateProgress" @loadedmetadata="updateDuration" @ended="onMusicEnded"></audio>
  </div>
</template>

<script>
export default {
  name: 'LocalMusicVisual',
  data() {
    return {
      searchQuery: '',
      musicList: [],
      currentMusic: null,
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 70,
      playbackRate: 1,
      loopMode: 'sequence', // sequence 或 single
      currentVisualStyle: 'spectrum',
      audioContext: null,
      analyser: null,
      source: null,
      canvas: null,
      ctx: null,
      particles: []
    }
  },
  computed: {
    filteredMusicList() {
      if (!this.searchQuery) return this.musicList
      return this.musicList.filter(music =>
        music.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    progress() {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0
    }
  },
  mounted() {
    this.loadLocalMusic()
    this.initVisualization()
  },
  beforeDestroy() {
    this.stopVisualization()
  },
  methods: {
    // 加载本地音乐列表
    loadLocalMusic() {
      const savedMusic = localStorage.getItem('localMusicList')
      if (savedMusic) {
        this.musicList = JSON.parse(savedMusic)
      }
    },

    // 刷新本地列表
    refreshLocalList() {
      this.loadLocalMusic()
      this.$message.success('本地列表已刷新')
    },

    // 处理文件导入
    handleFileChange(file) {
      const audioFile = file.raw
      if (!audioFile) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const audio = new Audio()
        audio.src = e.target.result
        audio.onloadedmetadata = () => {
          const musicItem = {
            id: Date.now() + Math.random(),
            name: audioFile.name.replace(/\.[^/.]+$/, ''),
            artist: '未知歌手',
            duration: this.formatTime(audio.duration),
            size: this.formatFileSize(audioFile.size),
            url: e.target.result
          }

          this.musicList.push(musicItem)
          localStorage.setItem('localMusicList', JSON.stringify(this.musicList))
          this.$message.success('音乐导入成功')
        }
      }
      reader.readAsDataURL(audioFile)
    },

    // 播放音乐
    playMusic(row) {
      const index = this.musicList.findIndex(music => music.id === row.id)
      if (index === -1) return

      this.currentIndex = index
      this.currentMusic = row
      this.$refs.audioElement.src = row.url
      this.$refs.audioElement.play()
      this.isPlaying = true
      this.connectAudioToVisualization()
    },

    // 切换播放状态
    togglePlay() {
      if (!this.currentMusic) {
        this.$message.warning('请先选择一首音乐')
        return
      }

      if (this.isPlaying) {
        this.$refs.audioElement.pause()
      } else {
        this.$refs.audioElement.play()
      }
      this.isPlaying = !this.isPlaying
    },

    // 播放上一首
    playPrevious() {
      if (this.musicList.length === 0) return

      this.currentIndex = (this.currentIndex - 1 + this.musicList.length) % this.musicList.length
      this.playMusic(this.musicList[this.currentIndex])
    },

    // 播放下一首
    playNext() {
      if (this.musicList.length === 0) return

      this.currentIndex = (this.currentIndex + 1) % this.musicList.length
      this.playMusic(this.musicList[this.currentIndex])
    },

    // 音乐结束时的处理
    onMusicEnded() {
      if (this.loopMode === 'single') {
        this.$refs.audioElement.currentTime = 0
        this.$refs.audioElement.play()
      } else {
        this.playNext()
      }
    },

    // 更新播放进度
    updateProgress() {
      this.currentTime = this.$refs.audioElement.currentTime
    },

    // 更新歌曲时长
    updateDuration() {
      this.duration = this.$refs.audioElement.duration
    },

    // 调整播放位置
    seekTo(value) {
      if (!this.$refs.audioElement) return
      this.$refs.audioElement.currentTime = (value / 100) * this.duration
    },

    // 调整音量
    adjustVolume(value) {
      if (!this.$refs.audioElement) return
      this.$refs.audioElement.volume = value / 100
    },

    // 改变播放速度
    changePlaybackRate(value) {
      if (!this.$refs.audioElement) return
      this.$refs.audioElement.playbackRate = value
    },

    // 切换循环模式
    toggleLoopMode() {
      this.loopMode = this.loopMode === 'sequence' ? 'single' : 'sequence'
      this.$message.success(`循环模式已切换为：${this.loopMode === 'single' ? '单曲循环' : '顺序播放'}`)
    },

    // 初始化可视化
    initVisualization() {
      this.canvas = this.$refs.visualCanvas
      this.ctx = this.canvas.getContext('2d')
      this.canvas.width = 600
      this.canvas.height = 400

      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 256
        this.startVisualization()
      } catch (e) {
        console.error('音频可视化初始化失败:', e)
      }
    },

    // 连接音频到可视化
    connectAudioToVisualization() {
      if (!this.audioContext || !this.analyser) return

      if (this.source) {
        this.source.disconnect()
      }

      this.source = this.audioContext.createMediaElementSource(this.$refs.audioElement)
      this.source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
    },

    // 开始可视化
    startVisualization() {
      const bufferLength = this.analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        requestAnimationFrame(draw)

        this.analyser.getByteFrequencyData(dataArray)

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.currentVisualStyle === 'spectrum') {
          this.drawSpectrum(dataArray, bufferLength)
        } else if (this.currentVisualStyle === 'particles') {
          this.drawParticles(dataArray, bufferLength)
        } else if (this.currentVisualStyle === 'circle') {
          this.drawCircle(dataArray, bufferLength)
        }
      }

      draw()
    },

    // 绘制频谱波形
    drawSpectrum(dataArray, bufferLength) {
      const barWidth = (this.canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i]

        const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0)
        gradient.addColorStop(0, '#409EFF')
        gradient.addColorStop(1, '#67C23A')

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    },

    // 绘制粒子跟随
    drawParticles(dataArray, bufferLength) {
      if (this.particles.length === 0) {
        for (let i = 0; i < 100; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 5 + 2,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
          })
        }
      }

      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      const scale = average / 128

      this.particles.forEach(particle => {
        particle.x += particle.speedX * scale
        particle.y += particle.speedY * scale

        if (particle.x < 0 || particle.x > this.canvas.width) {
          particle.speedX = -particle.speedX
        }
        if (particle.y < 0 || particle.y > this.canvas.height) {
          particle.speedY = -particle.speedY
        }

        this.ctx.fillStyle = particle.color
        this.ctx.beginPath()
        this.ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2)
        this.ctx.fill()
      })
    },

    // 绘制环形律动
    drawCircle(dataArray, bufferLength) {
      const centerX = this.canvas.width / 2
      const centerY = this.canvas.height / 2
      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      const radius = 50 + (average / 255) * 100

      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, '#E6A23C')
      gradient.addColorStop(1, '#F56C6C')

      this.ctx.strokeStyle = gradient
      this.ctx.lineWidth = 5
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.stroke()

      // 绘制内层圆环
      this.ctx.strokeStyle = '#909399'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius / 2, 0, Math.PI * 2)
      this.ctx.stroke()
    },

    // 停止可视化
    stopVisualization() {
      if (this.audioContext) {
        this.audioContext.close()
      }
    },

    // 改变可视化样式
    changeVisualStyle() {
      this.particles = [] // 重置粒子
    },

    // 格式化时间
    formatTime(seconds) {
      if (isNaN(seconds)) return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.local-music-visual {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.visual-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e7ea;
}

.visual-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.visual-container {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: hidden;
}

.music-list-section {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 15px;
}

.import-section {
  margin-top: 15px;
  text-align: center;
}

.visual-play-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.visual-canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.visual-canvas-container canvas {
  border-radius: 8px;
}

.play-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-section span {
  font-size: 12px;
  color: #606266;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.volume-section i {
  color: #606266;
}

.visual-style-section,
.playback-rate-section {
  margin: 0 10px;
}

.playing {
  color: #F56C6C;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .music-list-section {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .visual-container {
    flex-direction: column;
  }

  .music-list-section {
    width: 100%;
    height: 200px;
  }

  .play-control {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>