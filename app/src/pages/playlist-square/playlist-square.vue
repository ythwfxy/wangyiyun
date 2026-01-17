<template>
  <div class="playlist-square">
    <!-- 切换视图 -->
    <div class="view-tabs">
      <span 
        v-for="tab in viewTabs" 
        :key="tab.value"
        :class="['tab-item', { active: currentView === tab.value }]"
        @click="currentView = tab.value"
      >
        {{ tab.label }}
      </span>
    </div>

    <!-- 推荐视图 -->
    <div v-if="currentView === 'recommend'" class="recommend-view">
      <!-- 推荐维度标签 -->
      <div class="dimension-tabs">
        <span 
          v-for="dim in dimensions" 
          :key="dim.value"
          :class="['dim-item', { active: currentDimension === dim.value }]"
          @click="currentDimension = dim.value"
        >
          {{ dim.label }}
        </span>
      </div>

      <!-- 歌单列表 -->
      <div class="playlist-grid">
        <div 
          v-for="playlist in paginatedPlaylists" 
          :key="playlist.id"
          class="playlist-card"
          @click="handlePlaylistClick(playlist)"
        >
          <div class="playlist-cover">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" />
            <div class="play-count">
              <span class="iconfont icon-bofang"></span>
              {{ formatCount(playlist.playCount) }}
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-creator">by {{ playlist.creator.nickname }}</p>
            <div class="playlist-tags">
              <span 
                v-for="tag in playlist.tags.slice(0, 2)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div 
            class="favorite-btn"
            :class="{ favorited: isFavorited(playlist.id) }"
            @click.stop="toggleFavorite(playlist)"
          >
            <span class="iconfont" :class="isFavorited(playlist.id) ? 'icon-yishoucang' : 'icon-shoucang'"></span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 收藏视图 -->
    <div v-else-if="currentView === 'favorites'" class="favorites-view">
      <div v-if="favoritePlaylists.length === 0" class="empty-state">
        <span class="iconfont icon-shoucang empty-icon"></span>
        <p>暂无收藏的歌单</p>
      </div>
      <div v-else class="playlist-grid">
        <div 
          v-for="playlist in favoritePlaylists" 
          :key="playlist.id"
          class="playlist-card"
          @click="handlePlaylistClick(playlist)"
        >
          <div class="playlist-cover">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" />
            <div class="play-count">
              <span class="iconfont icon-bofang"></span>
              {{ formatCount(playlist.playCount) }}
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-creator">by {{ playlist.creator.nickname }}</p>
            <div class="playlist-tags">
              <span 
                v-for="tag in playlist.tags.slice(0, 2)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div 
            class="favorite-btn favorited"
            @click.stop="toggleFavorite(playlist)"
          >
            <span class="iconfont icon-yishoucang"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaylistSquare',
  data() {
    return {
      currentView: 'recommend',
      currentDimension: 'similar',
      currentPage: 1,
      pageSize: 12,
      viewTabs: [
        { label: '推荐歌单', value: 'recommend' },
        { label: '我的收藏', value: 'favorites' }
      ],
      dimensions: [
        { label: '相似曲风', value: 'similar' },
        { label: '热门程度', value: 'hot' },
        { label: '最新更新', value: 'latest' }
      ],
      // 模拟歌单数据
      mockPlaylists: [],
      // 收藏的歌单
      favoritePlaylists: [],
      // 浏览历史
      browseHistory: []
    }
  },
  computed: {
    filteredPlaylists() {
      let playlists = [...this.mockPlaylists]
      
      switch (this.currentDimension) {
        case 'similar':
          return this.getSimilarStylePlaylists(playlists)
        case 'hot':
          return playlists.sort((a, b) => b.playCount - a.playCount)
        case 'latest':
          return playlists.sort((a, b) => b.updateTime - a.updateTime)
        default:
          return playlists
      }
    },
    paginatedPlaylists() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredPlaylists.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.filteredPlaylists.length / this.pageSize)
    }
  },
  methods: {
    // 生成模拟数据
    generateMockData() {
      const tags = ['华语', '流行', '摇滚', '民谣', '电子', '说唱', '古典', '爵士', 'R&B', '金属']
      const names = ['精选歌单', '私人定制', '热门推荐', '每日推荐', '发现好音乐', '怀旧金曲', '新歌速递']
      const creators = ['网易云音乐', '音乐达人', 'DJ小明', '音乐爱好者', '官方推荐']
      
      for (let i = 1; i <= 50; i++) {
        const playlist = {
          id: i,
          name: `${names[Math.floor(Math.random() * names.length)]} ${i}`,
          coverImgUrl: `https://picsum.photos/seed/playlist${i}/300/300.jpg`,
          playCount: Math.floor(Math.random() * 10000000) + 10000,
          creator: {
            nickname: creators[Math.floor(Math.random() * creators.length)]
          },
          tags: [
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)]
          ],
          updateTime: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
          trackCount: Math.floor(Math.random() * 200) + 10
        }
        this.mockPlaylists.push(playlist)
      }
    },
    // 根据历史记录获取相似曲风歌单
    getSimilarStylePlaylists(playlists) {
      if (this.browseHistory.length === 0) {
        return playlists
      }
      
      // 统计历史记录中的标签频率
      const tagFrequency = {}
      this.browseHistory.forEach(item => {
        item.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
        })
      })
      
      // 找出最频繁的标签
      const sortedTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1])
      const topTags = sortedTags.slice(0, 3).map(item => item[0])
      
      // 优先推荐包含高频标签的歌单
      return playlists.sort((a, b) => {
        const aScore = a.tags.filter(tag => topTags.includes(tag)).length
        const bScore = b.tags.filter(tag => topTags.includes(tag)).length
        return bScore - aScore
      })
    },
    // 格式化播放次数
    formatCount(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
      }
      return count.toString()
    },
    // 处理歌单点击
    handlePlaylistClick(playlist) {
      // 记录浏览历史
      this.recordBrowseHistory(playlist)
      // 跳转到歌单详情页
      this.$router.push(`/home/songList/${playlist.id}`)
    },
    // 记录浏览历史
    recordBrowseHistory(playlist) {
      const history = JSON.parse(localStorage.getItem('browseHistory') || '[]')
      // 移除已存在的相同歌单
      const filtered = history.filter(item => item.id !== playlist.id)
      filtered.unshift({
        id: playlist.id,
        tags: [...playlist.tags]
      })
      // 只保留最近20条记录
      if (filtered.length > 20) {
        filtered.pop()
      }
      localStorage.setItem('browseHistory', JSON.stringify(filtered))
      this.browseHistory = filtered
    },
    // 从localStorage读取浏览历史
    loadBrowseHistory() {
      const history = JSON.parse(localStorage.getItem('browseHistory') || '[]')
      this.browseHistory = history
    },
    // 切换收藏状态
    toggleFavorite(playlist) {
      const favorites = JSON.parse(localStorage.getItem('favoritePlaylists') || '[]')
      const index = favorites.findIndex(item => item.id === playlist.id)
      
      if (index > -1) {
        favorites.splice(index, 1)
      } else {
        favorites.push(playlist)
      }
      
      localStorage.setItem('favoritePlaylists', JSON.stringify(favorites))
      this.favoritePlaylists = favorites
    },
    // 检查是否已收藏
    isFavorited(playlistId) {
      return this.favoritePlaylists.some(item => item.id === playlistId)
    },
    // 加载收藏列表
    loadFavorites() {
      const favorites = JSON.parse(localStorage.getItem('favoritePlaylists') || '[]')
      this.favoritePlaylists = favorites
    }
  },
  created() {
    this.generateMockData()
    this.loadBrowseHistory()
    this.loadFavorites()
  },
  watch: {
    currentDimension() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.playlist-square {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.view-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-item {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
  color: #666;
}

.tab-item:hover {
  background: #f0f0f0;
}

.tab-item.active {
  background: #d03535;
  color: white;
}

.dimension-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dim-item {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
}

.dim-item:hover {
  background: #f0f0f0;
}

.dim-item.active {
  background: #d03535;
  color: white;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.playlist-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.playlist-cover {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.playlist-info {
  padding: 12px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-creator {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.playlist-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  color: #666;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn.favorited {
  background: rgba(208, 53, 53, 0.8);
  opacity: 1;
}

.favorite-btn .iconfont {
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #999;
}
</style>