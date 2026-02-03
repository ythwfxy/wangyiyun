<template>
  <div class="playlist-square">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">歌单广场</h2>
      <p class="subtitle">根据你的音乐口味推荐</p>
    </div>

    <!-- 推荐维度切换 -->
    <div class="filter-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-item', { active: currentTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 歌单列表 -->
    <div class="playlist-grid">
      <playlist-card 
        v-for="playlist in displayPlaylists" 
        :key="playlist.id"
        :playlist="playlist"
        @toggle-collect="toggleCollect"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredPlaylists.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 收藏歌单入口 -->
    <div class="collection-section" v-if="collectedPlaylists.length > 0">
      <div class="section-header">
        <h3>我的收藏</h3>
        <span class="count">({{ collectedPlaylists.length }}个歌单)</span>
      </div>
      <div class="playlist-grid">
        <playlist-card 
          v-for="playlist in collectedPlaylists" 
          :key="playlist.id"
          :playlist="playlist"
          @toggle-collect="toggleCollect"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PlaylistCard from '@/components/playlistSquare/playlistCard'
import { mockPlaylists } from '@/mock/playlistData'
import { 
  getUserHistory, 
  saveCollectedPlaylist, 
  removeCollectedPlaylist,
  getCollectedPlaylists 
} from '@/utils/playlistHistory'

export default {
  name: 'PlaylistSquare',
  components: {
    PlaylistCard
  },
  data() {
    return {
      tabs: [
        { key: 'similar', label: '相似曲风' },
        { key: 'popular', label: '热门程度' },
        { key: 'latest', label: '最新更新' }
      ],
      currentTab: 'similar',
      allPlaylists: [],
      currentPage: 1,
      pageSize: 12,
      collectedIds: new Set()
    }
  },
  computed: {
    // 根据当前维度过滤和排序歌单
    filteredPlaylists() {
      let result = [...this.allPlaylists]
      
      switch (this.currentTab) {
        case 'similar':
          result = this.sortBySimilarStyle(result)
          break
        case 'popular':
          result = this.sortByPopularity(result)
          break
        case 'latest':
          result = this.sortByLatest(result)
          break
      }
      
      return result
    },
    // 分页显示的歌单
    displayPlaylists() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredPlaylists.slice(start, end)
    },
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredPlaylists.length / this.pageSize)
    },
    // 收藏的歌单 - 从localStorage读取完整数据
    collectedPlaylists() {
      return getCollectedPlaylists()
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 初始化数据
    initData() {
      // 加载MOCK数据
      this.allPlaylists = mockPlaylists
      
      // 加载用户收藏
      const collected = getCollectedPlaylists()
      this.collectedIds = new Set(collected.map(p => p.id))
    },
    
    // 切换推荐维度
    switchTab(tab) {
      this.currentTab = tab
      this.currentPage = 1
    },
    
    // 按相似曲风排序
    sortBySimilarStyle(playlists) {
      const userHistory = getUserHistory()
      const userTags = userHistory.tags || []
      
      return playlists.sort((a, b) => {
        const aMatch = this.calculateTagMatch(a.tags, userTags)
        const bMatch = this.calculateTagMatch(b.tags, userTags)
        return bMatch - aMatch
      })
    },
    
    // 计算标签匹配度
    calculateTagMatch(playlistTags, userTags) {
      if (!userTags.length) return 0
      const matchCount = playlistTags.filter(tag => userTags.includes(tag)).length
      return matchCount / Math.max(playlistTags.length, userTags.length)
    },
    
    // 按热门程度排序
    sortByPopularity(playlists) {
      return playlists.sort((a, b) => b.playCount - a.playCount)
    },
    
    // 按最新更新排序
    sortByLatest(playlists) {
      return playlists.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
    },
    
    // 分页切换
    handlePageChange(page) {
      this.currentPage = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    
    // 收藏/取消收藏
    toggleCollect(playlist) {
      if (this.collectedIds.has(playlist.id)) {
        removeCollectedPlaylist(playlist.id)
        this.collectedIds.delete(playlist.id)
        this.$message.success('已取消收藏')
      } else {
        saveCollectedPlaylist(playlist)
        this.collectedIds.add(playlist.id)
        this.$message.success('收藏成功')
      }
    }
  }
}
</script>

<style scoped>
.playlist-square {
  padding: 20px 30px;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  padding: 8px 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #333;
  background: #e8e8e8;
}

.tab-item.active {
  color: #fff;
  background: #ec4141;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.collection-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-header .count {
  font-size: 14px;
  color: #999;
}
</style>
