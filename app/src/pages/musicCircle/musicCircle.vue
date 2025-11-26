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
          @input="onSearchInput"
        ></el-input>
      </div>
      <el-button type="primary" icon="el-icon-edit" @click="showPublishModal = true">发布</el-button>
    </div>

    <!-- 搜索建议下拉框 -->
    <div class="search-suggest" v-show="showSearchSuggest && searchSuggest.length > 0">
      <div class="suggest-item" v-for="(item, index) in searchSuggest" :key="index">
        <i :class="item.icon"></i>
        <span>{{ item.content }}</span>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="main-content">
      <!-- 左侧推荐栏 -->
      <div class="left-sidebar">
        <!-- 推荐圈子 -->
        <div class="sidebar-section">
          <div class="section-title">推荐圈子</div>
          <div class="circle-item" v-for="(circle, index) in recommendedCircles" :key="index">
            <img :src="circle.cover" alt="圈子封面" class="circle-cover">
            <div class="circle-info">
              <div class="circle-name">{{ circle.name }}</div>
              <div class="circle-desc">{{ circle.description }}</div>
              <div class="circle-stats">
                <span>{{ circle.memberCount }}人</span>
                <span>{{ circle.postCount }}条动态</span>
              </div>
            </div>
            <el-button size="small" @click="joinCircle(circle.id)">加入</el-button>
          </div>
        </div>

        <!-- 热门话题 -->
        <div class="sidebar-section">
          <div class="section-title">热门话题</div>
          <div class="topic-item" v-for="(topic, index) in hotTopics" :key="index">
            <span class="topic-tag">#{{ topic.name }}</span>
            <span class="topic-count">{{ topic.discussionCount }}讨论</span>
          </div>
        </div>

        <!-- 可能感兴趣的人 -->
        <div class="sidebar-section">
          <div class="section-title">可能感兴趣的人</div>
          <div class="user-item" v-for="(user, index) in recommendedUsers" :key="index">
            <el-avatar :src="user.avatar"></el-avatar>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-desc">{{ user.description }}</div>
            </div>
            <el-button size="small" @click="followUser(user.id)">关注</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧动态流 -->
      <div class="right-content">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-button-group>
            <el-button :type="activeFilter === 'latest' ? 'primary' : 'default'" @click="setFilter('latest')">最新发布</el-button>
            <el-button :type="activeFilter === 'hot' ? 'primary' : 'default'" @click="setFilter('hot')">热门推荐</el-button>
            <el-button :type="activeFilter === 'follow' ? 'primary' : 'default'" @click="setFilter('follow')">关注优先</el-button>
          </el-button-group>
        </div>

        <!-- 动态列表 -->
        <div class="post-list">
          <div class="post-item" v-for="(post, index) in posts" :key="index">
            <div class="post-header">
              <el-avatar :src="post.user.avatar"></el-avatar>
              <div class="user-info">
                <div class="user-name">{{ post.user.name }}</div>
                <div class="post-time">{{ post.createTime }}</div>
              </div>
              <el-dropdown>
                <i class="el-icon-more"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>举报</el-dropdown-item>
                  <el-dropdown-item>删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="post-content">
              <p>{{ post.content }}</p>
              <!-- 音乐卡片 -->
              <div class="music-card" v-if="post.music">
                <img :src="post.music.cover" alt="音乐封面" class="music-cover">
                <div class="music-info">
                  <div class="music-name">{{ post.music.name }}</div>
                  <div class="music-artist">{{ post.music.artist }}</div>
                </div>
                <i class="el-icon-play music-play-icon"></i>
              </div>
              <!-- 话题标签 -->
              <div class="topic-tags" v-if="post.topics && post.topics.length > 0">
                <span class="topic-tag" v-for="(topic, index) in post.topics" :key="index">#{{ topic.name }}</span>
              </div>
            </div>
            <div class="post-actions">
              <el-button icon="el-icon-chat-dot-round" size="small">{{ post.commentCount }}评论</el-button>
              <el-button icon="el-icon-star-off" size="small">{{ post.likeCount }}点赞</el-button>
              <el-button icon="el-icon-share" size="small">{{ post.shareCount }}转发</el-button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore">
          <el-button type="default" @click="loadMorePosts">加载更多</el-button>
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
      <el-button type="primary" @click="showPublishModal = true">发布</el-button>
    </div>

    <!-- 发布动态弹窗 -->
    <el-dialog title="发布动态" :visible.sync="showPublishModal" width="600px">
      <div class="publish-modal-content">
        <el-input 
          v-model="publishContent" 
          type="textarea" 
          :rows="3" 
          placeholder="分享音乐、心情或故事..."
        ></el-input>
        <div class="publish-options">
          <el-button icon="el-icon-music" @click="selectMusic">选择音乐</el-button>
          <el-button icon="el-icon-tags" @click="selectTopic">添加话题</el-button>
          <el-button icon="el-icon-upload" @click="uploadAudio">上传翻唱</el-button>
        </div>
        <!-- 音乐预览 -->
        <div class="music-preview" v-if="selectedMusic">
          <img :src="selectedMusic.cover" alt="音乐封面" class="music-cover">
          <div class="music-info">
            <div class="music-name">{{ selectedMusic.name }}</div>
            <div class="music-artist">{{ selectedMusic.artist }}</div>
          </div>
          <i class="el-icon-close music-remove-icon" @click="removeMusic"></i>
        </div>
        <!-- 话题预览 -->
        <div class="topic-preview" v-if="selectedTopics && selectedTopics.length > 0">
          <span class="topic-tag" v-for="(topic, index) in selectedTopics" :key="index">
            #{{ topic.name }}
            <i class="el-icon-close" @click="removeTopic(index)"></i>
          </span>
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
  name: 'MusicCircle',
  data() {
    return {
      // 搜索相关
      searchKeyword: '',
      showSearchSuggest: false,
      searchSuggest: [],
      // 筛选相关
      activeFilter: 'latest',
      // 动态相关
      posts: [],
      hasMore: true,
      // 推荐数据
      recommendedCircles: [
        { id: 1, name: '华语音乐爱好者', description: '分享华语音乐的美好', cover: 'https://picsum.photos/80/80', memberCount: 12345, postCount: 6789 },
        { id: 2, name: '独立音乐圈', description: '独立音乐人的聚集地', cover: 'https://picsum.photos/81/81', memberCount: 8901, postCount: 4567 },
        { id: 3, name: '古典音乐欣赏', description: '品味古典音乐的魅力', cover: 'https://picsum.photos/82/82', memberCount: 5678, postCount: 2345 },
      ],
      hotTopics: [
        { id: 1, name: '华语新歌榜', discussionCount: 12345 },
        { id: 2, name: '独立音乐推荐', discussionCount: 8901 },
        { id: 3, name: '古典音乐赏析', discussionCount: 5678 },
      ],
      recommendedUsers: [
        { id: 1, name: '音乐爱好者小明', description: '喜欢各种类型的音乐', avatar: 'https://picsum.photos/40/40' },
        { id: 2, name: '独立音乐人小红', description: '创作自己的音乐作品', avatar: 'https://picsum.photos/41/41' },
        { id: 3, name: '古典音乐老师', description: '分享古典音乐知识', avatar: 'https://picsum.photos/42/42' },
      ],
      // 发布相关
      showPublishModal: false,
      publishContent: '',
      selectedMusic: null,
      selectedTopics: [],
    }
  },
  methods: {
    // 搜索输入处理
    onSearchInput() {
      // 模拟搜索建议
      if (this.searchKeyword.length > 0) {
        this.searchSuggest = [
          { icon: 'el-icon-folder-opened', content: `圈子：${this.searchKeyword}音乐圈` },
          { icon: 'el-icon-tags', content: `话题：#${this.searchKeyword}音乐` },
          { icon: 'el-icon-user', content: `用户：${this.searchKeyword}` },
        ]
      } else {
        this.searchSuggest = []
      }
    },
    // 筛选动态
    setFilter(filter) {
      this.activeFilter = filter
      // 这里可以添加筛选逻辑
    },
    // 加载更多动态
    loadMorePosts() {
      // 模拟加载更多数据
      const newPosts = Array.from({ length: 10 }, (_, i) => ({
        id: this.posts.length + i + 1,
        user: { name: `用户${this.posts.length + i + 1}`, avatar: `https://picsum.photos/40/40?random=${this.posts.length + i + 1}` },
        content: `这是第${this.posts.length + i + 1}条动态内容，分享我的音乐心情...`,
        createTime: '刚刚',
        commentCount: Math.floor(Math.random() * 100),
        likeCount: Math.floor(Math.random() * 1000),
        shareCount: Math.floor(Math.random() * 100),
        music: {
          name: `歌曲${this.posts.length + i + 1}`,
          artist: `歌手${this.posts.length + i + 1}`,
          cover: `https://picsum.photos/120/120?random=${this.posts.length + i + 1}`,
        },
        topics: [{ name: `话题${this.posts.length + i + 1}` }],
      }))
      this.posts = [...this.posts, ...newPosts]
      // 模拟加载完所有数据
      if (this.posts.length >= 50) {
        this.hasMore = false
      }
    },
    // 加入圈子
    joinCircle(circleId) {
      this.$message.success('加入圈子成功')
    },
    // 关注用户
    followUser(userId) {
      this.$message.success('关注用户成功')
    },
    // 发布动态
    publishPost() {
      if (!this.publishContent.trim()) {
        this.$message.warning('请输入发布内容')
        return
      }
      // 模拟发布动态
      const newPost = {
        id: this.posts.length + 1,
        user: { name: '当前用户', avatar: 'https://picsum.photos/40/40?random=999' },
        content: this.publishContent,
        createTime: '刚刚',
        commentCount: 0,
        likeCount: 0,
        shareCount: 0,
        music: this.selectedMusic,
        topics: this.selectedTopics,
      }
      this.posts.unshift(newPost)
      // 重置发布表单
      this.showPublishModal = false
      this.publishContent = ''
      this.selectedMusic = null
      this.selectedTopics = []
      this.$message.success('发布动态成功')
    },
    // 选择音乐
    selectMusic() {
      // 模拟选择音乐
      this.selectedMusic = {
        name: '随机歌曲',
        artist: '随机歌手',
        cover: 'https://picsum.photos/120/120?random=123',
      }
    },
    // 移除音乐
    removeMusic() {
      this.selectedMusic = null
    },
    // 选择话题
    selectTopic() {
      // 模拟选择话题
      const topicName = prompt('请输入话题名称')
      if (topicName && topicName.trim()) {
        this.selectedTopics.push({ name: topicName.trim() })
      }
    },
    // 移除话题
    removeTopic(index) {
      this.selectedTopics.splice(index, 1)
    },
    // 上传翻唱
    uploadAudio() {
      // 模拟上传翻唱
      this.$message.info('上传翻唱功能开发中')
    },
  },
  mounted() {
    // 初始化加载动态数据
    this.loadMorePosts()
  },
}
</script>

<style scoped>
.music-circle {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部搜索栏 */
.top-search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-container {
  display: flex;
  align-items: center;
  width: 400px;
  height: 40px;
  border-radius: 20px;
  background-color: #f5f5f5;
  padding: 0 16px;
}

.search-icon {
  margin-right: 8px;
  color: #999;
}

.search-container .el-input {
  width: 100%;
}

.search-container .el-input__inner {
  border: none;
  background-color: transparent;
  box-shadow: none;
}

/* 搜索建议 */
.search-suggest {
  position: absolute;
  top: 64px;
  left: 24px;
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 200;
}

.suggest-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggest-item:hover {
  background-color: #f5f5f5;
}

.suggest-item i {
  margin-right: 8px;
  color: #999;
}

/* 中间内容区 */
.main-content {
  display: flex;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 左侧推荐栏 */
.left-sidebar {
  width: 360px;
  margin-right: 24px;
}

.sidebar-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* 推荐圈子 */
.circle-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.circle-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.circle-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.circle-info {
  flex: 1;
  margin-right: 12px;
}

.circle-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.circle-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-stats {
  font-size: 12px;
  color: #999;
}

.circle-stats span {
  margin-right: 16px;
}

/* 热门话题 */
.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-tag {
  color: #1890ff;
  cursor: pointer;
}

.topic-count {
  font-size: 12px;
  color: #999;
}

/* 可能感兴趣的人 */
.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.user-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.user-item .el-avatar {
  margin-right: 12px;
}

.user-info {
  flex: 1;
  margin-right: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
}

/* 筛选栏 */
.filter-bar {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 动态列表 */
.post-list {
  margin-bottom: 24px;
}

.post-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.post-header .user-info {
  flex: 1;
  margin-left: 12px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content {
  margin-bottom: 16px;
}

.post-content p {
  margin-bottom: 12px;
  line-height: 1.6;
}

/* 音乐卡片 */
.music-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;
}

.music-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.music-info {
  flex: 1;
}

.music-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.music-artist {
  font-size: 12px;
  color: #999;
}

.music-play-icon {
  font-size: 20px;
  color: #1890ff;
  cursor: pointer;
}

/* 话题标签 */
.topic-tags {
  margin-top: 12px;
}

.topic-tags .topic-tag {
  margin-right: 8px;
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

/* 动态操作 */
.post-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.post-actions .el-button {
  margin-right: 24px;
}

/* 加载更多 */
.load-more {
  text-align: center;
}

/* 底部发布栏 */
.bottom-publish-bar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.bottom-publish-bar .el-input {
  flex: 1;
  margin-right: 16px;
}

/* 发布弹窗 */
.publish-modal-content {
  padding: 16px 0;
}

.publish-options {
  margin: 16px 0;
}

.publish-options .el-button {
  margin-right: 12px;
}

/* 音乐预览 */
.music-preview {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;
}

.music-preview .music-cover {
  width: 80px;
  height: 80px;
}

.music-remove-icon {
  font-size: 20px;
  color: #ff4d4f;
  cursor: pointer;
  margin-left: 12px;
}

/* 话题预览 */
.topic-preview {
  margin-bottom: 12px;
}

.topic-preview .topic-tag {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.topic-preview .topic-tag i {
  margin-left: 4px;
  cursor: pointer;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-search-bar {
    padding: 12px 16px;
  }

  .search-container {
    width: 100%;
  }

  .search-suggest {
    width: calc(100% - 32px);
    left: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .bottom-publish-bar {
    padding: 12px 16px;
  }
}
</style>