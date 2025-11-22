<template>
  <div class="music-comment-container">
    <!-- 顶部歌曲信息区 -->
    <div class="song-info-section">
      <div class="song-cover">
        <img :src="currentSong.cover" alt="歌曲封面" v-lazy>
        <div class="play-pause-btn" @click="togglePlay">
          <i :class="isPlaying ? 'iconfont icon-zanting' : 'iconfont icon-bofang'"></i>
        </div>
      </div>
      <div class="song-details">
        <h2 class="song-title">{{ currentSong.title }}</h2>
        <p class="song-artist">{{ currentSong.artist }}</p>
      </div>
      <div class="comment-stats">
        <span class="comment-count">{{ totalComments }}条评论</span>
        <el-button type="primary" size="small" @click="toggleCommentVisibility">
          {{ commentVisible ? '收起评论区' : '展开评论区' }}
        </el-button>
      </div>
    </div>

    <!-- 中间评论管理区 -->
    <div class="comment-management-section" v-if="commentVisible">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="sortType" placeholder="排序方式" size="small" @change="onSortChange">
          <el-option label="最新" value="latest" />
          <el-option label="最热" value="hot" />
          <el-option label="带图评论" value="pic" />
        </el-select>
        <div class="like-filter">
          <span>点赞数：</span>
          <el-slider
            v-model="likeRange"
            :min="10"
            :max="1000"
            :step="10"
            range
            size="small"
            @change="onLikeRangeChange"
          />
          <span>{{ likeRange[0] }}-{{ likeRange[1] }}</span>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div class="comment-item" v-for="comment in filteredComments" :key="comment.id">
          <div class="comment-avatar">
            <img :src="comment.avatar" alt="用户头像" v-lazy>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-name">{{ comment.userName }}</span>
              <span class="comment-time">{{ comment.time }}</span>
              <span class="top-tag" v-if="comment.isTop">置顶</span>
            </div>
            <div class="comment-text" v-html="comment.content"></div>
            <div class="comment-actions">
              <span class="action-btn" @click="toggleLike(comment)">
                <i :class="comment.isLiked ? 'iconfont icon-aixin1' : 'iconfont icon-aixin'"></i>
                {{ comment.likeCount }}
              </span>
              <span class="action-btn" @click="replyToComment(comment)">
                <i class="iconfont icon-huifu"></i>
                {{ comment.replyCount }}
              </span>
              <span class="action-btn" @click="deleteComment(comment)">
                <i class="iconfont icon-shanchu"></i>
                删除
              </span>
              <span class="action-btn" @click="toggleTop(comment)">
                <i class="iconfont icon-dingwei"></i>
                {{ comment.isTop ? '取消置顶' : '置顶' }}
              </span>
            </div>
            <!-- 回复框 -->
            <div class="reply-box" v-if="replyCommentId === comment.id">
              <el-input
                v-model="replyContent"
                placeholder="写下你的回复..."
                size="small"
                @keyup.enter.native="submitReply"
                @focus="onReplyFocus"
              >
                <template slot="prepend">
                  <el-button size="small" @click="insertEmoji">
                    <i class="iconfont icon-biaoqing"></i>
                  </el-button>
                  <el-button size="small" @click="atUser">
                    <i class="iconfont icon-at"></i>
                  </el-button>
                </template>
                <template slot="append">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button size="small" type="primary" @click="submitReply">发送</el-button>
                </template>
              </el-input>
              <!-- @用户下拉列表 -->
              <div class="at-user-list" v-if="showAtUserList">
                <div class="at-user-item" v-for="user in atUserSuggestions" :key="user.id" @click="selectAtUser(user)">
                  <img :src="user.avatar" alt="用户头像" v-lazy>
                  <span>{{ user.userName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalComments"
          :page-size="20"
          :current-page.sync="currentPage"
          @current-change="onPageChange"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 右侧互动数据看板 -->
    <div class="data-board-section" :class="{ 'collapsed': !dataBoardVisible }">
      <div class="data-board-header">
        <h3>互动数据看板</h3>
        <el-button size="mini" @click="toggleDataBoard">
          <i :class="dataBoardVisible ? 'iconfont icon-shouqi' : 'iconfont icon-zhankai'"></i>
        </el-button>
      </div>
      <div class="data-board-content">
        <!-- 评论增长趋势图表 -->
        <div class="chart-container">
          <h4>评论增长趋势</h4>
          <el-select v-model="trendTimeRange" placeholder="时间范围" size="small" @change="onTrendTimeRangeChange">
            <el-option label="24小时" value="24h" />
            <el-option label="7天" value="7d" />
          </el-select>
          <div id="comment-trend-chart" ref="commentTrendChart"></div>
        </div>

        <!-- 用户评论设备占比图表 -->
        <div class="chart-container">
          <h4>用户评论设备占比</h4>
          <div id="device-distribution-chart" ref="deviceDistributionChart"></div>
        </div>

        <!-- 热门评论词云 -->
        <div class="word-cloud-container">
          <h4>热门评论词云</h4>
          <div id="word-cloud-chart" ref="wordCloudChart"></div>
        </div>

        <!-- 数据导出按钮 -->
        <div class="export-btn-container">
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </div>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-section" v-if="commentVisible">
      <div class="user-avatar">
        <img :src="currentUser.avatar" alt="用户头像" v-lazy>
      </div>
      <el-input
        v-model="newCommentContent"
        placeholder="写下你的评论..."
        @keyup.enter.native="submitComment"
        @focus="onCommentFocus"
        @input="onCommentInput"
      >
        <template slot="prepend">
          <el-button size="small" @click="insertEmoji">
            <i class="iconfont icon-biaoqing"></i>
          </el-button>
          <el-button size="small" @click="atUser">
            <i class="iconfont icon-at"></i>
          </el-button>
        </template>
        <template slot="append">
          <el-button size="small" type="primary" @click="submitComment" :disabled="!newCommentContent.trim()">发送</el-button>
        </template>
      </el-input>
      <!-- @用户下拉列表 -->
      <div class="at-user-list" v-if="showAtUserList">
        <div class="at-user-item" v-for="user in atUserSuggestions" :key="user.id" @click="selectAtUser(user)">
          <img :src="user.avatar" alt="用户头像" v-lazy>
          <span>{{ user.userName }}</span>
        </div>
      </div>
      <!-- 表情选择器 -->
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-item" v-for="emoji in emojis" :key="emoji.code" @click="insertEmojiToComment(emoji)">
          {{ emoji.symbol }}
        </div>
      </div>
    </div>

    <!-- 草稿恢复提示 -->
    <div class="draft-tip" v-if="showDraftTip">
      <span>检测到未发布的评论草稿，是否恢复？</span>
      <el-button size="small" @click="restoreDraft">恢复</el-button>
      <el-button size="small" @click="discardDraft">放弃</el-button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-wordcloud'

export default {
  name: 'MusicComment',
  data() {
    return {
      // 当前歌曲信息
      currentSong: {
        cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        title: '告白气球',
        artist: '周杰伦'
      },
      // 当前用户信息
      currentUser: {
        avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        userName: '当前用户'
      },
      // 评论可见性
      commentVisible: true,
      // 数据看板可见性
      dataBoardVisible: true,
      // 排序方式
      sortType: 'latest',
      // 点赞数范围
      likeRange: [10, 1000],
      // 当前页码
      currentPage: 1,
      // 回复相关
      replyCommentId: null,
      replyContent: '',
      // 评论输入框内容
      newCommentContent: '',
      // @用户相关
      showAtUserList: false,
      atUserSuggestions: [],
      // 表情选择器
      showEmojiPicker: false,
      emojis: [
        { symbol: '😊', code: ':smile:' },
        { symbol: '😂', code: ':joy:' },
        { symbol: '❤️', code: ':heart:' },
        { symbol: '👍', code: ':thumbsup:' },
        { symbol: '🎉', code: ':tada:' },
        { symbol: '🔥', code: ':fire:' },
        { symbol: '👏', code: ':clap:' },
        { symbol: '🙏', code: ':pray:' },
        { symbol: '❤️', code: ':heart:' },
        { symbol: '😘', code: ':kissing_heart:' },
        { symbol: '😢', code: ':cry:' },
        { symbol: '😡', code: ':angry:' },
        { symbol: '😱', code: ':scream:' },
        { symbol: '😎', code: ':sunglasses:' },
        { symbol: '😴', code: ':sleeping:' },
        { symbol: '😜', code: ':stuck_out_tongue_winking_eye:' }
      ],
      // 草稿相关
      showDraftTip: false,
      draftContent: '',
      // 图表相关
      trendTimeRange: '24h',
      commentTrendChart: null,
      deviceDistributionChart: null,
      wordCloudChart: null,
      // 模拟评论数据
      comments: [],
      // 过滤后的评论数据
      filteredComments: [],
      // 播放状态
      isPlaying: false
    }
  },
  computed: {
    totalComments() {
      return this.filteredComments.length
    }
  },
  mounted() {
    // 初始化评论数据
    this.initComments()
    // 初始化图表
    this.initCharts()
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    // 检查是否有草稿
    this.checkDraft()
    // 从URL参数获取评论可见性状态
    this.getCommentVisibilityFromUrl()
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.commentTrendChart) {
      this.commentTrendChart.dispose()
    }
    if (this.deviceDistributionChart) {
      this.deviceDistributionChart.dispose()
    }
    if (this.wordCloudChart) {
      this.wordCloudChart.dispose()
    }
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  },
  methods: {
    // 初始化评论数据
    initComments() {
      // 模拟200条评论数据
      const comments = []
      const users = [
        { id: 1, name: '用户A', avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 2, name: '用户B', avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 3, name: '用户C', avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 4, name: '用户D', avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 5, name: '用户E', avatar: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' }
      ]
      const contents = [
        '这首歌真的很好听！',
        '周杰伦的歌永远经典！',
        '告白气球，我的最爱！',
        '每次听都有不一样的感觉',
        '支持杰伦！',
        '太好听了，循环播放中',
        '歌词写得真好',
        '旋律很动人',
        '喜欢这种风格的音乐',
        '百听不厌'
      ]
      const devices = ['iPhone', 'Android', 'iPad', 'PC', 'Mac']
      
      for (let i = 1; i <= 200; i++) {
        const user = users[Math.floor(Math.random() * users.length)]
        const content = contents[Math.floor(Math.random() * contents.length)]
        const device = devices[Math.floor(Math.random() * devices.length)]
        const hasImage = Math.random() > 0.7
        
        comments.push({
          id: i,
          userId: user.id,
          userName: user.name,
          avatar: user.avatar,
          content: hasImage ? `${content} <img src="https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg" alt="评论图片" class="comment-image">` : content,
          likeCount: Math.floor(Math.random() * 1000) + 10,
          replyCount: Math.floor(Math.random() * 50),
          time: this.generateRandomTime(),
          device: device,
          isLiked: Math.random() > 0.8,
          isTop: i <= 5,
          hasImage: hasImage
        })
      }
      
      this.comments = comments
      this.filteredComments = [...comments]
      this.sortComments()
    },
    // 生成随机时间
    generateRandomTime() {
      const now = new Date()
      const randomMinutes = Math.floor(Math.random() * 7 * 24 * 60)
      const randomTime = new Date(now.getTime() - randomMinutes * 60 * 1000)
      
      const diffMinutes = Math.floor((now - randomTime) / (1000 * 60))
      if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`
      } else if (diffMinutes < 24 * 60) {
        return `${Math.floor(diffMinutes / 60)}小时前`
      } else if (diffMinutes < 7 * 24 * 60) {
        return `${Math.floor(diffMinutes / (60 * 24))}天前`
      } else {
        return randomTime.toLocaleDateString()
      }
    },
    // 切换播放状态
    togglePlay() {
      this.isPlaying = !this.isPlaying
      // 这里可以添加实际的播放逻辑
    },
    // 切换评论可见性
    toggleCommentVisibility() {
      this.commentVisible = !this.commentVisible
      // 更新URL参数
      this.updateCommentVisibilityUrl()
    },
    // 从URL参数获取评论可见性状态
    getCommentVisibilityFromUrl() {
      const queryParams = new URLSearchParams(window.location.search)
      const commentVisibleParam = queryParams.get('commentVisible')
      if (commentVisibleParam !== null) {
        this.commentVisible = commentVisibleParam === 'true'
      }
    },
    // 更新URL参数
    updateCommentVisibilityUrl() {
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set('commentVisible', this.commentVisible.toString())
      window.history.replaceState({}, '', `${window.location.pathname}?${queryParams}`)
    },
    // 排序方式改变
    onSortChange() {
      this.sortComments()
    },
    // 点赞数范围改变
    onLikeRangeChange() {
      this.filterComments()
    },
    // 筛选评论
    filterComments() {
      this.filteredComments = this.comments.filter(comment => {
        const matchesLikeRange = comment.likeCount >= this.likeRange[0] && comment.likeCount <= this.likeRange[1]
        const matchesSortType = this.sortType === 'pic' ? comment.hasImage : true
        return matchesLikeRange && matchesSortType
      })
      this.sortComments()
    },
    // 排序评论
    sortComments() {
      switch (this.sortType) {
        case 'latest':
          this.filteredComments.sort((a, b) => {
            const timeA = this.parseCommentTime(a.time)
            const timeB = this.parseCommentTime(b.time)
            return timeB - timeA
          })
          break
        case 'hot':
          this.filteredComments.sort((a, b) => b.likeCount - a.likeCount)
          break
        case 'pic':
          this.filteredComments.sort((a, b) => {
            const timeA = this.parseCommentTime(a.time)
            const timeB = this.parseCommentTime(b.time)
            return timeB - timeA
          })
          break
      }
      // 确保置顶评论在最前面
      this.filteredComments.sort((a, b) => b.isTop - a.isTop)
    },
    // 解析评论时间
    parseCommentTime(timeStr) {
      const now = new Date()
      const match = timeStr.match(/(\d+)(分钟|小时|天)前/)
      
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2]
        
        switch (unit) {
          case '分钟':
            return now.getTime() - value * 60 * 1000
          case '小时':
            return now.getTime() - value * 60 * 60 * 1000
          case '天':
            return now.getTime() - value * 24 * 60 * 60 * 1000
        }
      } else {
        return new Date(timeStr).getTime()
      }
    },
    // 切换点赞状态
    toggleLike(comment) {
      comment.isLiked = !comment.isLiked
      comment.likeCount += comment.isLiked ? 1 : -1
    },
    // 回复评论
    replyToComment(comment) {
      this.replyCommentId = comment.id
      this.replyContent = `@${comment.userName} `
      this.$nextTick(() => {
        const replyInput = document.querySelector('.reply-box .el-input__inner')
        if (replyInput) {
          replyInput.focus()
          replyInput.setSelectionRange(this.replyContent.length, this.replyContent.length)
        }
      })
    },
    // 取消回复
    cancelReply() {
      this.replyCommentId = null
      this.replyContent = ''
      this.showAtUserList = false
    },
    // 提交回复
    submitReply() {
      if (!this.replyContent.trim()) return
      
      // 模拟提交回复
      const replyComment = this.comments.find(comment => comment.id === this.replyCommentId)
      if (replyComment) {
        replyComment.replyCount += 1
      }
      
      // 清空回复框
      this.cancelReply()
      
      // 提示成功
      this.$message.success('回复成功')
    },
    // 删除评论
    deleteComment(comment) {
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除评论
        const index = this.comments.findIndex(c => c.id === comment.id)
        if (index !== -1) {
          this.comments.splice(index, 1)
          this.filterComments()
        }
        
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 切换置顶状态
    toggleTop(comment) {
      comment.isTop = !comment.isTop
      this.sortComments()
      this.$message.success(comment.isTop ? '置顶成功' : '取消置顶成功')
    },
    // 页码改变
    onPageChange() {
      // 这里可以添加分页加载逻辑
      // 由于是模拟数据，暂时不需要实际加载
    },
    // 评论输入框聚焦
    onCommentFocus() {
      this.showEmojiPicker = false
    },
    // 评论输入框输入
    onCommentInput() {
      // 防抖处理
      clearTimeout(this.commentInputTimer)
      this.commentInputTimer = setTimeout(() => {
        // 保存草稿
        this.saveDraft()
        // 检测@用户
        this.detectAtUser()
      }, 300)
    },
    // 回复框聚焦
    onReplyFocus() {
      this.showEmojiPicker = false
    },
    // 检测@用户
    detectAtUser() {
      const content = this.replyCommentId ? this.replyContent : this.newCommentContent
      const atIndex = content.lastIndexOf('@')
      
      if (atIndex !== -1 && atIndex < content.length - 1) {
        const searchText = content.slice(atIndex + 1)
        if (searchText.length > 0) {
          // 模拟搜索用户
          this.atUserSuggestions = this.comments
            .filter(comment => comment.userName.includes(searchText))
            .map(comment => ({ id: comment.userId, userName: comment.userName, avatar: comment.avatar }))
            .slice(0, 5)
          this.showAtUserList = true
        } else {
          this.showAtUserList = false
        }
      } else {
        this.showAtUserList = false
      }
    },
    // @用户
    atUser() {
      const content = this.replyCommentId ? this.replyContent : this.newCommentContent
      const cursorPosition = this.getCursorPosition()
      
      // 在光标位置插入@
      this.newCommentContent = content.slice(0, cursorPosition) + '@' + content.slice(cursorPosition)
      
      this.$nextTick(() => {
        this.setCursorPosition(cursorPosition + 1)
        this.detectAtUser()
      })
    },
    // 获取光标位置
    getCursorPosition() {
      const input = document.querySelector('.comment-input-section .el-input__inner')
      if (input) {
        return input.selectionStart
      }
      return this.newCommentContent.length
    },
    // 设置光标位置
    setCursorPosition(position) {
      const input = document.querySelector('.comment-input-section .el-input__inner')
      if (input) {
        input.focus()
        input.setSelectionRange(position, position)
      }
    },
    // 选择@用户
    selectAtUser(user) {
      const content = this.replyCommentId ? this.replyContent : this.newCommentContent
      const atIndex = content.lastIndexOf('@')
      
      if (atIndex !== -1) {
        const newContent = content.slice(0, atIndex) + `@${user.userName} ` + content.slice(atIndex + 1)
        
        if (this.replyCommentId) {
          this.replyContent = newContent
        } else {
          this.newCommentContent = newContent
        }
      }
      
      this.showAtUserList = false
      this.saveDraft()
    },
    // 插入表情
    insertEmoji() {
      this.showEmojiPicker = !this.showEmojiPicker
      this.showAtUserList = false
    },
    // 插入表情到评论
    insertEmojiToComment(emoji) {
      const content = this.replyCommentId ? this.replyContent : this.newCommentContent
      const cursorPosition = this.getCursorPosition()
      
      // 在光标位置插入表情
      const newContent = content.slice(0, cursorPosition) + emoji.symbol + content.slice(cursorPosition)
      
      if (this.replyCommentId) {
        this.replyContent = newContent
      } else {
        this.newCommentContent = newContent
      }
      
      this.setCursorPosition(cursorPosition + emoji.symbol.length)
      this.showEmojiPicker = false
      this.saveDraft()
    },
    // 提交评论
    submitComment() {
      if (!this.newCommentContent.trim()) return
      
      // 模拟提交评论
      const newComment = {
        id: this.comments.length + 1,
        userId: this.currentUser.id,
        userName: this.currentUser.userName,
        avatar: this.currentUser.avatar,
        content: this.newCommentContent,
        likeCount: 0,
        replyCount: 0,
        time: '刚刚',
        device: 'PC',
        isLiked: false,
        isTop: false,
        hasImage: this.newCommentContent.includes('<img')
      }
      
      this.comments.unshift(newComment)
      this.filterComments()
      
      // 清空评论框
      this.newCommentContent = ''
      // 清除草稿
      this.clearDraft()
      
      // 提示成功
      this.$message.success('评论成功')
    },
    // 保存草稿
    saveDraft() {
      if (this.newCommentContent.trim()) {
        localStorage.setItem('commentDraft', this.newCommentContent)
      } else {
        this.clearDraft()
      }
    },
    // 清除草稿
    clearDraft() {
      localStorage.removeItem('commentDraft')
      this.showDraftTip = false
    },
    // 检查草稿
    checkDraft() {
      this.draftContent = localStorage.getItem('commentDraft') || ''
      if (this.draftContent.trim()) {
        this.showDraftTip = true
      }
    },
    // 恢复草稿
    restoreDraft() {
      this.newCommentContent = this.draftContent
      this.showDraftTip = false
      this.$message.success('草稿已恢复')
    },
    // 放弃草稿
    discardDraft() {
      this.clearDraft()
      this.$message.info('草稿已放弃')
    },
    // 切换数据看板
    toggleDataBoard() {
      this.dataBoardVisible = !this.dataBoardVisible
      this.$nextTick(() => {
        this.resizeCharts()
      })
    },
    // 趋势时间范围改变
    onTrendTimeRangeChange() {
      this.updateCommentTrendChart()
    },
    // 初始化图表
    initCharts() {
      // 初始化评论增长趋势图表
      this.commentTrendChart = echarts.init(this.$refs.commentTrendChart)
      this.updateCommentTrendChart()
      
      // 初始化用户评论设备占比图表
      this.deviceDistributionChart = echarts.init(this.$refs.deviceDistributionChart)
      this.updateDeviceDistributionChart()
      
      // 初始化热门评论词云
      this.wordCloudChart = echarts.init(this.$refs.wordCloudChart)
      this.updateWordCloudChart()
    },
    // 更新评论增长趋势图表
    updateCommentTrendChart() {
      const data = this.generateTrendData()
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}条'
        },
        xAxis: {
          type: 'category',
          data: data.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '评论数',
            data: data.yAxis,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#ff2a2a'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 42, 42, 0.3)' },
                { offset: 1, color: 'rgba(255, 42, 42, 0.05)' }
              ])
            }
          }
        ]
      }
      
      this.commentTrendChart.setOption(option)
    },
    // 生成趋势数据
    generateTrendData() {
      const xAxis = []
      const yAxis = []
      
      if (this.trendTimeRange === '24h') {
        // 24小时数据
        for (let i = 23; i >= 0; i--) {
          xAxis.push(`${i}时`)
          yAxis.push(Math.floor(Math.random() * 50) + 10)
        }
      } else {
        // 7天数据
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const today = new Date().getDay()
        
        for (let i = 6; i >= 0; i--) {
          const dayIndex = (today - i + 7) % 7
          xAxis.push(days[dayIndex])
          yAxis.push(Math.floor(Math.random() * 200) + 50)
        }
      }
      
      return { xAxis, yAxis }
    },
    // 更新用户评论设备占比图表
    updateDeviceDistributionChart() {
      const deviceData = this.generateDeviceData()
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '设备分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: deviceData
          }
        ]
      }
      
      this.deviceDistributionChart.setOption(option)
    },
    // 生成设备数据
    generateDeviceData() {
      const deviceCounts = {
        iPhone: 0,
        Android: 0,
        iPad: 0,
        PC: 0,
        Mac: 0
      }
      
      this.comments.forEach(comment => {
        if (deviceCounts.hasOwnProperty(comment.device)) {
          deviceCounts[comment.device]++
        }
      })
      
      return Object.entries(deviceCounts).map(([name, value]) => ({
        value,
        name
      }))
    },
    // 更新热门评论词云
    updateWordCloudChart() {
      const wordCloudData = this.generateWordCloudData()
      
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            right: null,
            bottom: null,
            sizeRange: [12, 60],
            rotationRange: [-90, 90],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
              color: function () {
                return 'rgb(' + [
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 160)
                ].join(',') + ')'
              }
            },
            emphasis: {
              focus: 'self',
              textStyle: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: wordCloudData
          }
        ]
      }
      
      this.wordCloudChart.setOption(option)
      
      // 添加点击事件
      this.wordCloudChart.off('click')
      this.wordCloudChart.on('click', (params) => {
        // 点击词云跳转到对应评论筛选
        this.filterCommentsByKeyword(params.name)
      })
    },
    // 生成词云数据
    generateWordCloudData() {
      const wordCounts = {}
      const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']
      
      this.comments.forEach(comment => {
        // 提取纯文本内容
        const text = comment.content.replace(/<[^>]*>/g, '')
        // 分割成单词
        const words = text.split(/\s+/)
        
        words.forEach(word => {
          // 过滤停用词和短词
          if (word.length > 1 && !stopWords.includes(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1
          }
        })
      })
      
      // 转换为词云数据格式
      return Object.entries(wordCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50)
    },
    // 按关键词筛选评论
    filterCommentsByKeyword(keyword) {
      this.filteredComments = this.comments.filter(comment => {
        const text = comment.content.replace(/<[^>]*>/g, '')
        return text.includes(keyword)
      })
      this.sortComments()
      
      this.$message.info(`已筛选出包含"${keyword}"的评论`)
    },
    // 导出数据
    exportData() {
      // 模拟导出Excel
      this.$message.success('数据导出成功')
    },
    // 处理窗口大小变化
    handleResize() {
      this.resizeCharts()
    },
    // 调整图表大小
    resizeCharts() {
      if (this.commentTrendChart) {
        this.commentTrendChart.resize()
      }
      if (this.deviceDistributionChart) {
        this.deviceDistributionChart.resize()
      }
      if (this.wordCloudChart) {
        this.wordCloudChart.resize()
      }
    },
    // 处理网络在线
    handleOnline() {
      this.$message.success('网络已连接')
    },
    // 处理网络离线
    handleOffline() {
      this.$message.warning('网络已断开，评论草稿将自动保存')
    }
  }
}
</script>

<style scoped>
.music-comment-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  margin-left: 200px; /* 匹配侧边栏宽度 */
  transition: margin-left 0.3s;
}

/* 顶部歌曲信息区 */
.song-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.song-cover {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 20px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.play-pause-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.play-pause-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.play-pause-btn i {
  color: #fff;
  font-size: 20px;
}

.song-details {
  flex: 1;
  margin-right: 20px;
}

.song-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.song-artist {
  font-size: 16px;
  color: #666;
}

.comment-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.comment-count {
  font-size: 16px;
  color: #ff2a2a;
  margin-bottom: 8px;
}

/* 中间评论管理区 */
.comment-management-section {
  flex: 1;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-bar .el-select {
  margin-right: 20px;
  min-width: 120px;
}

.like-filter {
  display: flex;
  align-items: center;
  flex: 1;
}

.like-filter span {
  margin: 0 10px;
  font-size: 14px;
  color: #666;
}

.like-filter .el-slider {
  flex: 1;
  margin: 0 10px;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-avatar {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-name {
  font-weight: bold;
  margin-right: 10px;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-right: 10px;
}

.top-tag {
  font-size: 12px;
  color: #ff2a2a;
  background-color: rgba(255, 42, 42, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  word-break: break-word;
}

.comment-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  margin-right: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.action-btn:hover {
  color: #ff2a2a;
}

.action-btn i {
  margin-right: 4px;
  font-size: 14px;
}

.reply-box {
  margin-top: 12px;
  margin-left: 65px;
}

.reply-box .el-input {
  margin-bottom: 8px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 右侧互动数据看板 */
.data-board-section {
  width: 350px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.data-board-section.collapsed {
  width: 60px;
}

.data-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.data-board-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.data-board-content {
  flex: 1;
  overflow-y: auto;
}

.chart-container {
  margin-bottom: 24px;
}

.chart-container h4 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.chart-container .el-select {
  margin-bottom: 12px;
  width: 120px;
}

#comment-trend-chart, #device-distribution-chart {
  height: 200px;
}

.word-cloud-container {
  margin-bottom: 24px;
}

#word-cloud-chart {
  height: 250px;
}

.export-btn-container {
  text-align: center;
}

/* 评论输入框 */
.comment-input-section {
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.comment-input-section .el-input {
  flex: 1;
}

/* @用户下拉列表 */
.at-user-list {
  position: absolute;
  top: 100%;
  left: 52px;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.at-user-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.at-user-item:hover {
  background-color: #f5f7fa;
}

.at-user-item img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
}

.at-user-item span {
  font-size: 14px;
  color: #333;
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  top: 100%;
  left: 52px;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 8px;
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  max-width: 300px;
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

/* 草稿恢复提示 */
.draft-tip {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  z-index: 1001;
}

.draft-tip span {
  margin-right: 12px;
  font-size: 14px;
  color: #333;
}

.draft-tip .el-button {
  margin-left: 8px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .music-comment-container {
    flex-direction: row;
  }
  
  .comment-management-section {
    margin-right: 20px;
    margin-bottom: 0;
  }
}

@media (max-width: 1200px) {
  .data-board-section {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s;
  }
  
  .data-board-section:not(.collapsed) {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .music-comment-container {
    margin-left: 0;
    padding: 10px;
  }
  
  .song-info-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .song-cover {
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
  }
  
  .song-title {
    font-size: 20px;
  }
  
  .song-artist {
    font-size: 14px;
  }
  
  .comment-stats {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-bar .el-select {
    margin-right: 0;
    margin-bottom: 12px;
    width: 100%;
  }
  
  .like-filter {
    width: 100%;
  }
  
  .comment-item {
    flex-direction: column;
  }
  
  .comment-avatar {
    margin-bottom: 12px;
  }
  
  .reply-box {
    margin-left: 0;
  }
  
  .data-board-section {
    width: 100%;
  }
}
</style>