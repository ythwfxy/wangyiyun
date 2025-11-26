<template>
  <div class="musicStoryboard">
    <!-- 顶部标题栏 -->
    <div class="storyboard-header">
      <h1>音乐故事板</h1>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus">创建故事</el-button>
        <el-button icon="el-icon-user">我的故事</el-button>
      </div>
    </div>

    <!-- 顶部筛选栏 -->
    <div class="storyboard-filters">
      <el-select v-model="themeFilter" placeholder="按主题筛选" style="width: 150px; margin-right: 10px;">
        <el-option label="全部" value="all"></el-option>
        <el-option label="青春" value="youth"></el-option>
        <el-option label="治愈" value="healing"></el-option>
        <el-option label="冒险" value="adventure"></el-option>
        <el-option label="怀旧" value="nostalgia"></el-option>
      </el-select>

      <el-select v-model="styleFilter" placeholder="按音乐风格筛选" style="width: 150px; margin-right: 10px;">
        <el-option label="全部" value="all"></el-option>
        <el-option label="流行" value="pop"></el-option>
        <el-option label="民谣" value="folk"></el-option>
        <el-option label="古典" value="classical"></el-option>
        <el-option label="摇滚" value="rock"></el-option>
      </el-select>

      <el-select v-model="lengthFilter" placeholder="按故事长度筛选" style="width: 150px;">
        <el-option label="全部" value="all"></el-option>
        <el-option label="短" value="short"></el-option>
        <el-option label="中" value="medium"></el-option>
        <el-option label="长" value="long"></el-option>
      </el-select>
    </div>

    <!-- 中间故事列表区 -->
    <div class="storyboard-list">
      <div class="story-card" v-for="story in stories" :key="story.id">
        <div class="story-cover">
          <img :src="story.cover" :alt="story.title">
          <div class="cover-overlay">
            <el-button type="primary" icon="el-icon-headset">沉浸式体验</el-button>
          </div>
        </div>
        <div class="story-info">
          <h3>{{ story.title }}</h3>
          <p class="story-creator">by {{ story.creator }}</p>
          <p class="story-stats">播放量: {{ story.playCount }} | 收藏: {{ story.favoriteCount }}</p>
          <div class="story-actions">
            <el-button icon="el-icon-star-off" size="small"></el-button>
            <el-button icon="el-icon-thumb-up" size="small"></el-button>
            <el-button icon="el-icon-chat-dot-round" size="small"></el-button>
            <el-button icon="el-icon-share" size="small"></el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <div class="storyboard-player">
      <div class="player-info">
        <img :src="currentStory.cover" :alt="currentStory.title" style="width: 50px; height: 50px; margin-right: 10px;">
        <div>
          <p class="player-title">{{ currentStory.title }}</p>
          <p class="player-creator">{{ currentStory.creator }}</p>
        </div>
      </div>
      <div class="player-controls">
        <el-button icon="el-icon-prev" size="small"></el-button>
        <el-button type="primary" icon="el-icon-play" size="small"></el-button>
        <el-button icon="el-icon-next" size="small"></el-button>
        <el-slider v-model="playProgress" style="width: 300px; margin: 0 20px;"></el-slider>
        <el-button icon="el-icon-moon" size="small"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'musicStoryboard',
  data() {
    return {
      themeFilter: 'all',
      styleFilter: 'all',
      lengthFilter: 'all',
      playProgress: 0,
      currentStory: {
        title: '当前播放故事',
        creator: '创作者',
        cover: 'https://via.placeholder.com/100'
      },
      stories: [
        {
          id: 1,
          title: '青春的回忆',
          creator: '张三',
          cover: 'https://via.placeholder.com/300',
          playCount: 12345,
          favoriteCount: 678
        },
        {
          id: 2,
          title: '治愈系音乐故事',
          creator: '李四',
          cover: 'https://via.placeholder.com/300',
          playCount: 9876,
          favoriteCount: 456
        },
        {
          id: 3,
          title: '冒险之旅',
          creator: '王五',
          cover: 'https://via.placeholder.com/300',
          playCount: 5432,
          favoriteCount: 234
        },
        {
          id: 4,
          title: '怀旧时光',
          creator: '赵六',
          cover: 'https://via.placeholder.com/300',
          playCount: 7654,
          favoriteCount: 345
        },
        {
          id: 5,
          title: '夏日微风',
          creator: '孙七',
          cover: 'https://via.placeholder.com/300',
          playCount: 3210,
          favoriteCount: 123
        },
        {
          id: 6,
          title: '星空下的音乐',
          creator: '周八',
          cover: 'https://via.placeholder.com/300',
          playCount: 4567,
          favoriteCount: 234
        }
      ]
    }
  }
}
</script>

<style scoped>
.musicStoryboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.storyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.storyboard-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions button {
  margin-left: 10px;
}

.storyboard-filters {
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.storyboard-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 80px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.story-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.story-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.story-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.story-cover:hover img {
  transform: scale(1.1);
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

.story-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
}

.story-creator {
  margin: 0 0 5px;
  font-size: 14px;
  color: #666;
}

.story-stats {
  margin: 0 0 10px;
  font-size: 14px;
  color: #999;
}

.story-actions button {
  margin-right: 5px;
}

.storyboard-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.player-info {
  display: flex;
  align-items: center;
}

.player-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.player-creator {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.player-controls {
  display: flex;
  align-items: center;
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

  .storyboard-header {
    padding: 15px;
  }

  .storyboard-header h1 {
    font-size: 20px;
  }

  .header-actions button {
    font-size: 12px;
    padding: 5px 10px;
  }

  .storyboard-filters {
    padding: 10px 15px;
  }

  .storyboard-filters select {
    width: 120px;
    font-size: 12px;
  }

  .storyboard-player {
    height: 50px;
    padding: 0 10px;
  }

  .player-controls .el-slider {
    width: 200px;
  }
}
</style>