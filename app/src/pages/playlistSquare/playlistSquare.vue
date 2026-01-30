<template>
  <div class="playlist-square">
    <div class="header">
      <h2>歌单广场</h2>
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'similar' }" 
          @click="activeTab = 'similar'"
        >
          相似曲风
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'popular' }" 
          @click="activeTab = 'popular'"
        >
          热门程度
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'latest' }" 
          @click="activeTab = 'latest'"
        >
          最新更新
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'favorites' }" 
          @click="activeTab = 'favorites'"
        >
          我的收藏
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="playlist-grid">
        <div 
          v-for="playlist in paginatedPlaylists" 
          :key="playlist.id" 
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.coverImgUrl" :alt="playlist.name">
            <div class="play-count">
              <i class="el-icon-video-play"></i>
              {{ formatCount(playlist.playCount) }}
            </div>
            <div class="favorite-btn" @click.stop="toggleFavorite(playlist)">
              <i :class="isFavorite(playlist.id) ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-creator">by {{ playlist.creator.nickname }}</p>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="filteredPlaylists.length">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlaylistSquare',
  data() {
    return {
      activeTab: 'similar',
      currentPage: 1,
      pageSize: 12,
      mockPlaylists: [],
      favoritePlaylists: [],
      userHistory: {
        viewedPlaylists: [],
        playedSongs: [],
        genres: []
      }
    }
  },
  computed: {
    ...mapState(['personalList', 'favoritePlaylists', 'userHistory']),
    filteredPlaylists() {
      let playlists = [...this.mockPlaylists];
      
      if (this.activeTab === 'favorites') {
        return playlists.filter(playlist => this.isFavorite(playlist.id));
      }
      
      switch (this.activeTab) {
        case 'similar':
          // 基于用户历史记录推荐相似曲风
          playlists = this.sortBySimilarGenre(playlists);
          break;
        case 'popular':
          // 按热门程度排序
          playlists = playlists.sort((a, b) => b.playCount - a.playCount);
          break;
        case 'latest':
          // 按最新更新时间排序
          playlists = playlists.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
          break;
      }
      
      return playlists;
    },
    paginatedPlaylists() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPlaylists.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPlaylists.length / this.pageSize);
    }
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      // 初始化用户历史数据
      this.loadUserHistory();
      
      // 生成模拟数据
      this.generateMockData();
    },
    loadUserHistory() {
      // 使用 Vuex 中的用户历史数据
      this.userHistory = this.$store.state.userHistory;
    },
    saveUserHistory() {
      this.$store.dispatch('saveUserHistory', this.userHistory);
    },
    generateMockData() {
      const genres = ['流行', '摇滚', '民谣', '电子', '古典', '爵士', '说唱', '轻音乐'];
      const creators = ['网易云音乐', 'QQ音乐', '酷狗音乐', '酷我音乐', '虾米音乐', '音乐达人', 'DJ小王', '音乐制作人'];
      
      // 生成50个模拟歌单
      for (let i = 1; i <= 50; i++) {
        const genre = genres[Math.floor(Math.random() * genres.length)];
        const creator = creators[Math.floor(Math.random() * creators.length)];
        const playCount = Math.floor(Math.random() * 1000000) + 10000;
        const updateTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        
        this.mockPlaylists.push({
          id: `playlist_${i}`,
          name: `${genre}音乐精选 ${i}`,
          description: `这是一个关于${genre}音乐的精选歌单，包含了最受欢迎的${genre}歌曲`,
          coverImgUrl: `https://picsum.photos/seed/playlist${i}/300/300.jpg`,
          playCount: playCount,
          creator: {
            nickname: creator,
            userId: `user_${Math.floor(Math.random() * 1000)}`
          },
          genre: genre,
          updateTime: updateTime.toISOString(),
          trackCount: Math.floor(Math.random() * 50) + 10
        });
      }
      
      // 添加一些用户历史记录
      this.userHistory.viewedPlaylists = [
        { id: 'playlist_1', viewTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'playlist_5', viewTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'playlist_10', viewTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      
      this.userHistory.genres = ['流行', '民谣', '电子'];
      this.saveUserHistory();
    },
    sortBySimilarGenre(playlists) {
      // 基于用户历史记录中的曲风偏好排序
      const userGenres = this.userHistory.genres || [];
      
      return playlists.sort((a, b) => {
        const aGenreIndex = userGenres.indexOf(a.genre);
        const bGenreIndex = userGenres.indexOf(b.genre);
        
        if (aGenreIndex !== -1 && bGenreIndex === -1) return -1;
        if (aGenreIndex === -1 && bGenreIndex !== -1) return 1;
        if (aGenreIndex !== -1 && bGenreIndex !== -1) return aGenreIndex - bGenreIndex;
        
        return 0;
      });
    },
    isFavorite(playlistId) {
      return this.favoritePlaylists.some(fav => fav.id === playlistId);
    },
    toggleFavorite(playlist) {
      if (this.isFavorite(playlist.id)) {
        // 从收藏中移除
        this.$store.dispatch('removeFavoritePlaylist', playlist.id);
        this.$message.info('已取消收藏');
      } else {
        // 添加到收藏
        this.$store.dispatch('addFavoritePlaylist', playlist);
        this.$message.success('已添加到收藏');
      }
    },
    loadFavorites() {
      // 使用 Vuex 中的收藏数据
      this.favoritePlaylists = this.$store.state.favoritePlaylists;
    },
    goToPlaylist(playlistId) {
      // 记录用户浏览历史
      this.$store.dispatch('addViewedPlaylist', playlistId);
      
      // 跳转到歌单详情页
      this.$router.push(`/home/songList/${playlistId}`);
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    formatCount(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
      }
      return count.toString();
    }
  },
  mounted() {
    this.loadFavorites();
  }
}
</script>

<style scoped>
.playlist-square {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin-bottom: 15px;
  color: #333;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  margin-right: 20px;
}

.tab-item:hover {
  color: #c62f2f;
}

.tab-item.active {
  color: #c62f2f;
  border-bottom-color: #c62f2f;
  font-weight: bold;
}

.content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  position: relative;
  width: 100%;
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
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.play-count i {
  margin-right: 3px;
}

.favorite-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #c62f2f;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background-color: #c62f2f;
  color: white;
}

.playlist-info {
  padding: 10px;
}

.playlist-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-creator {
  font-size: 12px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>