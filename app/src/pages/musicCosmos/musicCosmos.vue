<template>
  <div class="music-cosmos-container">
    <!-- 顶部导航栏 -->
    <div class="cosmos-header">
      <h1 class="cosmos-title">音乐宇宙</h1>
      <div class="header-actions">
        <button class="random-roam-btn">随机漫游</button>
        <i class="search-icon"></i>
      </div>
    </div>

    <!-- 3D宇宙容器 -->
    <div class="cosmos-main">
      <canvas id="cosmos-canvas"></canvas>
    </div>

    <!-- 底部控制栏 -->
    <div class="cosmos-footer">
      <div class="current-track">
        <img src="" alt="专辑封面" class="track-cover">
        <div class="track-info">
          <span class="track-name">当前播放歌曲</span>
          <span class="track-artist">歌手名称</span>
        </div>
      </div>
      <div class="play-controls">
        <button class="control-btn prev-btn">上一首</button>
        <button class="control-btn play-pause-btn">播放/暂停</button>
        <button class="control-btn next-btn">下一首</button>
      </div>
      <div class="footer-actions">
        <button class="back-to-center-btn">返回中心</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicCosmos',
  data() {
    return {
      // 宇宙相关数据
      cosmosData: null,
      // 3D渲染相关
      canvas: null,
      gl: null,
      // 播放相关
      currentTrack: null
    }
  },
  mounted() {
    this.initCanvas()
    this.loadCosmosData()
    this.startAnimation()
  },
  beforeDestroy() {
    // 清理资源
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  },
  methods: {
    // 初始化Canvas和WebGL
    initCanvas() {
      this.canvas = document.getElementById('cosmos-canvas')
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
      
      if (!this.gl) {
        // WebGL不支持，使用降级方案
        this.useFallback()
        return
      }
      
      // 设置Canvas大小
      this.resizeCanvas()
      window.addEventListener('resize', this.resizeCanvas)
      
      // 初始化WebGL上下文
      this.initWebGL()
    },
    
    // 调整Canvas大小
    resizeCanvas() {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight - this.$refs.header.offsetHeight - this.$refs.footer.offsetHeight
      if (this.gl) {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
      }
    },
    
    // 初始化WebGL
    initWebGL() {
      // 这里将实现WebGL渲染逻辑
      console.log('WebGL initialized')
    },
    
    // 加载宇宙数据
    loadCosmosData() {
      // 这里将从后端加载用户的音乐偏好数据，生成个性化宇宙
      this.cosmosData = this.generateMockCosmosData()
    },
    
    // 生成模拟宇宙数据
    generateMockCosmosData() {
      return {
        user: {
          name: '用户',
          avatar: 'https://picsum.photos/seed/user-avatar/100/100'
        },
        styles: [
          {
            id: 'pop',
            name: '流行',
            color: '#FF6B6B',
            size: 30,
            brightness: 1.0,
            position: { x: 100, y: 0, z: 0 },
            artists: ['Taylor Swift', 'Ed Sheeran', 'Adele'],
            playCount: 1250
          },
          {
            id: 'rock',
            name: '摇滚',
            color: '#4ECDC4',
            size: 25,
            brightness: 0.8,
            position: { x: -80, y: 60, z: 0 },
            artists: ['Queen', 'The Beatles', 'Linkin Park'],
            playCount: 890
          },
          {
            id: 'electronic',
            name: '电子',
            color: '#45B7D1',
            size: 22,
            brightness: 0.7,
            position: { x: -80, y: -60, z: 0 },
            artists: ['Daft Punk', 'Calvin Harris', 'Avicii'],
            playCount: 670
          },
          {
            id: 'classical',
            name: '古典',
            color: '#96CEB4',
            size: 18,
            brightness: 0.6,
            position: { x: 60, y: 80, z: 0 },
            artists: ['Beethoven', 'Mozart', 'Chopin'],
            playCount: 450
          },
          {
            id: 'hiphop',
            name: '嘻哈',
            color: '#FFEAA7',
            size: 20,
            brightness: 0.75,
            position: { x: 60, y: -80, z: 0 },
            artists: ['Eminem', 'Kanye West', 'Jay-Z'],
            playCount: 720
          }
        ],
        comets: [
          {
            id: 'comet1',
            name: '新歌推荐',
            song: 'Blinding Lights',
            artist: 'The Weeknd',
            position: { x: 200, y: 100, z: 0 },
            speed: 2
          },
          {
            id: 'comet2',
            name: '宝藏歌曲',
            song: 'Shape of You',
            artist: 'Ed Sheeran',
            position: { x: -200, y: -100, z: 0 },
            speed: 1.5
          }
        ]
      }
    },
    
    // 开始动画循环
    startAnimation() {
      const animate = () => {
        this.updateCosmos()
        this.renderCosmos()
        this.animationId = requestAnimationFrame(animate)
      }
      animate()
    },
    
    // 更新宇宙状态
    updateCosmos() {
      // 这里将实现宇宙天体的运动逻辑
    },
    
    // 渲染宇宙
    renderCosmos() {
      if (!this.gl) return
      
      // 这里将实现WebGL渲染逻辑
    },
    
    // WebGL不支持时的降级方案
    useFallback() {
      console.log('WebGL not supported, using fallback')
      // 这里将实现静态星空背景+动态HTML元素模拟天体
    },
    
    // 随机漫游
    randomRoam() {
      // 这里将实现随机漫游功能
      console.log('Random roam clicked')
    },
    
    // 返回中心
    backToCenter() {
      // 这里将实现返回中心功能
      console.log('Back to center clicked')
    }
  }
}
</script>

<style scoped>
.music-cosmos-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0f;
  overflow: hidden;
}

.cosmos-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: rgba(10, 10, 15, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.cosmos-title {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: nebulaFlow 3s ease-in-out infinite alternate;
}

@keyframes nebulaFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.random-roam-btn {
  padding: 8px 16px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.random-roam-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.search-icon {
  width: 20px;
  height: 20px;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTRMMTUuNSAxMC41TDE0IDlMMTAgMTNMMTYuNSAxNi41TDE1LjUgMTcuNUw5IDI0TDIuNSAxNy41TDMuNSAxNi41TDkgMTNMMi41IDkuNUwxLjUgOC41TDkgMCIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K') no-repeat center;
  background-size: contain;
  cursor: pointer;
}

.cosmos-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#cosmos-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.cosmos-footer {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: rgba(10, 10, 15, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.current-track {
  display: flex;
  align-items: center;
  gap: 10px;
}

.track-cover {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  object-fit: cover;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.track-name {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.track-artist {
  color: #999;
  font-size: 12px;
}

.play-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-pause-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.footer-actions {
  display: flex;
  align-items: center;
}

.back-to-center-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-to-center-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>