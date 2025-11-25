<template>
  <div class="music-circle">
    <!-- 顶部搜索栏 -->
    <div class="top-search-bar">
      <div class="search-container">
        <i class="el-icon-search search-icon"></i>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索圈子/话题/用户"
          @focus="showSearchSuggest = true"
          @input="handleSearchInput"
        ></el-input>
        <el-button
          type="primary"
          size="small"
          class="publish-btn"
          @click="showPublishModal = true"
        >
          发布
        </el-button>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="main-content">
      <!-- 左侧推荐栏 -->
      <div class="left-sidebar">
        <!-- 推荐圈子 -->
        <div class="sidebar-section">
          <h3 class="section-title">推荐圈子</h3>
          <div class="circle-item" v-for="circle in recommendedCircles" :key="circle.id">
            <img :src="circle.cover" alt="" class="circle-cover">
            <div class="circle-info">
              <h4 class="circle-name">{{ circle.name }}</h4>
              <p class="circle-desc">{{ circle.description }}</p>
              <div class="circle-stats">
                <span>{{ circle.memberCount }} 成员</span>
                <span>{{ circle.postCount }} 帖子</span>
              </div>
              <el-button type="primary" size="mini" @click="joinCircle(circle.id)">
                加入
              </el-button>
            </div>
          </div>
        </div>

        <!-- 热门话题 -->
        <div class="sidebar-section">
          <h3 class="section-title">热门话题</h3>
          <div class="topic-item" v-for="topic in hotTopics" :key="topic.id">
            <div class="topic-info">
              <h4 class="topic-name">#{{ topic.name }}</h4>
              <p class="topic-desc">{{ topic.description }}</p>
              <div class="topic-stats">
                <span>{{ topic.discussionCount }} 讨论</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 可能感兴趣的人 -->
        <div class="sidebar-section">
          <h3 class="section-title">可能感兴趣的人</h3>
          <div class="user-item" v-for="user in recommendedUsers" :key="user.id">
            <el-avatar :src="user.avatar" class="user-avatar"></el-avatar>
            <div class="user-info">
              <h4 class="user-name">{{ user.nickname }}</h4>
              <p class="user-desc">{{ user.description }}</p>
            </div>
            <el-button type="primary" size="mini" @click="followUser(user.id)">
              关注
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧动态流 -->
      <div class="right-content">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="latest">最新发布</el-radio-button>
            <el-radio-button label="hot">热门推荐</el-radio-button>
            <el-radio-button label="follow">关注优先</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 动态列表 -->
        <div class="post-list">
          <div class="post-item" v-for="post in postList" :key="post.id">
            <div class="post-header">
              <el-avatar :src="post.user.avatar" class="post-avatar"></el-avatar>
              <div class="post-user-info">
                <h4 class="post-username">{{ post.user.nickname }}</h4>
                <span class="post-time">{{ post.createTime }}</span>
              </div>
              <el-button type="text" size="small" class="more-btn">...</el-button>
            </div>

            <div class="post-content">
              <p class="post-text">{{ post.content }}</p>
              <!-- 音乐卡片 -->
              <div class="music-card" v-if="post.music">
                <img :src="post.music.cover" alt="" class="music-cover">
                <div class="music-info">
                  <h4 class="music-name">{{ post.music.name }}</h4>
                  <p class="music-artist">{{ post.music.artist }}</p>
                </div>
                <el-button type="text" size="small" class="play-btn">
                  <i class="el-icon-play"></i>
                </el-button>
              </div>
              <!-- 歌单卡片 -->
              <div class="playlist-card" v-if="post.playlist">
                <img :src="post.playlist.cover" alt="" class="playlist-cover">
                <div class="playlist-info">
                  <h4 class="playlist-name">{{ post.playlist.name }}</h4>
                  <p class="playlist-desc">{{ post.playlist.description }}</p>
                  <span class="playlist-song-count">{{ post.playlist.songCount }} 首歌</span>
                </div>
              </div>
            </div>

            <div class="post-actions">
              <el-button type="text" size="small" class="action-btn" @click="likePost(post.id)">
                <i class="el-icon-thumb"></i>
                {{ post.likeCount }}
              </el-button>
              <el-button type="text" size="small" class="action-btn" @click="commentPost(post.id)">
                <i class="el-icon-chat-dot-round"></i>
                {{ post.commentCount }}
              </el-button>
              <el-button type="text" size="small" class="action-btn" @click="sharePost(post.id)">
                <i class="el-icon-share"></i>
                转发
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more-container">
          <el-button type="text" size="small" @click="loadMorePosts" :loading="loading">
            {{ loading ? '加载中...' : '加载更多' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部发布栏 -->
    <div class="bottom-publish-bar">
      <el-input
        v-model="publishContent"
        placeholder="分享音乐、心情或故事..."
        @focus="showPublishModal = true"
      ></el-input>
      <el-button type="primary" size="small" @click="showPublishModal = true">
        发布
      </el-button>
    </div>

    <!-- 发布弹窗 -->
    <el-dialog
      title="发布动态"
      :visible.sync="showPublishModal"
      width="600px"
      :before-close="handleClosePublishModal"
    >
      <div class="publish-modal-content">
        <el-input
          v-model="publishContent"
          type="textarea"
          :rows="4"
          placeholder="分享音乐、心情或故事..."
        ></el-input>

        <!-- 音乐选择 -->
        <div class="publish-section">
          <h4 class="section-title">添加音乐</h4>
          <el-input
            v-model="musicSearchKeyword"
            placeholder="搜索歌曲或歌单"
            @input="handleMusicSearch"
          ></el-input>
          <div class="music-search-results" v-if="musicSearchResults.length > 0">
            <div class="music-search-item" v-for="music in musicSearchResults" :key="music.id">
              <img :src="music.cover" alt="" class="music-search-cover">
              <div class="music-search-info">
                <h4 class="music-search-name">{{ music.name }}</h4>
                <p class="music-search-artist">{{ music.artist }}</p>
              </div>
              <el-button type="text" size="small" @click="selectMusic(music)">
                选择
              </el-button>
            </div>
          </div>
        </div>

        <!-- 话题选择 -->
        <div class="publish-section">
          <h4 class="section-title">添加话题</h4>
          <el-input
            v-model="topicSearchKeyword"
            placeholder="搜索或输入话题"
            @input="handleTopicSearch"
          ></el-input>
          <div class="topic-search-results" v-if="topicSearchResults.length > 0">
            <div class="topic-search-item" v-for="topic in topicSearchResults" :key="topic.id">
              <span class="topic-search-name">#{{ topic.name }}</span>
              <el-button type="text" size="small" @click="selectTopic(topic)">
                添加
              </el-button>
            </div>
          </div>
        </div>

        <!-- 预览 -->
        <div class="publish-section">
          <h4 class="section-title">预览</h4>
          <div class="preview-content">
            <p>{{ publishContent }}</p>
            <div class="music-card" v-if="selectedMusic">
              <img :src="selectedMusic.cover" alt="" class="music-cover">
              <div class="music-info">
                <h4 class="music-name">{{ selectedMusic.name }}</h4>
                <p class="music-artist">{{ selectedMusic.artist }}</p>
              </div>
            </div>
            <div class="selected-topics" v-if="selectedTopics.length > 0">
              <span class="selected-topic" v-for="topic in selectedTopics" :key="topic.id">
                #{{ topic.name }}
                <i class="el-icon-close" @click="removeTopic(topic.id)"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showPublishModal = false">取消</el-button>
        <el-button type="primary" @click="publishPost">发布</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'musicCircle',
  data() {
    return {
      // 搜索相关
      searchKeyword: '',
      showSearchSuggest: false,
      searchSuggestions: [],

      // 筛选类型
      filterType: 'latest',

      // 推荐圈子
      recommendedCircles: [
        {
          id: 1,
          name: '独立音乐爱好者',
          description: '分享独立音乐，发现新声音',
          cover: 'https://picsum.photos/seed/indie/100/100',
          memberCount: 1234,
          postCount: 5678
        },
        {
          id: 2,
          name: '古典音乐欣赏',
          description: '一起感受古典音乐的魅力',
          cover: 'https://picsum.photos/seed/classical/100/100',
          memberCount: 987,
          postCount: 3456
        },
        {
          id: 3,
          name: '电子音乐派对',
          description: '电子音乐爱好者的聚集地',
          cover: 'https://picsum.photos/seed/electronic/100/100',
          memberCount: 2345,
          postCount: 7890
        }
      ],

      // 热门话题
      hotTopics: [
        {
          id: 1,
          name: '我的年度歌单',
          description: '分享你的2023年度歌单',
          discussionCount: 4567
        },
        {
          id: 2,
          name: '小众音乐推荐',
          description: '推荐你喜欢的小众音乐',
          discussionCount: 3210
        },
        {
          id: 3,
          name: '音乐与生活',
          description: '音乐如何影响你的生活',
          discussionCount: 2890
        }
      ],

      // 可能感兴趣的人
      recommendedUsers: [
        {
          id: 1,
          nickname: '音乐爱好者小王',
          avatar: 'https://picsum.photos/seed/user1/50/50',
          description: '喜欢各种类型的音乐'
        },
        {
          id: 2,
          nickname: '独立音乐人小李',
          avatar: 'https://picsum.photos/seed/user2/50/50',
          description: '独立音乐人，创作中'
        },
        {
          id: 3,
          nickname: '古典音乐迷小张',
          avatar: 'https://picsum.photos/seed/user3/50/50',
          description: '古典音乐爱好者'
        }
      ],

      // 动态列表
      postList: [
        {
          id: 1,
          user: {
            nickname: '音乐爱好者小王',
            avatar: 'https://picsum.photos/seed/user1/50/50'
          },
          createTime: '2023-12-01 14:30',
          content: '今天发现了一首很好听的独立音乐，分享给大家！',
          music: {
            name: '夏日微风',
            artist: '独立音乐人',
            cover: 'https://picsum.photos/seed/music1/100/100'
          },
          likeCount: 123,
          commentCount: 45
        },
        {
          id: 2,
          user: {
            nickname: '独立音乐人小李',
            avatar: 'https://picsum.photos/seed/user2/50/50'
          },
          createTime: '2023-12-01 13:20',
          content: '我的新专辑已经发布了，希望大家喜欢！',
          playlist: {
            name: '新专辑',
            description: '我的第一张专辑',
            cover: 'https://picsum.photos/seed/playlist1/100/100',
            songCount: 10
          },
          likeCount: 456,
          commentCount: 78
        }
      ],

      // 加载状态
      loading: false,

      // 发布相关
      showPublishModal: false,
      publishContent: '',
      musicSearchKeyword: '',
      musicSearchResults: [],
      selectedMusic: null,
      topicSearchKeyword: '',
      topicSearchResults: [],
      selectedTopics: []
    }
  },
  methods: {
    // 搜索输入处理
    handleSearchInput() {
      // 模拟搜索建议
      if (this.searchKeyword.length > 0) {
        this.searchSuggestions = [
          { type: 'circle', name: '独立音乐爱好者', count: 1234 },
          { type: 'topic', name: '我的年度歌单', count: 4567 },
          { type: 'user', name: '音乐爱好者小王', count: 789 }
        ]
      } else {
        this.searchSuggestions = []
      }
    },

    // 加入圈子
    joinCircle(circleId) {
      this.$message.success('已加入圈子')
    },

    // 关注用户
    followUser(userId) {
      this.$message.success('已关注用户')
    },

    // 点赞动态
    likePost(postId) {
      const post = this.postList.find(p => p.id === postId)
      if (post) {
        post.likeCount++
        this.$message.success('点赞成功')
      }
    },

    // 评论动态
    commentPost(postId) {
      this.$message.info('评论功能开发中')
    },

    // 转发动态
    sharePost(postId) {
      this.$message.info('转发功能开发中')
    },

    // 加载更多动态
    loadMorePosts() {
      this.loading = true
      // 模拟加载更多
      setTimeout(() => {
        const newPosts = [
          {
            id: this.postList.length + 1,
            user: {
              nickname: '古典音乐迷小张',
              avatar: 'https://picsum.photos/seed/user3/50/50'
            },
            createTime: '2023-12-01 12:10',
            content: '今天听了贝多芬的第九交响曲，感觉很震撼！',
            music: {
              name: '第九交响曲',
              artist: '贝多芬',
              cover: 'https://picsum.photos/seed/music2/100/100'
            },
            likeCount: 78,
            commentCount: 23
          }
        ]
        this.postList = [...this.postList, ...newPosts]
        this.loading = false
      }, 1000)
    },

    // 音乐搜索处理
    handleMusicSearch() {
      // 模拟音乐搜索结果
      if (this.musicSearchKeyword.length > 0) {
        this.musicSearchResults = [
          {
            id: 1,
            name: '夏日微风',
            artist: '独立音乐人',
            cover: 'https://picsum.photos/seed/music1/100/100'
          },
          {
            id: 2,
            name: '第九交响曲',
            artist: '贝多芬',
            cover: 'https://picsum.photos/seed/music2/100/100'
          }
        ]
      } else {
        this.musicSearchResults = []
      }
    },

    // 选择音乐
    selectMusic(music) {
      this.selectedMusic = music
      this.musicSearchKeyword = ''
      this.musicSearchResults = []
    },

    // 话题搜索处理
    handleTopicSearch() {
      // 模拟话题搜索结果
      if (this.topicSearchKeyword.length > 0) {
        this.topicSearchResults = [
          {
            id: 1,
            name: '我的年度歌单',
            description: '分享你的2023年度歌单'
          },
          {
            id: 2,
            name: '小众音乐推荐',
            description: '推荐你喜欢的小众音乐'
          }
        ]
      } else {
        this.topicSearchResults = []
      }
    },

    // 选择话题
    selectTopic(topic) {
      // 检查是否已经选择了该话题
      const existingTopic = this.selectedTopics.find(t => t.id === topic.id)
      if (!existingTopic) {
        this.selectedTopics.push(topic)
      }
      this.topicSearchKeyword = ''
      this.topicSearchResults = []
    },

    // 移除话题
    removeTopic(topicId) {
      this.selectedTopics = this.selectedTopics.filter(t => t.id !== topicId)
    },

    // 发布动态
    publishPost() {
      if (!this.publishContent.trim()) {
        this.$message.error('请输入发布内容')
        return
      }

      // 模拟发布
      this.$message.success('发布成功')
      this.showPublishModal = false
      this.publishContent = ''
      this.selectedMusic = null
      this.selectedTopics = []
    },

    // 关闭发布弹窗
    handleClosePublishModal() {
      // 保存草稿到localStorage
      if (this.publishContent.trim() || this.selectedMusic || this.selectedTopics.length > 0) {
        const draft = {
          content: this.publishContent,
          music: this.selectedMusic,
          topics: this.selectedTopics,
          createTime: new Date().toISOString()
        }
        localStorage.setItem('musicCircleDraft', JSON.stringify(draft))
      }
      this.showPublishModal = false
    }
  },
  mounted() {
    // 检查是否有未发布的草稿
    const draft = localStorage.getItem('musicCircleDraft')
    if (draft) {
      const parsedDraft = JSON.parse(draft)
      this.$confirm('检测到未发布的草稿，是否恢复？', '提示', {
        confirmButtonText: '恢复',
        cancelButtonText: '放弃',
        type: 'info'
      }).then(() => {
        this.publishContent = parsedDraft.content
        this.selectedMusic = parsedDraft.music
        this.selectedTopics = parsedDraft.topics
        this.showPublishModal = true
      }).catch(() => {
        // 放弃草稿
        localStorage.removeItem('musicCircleDraft')
      })
    }
  }
}
</script>

<style scoped>
.music-circle {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部搜索栏 */
.top-search-bar {
  position: sticky;
  top: 0;
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.search-container {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.search-container .el-input {
  flex: 1;
  margin-right: 10px;
}

.search-container .el-input__inner {
  padding-left: 35px;
  border-radius: 20px;
}

.publish-btn {
  border-radius: 20px;
}

/* 中间内容区 */
.main-content {
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
}

/* 左侧推荐栏 */
.left-sidebar {
  width: 30%;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.circle-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.circle-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.circle-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.circle-info {
  flex: 1;
}

.circle-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.circle-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  line-height: 1.4;
}

.circle-stats {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.circle-stats span {
  margin-right: 10px;
}

.topic-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.topic-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.topic-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.topic-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  line-height: 1.4;
}

.topic-stats {
  font-size: 12px;
  color: #999;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.user-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.user-avatar {
  width: 50px;
  height: 50px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 右侧动态流 */
.right-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: 20px;
}

.post-list {
  margin-bottom: 20px;
}

.post-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.post-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.post-user-info {
  flex: 1;
}

.post-username {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.more-btn {
  color: #999;
}

.post-content {
  margin-bottom: 15px;
}

.post-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.music-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.music-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.music-info {
  flex: 1;
}

.music-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.music-artist {
  font-size: 12px;
  color: #999;
}

.play-btn {
  color: #409eff;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  line-height: 1.4;
}

.playlist-song-count {
  font-size: 12px;
  color: #999;
}

.post-actions {
  display: flex;
  gap: 20px;
}

.action-btn {
  color: #999;
}

.action-btn:hover {
  color: #409eff;
}

.load-more-container {
  text-align: center;
}

/* 底部发布栏 */
.bottom-publish-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
}

.bottom-publish-bar .el-input {
  flex: 1;
}

.bottom-publish-bar .el-input__inner {
  border-radius: 20px;
}

/* 发布弹窗 */
.publish-modal-content {
  padding: 20px 0;
}

.publish-section {
  margin-bottom: 20px;
}

.publish-section:last-child {
  margin-bottom: 0;
}

.music-search-results {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.music-search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.music-search-item:last-child {
  border-bottom: none;
}

.music-search-item:hover {
  background-color: #f5f5f5;
}

.music-search-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.music-search-info {
  flex: 1;
}

.music-search-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.music-search-artist {
  font-size: 12px;
  color: #999;
}

.topic-search-results {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.topic-search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.topic-search-item:last-child {
  border-bottom: none;
}

.topic-search-item:hover {
  background-color: #f5f5f5;
}

.topic-search-name {
  font-size: 14px;
  font-weight: 600;
}

.preview-content {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.selected-topics {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-topic {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 15px;
  font-size: 12px;
}

.selected-topic i {
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-sidebar {
    width: 360px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
  }

  .bottom-publish-bar {
    padding: 10px;
  }

  .bottom-publish-bar .el-input {
    flex: 1;
  }

  .bottom-publish-bar .el-button {
    padding: 0 10px;
  }
}
</style>
