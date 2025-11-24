<template>
  <div class="music-comment-container">
    <!-- 顶部歌曲信息区 -->
    <div class="song-info-section">
      <div class="song-cover">
        <img :src="currentSong.cover" alt="歌曲封面" class="cover-img">
        <div class="play-btn" @click="togglePlay">
          <i :class="isPlaying ? 'el-icon-pause' : 'el-icon-play'" class="play-icon"></i>
        </div>
      </div>
      <div class="song-details">
        <h2 class="song-title">{{ currentSong.title }}</h2>
        <p class="song-artist">{{ currentSong.artist }}</p>
        <div class="comment-count">
          <i class="el-icon-chat-dot-round"></i>
          <span>{{ totalComments }}条评论</span>
        </div>
      </div>
    </div>

    <!-- 评论区控制按钮 -->
    <div class="comment-control">
      <el-button type="primary" @click="toggleCommentVisible">
        {{ commentVisible ? '收起评论区' : '展开评论区' }}
      </el-button>
    </div>

    <!-- 中间评论管理区和右侧数据看板 -->
    <div class="main-content" :class="{ 'comment-hidden': !commentVisible }">
      <!-- 评论管理区 -->
      <div class="comment-management-section">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="sortType" @change="handleSortChange">
            <el-radio label="latest">最新</el-radio>
            <el-radio label="hot">最热</el-radio>
            <el-radio label="image">带图评论</el-radio>
          </el-radio-group>
          <div class="like-filter">
            <span>点赞数：</span>
            <el-slider
              v-model="likeRange"
              :min="0"
              :max="1000"
              :step="10"
              range
              @change="handleLikeRangeChange"
            ></el-slider>
            <span>{{ likeRange[0] }}-{{ likeRange[1] }}</span>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-for="(comment, index) in filteredComments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <img :src="comment.avatar" alt="用户头像" class="avatar-img">
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="user-name">{{ comment.userName }}</span>
                <span class="publish-time">{{ comment.publishTime }}</span>
                <el-tag v-if="comment.isTop" type="danger" size="small">置顶</el-tag>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-images" v-if="comment.images && comment.images.length">
                <img v-for="(img, imgIndex) in comment.images" :key="imgIndex" :src="img" alt="评论图片" class="comment-img">
              </div>
              <div class="comment-actions">
                <span class="action-item" @click="handleLike(comment)">
                  <i :class="comment.isLiked ? 'el-icon-thumb-up-fill' : 'el-icon-thumb-up'" class="action-icon"></i>
                  {{ comment.likeCount }}
                </span>
                <span class="action-item" @click="handleReply(comment)">
                  <i class="el-icon-chat-line-round action-icon"></i>
                  {{ comment.replyCount }}
                </span>
                <span class="action-item" @click="handleTop(comment)">
                  <i class="el-icon-top action-icon"></i>
                  置顶
                </span>
                <span class="action-item" @click="handleDelete(comment)">
                  <i class="el-icon-delete action-icon"></i>
                  删除
                </span>
              </div>
              <!-- 回复框 -->
              <div class="reply-section" v-if="comment.showReplyBox">
                <el-input
                  v-model="comment.replyContent"
                  type="textarea"
                  placeholder="写下你的回复..."
                  :rows="2"
                  @keyup.enter.native="handleSubmitReply(comment)"
                ></el-input>
                <div class="reply-actions">
                  <el-button type="primary" size="small" @click="handleSubmitReply(comment)">发送</el-button>
                  <el-button size="small" @click="comment.showReplyBox = false">取消</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredComments.length"
          ></el-pagination>
        </div>

        <!-- 评论输入框 -->
        <div class="comment-input-section">
          <div class="user-avatar">
            <img src="@/assets/logo.jpg" alt="用户头像" class="avatar-img">
          </div>
          <div class="input-container">
            <el-input
              v-model="newCommentContent"
              type="textarea"
              placeholder="写下你的评论..."
              :rows="3"
              @keyup.enter.native="handleSubmitComment"
              @input="handleInput"
            ></el-input>
            <div class="input-actions">
              <el-button type="primary" @click="handleSubmitComment">发布评论</el-button>
              <el-button @click="showEmojiPicker = true">
                <i class="el-icon-smile"></i>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧互动数据看板 -->
      <div class="data-dashboard-section">
        <div class="dashboard-card">
          <h3>评论增长趋势</h3>
          <div class="chart-container">
            <div id="commentTrendChart" style="width: 100%; height: 250px;"></div>
          </div>
          <div class="chart-controls">
            <el-radio-group v-model="trendTimeRange" @change="updateCommentTrendChart">
              <el-radio label="24h">24小时</el-radio>
              <el-radio label="7d">7天</el-radio>
            </el-radio-group>
          </div>
        </div>

        <div class="dashboard-card">
          <h3>用户评论设备占比</h3>
          <div class="chart-container">
            <div id="deviceRatioChart" style="width: 100%; height: 250px;"></div>
          </div>
        </div>

        <div class="dashboard-card">
          <h3>热门评论词云</h3>
          <div class="word-cloud-container">
            <span
              v-for="(word, index) in wordCloudData"
              :key="index"
              class="word-cloud-item"
              :style="{ fontSize: `${word.size}px`, color: word.color }"
              @click="handleWordCloudClick(word.text)"
            >
              {{ word.text }}
            </span>
          </div>
        </div>

        <div class="dashboard-actions">
          <el-button type="success" @click="exportData">导出Excel</el-button>
        </div>
      </div>
    </div>

    <!-- 表情选择器 -->
    <el-dialog
      title="选择表情"
      :visible.sync="showEmojiPicker"
      width="30%"
      :show-close="false"
      :close-on-click-modal="true"
    >
      <div class="emoji-picker">
        <span
          v-for="(emoji, index) in emojiList"
          :key="index"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export default {
  name: 'MusicComment',
  data() {
    return {
      // 歌曲信息
      currentSong: {
        cover: '@/assets/logo.jpg',
        title: '默认歌曲',
        artist: '默认歌手'
      },
      isPlaying: false,
      totalComments: 200,

      // 评论区状态
      commentVisible: true,

      // 筛选条件
      sortType: 'latest',
      likeRange: [0, 1000],

      // 分页
      currentPage: 1,
      pageSize: 20,

      // 评论数据
      comments: [],

      // 新评论
      newCommentContent: '',

      // 表情选择器
      showEmojiPicker: false,
      emojiList: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],

      // 数据看板
      trendTimeRange: '24h',
      wordCloudData: [],

      // 防抖定时器
      debounceTimer: null
    }
  },
  computed: {
    filteredComments() {
      let filtered = [...this.comments]

      // 按点赞数筛选
      filtered = filtered.filter(comment => {
        return comment.likeCount >= this.likeRange[0] && comment.likeCount <= this.likeRange[1]
      })

      // 按类型筛选
      if (this.sortType === 'image') {
        filtered = filtered.filter(comment => comment.images && comment.images.length > 0)
      }

      // 排序
      if (this.sortType === 'latest') {
        filtered.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
      } else if (this.sortType === 'hot') {
        filtered.sort((a, b) => b.likeCount - a.likeCount)
      }

      return filtered
    },

    paginatedComments() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      return this.filteredComments.slice(startIndex, endIndex)
    }
  },
  mounted() {
    // 从URL参数获取评论区状态
    const commentVisibleParam = this.$route.query.commentVisible
    if (commentVisibleParam !== undefined) {
      this.commentVisible = commentVisibleParam === 'true'
    }

    // 初始化评论数据
    this.initComments()

    // 初始化图表
    this.initCharts()

    // 初始化词云
    this.initWordCloud()

    // 检查localStorage中的草稿
    this.checkDraft()

    // 监听网络状态
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  },
  beforeDestroy() {
    // 移除网络状态监听
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  },
  methods: {
    // 初始化评论数据
    initComments() {
      const mockComments = []
      for (let i = 1; i <= 200; i++) {
        mockComments.push({
          id: i,
          userName: `用户${i}`,
          avatar: `https://picsum.photos/seed/user${i}/40/40`,
          content: `这是第${i}条评论，测试音乐评论互动管理功能。`,
          likeCount: Math.floor(Math.random() * 1000),
          replyCount: Math.floor(Math.random() * 50),
          publishTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          isLiked: false,
          isTop: i <= 5,
          showReplyBox: false,
          replyContent: '',
          images: i % 10 === 0 ? [`https://picsum.photos/seed/comment${i}/200/200`] : []
        })
      }
      this.comments = mockComments
      this.totalComments = mockComments.length
    },

    // 初始化图表
    initCharts() {
      // 评论增长趋势图表
      this.commentTrendChart = echarts.init(document.getElementById('commentTrendChart'))
      this.updateCommentTrendChart()

      // 用户评论设备占比图表
      this.deviceRatioChart = echarts.init(document.getElementById('deviceRatioChart'))
      this.updateDeviceRatioChart()

      // 响应式调整
      window.addEventListener('resize', () => {
        this.commentTrendChart.resize()
        this.deviceRatioChart.resize()
      })
    },

    // 更新评论增长趋势图表
    updateCommentTrendChart() {
      const hours = this.trendTimeRange === '24h' ? 24 : 168
      const xAxisData = []
      const seriesData = []

      for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000)
        if (this.trendTimeRange === '24h') {
          xAxisData.push(`${time.getHours()}:00`)
        } else {
          const day = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][time.getDay()]
          xAxisData.push(`${day} ${time.getHours()}:00`)
        }
        seriesData.push(Math.floor(Math.random() * 20))
      }

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '评论数',
            type: 'line',
            stack: '总量',
            data: seriesData,
            areaStyle: {}
          }
        ]
      }

      this.commentTrendChart.setOption(option)
    },

    // 更新用户评论设备占比图表
    updateDeviceRatioChart() {
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 40, name: '手机' },
              { value: 30, name: '电脑' },
              { value: 20, name: '平板' },
              { value: 10, name: '其他' }
            ]
          }
        ]
      }

      this.deviceRatioChart.setOption(option)
    },

    // 初始化词云
    initWordCloud() {
      const words = ['好听', '喜欢', '支持', '太棒了', '音乐', '歌手', '旋律', '歌词', '情感', '回忆', '经典', '流行', '摇滚', '民谣', '电子', '节奏', '和声', '编曲', '制作', '演唱', '现场', '专辑', '单曲', 'MV', '排行榜', '推荐', '分享', '收藏', '下载', '播放']
      this.wordCloudData = words.map(word => ({
        text: word,
        size: Math.floor(Math.random() * 20) + 12,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }))
    },

    // 切换播放状态
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },

    // 切换评论区可见性
    toggleCommentVisible() {
      this.commentVisible = !this.commentVisible
      // 更新URL参数
      this.$router.push({
        query: {
          ...this.$route.query,
          commentVisible: this.commentVisible
        }
      })
    },

    // 处理排序变化
    handleSortChange() {
      this.currentPage = 1
    },

    // 处理点赞数范围变化
    handleLikeRangeChange() {
      this.currentPage = 1
    },

    // 处理点赞
    handleLike(comment) {
      if (comment.isLiked) {
        comment.likeCount--
      } else {
        comment.likeCount++
      }
      comment.isLiked = !comment.isLiked
    },

    // 处理回复
    handleReply(comment) {
      comment.showReplyBox = true
      // 延迟聚焦回复框
      this.$nextTick(() => {
        const replyInput = document.querySelector(`.reply-section textarea`)
        if (replyInput) {
          replyInput.focus()
        }
      })
    },

    // 处理提交回复
    handleSubmitReply(comment) {
      if (!comment.replyContent.trim()) return

      // 模拟提交回复
      comment.replyCount++
      comment.replyContent = ''
      comment.showReplyBox = false

      this.$message.success('回复成功')
    },

    // 处理置顶
    handleTop(comment) {
      comment.isTop = !comment.isTop
      this.$message.success(comment.isTop ? '置顶成功' : '取消置顶成功')
    },

    // 处理删除评论
    handleDelete(comment) {
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.comments.indexOf(comment)
        if (index !== -1) {
          this.comments.splice(index, 1)
          this.totalComments--
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },

    // 处理当前页变化
    handleCurrentChange(page) {
      this.currentPage = page
    },

    // 处理评论输入
    handleInput() {
      // 防抖保存草稿
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        localStorage.setItem('commentDraft', this.newCommentContent)
      }, 300)
    },

    // 处理提交评论
    handleSubmitComment() {
      if (!this.newCommentContent.trim()) return

      // 模拟提交评论
      const newComment = {
        id: this.comments.length + 1,
        userName: '当前用户',
        avatar: '@/assets/images/default-avatar.png',
        content: this.newCommentContent,
        likeCount: 0,
        replyCount: 0,
        publishTime: new Date().toISOString(),
        isLiked: false,
        isTop: false,
        showReplyBox: false,
        replyContent: '',
        images: []
      }

      this.comments.unshift(newComment)
      this.totalComments++
      this.newCommentContent = ''
      this.currentPage = 1

      // 清除草稿
      localStorage.removeItem('commentDraft')

      this.$message.success('评论发布成功')
    },

    // 插入表情
    insertEmoji(emoji) {
      this.newCommentContent += emoji
      this.showEmojiPicker = false
    },

    // 处理词云点击
    handleWordCloudClick(word) {
      this.$message.info(`搜索包含"${word}"的评论`)
      // 这里可以添加搜索功能
    },

    // 导出数据
    exportData() {
      const worksheet = XLSX.utils.json_to_sheet(this.comments)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '评论数据')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(dataBlob, '音乐评论数据.xlsx')
    },

    // 检查草稿
    checkDraft() {
      const draft = localStorage.getItem('commentDraft')
      if (draft) {
        this.$confirm('检测到未保存的评论草稿，是否恢复？', '提示', {
          confirmButtonText: '恢复',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.newCommentContent = draft
        }).catch(() => {
          localStorage.removeItem('commentDraft')
        })
      }
    },

    // 处理网络在线
    handleOnline() {
      this.$message.success('网络连接已恢复')
    },

    // 处理网络离线
    handleOffline() {
      this.$message.warning('网络连接已断开，评论将自动保存为草稿')
    }
  }
}
</script>

<style scoped>
.music-comment-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部歌曲信息区 */
.song-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.song-cover {
  position: relative;
  margin-right: 20px;
}

.cover-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  color: #fff;
  font-size: 20px;
  margin-left: 2px;
}

.song-details {
  flex: 1;
}

.song-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.song-artist {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #666;
}

.comment-count {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.comment-count i {
  margin-right: 5px;
}

/* 评论区控制按钮 */
.comment-control {
  margin-bottom: 20px;
}

/* 主内容区 */
.main-content {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.main-content.comment-hidden {
  display: none;
}

/* 评论管理区 */
.comment-management-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.like-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 50%;
}

.like-filter span {
  font-size: 14px;
  color: #666;
}

/* 评论列表 */
.comment-list {
  margin-bottom: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #333;
}

.comment-images {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-img:hover {
  transform: scale(1.05);
}

.comment-actions {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #999;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.action-item:hover {
  color: #409eff;
}

.action-icon {
  font-size: 14px;
}

/* 回复区 */
.reply-section {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 评论输入区 */
.comment-input-section {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.user-avatar {
  flex-shrink: 0;
}

.input-container {
  flex: 1;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* 数据看板区 */
.data-dashboard-section {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.dashboard-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-container {
  margin-bottom: 15px;
}

.chart-controls {
  display: flex;
  justify-content: center;
}

/* 词云 */
.word-cloud-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.word-cloud-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.word-cloud-item:hover {
  transform: scale(1.1);
}

.dashboard-actions {
  display: flex;
  justify-content: center;
}

/* 表情选择器 */
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.emoji-item:hover {
  transform: scale(1.2);
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .data-dashboard-section {
    width: 350px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .data-dashboard-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .dashboard-card {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .music-comment-container {
    padding: 10px;
  }

  .song-info-section {
    flex-direction: column;
    text-align: center;
  }

  .song-cover {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .like-filter {
    width: 100%;
  }

  .data-dashboard-section {
    flex-direction: column;
  }

  .dashboard-card {
    min-width: auto;
  }
}
</style>