<template>
  <div class="music-card-container">
    <!-- 顶部名片展示区 -->
    <div class="card-header">
      <div class="card-background" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="card-content">
          <div class="user-info">
            <div class="avatar-container">
              <img :src="userInfo.avatar" alt="用户头像" class="avatar" @click="uploadAvatar">
              <div class="avatar-edit-btn" @click="uploadAvatar">
                <i class="el-icon-camera"></i>
              </div>
            </div>
            <div class="user-details">
              <h2 class="nickname" @click="editNickname">{{ userInfo.nickname }}</h2>
              <p class="signature" @click="editSignature">{{ userInfo.signature || '这个人很懒，什么都没有留下...' }}</p>
            </div>
          </div>
          <div class="music-stats">
            <div class="music-level">
              <span class="level-label">音乐等级</span>
              <span class="level-value">Lv.{{ userInfo.level }}</span>
            </div>
            <div class="medals">
              <span class="medal" v-for="medal in userInfo.medals" :key="medal.id">{{ medal.name }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <el-button icon="el-icon-edit" size="small" @click="editCard">编辑</el-button>
          <el-button icon="el-icon-share" size="small" @click="shareCard">分享</el-button>
        </div>
      </div>
    </div>

    <!-- 中间社交关系区 -->
    <div class="card-body">
      <div class="social-section">
        <div class="social-stats">
          <div class="stat-item" @click="viewFollowing">
            <span class="stat-number">{{ userInfo.following }}</span>
            <span class="stat-label">关注</span>
          </div>
          <div class="stat-item" @click="viewFollowers">
            <span class="stat-number">{{ userInfo.followers }}</span>
            <span class="stat-label">粉丝</span>
          </div>
        </div>

        <div class="recent-interactions">
          <h3>最近互动</h3>
          <div class="friend-list">
            <div class="friend-item" v-for="friend in recentFriends" :key="friend.id">
              <img :src="friend.avatar" alt="好友头像" class="friend-avatar">
              <div class="friend-info">
                <span class="friend-name">{{ friend.name }}</span>
                <span class="friend-common">{{ friend.commonSongs }}首共同喜欢的歌曲</span>
              </div>
              <el-button type="primary" size="small" @click="followFriend(friend.id)">{{ friend.isFollowing ? '已关注' : '关注' }}</el-button>
            </div>
          </div>
        </div>

        <div class="music-groups">
          <h3>音乐群组</h3>
          <div class="group-list">
            <div class="group-item" v-for="group in userGroups" :key="group.id">
              <img :src="group.avatar" alt="群组头像" class="group-avatar">
              <div class="group-info">
                <span class="group-name">{{ group.name }}</span>
                <span class="group-members">{{ group.members }}人</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部音乐偏好区 -->
      <div class="music-preferences">
        <div class="top-songs">
          <h3>听歌TOP3</h3>
          <div class="song-list">
            <div class="song-item" v-for="(song, index) in topSongs" :key="song.id" @click="playSong(song.id)">
              <div class="song-rank">{{ index + 1 }}</div>
              <img :src="song.cover" alt="歌曲封面" class="song-cover">
              <div class="song-info">
                <span class="song-name">{{ song.name }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </div>
              <div class="song-actions">
                <el-button icon="el-icon-play" size="small" @click.stop="playSong(song.id)"></el-button>
                <el-button icon="el-icon-star-off" size="small" @click.stop="addToPlaylist(song.id)"></el-button>
                <el-button icon="el-icon-share" size="small" @click.stop="shareSong(song.id)"></el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="music-tags">
          <h3>音乐标签</h3>
          <div class="tag-cloud">
            <span class="tag" v-for="tag in musicTags" :key="tag.id" @click="viewTagRecommendations(tag.id)">{{ tag.name }}</span>
          </div>
        </div>

        <div class="collected-playlists">
          <h3>收藏歌单</h3>
          <div class="playlist-list">
            <div class="playlist-item" v-for="playlist in collectedPlaylists" :key="playlist.id">
              <img :src="playlist.cover" alt="歌单封面" class="playlist-cover">
              <div class="playlist-info">
                <span class="playlist-name">{{ playlist.name }}</span>
                <span class="playlist-updated">{{ playlist.updatedAt }}</span>
                <span class="playlist-songs">{{ playlist.songCount }}首歌</span>
              </div>
              <el-button icon="el-icon-play" size="small" @click="playPlaylist(playlist.id)"></el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑名片对话框 -->
    <el-dialog title="编辑音乐名片" :visible.sync="editDialogVisible" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="editForm.signature" type="textarea" placeholder="请输入签名" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="onAvatarUploadSuccess"
          >
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="背景图">
          <el-upload
            class="background-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeBackgroundUpload"
            :on-success="onBackgroundUploadSuccess"
          >
            <img v-if="editForm.backgroundImage" :src="editForm.backgroundImage" class="background-preview">
            <i v-else class="el-icon-plus background-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCardEdit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicCard',
  data() {
    return {
      // 用户信息
      userInfo: {
        avatar: 'https://picsum.photos/seed/user-avatar/100/100',
        nickname: '网易云音乐用户',
        signature: '喜欢音乐，享受生活',
        level: 10,
        medals: [
          { id: 1, name: '摇滚达人' },
          { id: 2, name: '古典爱好者' }
        ],
        following: 50,
        followers: 120
      },
      // 背景图片
      backgroundImage: 'https://picsum.photos/seed/music-card-background/1200/400',
      // 最近互动好友
      recentFriends: [
        { id: 1, name: '张三', avatar: 'https://picsum.photos/seed/friend1/50/50', commonSongs: 20, isFollowing: true },
        { id: 2, name: '李四', avatar: 'https://picsum.photos/seed/friend2/50/50', commonSongs: 15, isFollowing: false },
        { id: 3, name: '王五', avatar: 'https://picsum.photos/seed/friend3/50/50', commonSongs: 10, isFollowing: false }
      ],
      // 用户加入的音乐群组
      userGroups: [
        { id: 1, name: '摇滚爱好者', avatar: 'https://picsum.photos/seed/group1/50/50', members: 500 },
        { id: 2, name: '古典音乐交流', avatar: 'https://picsum.photos/seed/group2/50/50', members: 300 }
      ],
      // 听歌TOP3
      topSongs: [
        { id: 1, name: '歌曲1', artist: '歌手1', cover: 'https://picsum.photos/seed/song1/80/80' },
        { id: 2, name: '歌曲2', artist: '歌手2', cover: 'https://picsum.photos/seed/song2/80/80' },
        { id: 3, name: '歌曲3', artist: '歌手3', cover: 'https://picsum.photos/seed/song3/80/80' }
      ],
      // 音乐标签
      musicTags: [
        { id: 1, name: '流行' },
        { id: 2, name: '独立音乐' },
        { id: 3, name: '90后经典' },
        { id: 4, name: '摇滚' },
        { id: 5, name: '古典' },
        { id: 6, name: '电子音乐' }
      ],
      // 收藏歌单
      collectedPlaylists: [
        { id: 1, name: '我的最爱', cover: 'https://picsum.photos/seed/playlist1/80/80', updatedAt: '2023-06-01', songCount: 100 },
        { id: 2, name: '开车必备', cover: 'https://picsum.photos/seed/playlist2/80/80', updatedAt: '2023-05-25', songCount: 50 }
      ],
      // 编辑对话框状态
      editDialogVisible: false,
      // 编辑表单数据
      editForm: {
        nickname: '',
        signature: '',
        avatar: '',
        backgroundImage: ''
      }
    }
  },
  mounted() {
    // 初始化编辑表单数据
    this.editForm = { ...this.userInfo, backgroundImage: this.backgroundImage }
  },
  methods: {
    // 上传头像
    uploadAvatar() {
      // 触发文件选择
      this.$refs.avatarUploader.$refs.input.click()
    },
    // 编辑昵称
    editNickname() {
      this.$prompt('请输入新昵称', '编辑昵称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.userInfo.nickname
      }).then(({ value }) => {
        this.userInfo.nickname = value
        this.editForm.nickname = value
      }).catch(() => {
        this.$message({ type: 'info', message: '取消编辑' })
      })
    },
    // 编辑签名
    editSignature() {
      this.$prompt('请输入新签名', '编辑签名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.userInfo.signature,
        inputType: 'textarea',
        inputRows: 3
      }).then(({ value }) => {
        this.userInfo.signature = value
        this.editForm.signature = value
      }).catch(() => {
        this.$message({ type: 'info', message: '取消编辑' })
      })
    },
    // 编辑名片
    editCard() {
      this.editDialogVisible = true
    },
    // 分享名片
    shareCard() {
      this.$message({ type: 'info', message: '分享功能开发中...' })
    },
    // 查看关注列表
    viewFollowing() {
      this.$message({ type: 'info', message: '关注列表功能开发中...' })
    },
    // 查看粉丝列表
    viewFollowers() {
      this.$message({ type: 'info', message: '粉丝列表功能开发中...' })
    },
    // 关注好友
    followFriend(friendId) {
      const friend = this.recentFriends.find(f => f.id === friendId)
      if (friend) {
        friend.isFollowing = !friend.isFollowing
        this.$message({ type: 'success', message: friend.isFollowing ? '关注成功' : '取消关注成功' })
      }
    },
    // 播放歌曲
    playSong(songId) {
      this.$message({ type: 'info', message: `播放歌曲 ${songId}` })
    },
    // 添加到歌单
    addToPlaylist(songId) {
      this.$message({ type: 'success', message: `歌曲 ${songId} 已添加到歌单` })
    },
    // 分享歌曲
    shareSong(songId) {
      this.$message({ type: 'info', message: `分享歌曲 ${songId}` })
    },
    // 查看标签推荐
    viewTagRecommendations(tagId) {
      this.$message({ type: 'info', message: `查看标签 ${tagId} 的推荐内容` })
    },
    // 播放歌单
    playPlaylist(playlistId) {
      this.$message({ type: 'info', message: `播放歌单 ${playlistId}` })
    },
    // 头像上传前校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 头像上传成功
    onAvatarUploadSuccess(response, file) {
      this.editForm.avatar = URL.createObjectURL(file.raw)
    },
    // 背景图上传前校验
    beforeBackgroundUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isJPG) {
        this.$message.error('上传背景图片只能是 JPG/PNG 格式!')
      }
      if (!isLt5M) {
        this.$message.error('上传背景图片大小不能超过 5MB!')
      }
      return isJPG && isLt5M
    },
    // 背景图上传成功
    onBackgroundUploadSuccess(response, file) {
      this.editForm.backgroundImage = URL.createObjectURL(file.raw)
    },
    // 保存名片编辑
    saveCardEdit() {
      // 更新用户信息
      this.userInfo = { ...this.editForm }
      this.backgroundImage = this.editForm.backgroundImage
      // 关闭对话框
      this.editDialogVisible = false
      // 提示保存成功
      this.$message({ type: 'success', message: '名片信息保存成功' })
    }
  }
}
</script>

<style scoped>
.music-card-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部名片展示区 */
.card-header {
  margin-bottom: 30px;
}

.card-background {
  position: relative;
  height: 400px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 40px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  margin-right: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.avatar-edit-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nickname:hover {
  color: #ff0033;
}

.signature {
  font-size: 16px;
  opacity: 0.9;
  cursor: pointer;
  transition: color 0.3s ease;
}

.signature:hover {
  color: #ff0033;
}

.music-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.music-level {
  margin-bottom: 20px;
  text-align: right;
}

.level-label {
  font-size: 14px;
  opacity: 0.8;
  display: block;
  margin-bottom: 5px;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

.medals {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.medal {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 15px;
  margin-left: 10px;
  margin-bottom: 5px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.card-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.card-actions .el-button {
  margin-left: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  backdrop-filter: blur(10px);
}

.card-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 中间社交关系区 */
.card-body {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.social-section {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.social-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.recent-interactions,
.music-groups {
  margin-bottom: 30px;
}

.recent-interactions h3,
.music-groups h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.friend-list,
.group-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.friend-item,
.group-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.friend-item:hover,
.group-item:hover {
  background: #f5f7fa;
}

.friend-avatar,
.group-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.friend-info,
.group-info {
  flex: 1;
}

.friend-name,
.group-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.friend-common,
.group-members {
  font-size: 14px;
  color: #606266;
}

/* 底部音乐偏好区 */
.music-preferences {
  flex: 2;
  min-width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.top-songs,
.music-tags,
.collected-playlists {
  margin-bottom: 30px;
}

.top-songs h3,
.music-tags h3,
.collected-playlists h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.song-list,
.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.song-item,
.playlist-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  transition: background 0.3s ease;
  cursor: pointer;
}

.song-item:hover,
.playlist-item:hover {
  background: #f5f7fa;
}

.song-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff0033;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 15px;
}

.song-cover,
.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 15px;
}

.song-info,
.playlist-info {
  flex: 1;
}

.song-name,
.playlist-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.song-artist,
.playlist-updated,
.playlist-songs {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background: #f5f7fa;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: #ff0033;
  color: white;
  transform: translateY(-3px);
}

/* 编辑对话框样式 */
.avatar-uploader,
.background-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.background-preview {
  width: 200px;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
  cursor: pointer;
}

.avatar-uploader-icon,
.background-uploader-icon {
  font-size: 28px;
  color: #c0c4cc;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .card-body {
    flex-direction: column;
  }

  .social-section,
  .music-preferences {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .music-card-container {
    padding: 10px;
  }

  .card-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .music-stats {
    margin-top: 20px;
    align-items: flex-start;
  }

  .medals {
    justify-content: flex-start;
  }

  .medal {
    margin-left: 0;
    margin-right: 10px;
  }

  .card-actions {
    top: 10px;
    right: 10px;
  }

  .card-actions .el-button {
    margin-left: 5px;
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style>