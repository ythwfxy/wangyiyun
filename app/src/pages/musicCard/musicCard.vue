<template>
  <div class="music-card-container">
    <!-- 顶部导航栏 -->
    <div class="music-card-header">
      <h1>我的音乐名片</h1>
      <div class="header-actions">
        <el-button icon="el-icon-edit" circle @click="editCard"></el-button>
        <el-button icon="el-icon-share" circle @click="shareCard"></el-button>
      </div>
    </div>

    <!-- 卡片展示区 -->
    <div class="card-display-section">
      <div class="card-background" :style="{ backgroundImage: `url(${cardBackground})` }">
        <div class="card-content">
          <div class="left-section">
            <el-avatar :size="120" :src="userAvatar" @click="changeAvatar">
              <i class="el-icon-plus"></i>
            </el-avatar>
            <div class="user-info">
              <h2>{{ userName }}</h2>
              <p class="user-signature" @click="editSignature">{{ userSignature || '点击添加签名' }}</p>
            </div>
          </div>
          <div class="right-section">
            <div class="music-level">
              <h3>音乐等级</h3>
              <div class="level-display">
                <el-progress :percentage="musicLevel.percentage" :stroke-width="20" :show-text="false">
                  <template slot="default">
                    <span class="level-text">{{ musicLevel.level }}</span>
                  </template>
                </el-progress>
              </div>
            </div>
            <div class="music-medals">
              <h3>听歌勋章</h3>
              <div class="medals-list">
                <el-tag v-for="medal in musicMedals" :key="medal.id" :type="medal.type">
                  {{ medal.name }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 社交关系区 -->
    <div class="social-section">
      <div class="social-stats">
        <div class="stat-item" @click="viewFollowing">
          <span class="stat-number">{{ followingCount }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item" @click="viewFollowers">
          <span class="stat-number">{{ followersCount }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item" @click="viewGroups">
          <span class="stat-number">{{ groupsCount }}</span>
          <span class="stat-label">群组</span>
        </div>
      </div>

      <div class="recent-interactions">
        <h3>最近互动</h3>
        <div class="interactions-list">
          <div class="interaction-item" v-for="friend in recentFriends" :key="friend.id">
            <el-avatar :size="50" :src="friend.avatar"></el-avatar>
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
              <span class="common-interest">{{ friend.commonInterest }}</span>
            </div>
            <el-button v-if="!friend.isFollowing" type="primary" size="small" @click="followFriend(friend.id)">
              关注
            </el-button>
            <el-button v-else type="success" size="small">
              已关注
            </el-button>
          </div>
        </div>
      </div>

      <div class="music-groups">
        <h3>音乐群组</h3>
        <div class="groups-list">
          <div class="group-item" v-for="group in musicGroups" :key="group.id" @click="enterGroup(group.id)">
            <el-avatar :size="60" :src="group.avatar"></el-avatar>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-members">{{ group.membersCount }}人</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 音乐偏好区 -->
    <div class="music-preference-section">
      <div class="top-songs">
        <h3>听歌TOP3</h3>
        <div class="songs-list">
          <div class="song-item" v-for="(song, index) in topSongs" :key="song.id" @click="playSong(song.id)">
            <div class="song-rank">{{ index + 1 }}</div>
            <el-image :src="song.cover" :lazy="true" class="song-cover"></el-image>
            <div class="song-info">
              <span class="song-name">{{ song.name }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <div class="song-actions">
              <el-button icon="el-icon-play" circle size="small" @click.stop="playSong(song.id)"></el-button>
              <el-button icon="el-icon-collection" circle size="small" @click.stop="addToPlaylist(song.id)"></el-button>
              <el-button icon="el-icon-share" circle size="small" @click.stop="shareSong(song.id)"></el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="music-tags">
        <h3>音乐标签云</h3>
        <div class="tags-cloud">
          <el-tag v-for="tag in musicTags" :key="tag.id" :size="tag.size" :type="tag.type" @click="viewTagRecommendations(tag.id)">
            {{ tag.name }}
          </el-tag>
        </div>
      </div>

      <div class="collected-playlists">
        <h3>收藏歌单</h3>
        <div class="playlists-list">
          <div class="playlist-item" v-for="playlist in collectedPlaylists" :key="playlist.id" @click="playPlaylist(playlist.id)">
            <el-image :src="playlist.cover" :lazy="true" class="playlist-cover"></el-image>
            <div class="playlist-info">
              <span class="playlist-name">{{ playlist.name }}</span>
              <span class="playlist-updated">{{ playlist.updatedAt }}</span>
              <span class="playlist-songs">{{ playlist.songsCount }}首歌</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑名片对话框 -->
    <el-dialog title="编辑音乐名片" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="form.userName" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="form.userSignature" type="textarea" :rows="3" placeholder="请输入签名"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload :action="uploadUrl" :show-file-list="false" @success="handleAvatarSuccess">
            <el-button size="small" type="primary">上传头像</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="背景图">
          <el-upload :action="uploadUrl" :show-file-list="false" @success="handleBackgroundSuccess">
            <el-button size="small" type="primary">上传背景图</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCardChanges">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicCard',
  data() {
    return {
      // 卡片信息
      userName: '网易云用户',
      userSignature: '热爱音乐，享受生活',
      userAvatar: 'https://picsum.photos/id/1005/200/200',
      cardBackground: 'https://picsum.photos/id/1040/1200/400',
      
      // 音乐等级
      musicLevel: {
        level: 12,
        percentage: 75
      },
      
      // 听歌勋章
      musicMedals: [
        { id: 1, name: '摇滚达人', type: 'danger' },
        { id: 2, name: '古典爱好者', type: 'success' },
        { id: 3, name: '流行先锋', type: 'warning' },
        { id: 4, name: '独立音乐迷', type: 'info' }
      ],
      
      // 社交统计
      followingCount: 123,
      followersCount: 456,
      groupsCount: 7,
      
      // 最近互动好友
      recentFriends: [
        { id: 1, name: '张三', avatar: 'https://picsum.photos/id/1000/100/100', commonInterest: '共同喜欢周杰伦', isFollowing: false },
        { id: 2, name: '李四', avatar: 'https://picsum.photos/id/1001/100/100', commonInterest: '共同喜欢陈奕迅', isFollowing: true },
        { id: 3, name: '王五', avatar: 'https://picsum.photos/id/1002/100/100', commonInterest: '共同喜欢林俊杰', isFollowing: false }
      ],
      
      // 音乐群组
      musicGroups: [
        { id: 1, name: '摇滚爱好者俱乐部', avatar: 'https://picsum.photos/id/1019/100/100', membersCount: 1234 },
        { id: 2, name: '古典音乐交流群', avatar: 'https://picsum.photos/id/1020/100/100', membersCount: 567 },
        { id: 3, name: '流行音乐分享群', avatar: 'https://picsum.photos/id/1021/100/100', membersCount: 890 }
      ],
      
      // 听歌TOP3
      topSongs: [
        { id: 1, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/id/1025/100/100' },
        { id: 2, name: '富士山下', artist: '陈奕迅', cover: 'https://picsum.photos/id/1026/100/100' },
        { id: 3, name: '江南', artist: '林俊杰', cover: 'https://picsum.photos/id/1027/100/100' }
      ],
      
      // 音乐标签云
      musicTags: [
        { id: 1, name: '流行', size: 'large', type: 'primary' },
        { id: 2, name: '摇滚', size: 'medium', type: 'danger' },
        { id: 3, name: '古典', size: 'small', type: 'success' },
        { id: 4, name: '独立音乐', size: 'medium', type: 'warning' },
        { id: 5, name: '90后经典', size: 'large', type: 'info' },
        { id: 6, name: '华语流行', size: 'small', type: 'primary' },
        { id: 7, name: '欧美音乐', size: 'medium', type: 'danger' },
        { id: 8, name: '电子音乐', size: 'large', type: 'success' }
      ],
      
      // 收藏歌单
      collectedPlaylists: [
        { id: 1, name: '我的最爱', cover: 'https://picsum.photos/id/1030/100/100', updatedAt: '2023-05-15', songsCount: 123 },
        { id: 2, name: '开车必备', cover: 'https://picsum.photos/id/1031/100/100', updatedAt: '2023-05-10', songsCount: 45 },
        { id: 3, name: '睡前音乐', cover: 'https://picsum.photos/id/1032/100/100', updatedAt: '2023-05-05', songsCount: 78 }
      ],
      
      // 编辑对话框
      editDialogVisible: false,
      form: {
        userName: '',
        userSignature: ''
      },
      
      // 上传URL
      uploadUrl: '/api/upload'
    }
  },
  mounted() {
    // 初始化表单数据
    this.form.userName = this.userName
    this.form.userSignature = this.userSignature
    
    // 检查网络状态
    this.checkNetworkStatus()
    
    // 监听网络状态变化
    window.addEventListener('online', this.handleNetworkOnline)
    window.addEventListener('offline', this.handleNetworkOffline)
  },
  beforeDestroy() {
    // 移除网络状态监听
    window.removeEventListener('online', this.handleNetworkOnline)
    window.removeEventListener('offline', this.handleNetworkOffline)
  },
  methods: {
    // 编辑卡片
    editCard() {
      this.editDialogVisible = true
    },
    
    // 分享卡片
    shareCard() {
      this.$message.info('分享功能开发中...')
    },
    
    // 更换头像
    changeAvatar() {
      this.$message.info('更换头像功能开发中...')
    },
    
    // 编辑签名
    editSignature() {
      this.editCard()
    },
    
    // 查看关注列表
    viewFollowing() {
      this.$message.info('关注列表功能开发中...')
    },
    
    // 查看粉丝列表
    viewFollowers() {
      this.$message.info('粉丝列表功能开发中...')
    },
    
    // 查看群组
    viewGroups() {
      this.$message.info('群组列表功能开发中...')
    },
    
    // 关注好友
    followFriend(friendId) {
      const friend = this.recentFriends.find(f => f.id === friendId)
      if (friend) {
        friend.isFollowing = true
        this.followingCount++
        this.$message.success('关注成功')
      }
    },
    
    // 进入群组
    enterGroup(groupId) {
      this.$message.info('进入群组功能开发中...')
    },
    
    // 播放歌曲
    playSong(songId) {
      this.$message.info(`播放歌曲 ${songId}`)
    },
    
    // 添加到歌单
    addToPlaylist(songId) {
      this.$message.info(`添加歌曲 ${songId} 到歌单`)
    },
    
    // 分享歌曲
    shareSong(songId) {
      this.$message.info(`分享歌曲 ${songId}`)
    },
    
    // 查看标签推荐
    viewTagRecommendations(tagId) {
      this.$message.info(`查看标签 ${tagId} 的推荐内容`)
    },
    
    // 播放歌单
    playPlaylist(playlistId) {
      this.$message.info(`播放歌单 ${playlistId}`)
    },
    
    // 处理头像上传成功
    handleAvatarSuccess(response) {
      this.userAvatar = response.url
      this.form.userAvatar = response.url
    },
    
    // 处理背景图上传成功
    handleBackgroundSuccess(response) {
      this.cardBackground = response.url
    },
    
    // 保存卡片修改
    saveCardChanges() {
      this.userName = this.form.userName
      this.userSignature = this.form.userSignature
      this.editDialogVisible = false
      this.$message.success('卡片修改保存成功')
    },
    
    // 检查网络状态
    checkNetworkStatus() {
      if (!navigator.onLine) {
        this.$message.warning('当前网络离线，数据将保存在本地')
      }
    },
    
    // 网络恢复
    handleNetworkOnline() {
      this.$message.success('网络已恢复，是否同步更新数据？')
      // 这里可以添加同步本地缓存数据到服务器的逻辑
    },
    
    // 网络断开
    handleNetworkOffline() {
      this.$message.warning('网络已断开，数据将保存在本地')
    }
  }
}
</script>

<style scoped>
.music-card-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

/* 顶部导航栏 */
.music-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.music-card-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 卡片展示区 */
.card-display-section {
  margin-bottom: 30px;
}

.card-background {
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.card-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  color: white;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.user-signature {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  cursor: pointer;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.music-level h3,
.music-medals h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.level-display {
  width: 150px;
}

.level-text {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.medals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 社交关系区 */
.social-section {
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}

.social-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 8px;
}

.stat-item:hover {
  background-color: #f5f7fa;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.recent-interactions,
.music-groups {
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-interactions h3,
.music-groups h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.interactions-list,
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.interaction-item,
.group-item {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 8px;
}

.interaction-item:hover,
.group-item:hover {
  background-color: #f5f7fa;
}

.friend-info,
.group-info {
  flex: 1;
}

.friend-name,
.group-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
}

.common-interest,
.group-members {
  font-size: 14px;
  color: #666;
  display: block;
}

/* 音乐偏好区 */
.music-preference-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.top-songs,
.music-tags,
.collected-playlists {
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-songs h3,
.music-tags h3,
.collected-playlists h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.songs-list,
.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.song-item,
.playlist-item {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 8px;
  position: relative;
}

.song-item:hover,
.playlist-item:hover {
  background-color: #f5f7fa;
}

.song-rank {
  font-size: 20px;
  font-weight: 600;
  color: #666;
  width: 30px;
  text-align: center;
}

.song-cover,
.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.song-info,
.playlist-info {
  flex: 1;
}

.song-name,
.playlist-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
}

.song-artist,
.playlist-updated,
.playlist-songs {
  font-size: 14px;
  color: #666;
  display: block;
}

.song-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .social-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .music-preference-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .collected-playlists {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .music-card-container {
    padding: 10px;
  }
  
  .card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .social-section {
    grid-template-columns: 1fr;
  }
  
  .music-preference-section {
    grid-template-columns: 1fr;
  }
  
  .song-actions {
    opacity: 1;
  }
}
</style>
