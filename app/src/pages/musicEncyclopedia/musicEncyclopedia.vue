<template>
  <div class="music-encyclopedia">
    <!-- 顶部搜索与分类区 -->
    <div class="top-section">
      <!-- 动态标题与功能按钮 -->
      <div class="header">
        <h1 class="title">音乐百科</h1>
        <div class="header-buttons">
          <el-button type="primary" @click="randomWalk">随机漫步</el-button>
          <el-button icon="el-icon-search" @click="showSearch"></el-button>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索词条名称、艺术家、风格等"
          size="large"
          @keyup.enter="handleSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
      
      <!-- 分类导航栏 -->
      <div class="category-nav">
        <el-menu mode="horizontal" default-active="1" class="category-menu">
          <el-submenu index="1">
            <template slot="title">艺术家</template>
            <el-menu-item index="1-1">流行歌手</el-menu-item>
            <el-menu-item index="1-2">摇滚乐队</el-menu-item>
            <el-menu-item index="1-3">古典音乐家</el-menu-item>
            <el-menu-item index="1-4">电子音乐人</el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">专辑</template>
            <el-menu-item index="2-1">流行专辑</el-menu-item>
            <el-menu-item index="2-2">摇滚专辑</el-menu-item>
            <el-menu-item index="2-3">古典专辑</el-menu-item>
            <el-menu-item index="2-4">电子专辑</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">歌曲</template>
            <el-menu-item index="3-1">流行歌曲</el-menu-item>
            <el-menu-item index="3-2">摇滚歌曲</el-menu-item>
            <el-menu-item index="3-3">古典音乐</el-menu-item>
            <el-menu-item index="3-4">电子音乐</el-menu-item>
          </el-submenu>
          <el-submenu index="4">
            <template slot="title">风格流派</template>
            <el-menu-item index="4-1">摇滚</el-menu-item>
            <el-menu-item index="4-2">电子</el-menu-item>
            <el-menu-item index="4-3">古典</el-menu-item>
            <el-menu-item index="4-4">爵士</el-menu-item>
            <el-menu-item index="4-5">嘻哈</el-menu-item>
          </el-submenu>
          <el-submenu index="5">
            <template slot="title">乐器</template>
            <el-menu-item index="5-1">吉他</el-menu-item>
            <el-menu-item index="5-2">钢琴</el-menu-item>
            <el-menu-item index="5-3">鼓</el-menu-item>
            <el-menu-item index="5-4">小提琴</el-menu-item>
          </el-submenu>
          <el-submenu index="6">
            <template slot="title">音乐知识</template>
            <el-menu-item index="6-1">乐理基础</el-menu-item>
            <el-menu-item index="6-2">音乐历史</el-menu-item>
            <el-menu-item index="6-3">音乐制作</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </div>
    
    <!-- 中间主内容区 -->
    <div class="main-content">
      <!-- 分类浏览页 -->
      <div v-if="currentView === 'category'" class="category-view">
        <div class="filter-bar">
          <el-select v-model="sortBy" placeholder="排序方式" size="small">
            <el-option label="按热度" value="hot"></el-option>
            <el-option label="按时间" value="time"></el-option>
            <el-option label="按字母表" value="alphabet"></el-option>
          </el-select>
          <el-select v-model="filterBy" placeholder="筛选" size="small">
            <el-option label="全部" value="all"></el-option>
            <el-option label="2020年代" value="2020"></el-option>
            <el-option label="2010年代" value="2010"></el-option>
            <el-option label="2000年代" value="2000"></el-option>
          </el-select>
        </div>
        
        <div class="entry-list">
          <div v-for="entry in entries" :key="entry.id" class="entry-card">
            <img :src="entry.thumbnail" :alt="entry.title" class="entry-thumbnail">
            <div class="entry-info">
              <h3 class="entry-title">{{ entry.title }}</h3>
              <p class="entry-description">{{ entry.description }}</p>
              <el-tag :type="entry.type">{{ entry.type }}</el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 词条详情页 -->
      <div v-if="currentView === 'detail'" class="detail-view">
        <div class="entry-detail">
          <!-- 艺术家词条示例 -->
          <div v-if="currentEntry.type === 'artist'" class="artist-detail">
            <img :src="currentEntry.avatar" :alt="currentEntry.title" class="artist-avatar">
            <div class="artist-info">
              <h2 class="artist-name">{{ currentEntry.title }}</h2>
              <div class="artist-basic-info">
                <span>生日: {{ currentEntry.birthday }}</span>
                <span>国籍: {{ currentEntry.nationality }}</span>
                <span>流派: {{ currentEntry.genre }}</span>
              </div>
              <div class="artist-bio">
                <h3>生平简介</h3>
                <p>{{ currentEntry.bio }}</p>
              </div>
              <div class="artist-works">
                <h3>代表作品</h3>
                <el-carousel :interval="4000" type="card" height="200px">
                  <el-carousel-item v-for="work in currentEntry.works" :key="work.id">
                    <img :src="work.cover" :alt="work.title" class="work-cover">
                    <div class="work-info">
                      <h4>{{ work.title }}</h4>
                      <p>{{ work.album }}</p>
                    </div>
                  </el-carousel-item>
                </el-carousel>
              </div>
              <div class="related-artists">
                <h3>相关艺术家</h3>
                <div class="related-list">
                  <div v-for="artist in currentEntry.relatedArtists" :key="artist.id" class="related-item">
                    <img :src="artist.avatar" :alt="artist.name" class="related-avatar">
                    <span>{{ artist.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 风格流派词条示例 -->
          <div v-if="currentEntry.type === 'genre'" class="genre-detail">
            <h2 class="genre-name">{{ currentEntry.title }}</h2>
            <div class="genre-description">
              <p>{{ currentEntry.description }}</p>
            </div>
            <div class="genre-characteristics">
              <h3>风格特点</h3>
              <ul>
                <li v-for="char in currentEntry.characteristics" :key="char">{{ char }}</li>
              </ul>
            </div>
            <div class="genre-representatives">
              <h3>代表艺术家</h3>
              <div class="representative-list">
                <div v-for="artist in currentEntry.representativeArtists" :key="artist.id" class="representative-item">
                  <img :src="artist.avatar" :alt="artist.name" class="representative-avatar">
                  <span>{{ artist.name }}</span>
                </div>
              </div>
            </div>
            <div class="genre-examples">
              <h3>代表作品</h3>
              <el-audio v-for="example in currentEntry.examples" :key="example.id" :src="example.audioUrl" :title="example.title"></el-audio>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部相关推荐区 -->
    <div class="related-section">
      <h3 class="related-title">你可能还感兴趣的</h3>
      <div class="related-carousel">
        <el-carousel :interval="5000" type="card" height="150px">
          <el-carousel-item v-for="recommend in relatedRecommendations" :key="recommend.id">
            <img :src="recommend.thumbnail" :alt="recommend.title" class="recommend-thumbnail">
            <div class="recommend-info">
              <h4>{{ recommend.title }}</h4>
              <p>{{ recommend.description }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicEncyclopedia',
  data() {
    return {
      searchQuery: '',
      currentView: 'category', // 'category' 或 'detail'
      currentEntry: {},
      entries: [
        {
          id: 1,
          title: '周杰伦',
          description: '中国台湾流行乐男歌手、音乐人、演员、导演、编剧、监制、商人',
          thumbnail: 'https://picsum.photos/id/1005/200/200',
          type: 'artist'
        },
        {
          id: 2,
          title: '摇滚',
          description: '一种音乐类型，起源于20世纪40年代末期的美国，20世纪50年代早期开始流行',
          thumbnail: 'https://picsum.photos/id/1018/200/200',
          type: 'genre'
        },
        {
          id: 3,
          title: '钢琴',
          description: '一种键盘乐器，用键拉动琴槌以敲打琴弦',
          thumbnail: 'https://picsum.photos/id/1025/200/200',
          type: 'instrument'
        }
      ],
      relatedRecommendations: [
        {
          id: 1,
          title: '王力宏',
          description: '华语流行乐男歌手、音乐人、影视演员、导演',
          thumbnail: 'https://picsum.photos/id/1006/200/200'
        },
        {
          id: 2,
          title: '流行音乐',
          description: '一种广泛流传于大众的音乐类型',
          thumbnail: 'https://picsum.photos/id/1019/200/200'
        },
        {
          id: 3,
          title: '吉他',
          description: '一种弹拨乐器，通常有六条弦',
          thumbnail: 'https://picsum.photos/id/1026/200/200'
        }
      ],
      sortBy: 'hot',
      filterBy: 'all'
    }
  },
  methods: {
    randomWalk() {
      // 随机跳转一个百科词条
      const randomIndex = Math.floor(Math.random() * this.entries.length)
      this.currentEntry = this.entries[randomIndex]
      this.currentView = 'detail'
    },
    showSearch() {
      // 显示搜索框（这里已经显示在页面顶部）
    },
    handleSearch() {
      // 处理搜索逻辑
      console.log('搜索:', this.searchQuery)
    }
  }
}
</script>

<style scoped>
.music-encyclopedia {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.top-section {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.6);
  }
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search-container {
  margin-bottom: 20px;
}

.category-nav {
  margin-bottom: 20px;
}

.category-menu {
  border-bottom: none;
}

.main-content {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.entry-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.entry-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.entry-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.entry-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.entry-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.detail-view {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.artist-detail {
  display: flex;
  gap: 30px;
}

.artist-avatar {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.artist-info {
  flex: 1;
}

.artist-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
}

.artist-basic-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
}

.artist-bio {
  margin-bottom: 20px;
}

.artist-bio h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.artist-bio p {
  line-height: 1.6;
  color: #333;
}

.artist-works {
  margin-bottom: 20px;
}

.artist-works h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.work-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.work-info {
  text-align: center;
  margin-top: 10px;
}

.related-artists {
  margin-bottom: 20px;
}

.related-artists h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.related-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.related-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
}

.genre-detail {
  max-width: 800px;
  margin: 0 auto;
}

.genre-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.genre-description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #333;
}

.genre-characteristics {
  margin-bottom: 20px;
}

.genre-characteristics h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.genre-characteristics ul {
  list-style-type: disc;
  padding-left: 20px;
  line-height: 1.6;
  color: #333;
}

.genre-representatives {
  margin-bottom: 20px;
}

.genre-representatives h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.representative-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.representative-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.representative-item:hover {
  transform: translateY(-5px);
}

.representative-avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
}

.genre-examples {
  margin-bottom: 20px;
}

.genre-examples h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.related-section {
  background-color: #fff;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.related-title {
  font-size: 20px;
  margin-bottom: 15px;
}

.recommend-thumbnail {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.recommend-info {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 10px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .category-menu {
    overflow-x: auto;
  }
  
  .artist-detail {
    flex-direction: column;
    align-items: center;
  }
  
  .artist-avatar {
    width: 200px;
    height: 200px;
  }
  
  .artist-basic-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .entry-list {
    grid-template-columns: 1fr;
  }
}
</style>