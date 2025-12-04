<template>
  <div class="local-music-visual">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1 class="title">本地音乐可视化</h1>
      <div class="header-actions">
        <el-button @click="refreshLocalList">刷新本地列表</el-button>
      </div>
    </div>

    <!-- 双分区布局 -->
    <div class="main-content">
      <!-- 左侧本地音乐列表区 -->
      <div class="music-list">
        <div class="list-header">
          <el-input v-model="searchText" placeholder="搜索歌曲名" style="width: 200px;">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          <el-select v-model="sortType" placeholder="排序" style="width: 120px; margin-left: 10px;">
            <el-option label="按歌曲名" value="name"></el-option>
            <el-option label="按时长" value="duration"></el-option>
          </el-select>
          <el-button @click="importMusic" style="margin-left: 10px;">导入音乐</el-button>
          <input type="file" ref="fileInput" accept="audio/mp3,audio/wav" multiple style="display: none;" @change="handleFileImport">
        </div>

        <el-table :data="filteredMusicList" style="width: 100%;" @row-click="playMusic">
          <el-table-column prop="name" label="歌曲名" width="180"></el-table-column>
          <el-table-column prop="artist" label="歌手" width="120"></el-table-column>
          <el-table-column prop="duration" label="时长" width="100" :formatter="formatDuration"></el-table-column>
          <el-table-column prop="size" label="文件大小" width="100" :formatter="formatFileSize"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <i v-if="currentPlayingIndex === scope.$index" class="el-icon-sound"></i>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右侧可视化播放区 -->
      <div class="visual-player">
        <!-- 可视化画布 -->
        <div class="visual-canvas">
          <canvas ref="visualCanvas" width="600" height="400"></canvas>
        </div>

        <!-- 播放控制栏 -->
        <div class="player-controls">
          <div class="control-left">
            <el-button @click="playPause" :icon="isPlaying ? 'el-icon-pause' : 'el-icon-play'">
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button @click="previousSong" icon="el-icon-back"></el-button>
            <el-button @click="nextSong" icon="el-icon-right"></el-button>
          </div>

          <div class="control-center">
            <span>{{ formatTime(currentTime) }}</span>
            <el-slider v-model="currentTime" :max="duration" @change="seek" style="width: 400px; margin: 0 10px;"></el-slider>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <div class="control-right">
            <el-select v-model="playbackRate" placeholder="倍速" style="width: 80px;">
              <el-option label="0.5x" value="0.5"></el-option>
              <el-option label="1x" value="1"></el-option>
              <el-option label="1.5x" value="1.5"></el-option>
              <el-option label="2x" value="2"></el-option>
            </el-select>

            <el-select v-model="visualStyle" placeholder="可视化样式" style="width: 120px; margin-left: 10px;">
              <el-option label="频谱波形" value="spectrum"></el-option>
              <el-option label="粒子跟随" value="particles"></el-option>
              <el-option label="环形律动" value="ring"></el-option>
            </el-select>

            <el-select v-model="colorScheme" placeholder="配色" style="width: 100px; margin-left: 10px;">
              <el-option label="蓝白" value="blue"></el-option>
              <el-option label="粉紫" value="pink"></el-option>
              <el-option label="青绿" value="green"></el-option>
              <el-option label="橙黄" value="orange"></el-option>
              <el-option label="红白" value="red"></el-option>
              <el-option label="黑白" value="black"></el-option>
            </el-select>

            <el-slider v-model="volume" :max="100" @change="adjustVolume" style="width: 120px; margin-left: 10px;"></el-slider>
          </div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="audioElement" @timeupdate="updateTime" @ended="onSongEnded"></audio>
  </div>
</template>

<script>
export default {
  name: 'localMusicVisual',
  data() {
    return {
      // 音乐列表数据
      musicList: [],
      searchText: '',
      sortType: 'name',

      // 播放状态
      isPlaying: false,
      currentPlayingIndex: -1,
      currentTime: 0,
      duration: 0,
      volume: 70,
      playbackRate: 1,

      // 可视化设置
      visualStyle: 'spectrum',
      colorScheme: 'blue',

      // Web Audio API相关
      audioContext: null,
      analyser: null,
      dataArray: null,
      bufferLength: null,
      animationId: null
    }
  },
  computed: {
    // 过滤后的音乐列表
    filteredMusicList() {
      let filtered = this.musicList

      // 搜索过滤
      if (this.searchText) {
        filtered = filtered.filter(music => 
          music.name.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }

      // 排序
      if (this.sortType === 'name') {
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
      } else if (this.sortType === 'duration') {
        filtered = filtered.sort((a, b) => a.duration - b.duration)
      }

      return filtered
    }
  },
  mounted() {
    // 从localStorage加载音乐列表
    this.loadMusicList()

    // 初始化Web Audio API
    this.initAudioContext()

    // 初始化可视化
    this.initVisualization()
  },
  beforeDestroy() {
    // 清除动画帧
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // 关闭AudioContext
    if (this.audioContext) {
      this.audioContext.close()
    }
  },
  methods: {
    // 从localStorage加载音乐列表
    loadMusicList() {
      const savedList = localStorage.getItem('localMusicList')
      if (savedList) {
        this.musicList = JSON.parse(savedList)
      }
    },

    // 保存音乐列表到localStorage
    saveMusicList() {
      localStorage.setItem('localMusicList', JSON.stringify(this.musicList))
    },

    // 刷新本地列表
    refreshLocalList() {
      this.loadMusicList()
      this.$message.success('本地列表已刷新')
    },

    // 导入音乐
    importMusic() {
      this.$refs.fileInput.click()
    },

    // 处理文件导入
    handleFileImport(event) {
      const files = event.target.files
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 创建音乐对象
        const music = {
          id: Date.now() + i,
          name: file.name.replace(/\.(mp3|wav)$/i, ''),
          artist: '本地音乐',
          duration: 0,
          size: file.size,
          file: file,
          url: URL.createObjectURL(file)
        }

        // 尝试解析文件元信息
        this.parseFileMetadata(file, music)

        // 添加到音乐列表
        this.musicList.push(music)
      }

      // 保存到localStorage
      this.saveMusicList()

      // 清空文件输入
      event.target.value = ''

      this.$message.success(`成功导入 ${files.length} 首音乐`)
    },

    // 解析文件元信息
    parseFileMetadata(file, music) {
      // 这里可以使用第三方库如jsmediatags来解析MP3文件的元信息
      // 为了简化，这里暂时不实现，默认使用文件名作为歌曲名
    },

    // 播放音乐
    playMusic(row, column, event) {
      // 找到点击的音乐在原始列表中的索引
      const index = this.musicList.findIndex(music => music.id === row.id)
      
      if (index !== -1) {
        this.currentPlayingIndex = index
        const music = this.musicList[index]

        // 设置音频源
        this.$refs.audioElement.src = music.url
        
        // 播放音频
        this.$refs.audioElement.play()
        this.isPlaying = true

        // 随机切换可视化样式（如果需要）
        // this.visualStyle = ['spectrum', 'particles', 'ring'][Math.floor(Math.random() * 3)]
      }
    },

    // 播放/暂停
    playPause() {
      if (this.isPlaying) {
        this.$refs.audioElement.pause()
        this.isPlaying = false
      } else {
        this.$refs.audioElement.play()
        this.isPlaying = true
      }
    },

    // 上一首
    previousSong() {
      if (this.currentPlayingIndex > 0) {
        this.playMusic(this.musicList[this.currentPlayingIndex - 1])
      } else {
        this.$message.info('已经是第一首了')
      }
    },

    // 下一首
    nextSong() {
      if (this.currentPlayingIndex < this.musicList.length - 1) {
        this.playMusic(this.musicList[this.currentPlayingIndex + 1])
      } else {
        this.$message.info('已经是最后一首了')
      }
    },

    // 更新播放时间
    updateTime() {
      this.currentTime = this.$refs.audioElement.currentTime
      this.duration = this.$refs.audioElement.duration || 0
    },

    // 跳转播放位置
    seek() {
      this.$refs.audioElement.currentTime = this.currentTime
    },

    // 调整音量
    adjustVolume() {
      this.$refs.audioElement.volume = this.volume / 100
    },

    // 歌曲播放结束
    onSongEnded() {
      // 自动播放下一首
      if (this.currentPlayingIndex < this.musicList.length - 1) {
        this.nextSong()
      } else {
        this.isPlaying = false
        this.currentPlayingIndex = -1
        this.currentTime = 0
      }
    },

    // 初始化Web Audio API
    initAudioContext() {
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new (AudioContext || webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()

        // 将音频元素连接到analyser
        const source = this.audioContext.createMediaElementSource(this.$refs.audioElement)
        source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)

        // 设置FFT大小
        this.analyser.fftSize = 256
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
      } else {
        this.$message.error('您的浏览器不支持Web Audio API，无法使用可视化功能')
      }
    },

    // 初始化可视化
    initVisualization() {
      const canvas = this.$refs.visualCanvas
      const ctx = canvas.getContext('2d')

      // 绘制可视化效果
      const drawVisualization = () => {
        this.animationId = requestAnimationFrame(drawVisualization)

        // 获取音频数据
        if (this.analyser) {
          this.analyser.getByteFrequencyData(this.dataArray)
        }

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 根据选择的可视化样式绘制
        switch (this.visualStyle) {
          case 'spectrum':
            this.drawSpectrum(ctx, canvas)
            break
          case 'particles':
            this.drawParticles(ctx, canvas)
            break
          case 'ring':
            this.drawRing(ctx, canvas)
            break
          default:
            this.drawSpectrum(ctx, canvas)
        }
      }

      drawVisualization()
    },

    // 绘制频谱波形
    drawSpectrum(ctx, canvas) {
      const barWidth = (canvas.width / this.bufferLength) * 2.5
      let barHeight
      let x = 0

      // 获取配色
      const colors = this.getColorScheme()

      for (let i = 0; i < this.bufferLength; i++) {
        barHeight = (this.dataArray[i] / 255) * canvas.height * 0.8

        // 创建渐变
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, colors.top)
        gradient.addColorStop(1, colors.bottom)

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    },

    // 绘制粒子跟随
    drawParticles(ctx, canvas) {
      // 这里简化实现，绘制一些随音频节奏变化的粒子
      const particleCount = 50
      
      // 获取配色
      const colors = this.getColorScheme()

      for (let i = 0; i < particleCount; i++) {
        // 根据音频数据计算粒子大小和透明度
        const audioValue = this.dataArray[Math.floor(i / particleCount * this.bufferLength)] || 0
        const size = (audioValue / 255) * 10 + 2
        const alpha = (audioValue / 255) * 0.8 + 0.2

        // 随机分布粒子位置
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height

        ctx.fillStyle = `${colors.top.substring(0, colors.top.length - 2)}, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    },

    // 绘制环形律动
    drawRing(ctx, canvas) {
      // 计算平均音频值
      let averageValue = 0
      for (let i = 0; i < this.bufferLength; i++) {
        averageValue += this.dataArray[i]
      }
      averageValue /= this.bufferLength

      // 环形半径随音频值变化
      const baseRadius = 100
      const maxRadiusChange = 50
      const radius = baseRadius + (averageValue / 255) * maxRadiusChange

      // 环形宽度
      const lineWidth = 10

      // 中心位置
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 获取配色
      const colors = this.getColorScheme()

      // 绘制环形
      ctx.strokeStyle = colors.top
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // 绘制内圆（可选）
      ctx.strokeStyle = colors.bottom
      ctx.lineWidth = lineWidth / 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - lineWidth, 0, Math.PI * 2)
      ctx.stroke()
    },

    // 获取配色方案
    getColorScheme() {
      switch (this.colorScheme) {
        case 'blue':
          return { top: 'rgba(52, 152, 219, 1)', bottom: 'rgba(236, 240, 241, 1)' }
        case 'pink':
          return { top: 'rgba(231, 76, 60, 1)', bottom: 'rgba(155, 89, 182, 1)' }
        case 'green':
          return { top: 'rgba(46, 204, 113, 1)', bottom: 'rgba(127, 140, 141, 1)' }
        case 'orange':
          return { top: 'rgba(230, 126, 34, 1)', bottom: 'rgba(241, 196, 15, 1)' }
        case 'red':
          return { top: 'rgba(231, 76, 60, 1)', bottom: 'rgba(236, 240, 241, 1)' }
        case 'black':
          return { top: 'rgba(34, 34, 34, 1)', bottom: 'rgba(149, 165, 166, 1)' }
        default:
          return { top: 'rgba(52, 152, 219, 1)', bottom: 'rgba(236, 240, 241, 1)' }
      }
    },

    // 格式化时长
    formatDuration(row, column, cellValue) {
      if (cellValue) {
        const minutes = Math.floor(cellValue / 60)
        const seconds = Math.floor(cellValue % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
      return '--:--'
    },

    // 格式化文件大小
    formatFileSize(row, column, cellValue) {
      if (cellValue) {
        if (cellValue < 1024 * 1024) {
          return `${(cellValue / 1024).toFixed(2)} KB`
        } else {
          return `${(cellValue / (1024 * 1024)).toFixed(2)} MB`
        }
      }
      return '--'
    },

    // 格式化时间
    formatTime(seconds) {
      if (seconds && !isNaN(seconds)) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      }
      return '0:00'
    }
  },
  watch: {
    // 监听播放速率变化
    playbackRate(newRate) {
      this.$refs.audioElement.playbackRate = newRate
    },

    // 监听音量变化
    volume() {
      this.adjustVolume()
    }
  }
}
</script>

<style scoped>
.local-music-visual {
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

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.music-list {
  width: 400px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.music-list .el-table {
  flex: 1;
  margin-bottom: 0;
}

.music-list .el-table__body tr:hover > td {
  background-color: #f5f5f5;
}

.music-list .el-table__body tr.current-row > td {
  background-color: #ffebee;
  color: #f44336;
}

.visual-player {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.visual-canvas {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.visual-canvas canvas {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.control-left, .control-center, .control-right {
  display: flex;
  align-items: center;
}

.control-center .el-slider {
  margin: 0 10px;
}

.control-right .el-select, .control-right .el-slider {
  margin-left: 10px;
}
</style>