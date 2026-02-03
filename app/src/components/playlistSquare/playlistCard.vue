<template>
  <div class="playlist-card" @click="goToDetail">
    <div class="card-image">
      <el-image 
        :src="playlist.coverImgUrl" 
        :alt="playlist.name"
        fit="cover"
        :preview-src-list="[playlist.coverImgUrl]"
      >
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
      <div class="play-count">
        <i class="el-icon-headset"></i>
        <span>{{ formatPlayCount(playlist.playCount) }}</span>
      </div>
      <div class="play-overlay">
        <img src="@/assets/imgs/play_1.svg" alt="play" class="play-icon-img" />
      </div>
    </div>
    <div class="card-info">
      <h4 class="playlist-name" :title="playlist.name">{{ playlist.name }}</h4>
      <p class="playlist-creator">by {{ playlist.creator }}</p>
      <div class="playlist-tags">
        <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <div class="collect-btn" @click.stop="toggleCollect">
      <i :class="['iconfont', isCollected ? 'icon-aixin' : 'icon-aixin']" 
         :style="{ color: isCollected ? '#ec4141' : '#999' }"></i>
    </div>
  </div>
</template>

<script>
import { getCollectedPlaylists } from '@/utils/playlistHistory'

export default {
  name: 'PlaylistCard',
  props: {
    playlist: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isCollected: false
    }
  },
  computed: {
    // 显示的标签（最多2个）
    displayTags() {
      return (this.playlist.tags || []).slice(0, 2)
    }
  },
  watch: {
    playlist: {
      immediate: true,
      handler() {
        this.checkCollected()
      }
    }
  },
  methods: {
    // 检查是否已收藏
    checkCollected() {
      const collected = getCollectedPlaylists()
      this.isCollected = collected.some(p => p.id === this.playlist.id)
    },
    
    // 切换收藏状态
    toggleCollect() {
      this.isCollected = !this.isCollected
      this.$emit('toggle-collect', this.playlist)
    },
    
    // 跳转到歌单详情
    goToDetail() {
      // 记录浏览历史
      this.recordViewHistory()
      this.$router.push(`/home/songList/${this.playlist.id}`)
    },
    
    // 记录浏览历史
    recordViewHistory() {
      const history = JSON.parse(localStorage.getItem('playlistViewHistory') || '[]')
      const newRecord = {
        id: this.playlist.id,
        name: this.playlist.name,
        tags: this.playlist.tags,
        viewTime: new Date().toISOString()
      }
      
      // 移除重复记录
      const index = history.findIndex(h => h.id === this.playlist.id)
      if (index > -1) {
        history.splice(index, 1)
      }
      
      // 添加到开头，限制最多50条
      history.unshift(newRecord)
      if (history.length > 50) {
        history.pop()
      }
      
      localStorage.setItem('playlistViewHistory', JSON.stringify(history))
      
      // 更新用户偏好标签
      this.updateUserTags(this.playlist.tags)
    },
    
    // 更新用户偏好标签
    updateUserTags(tags) {
      const userHistory = JSON.parse(localStorage.getItem('userMusicHistory') || '{}')
      userHistory.tags = userHistory.tags || []
      
      tags.forEach(tag => {
        if (!userHistory.tags.includes(tag)) {
          userHistory.tags.push(tag)
        }
      })
      
      // 限制标签数量
      if (userHistory.tags.length > 20) {
        userHistory.tags = userHistory.tags.slice(-20)
      }
      
      localStorage.setItem('userMusicHistory', JSON.stringify(userHistory))
    },
    
    // 格式化播放次数
    formatPlayCount(count) {
      if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿'
      } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
      }
      return count.toString()
    }
  }
}
</script>

<style scoped>
.playlist-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #e8e8e8;
}

.card-image .el-image {
  width: 100%;
  height: 100%;
}

.card-image .el-image__inner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .el-image__inner {
  transform: scale(1.05);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 30px;
}

.play-count {
  position: absolute;
  top: 4px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.play-count i {
  font-size: 10px;
}

.play-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.card-info {
  padding: 8px 4px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 40px;
}

.playlist-creator {
  font-size: 12px;
  color: #999;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  color: #ec4141;
  background: rgba(236, 65, 65, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.collect-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s, transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.playlist-card:hover .collect-btn {
  opacity: 1;
}

.collect-btn:hover {
  transform: scale(1.1);
}

.collect-btn i {
  font-size: 14px;
}
</style>
