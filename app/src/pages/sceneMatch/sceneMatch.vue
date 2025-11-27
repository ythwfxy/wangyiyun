<template>
  <div class="scene-match-container">
    <!-- 顶部场景筛选区 -->
    <div class="scene-filter-header">
      <div class="header-title">
        <span class="dynamic-title">{{ currentSceneTitle }}</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCustomSceneModal = true">自定义场景</el-button>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索场景名称/标签"
          prefix-icon="el-icon-search"
          style="width: 200px; margin-left: 10px"
          @keyup.enter.native="searchScenes"
        ></el-input>
      </div>
    </div>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" type="card" class="scene-tabs">
      <el-tab-pane label="智能匹配" name="smart">
        <!-- 智能匹配页面 -->
        <div class="smart-match-container">
          <!-- 环境数据展示 -->
          <div class="environment-info">
            <div class="info-item">
              <i class="el-icon-time"></i>
              <span>{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-cloudy"></i>
              <span>{{ currentWeather }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-location"></i>
              <span>{{ currentLocation }}</span>
            </div>
          </div>

          <!-- 匹配结果 -->
          <div class="match-results">
            <h3>为你推荐的场景</h3>
            <div class="primary-scene-card">
              <div class="scene-card large">
                <img :src="primaryScene.cover" alt="场景封面" class="scene-cover">
                <div class="scene-info">
                  <h2>{{ primaryScene.name }}</h2>
                  <p class="scene-description">{{ primaryScene.description }}</p>
                  <p class="match-reason">匹配理由：{{ primaryScene.matchReason }}</p>
                  <el-button type="success" @click="playScene(primaryScene)">立即播放</el-button>
                  <el-button @click="enterImmersiveMode">沉浸式模式</el-button>
                </div>
              </div>
            </div>

            <div class="alternative-scenes">
              <h4>备选场景</h4>
              <div class="scene-list">
                <div class="scene-card small" v-for="scene in alternativeScenes" :key="scene.id">
                  <img :src="scene.cover" alt="场景封面" class="scene-cover">
                  <div class="scene-info">
                    <h3>{{ scene.name }}</h3>
                    <p class="scene-description">{{ scene.description }}</p>
                    <el-button type="primary" size="small" @click="playScene(scene)">播放</el-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="refresh-button">
              <el-button @click="refreshMatchResults">换一批</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="热门场景" name="hot">
        <!-- 热门场景页面 -->
        <div class="hot-scenes-container">
          <div class="scene-grid">
            <div class="scene-card grid-item" v-for="scene in hotScenes" :key="scene.id">
              <img :src="scene.cover" alt="场景封面" class="scene-cover">
              <div class="scene-info">
                <h3>{{ scene.name }}</h3>
                <p class="scene-tags">{{ scene.tags.join(' · ') }}</p>
                <div class="scene-stats">
                  <span><i class="el-icon-user"></i> {{ scene.userCount }}人使用</span>
                  <span><i class="el-icon-music"></i> {{ scene.playlistCount }}个歌单</span>
                </div>
                <div class="scene-hover-info" v-show="hoveredSceneId === scene.id">
                  <p class="scene-description">{{ scene.description }}</p>
                  <el-button type="primary" size="small" @click="playScene(scene)">快速播放</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的场景" name="my">
        <!-- 我的场景页面 -->
        <div class="my-scenes-container">
          <div class="scene-grid">
            <div class="scene-card grid-item" v-for="scene in myScenes" :key="scene.id">
              <img :src="scene.cover" alt="场景封面" class="scene-cover">
              <div class="scene-info">
                <h3>{{ scene.name }}</h3>
                <p class="scene-tags">{{ scene.tags.join(' · ') }}</p>
                <div class="scene-stats">
                  <span><i class="el-icon-music"></i> {{ scene.playlistCount }}个歌单</span>
                  <span><i class="el-icon-star"></i> {{ scene.favorite ? '已收藏' : '未收藏' }}</span>
                </div>
                <div class="scene-actions">
                  <el-button size="small" @click="playScene(scene)">播放</el-button>
                  <el-button size="small" @click="editScene(scene)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteScene(scene)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部场景控制栏 -->
    <div class="scene-control-bar">
      <div class="playback-controls">
        <el-button @click="previousSong">上一曲</el-button>
        <el-button :type="isPlaying ? 'warning' : 'primary'" @click="togglePlayPause">
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button @click="nextSong">下一曲</el-button>
      </div>

      <div class="current-scene-info">
        <span class="scene-name">{{ currentPlayingScene.name }}</span>
        <span class="current-song">{{ currentPlayingSong.name }} - {{ currentPlayingSong.artist }}</span>
      </div>

      <div class="control-actions">
        <el-select v-model="currentSceneId" @change="switchScene" placeholder="切换场景">
          <el-option v-for="scene in alternativeScenes" :key="scene.id" :label="scene.name" :value="scene.id"></el-option>
        </el-select>
        <el-button @click="shareScene">分享场景</el-button>
      </div>
    </div>

    <!-- 自定义场景模态框 -->
    <el-dialog title="自定义场景" :visible.sync="showCustomSceneModal" width="600px">
      <el-form :model="customSceneForm" label-width="80px">
        <el-form-item label="场景名称">
          <el-input v-model="customSceneForm.name" placeholder="请输入场景名称"></el-input>
        </el-form-item>
        <el-form-item label="场景图标">
          <el-select v-model="customSceneForm.icon" placeholder="请选择场景图标">
            <el-option label="🎧 耳机" value="headphone"></el-option>
            <el-option label="📚 学习" value="study"></el-option>
            <el-option label="🏃 运动" value="sport"></el-option>
            <el-option label="🚇 通勤" value="commute"></el-option>
            <el-option label="🌙 睡眠" value="sleep"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="场景标签">
          <el-input v-model="customSceneForm.tags" placeholder="请输入场景标签，用逗号分隔"></el-input>
        </el-form-item>
        <el-form-item label="场景描述">
          <el-input type="textarea" v-model="customSceneForm.description" placeholder="请输入场景描述"></el-input>
        </el-form-item>
        <el-form-item label="匹配条件">
          <el-checkbox-group v-model="customSceneForm.conditions">
            <el-checkbox label="时间范围"></el-checkbox>
            <el-checkbox label="天气偏好"></el-checkbox>
            <el-checkbox label="地理位置"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCustomSceneModal = false">取消</el-button>
        <el-button type="primary" @click="saveCustomScene">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SceneMatch',
  data() {
    return {
      activeTab: 'smart',
      currentSceneTitle: '🎵 智能场景匹配',
      searchKeyword: '',
      currentTime: '上午 10:30',
      currentWeather: '晴',
      currentLocation: '北京市',
      primaryScene: {
        id: 1,
        name: '通勤专属',
        description: '适合地铁、公交等通勤场景的音乐',
        matchReason: '根据你的听歌历史和当前时间（上午10:30），为你推荐通勤场景音乐',
        cover: 'https://picsum.photos/seed/commute/600/400',
        playlistId: 12345
      },
      alternativeScenes: [
        {
          id: 2,
          name: '学习专注',
          description: '帮助你集中注意力的轻音乐',
          cover: 'https://picsum.photos/seed/study/300/200',
          playlistId: 67890
        },
        {
          id: 3,
          name: '运动活力',
          description: '激发运动潜能的动感音乐',
          cover: 'https://picsum.photos/seed/sport/300/200',
          playlistId: 11223
        },
        {
          id: 4,
          name: '放松休息',
          description: '缓解压力的轻松音乐',
          cover: 'https://picsum.photos/seed/relax/300/200',
          playlistId: 44556
        }
      ],
      hotScenes: [
        {
          id: 5,
          name: '通勤地铁',
          tags: ['通勤', '地铁', '流行'],
          description: '地铁上的最佳音乐伴侣',
          cover: 'https://picsum.photos/seed/subway/300/200',
          userCount: 123456,
          playlistCount: 24
        },
        {
          id: 6,
          name: '考研复习',
          tags: ['学习', '考研', '轻音乐'],
          description: '帮助考研学子集中注意力',
          cover: 'https://picsum.photos/seed/exam/300/200',
          userCount: 78901,
          playlistCount: 18
        },
        {
          id: 7,
          name: '跑步健身',
          tags: ['运动', '跑步', '动感'],
          description: '跑步时的最佳音乐节奏',
          cover: 'https://picsum.photos/seed/run/300/200',
          userCount: 456789,
          playlistCount: 32
        },
        {
          id: 8,
          name: '睡眠放松',
          tags: ['睡眠', '放松', '冥想'],
          description: '帮助你快速进入睡眠状态',
          cover: 'https://picsum.photos/seed/sleep/300/200',
          userCount: 234567,
          playlistCount: 15
        }
      ],
      myScenes: [
        {
          id: 9,
          name: '我的通勤',
          tags: ['通勤', '地铁'],
          description: '我自定义的通勤场景',
          cover: 'https://picsum.photos/seed/mycommute/300/200',
          playlistCount: 5,
          favorite: true
        },
        {
          id: 10,
          name: '我的学习',
          tags: ['学习', '图书馆'],
          description: '我自定义的学习场景',
          cover: 'https://picsum.photos/seed/mystudy/300/200',
          playlistCount: 3,
          favorite: false
        }
      ],
      hoveredSceneId: null,
      isPlaying: false,
      currentPlayingScene: {
        name: '未播放场景'
      },
      currentPlayingSong: {
        name: '未播放歌曲',
        artist: '未知歌手'
      },
      currentSceneId: null,
      showCustomSceneModal: false,
      customSceneForm: {
        name: '',
        icon: 'headphone',
        tags: '',
        description: '',
        conditions: []
      }
    }
  },
  methods: {
    searchScenes() {
      console.log('搜索场景:', this.searchKeyword)
      // 这里可以添加搜索逻辑
    },
    refreshMatchResults() {
      console.log('刷新匹配结果')
      // 这里可以添加刷新逻辑
    },
    playScene(scene) {
      console.log('播放场景:', scene.name)
      this.currentPlayingScene = scene
      this.isPlaying = true
      // 这里可以添加播放逻辑
    },
    enterImmersiveMode() {
      console.log('进入沉浸式模式')
      // 这里可以添加沉浸式模式逻辑
    },
    togglePlayPause() {
      this.isPlaying = !this.isPlaying
      console.log(this.isPlaying ? '播放' : '暂停')
      // 这里可以添加播放/暂停逻辑
    },
    previousSong() {
      console.log('上一曲')
      // 这里可以添加上一曲逻辑
    },
    nextSong() {
      console.log('下一曲')
      // 这里可以添加下一曲逻辑
    },
    switchScene(sceneId) {
      const scene = this.alternativeScenes.find(s => s.id === sceneId)
      if (scene) {
        this.playScene(scene)
      }
    },
    shareScene() {
      console.log('分享场景')
      // 这里可以添加分享逻辑
    },
    editScene(scene) {
      console.log('编辑场景:', scene.name)
      // 这里可以添加编辑逻辑
    },
    deleteScene(scene) {
      console.log('删除场景:', scene.name)
      // 这里可以添加删除逻辑
    },
    saveCustomScene() {
      console.log('保存自定义场景:', this.customSceneForm)
      // 这里可以添加保存自定义场景逻辑
      this.showCustomSceneModal = false
    }
  },
  mounted() {
    // 模拟获取环境数据
    setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      let timePeriod = ''
      if (hours < 6) {
        timePeriod = '凌晨'
      } else if (hours < 12) {
        timePeriod = '上午'
      } else if (hours < 18) {
        timePeriod = '下午'
      } else {
        timePeriod = '晚上'
      }
      this.currentTime = `${timePeriod} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }, 60000)
  }
}
</script>

<style scoped>
.scene-match-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scene-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.header-title .dynamic-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.scene-tabs {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.smart-match-container {
  padding: 20px;
}

.environment-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #606266;
}

.info-item i {
  margin-right: 8px;
  color: #409eff;
}

.match-results h3 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.primary-scene-card {
  margin-bottom: 30px;
}

.scene-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.scene-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.scene-card.large {
  height: 300px;
}

.scene-card.small {
  height: 150px;
  margin-right: 20px;
  margin-bottom: 20px;
  width: calc(33.333% - 20px);
  float: left;
}

.scene-cover {
  width: 40%;
  height: 100%;
  object-fit: cover;
}

.scene-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.scene-info h2 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #303133;
}

.scene-info h3 {
  margin-bottom: 8px;
  font-size: 18px;
  color: #303133;
}

.scene-description {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.5;
}

.match-reason {
  margin-bottom: 20px;
  color: #909399;
  font-style: italic;
}

.alternative-scenes h4 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.scene-list {
  display: flex;
  flex-wrap: wrap;
}

.refresh-button {
  text-align: center;
  margin-top: 30px;
}

.hot-scenes-container, .my-scenes-container {
  padding: 20px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.scene-card.grid-item {
  flex-direction: column;
  height: 300px;
  width: 100%;
}

.scene-card.grid-item .scene-cover {
  width: 100%;
  height: 60%;
}

.scene-tags {
  margin-bottom: 10px;
  color: #409eff;
  font-size: 14px;
}

.scene-stats {
  margin-bottom: 10px;
  color: #909399;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.scene-stats span {
  display: flex;
  align-items: center;
}

.scene-stats i {
  margin-right: 4px;
}

.scene-hover-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scene-card.grid-item:hover .scene-hover-info {
  opacity: 1;
}

.scene-actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.scene-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  height: 60px;
}

.playback-controls {
  display: flex;
  gap: 10px;
}

.current-scene-info {
  flex: 1;
  text-align: center;
}

.scene-name {
  display: block;
  font-weight: bold;
  color: #303133;
}

.current-song {
  display: block;
  font-size: 14px;
  color: #606266;
}

.control-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .scene-filter-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .scene-card.small {
    width: calc(50% - 10px);
    margin-right: 10px;
  }

  .scene-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .scene-control-bar {
    left: 0;
    flex-direction: column;
    height: auto;
    padding: 10px;
    gap: 10px;
  }

  .playback-controls {
    justify-content: center;
  }

  .current-scene-info {
    text-align: center;
  }

  .control-actions {
    justify-content: center;
  }
}
</style>