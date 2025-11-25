<template>
  <div class="music-storyboard-container">
    <!-- 顶部导航栏 -->
    <div class="storyboard-header">
      <h1 class="header-title">音乐故事板</h1>
      <div class="header-actions">
        <el-button icon="el-icon-plus" circle @click="createStory">创建故事</el-button>
        <el-button icon="el-icon-user" circle @click="myStories">我的故事</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="storyboard-filters">
      <el-select v-model="selectedTheme" placeholder="选择主题" @change="onFilterChange">
        <el-option label="全部" value="all"></el-option>
        <el-option label="青春" value="youth"></el-option>
        <el-option label="治愈" value="healing"></el-option>
        <el-option label="冒险" value="adventure"></el-option>
        <el-option label="怀旧" value="nostalgia"></el-option>
      </el-select>

      <el-select v-model="selectedStyle" placeholder="选择音乐风格" @change="onFilterChange">
        <el-option label="全部" value="all"></el-option>
        <el-option label="流行" value="pop"></el-option>
        <el-option label="民谣" value="folk"></el-option>
        <el-option label="古典" value="classical"></el-option>
        <el-option label="电子" value="electronic"></el-option>
      </el-select>

      <el-select v-model="selectedLength" placeholder="选择故事长度" @change="onFilterChange">
        <el-option label="全部" value="all"></el-option>
        <el-option label="短" value="short"></el-option>
        <el-option label="中" value="medium"></el-option>
        <el-option label="长" value="long"></el-option>
      </el-select>
    </div>

    <!-- 故事列表区 -->
    <div class="storyboard-list">
      <div class="story-card" v-for="story in stories" :key="story.id">
        <div class="story-cover">
          <img :src="story.cover" :alt="story.title" class="cover-image">
          <div class="cover-overlay">
            <el-button type="primary" size="small" @click="enterImmersive(story)">沉浸式体验</el-button>
          </div>
        </div>
        <div class="story-info">
          <h3 class="story-title">{{ story.title }}</h3>
          <p class="story-creator">创作者: {{ story.creator }}</p>
          <p class="story-plays">播放量: {{ story.plays }}</p>
          <div class="story-actions">
            <el-button icon="el-icon-star-off" size="small" @click="toggleFavorite(story)">{{ story.isFavorite ? '已收藏' : '收藏' }}</el-button>
            <el-button icon="el-icon-thumb-up" size="small" @click="likeStory(story)">{{ story.likes }}</el-button>
            <el-button icon="el-icon-chat-dot-round" size="small" @click="viewComments(story)">{{ story.comments }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <div class="storyboard-player" v-if="currentPlayingStory">
      <div class="player-info">
        <h4 class="player-title">{{ currentPlayingStory.title }}</h4>
        <p class="player-creator">{{ currentPlayingStory.creator }}</p>
      </div>
      <div class="player-controls">
        <el-button icon="el-icon-prev" size="small"></el-button>
        <el-button :icon="isPlaying ? 'el-icon-pause' : 'el-icon-play'" size="small" @click="togglePlay"></el-button>
        <el-button icon="el-icon-next" size="small"></el-button>
        <el-slider v-model="playProgress" :max="100" style="width: 200px; margin-left: 20px;"></el-slider>
        <el-button icon="el-icon-magic-stick" size="small" @click="toggleStoryMode">{{ isStoryMode ? '普通模式' : '故事模式' }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicStoryboard',
  data() {
    return {
      selectedTheme: 'all',
      selectedStyle: 'all',
      selectedLength: 'all',
      stories: [
        {
          id: 1,
          title: '青春的回忆',
          creator: '张三',
          plays: 12345,
          likes: 678,
          comments: 90,
          cover: 'https://via.placeholder.com/300x400',
          theme: 'youth',
          style: 'pop',
          length: 'medium',
          isFavorite: false
        },
        {
          id: 2,
          title: '治愈系音乐之旅',
          creator: '李四',
          plays: 9876,
          likes: 456,
          comments: 78,
          cover: 'https://via.placeholder.com/300x400',
          theme: 'healing',
          style: 'folk',
          length: 'long',
          isFavorite: false
        },
        {
          id: 3,
          title: '冒险的旋律',
          creator: '王五',
          plays: 5432,
          likes: 234,
          comments: 56,
          cover: 'https://via.placeholder.com/300x400',
          theme: 'adventure',
          style: 'electronic',
          length: 'short',
          isFavorite: false
        }
      ],
      currentPlayingStory: null,
      isPlaying: false,
      playProgress: 0,
      isStoryMode: true
    }
  },
  methods: {
    createStory() {
      // 跳转到故事创建页面
      console.log('创建故事')
    },
    myStories() {
      // 跳转到我的故事页面
      console.log('我的故事')
    },
    onFilterChange() {
      // 筛选故事列表
      console.log('筛选条件变化')
    },
    enterImmersive(story) {
      // 进入沉浸式体验模式
      console.log('进入沉浸式体验', story)
    },
    toggleFavorite(story) {
      story.isFavorite = !story.isFavorite
    },
    likeStory(story) {
      story.likes++
    },
    viewComments(story) {
      // 查看评论
      console.log('查看评论', story)
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    toggleStoryMode() {
      this.isStoryMode = !this.isStoryMode
    }
  },
  mounted() {
    // 模拟加载故事数据
    console.log('音乐故事板页面加载完成')
  }
}
</script>

<style scoped>
.music-storyboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
}

.storyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.storyboard-filters {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.storyboard-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0 20px;
}

.story-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.story-cover {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.story-cover:hover .cover-image {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.story-cover:hover .cover-overlay {
  opacity: 1;
}

.story-info {
  padding: 15px;
}

.story-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.story-creator {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.story-plays {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
}

.story-actions {
  display: flex;
  gap: 10px;
}

.storyboard-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.player-info {
  flex: 1;
}

.player-title {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.player-creator {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .storyboard-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .storyboard-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .storyboard-filters {
    flex-direction: column;
    gap: 10px;
  }

  .storyboard-player {
    height: 60px;
    padding: 0 10px;
  }

  .player-controls {
    gap: 5px;
  }

  .player-controls .el-slider {
    width: 100px;
  }
}
</style>