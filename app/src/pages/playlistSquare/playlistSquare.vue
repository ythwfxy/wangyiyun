<template>
  <div class="playlist-square">
    <div class="header">
      <h2>歌单广场</h2>
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: currentTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="my-favorites-btn" @click="showFavorites = true">
        <i class="el-icon-star-on"></i>
        我的收藏 ({{ favoritePlaylists.length }})
      </div>
    </div>

    <div class="playlist-grid">
      <div
        v-for="(playlist, index) in currentPagePlaylists"
        :key="playlist.id"
        class="playlist-card"
        @mouseenter="hoverIndex = index"
        @mouseleave="hoverIndex = -1"
      >
        <div class="card-cover" @click="goToPlaylist(playlist.id)">
          <el-image :src="playlist.coverImgUrl" fit="cover"></el-image>
          <div class="play-count">
            <i class="el-icon-headset"></i>
            {{ formatPlayCount(playlist.playCount) }}
          </div>
          <div class="play-icon" v-show="hoverIndex === index">
            <img src="@/assets/imgs/play_1.svg" alt="" />
          </div>
        </div>
        <div class="card-info">
          <h3 class="playlist-name" @click="goToPlaylist(playlist.id)">
            {{ playlist.name }}
          </h3>
          <p class="creator-name">{{ playlist.creator.nickname }}</p>
          <div class="tags">
            <span
              v-for="tag in playlist.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
          <div class="card-actions">
            <div class="favorite-btn" @click="toggleFavorite(playlist)">
              <i
                :class="[
                  'el-icon-star-on',
                  { active: isFavorite(playlist.id) }
                ]"
              ></i>
              {{ isFavorite(playlist.id) ? '已收藏' : '收藏' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="filteredPlaylists.length"
        :background="true"
      >
      </el-pagination>
    </div>

    <div class="favorites-modal" v-show="showFavorites" @click.self="showFavorites = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>我的收藏歌单</h3>
          <i class="el-icon-close" @click="showFavorites = false"></i>
        </div>
        <div class="favorites-list">
          <div
            v-for="playlist in favoritePlaylists"
            :key="playlist.id"
            class="favorite-item"
          >
            <el-image
              :src="playlist.coverImgUrl"
              fit="cover"
              @click="goToPlaylist(playlist.id)"
            ></el-image>
            <div class="favorite-info">
              <h4 @click="goToPlaylist(playlist.id)">{{ playlist.name }}</h4>
              <p>{{ playlist.creator.nickname }}</p>
            </div>
            <div class="remove-favorite" @click="toggleFavorite(playlist)">
              <i class="el-icon-delete"></i>
            </div>
          </div>
          <div v-if="favoritePlaylists.length === 0" class="empty-favorites">
            暂无收藏歌单
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mockPlaylists } from '@/utils/mockData';

export default {
  name: 'PlaylistSquare',
  data() {
    return {
      tabs: [
        { key: 'similar', label: '相似曲风' },
        { key: 'hot', label: '热门程度' },
        { key: 'latest', label: '最新更新' }
      ],
      currentTab: 'similar',
      playlists: [],
      favoritePlaylists: [],
      browseHistory: [],
      playHistory: [],
      hoverIndex: -1,
      currentPage: 1,
      pageSize: 15,
      showFavorites: false
    };
  },
  computed: {
    filteredPlaylists() {
      let result = [...this.playlists];

      switch (this.currentTab) {
        case 'similar':
          result = this.getSimilarStylePlaylists(result);
          break;
        case 'hot':
          result = this.getHotPlaylists(result);
          break;
        case 'latest':
          result = this.getLatestPlaylists(result);
          break;
      }

      return result;
    },
    currentPagePlaylists() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPlaylists.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPlaylists.length / this.pageSize);
    }
  },
  methods: {
    initMockData() {
      this.playlists = mockPlaylists;
      this.loadFromLocalStorage();
    },
    loadFromLocalStorage() {
      const favorites = localStorage.getItem('favoritePlaylists');
      const browse = localStorage.getItem('browseHistory');
      const play = localStorage.getItem('playHistory');

      if (favorites) {
        this.favoritePlaylists = JSON.parse(favorites);
      }
      if (browse) {
        this.browseHistory = JSON.parse(browse);
      }
      if (play) {
        this.playHistory = JSON.parse(play);
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('favoritePlaylists', JSON.stringify(this.favoritePlaylists));
      localStorage.setItem('browseHistory', JSON.stringify(this.browseHistory));
      localStorage.setItem('playHistory', JSON.stringify(this.playHistory));
    },
    switchTab(tab) {
      this.currentTab = tab;
      this.currentPage = 1;
    },
    getSimilarStylePlaylists(playlists) {
      const userTags = this.getUserPreferredTags();
      return playlists
        .map(playlist => ({
          ...playlist,
          matchScore: this.calculateTagMatchScore(playlist.tags, userTags)
        }))
        .sort((a, b) => b.matchScore - a.matchScore);
    },
    getHotPlaylists(playlists) {
      return [...playlists].sort((a, b) => b.playCount - a.playCount);
    },
    getLatestPlaylists(playlists) {
      return [...playlists].sort((a, b) => b.updateTime - a.updateTime);
    },
    getUserPreferredTags() {
      const tagCounts = {};

      [...this.browseHistory, ...this.playHistory].forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
    },
    calculateTagMatchScore(playlistTags, userTags) {
      if (userTags.length === 0) return 0;
      const matchCount = playlistTags.filter(tag => userTags.includes(tag)).length;
      return matchCount / userTags.length;
    },
    toggleFavorite(playlist) {
      const index = this.favoritePlaylists.findIndex(p => p.id === playlist.id);
      if (index > -1) {
        this.favoritePlaylists.splice(index, 1);
      } else {
        this.favoritePlaylists.push(playlist);
      }
      this.saveToLocalStorage();
    },
    isFavorite(playlistId) {
      return this.favoritePlaylists.some(p => p.id === playlistId);
    },
    addToBrowseHistory(playlist) {
      const existingIndex = this.browseHistory.findIndex(p => p.id === playlist.id);
      if (existingIndex > -1) {
        this.browseHistory.splice(existingIndex, 1);
      }
      this.browseHistory.unshift(playlist);
      if (this.browseHistory.length > 50) {
        this.browseHistory.pop();
      }
      this.saveToLocalStorage();
    },
    addToPlayHistory(playlist) {
      const existingIndex = this.playHistory.findIndex(p => p.id === playlist.id);
      if (existingIndex > -1) {
        this.playHistory.splice(existingIndex, 1);
      }
      this.playHistory.unshift(playlist);
      if (this.playHistory.length > 50) {
        this.playHistory.pop();
      }
      this.saveToLocalStorage();
    },
    goToPlaylist(id) {
      const playlist = this.playlists.find(p => p.id === id);
      if (playlist) {
        this.addToBrowseHistory(playlist);
        sessionStorage.setItem('currentPlaylistData', JSON.stringify(playlist));
      }
      this.$router.push(`/home/songList/${id}`);
    },
    handlePageChange(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    formatPlayCount(count) {
      if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
      } else if (count >= 10000) {
        return (count / 10000).toFixed(0) + '万';
      }
      return count;
    }
  },
  created() {
    this.initMockData();
  }
};
</script>

<style scoped>
.playlist-square {
  padding: 20px;
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  padding-right: 17px;
  padding-left: 3px;
}

.playlist-square:hover {
  overflow-y: overlay;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tab-item {
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
}

.tab-item:hover {
  background: #f5f5f5;
}

.tab-item.active {
  background: #c62f2f;
  color: white;
}

.my-favorites-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 1px solid #c62f2f;
  border-radius: 20px;
  color: #c62f2f;
  cursor: pointer;
  transition: all 0.3s;
}

.my-favorites-btn:hover {
  background: #c62f2f;
  color: white;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.playlist-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.card-cover .el-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.play-count {
  position: absolute;
  top: 5px;
  right: 5px;
  color: white;
  font-size: 12px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 3px;
}

.play-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.play-icon img {
  width: 20px;
  height: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card-info {
  padding: 12px;
}

.playlist-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.playlist-name:hover {
  color: #c62f2f;
}

.creator-name {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #999;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  font-size: 11px;
  color: #c62f2f;
  background: #fff5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  color: #c62f2f;
}

.favorite-btn .el-icon-star-on.active {
  color: #c62f2f;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.favorites-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.modal-header .el-icon-close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-header .el-icon-close:hover {
  color: #333;
}

.favorites-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.3s;
}

.favorite-item:hover {
  background: #f5f5f5;
}

.favorite-item .el-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.favorite-info {
  flex: 1;
}

.favorite-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.favorite-info h4:hover {
  color: #c62f2f;
}

.favorite-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.remove-favorite {
  padding: 8px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.remove-favorite:hover {
  color: #c62f2f;
}

.empty-favorites {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>
