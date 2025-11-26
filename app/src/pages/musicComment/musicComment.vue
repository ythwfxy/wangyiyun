<template>
  <div class="music-comment-container">
    <!-- 顶部歌曲信息区 -->
    <div class="song-info-section">
      <div class="song-info">
        <img :src="currentSong.cover" alt="歌曲封面" class="song-cover">
        <div class="song-details">
          <h2 class="song-title">{{ currentSong.title }}</h2>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
      </div>
      <div class="song-actions">
        <el-button @click="togglePlay" type="primary" icon="el-icon-video-play">
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <span class="comment-count">评论数: {{ commentCount }}</span>
      </div>
    </div>

    <!-- 中间评论管理区 -->
    <div class="comment-management-section" :class="{ 'collapsed': !commentVisible }">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="sortType" placeholder="排序方式" @change="onSortChange">
          <el-option label="最新" value="latest"></el-option>
          <el-option label="最热" value="hotest"></el-option>
          <el-option label="带图评论" value="withImage"></el-option>
        </el-select>
        <div class="like-filter">
          <span>点赞数范围: {{ likeRange[0] }} - {{ likeRange[1] }}</span>
          <el-slider v-model="likeRange" :min="0" :max="1000" range></el-slider>
        </div>
        <el-button @click="toggleCommentSection" type="default">
          {{ commentVisible ? '收起评论区' : '展开评论区' }}
        </el-button>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" v-if="commentVisible">
        <div class="comment-item" v-for="comment in paginatedComments" :key="comment.id">
          <img :src="comment.avatar" alt="用户头像" class="user-avatar">
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-nickname">{{ comment.nickname }}</span>
              <span class="comment-time">{{ comment.time }}</span>
              <el-tag v-if="comment.isTop" type="success" size="small">置顶</el-tag>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-actions">
              <el-button @click="likeComment(comment)" type="text" icon="el-icon-thumb">
                {{ comment.likeCount }}
              </el-button>
              <el-button @click="replyComment(comment)" type="text" icon="el-icon-chat-dot-round">
                {{ comment.replyCount }}
              </el-button>
              <el-button @click="deleteComment(comment)" type="text" icon="el-icon-delete" danger>
                删除
              </el-button>
              <el-button @click="topComment(comment)" type="text" icon="el-icon-top">
                {{ comment.isTop ? '取消置顶' : '置顶' }}
              </el-button>
            </div>
            <!-- 回复框 -->
            <div class="reply-box" v-if="comment.showReplyBox">
              <el-input
                v-model="comment.replyContent"
                placeholder="请输入回复内容"
                @keyup.enter.native="submitReply(comment)"
                ref="replyInput"
              ></el-input>
              <div class="reply-actions">
                <el-button @click="submitReply(comment)" type="primary" size="small">发送</el-button>
                <el-button @click="cancelReply(comment)" type="default" size="small">取消</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
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
      </div>
    </div>

    <!-- 右侧互动数据看板 -->
    <div class="interaction-dashboard" :class="{ 'collapsed': !dashboardVisible }">
      <div class="dashboard-header">
        <h3>互动数据看板</h3>
        <el-button @click="toggleDashboard" type="text" icon="el-icon-arrow-right">
          {{ dashboardVisible ? '收起' : '展开' }}
        </el-button>
      </div>
      <div class="dashboard-content" v-if="dashboardVisible">
        <!-- 评论增长趋势图表 -->
        <div class="chart-item">
          <h4>评论增长趋势</h4>
          <el-select v-model="trendTimeRange" placeholder="时间范围" @change="updateTrendChart">
            <el-option label="24小时" value="24h"></el-option>
            <el-option label="7天" value="7d"></el-option>
          </el-select>
          <div ref="trendChart" class="chart"></div>
        </div>

        <!-- 用户评论设备占比图表 -->
        <div class="chart-item">
          <h4>用户评论设备占比</h4>
          <div ref="deviceChart" class="chart"></div>
        </div>

        <!-- 热门评论词云 -->
        <div class="word-cloud-item">
          <h4>热门评论词云</h4>
          <div class="word-cloud">
            <span
              v-for="word in hotWords"
              :key="word.text"
              :style="{ fontSize: word.size + 'px', color: word.color }"
              @click="filterByWord(word.text)"
            >
              {{ word.text }}
            </span>
          </div>
        </div>

        <!-- 数据导出按钮 -->
        <div class="export-button">
          <el-button @click="exportData" type="primary" icon="el-icon-download">导出Excel</el-button>
        </div>
      </div>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-section" v-if="commentVisible">
      <el-input
        v-model="newComment"
        placeholder="请输入评论内容"
        @keyup.enter.native="submitComment"
        :disabled="!isLoggedIn"
      ></el-input>
      <div class="input-actions">
        <el-button @click="showEmojiPicker = true" type="text" icon="el-icon-smile"></el-button>
        <el-button @click="submitComment" type="primary" :disabled="!isLoggedIn || !newComment.trim()">
          发布评论
        </el-button>
      </div>
      <!-- 表情选择器 -->
      <el-popover
        v-model="showEmojiPicker"
        placement="top"
        width="300"
        trigger="click"
      >
        <div class="emoji-picker">
          <span
            v-for="emoji in emojis"
            :key="emoji"
            class="emoji-item"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </el-popover>
    </div>

    <!-- 二次确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="删除评论"
      :visible.sync="showDeleteDialog"
      @close="closeDeleteDialog"
    >
      <span>确定要删除这条评论吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete" danger>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import { export_json_to_excel } from '@/utils/excelExport'

export default {
  name: 'MusicComment',
  data() {
    return {
      // 当前歌曲信息
      currentSong: {
        cover: 'https://picsum.photos/200/200',
        title: '示例歌曲',
        artist: '示例歌手'
      },
      // 播放状态
      isPlaying: false,
      // 评论可见性
      commentVisible: true,
      // 数据看板可见性
      dashboardVisible: true,
      // 排序方式
      sortType: 'latest',
      // 点赞数范围
      likeRange: [0, 1000],
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      // 评论列表
      comments: [],
      // 新评论内容
      newComment: '',
      // 表情选择器可见性
      showEmojiPicker: false,
      // 常用表情
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
      // 删除弹窗可见性
      showDeleteDialog: false,
      // 当前要删除的评论
      currentDeleteComment: null,
      // 登录状态
      isLoggedIn: true,
      // 趋势图表时间范围
      trendTimeRange: '24h',
      // 热门评论词
      hotWords: [],
      // 趋势图表实例
      trendChartInstance: null,
      // 设备图表实例
      deviceChartInstance: null
    }
  },
  computed: {
    // 评论总数
    commentCount() {
      return this.comments.length
    },
    // 筛选后的评论
    filteredComments() {
      let filtered = [...this.comments]

      // 按排序方式筛选
      switch (this.sortType) {
        case 'latest':
          filtered.sort((a, b) => new Date(b.time) - new Date(a.time))
          break
        case 'hotest':
          filtered.sort((a, b) => b.likeCount - a.likeCount)
          break
        case 'withImage':
          filtered = filtered.filter(comment => comment.hasImage)
          break
      }

      // 按点赞数范围筛选
      filtered = filtered.filter(comment => {
        return comment.likeCount >= this.likeRange[0] && comment.likeCount <= this.likeRange[1]
      })

      return filtered
    },
    // 分页后的评论
    paginatedComments() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      return this.filteredComments.slice(startIndex, endIndex)
    }
  },
  mounted() {
    // 初始化评论数据
    this.initComments()
    // 初始化图表
    this.initCharts()
    // 检查URL参数中的评论可见性
    this.checkUrlParams()
    // 检查localStorage中的草稿
    this.checkDraft()
    // 监听网络状态
    this.listenNetworkStatus()
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.trendChartInstance) {
      this.trendChartInstance.dispose()
    }
    if (this.deviceChartInstance) {
      this.deviceChartInstance.dispose()
    }
  },
  methods: {
    // 初始化评论数据
    initComments() {
      // 模拟200条评论数据
      const comments = []
      const nicknames = ['用户1', '用户2', '用户3', '用户4', '用户5', '用户6', '用户7', '用户8', '用户9', '用户10']
      const contents = [
        '这首歌真好听！',
        '旋律很动人，歌词也很有意义。',
        '第一次听就爱上了，循环播放中。',
        '歌手的声音太好听了，支持！',
        '这首歌让我想起了很多往事。',
        '音乐制作很精良，点赞！',
        '强烈推荐给大家，真的很不错。',
        '听了这首歌心情都变好了。',
        '这首歌的MV也很好看。',
        '期待歌手的下一首作品。'
      ]
      const devices = ['iPhone', 'Android', 'iPad', 'MacBook', 'Windows PC']

      for (let i = 0; i < 200; i++) {
        comments.push({
          id: i + 1,
          avatar: `https://picsum.photos/50/50?random=${i}`,
          nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
          content: contents[Math.floor(Math.random() * contents.length)] + (Math.random() > 0.5 ? ' 👍' : ''),
          likeCount: Math.floor(Math.random() * 1000),
          replyCount: Math.floor(Math.random() * 50),
          time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
          isTop: Math.random() > 0.9,
          hasImage: Math.random() > 0.7,
          device: devices[Math.floor(Math.random() * devices.length)],
          showReplyBox: false,
          replyContent: ''
        })
      }

      this.comments = comments
      // 生成热门评论词
      this.generateHotWords()
    },
    // 生成热门评论词
    generateHotWords() {
      const wordCount = {}
      const stopWords = ['这首歌', '真的', '很好', '好听', '支持', '推荐', '循环', '播放', '心情', '往事', '声音', '旋律', '歌词', '意义', '制作', '精良', '期待', '作品', '很多', '想起', '爱上', '第一次', '强烈', '不错', '好看', 'MV']

      // 统计词频
      this.comments.forEach(comment => {
        const words = comment.content.split(/\s+/)
        words.forEach(word => {
          const cleanedWord = word.replace(/[^\w\u4e00-\u9fa5]/g, '').trim()
          if (cleanedWord && cleanedWord.length > 1 && !stopWords.includes(cleanedWord)) {
            wordCount[cleanedWord] = (wordCount[cleanedWord] || 0) + 1
          }
        })
      })

      // 转换为词云数据
      this.hotWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([text, count]) => ({
          text,
          size: 12 + count * 2,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }))
    },
    // 初始化图表
    initCharts() {
      // 初始化评论增长趋势图表
      this.trendChartInstance = echarts.init(this.$refs.trendChart)
      this.updateTrendChart()

      // 初始化用户评论设备占比图表
      this.deviceChartInstance = echarts.init(this.$refs.deviceChart)
      this.updateDeviceChart()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.trendChartInstance.resize()
        this.deviceChartInstance.resize()
      })
    },
    // 更新趋势图表
    updateTrendChart() {
      const hours = this.trendTimeRange === '24h' ? 24 : 168
      const xAxisData = []
      const seriesData = []

      for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000)
        xAxisData.push(this.trendTimeRange === '24h' ? time.getHours() + 'h' : time.toLocaleDateString())
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

      this.trendChartInstance.setOption(option)
    },
    // 更新设备图表
    updateDeviceChart() {
      const deviceCount = {
        iPhone: 0,
        Android: 0,
        iPad: 0,
        MacBook: 0,
        'Windows PC': 0
      }

      // 统计设备使用情况
      this.comments.forEach(comment => {
        deviceCount[comment.device]++
      })

      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: 0,
          left: 'center'
        },
        series: [
          {
            name: '设备占比',
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
            data: Object.entries(deviceCount).map(([name, value]) => ({
              value,
              name
            }))
          }
        ]
      }

      this.deviceChartInstance.setOption(option)
    },
    // 检查URL参数中的评论可见性
    checkUrlParams() {
      const params = new URLSearchParams(window.location.search)
      const commentVisible = params.get('commentVisible')
      if (commentVisible !== null) {
        this.commentVisible = commentVisible === 'true'
      }
    },
    // 更新URL参数
    updateUrlParams() {
      const params = new URLSearchParams(window.location.search)
      params.set('commentVisible', this.commentVisible.toString())
      window.history.replaceState(null, null, '?' + params.toString())
    },
    // 检查localStorage中的草稿
    checkDraft() {
      const draft = localStorage.getItem('musicCommentDraft')
      if (draft) {
        this.$confirm('检测到未发布的评论草稿，是否恢复？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.newComment = draft
        }).catch(() => {
          // 用户取消恢复，清除草稿
          localStorage.removeItem('musicCommentDraft')
        })
      }
    },
    // 监听网络状态
    listenNetworkStatus() {
      window.addEventListener('online', () => {
        this.$message.success('网络已连接')
      })

      window.addEventListener('offline', () => {
        this.$message.warning('网络已断开，评论草稿将自动保存')
      })

      // 监听评论输入框变化，自动保存草稿
      this.$watch('newComment', (newValue) => {
        if (!navigator.onLine) {
          localStorage.setItem('musicCommentDraft', newValue)
        } else {
          localStorage.removeItem('musicCommentDraft')
        }
      })
    },
    // 切换播放状态
    togglePlay() {
      this.isPlaying = !this.isPlaying
      this.$message.success(this.isPlaying ? '开始播放' : '暂停播放')
    },
    // 切换评论区可见性
    toggleCommentSection() {
      this.commentVisible = !this.commentVisible
      this.updateUrlParams()
    },
    // 切换数据看板可见性
    toggleDashboard() {
      this.dashboardVisible = !this.dashboardVisible
    },
    // 排序方式变化
    onSortChange() {
      this.currentPage = 1
    },
    // 点赞评论
    likeComment(comment) {
      comment.likeCount++
      this.$message.success('点赞成功')
    },
    // 回复评论
    replyComment(comment) {
      comment.showReplyBox = true
      this.$nextTick(() => {
        this.$refs.replyInput.focus()
      })
    },
    // 取消回复
    cancelReply(comment) {
      comment.showReplyBox = false
      comment.replyContent = ''
    },
    // 提交回复
    submitReply(comment) {
      if (!comment.replyContent.trim()) return

      // 模拟回复提交
      comment.replyCount++
      comment.showReplyBox = false
      comment.replyContent = ''
      this.$message.success('回复成功')
    },
    // 删除评论
    deleteComment(comment) {
      this.currentDeleteComment = comment
      this.showDeleteDialog = true
    },
    // 关闭删除弹窗
    closeDeleteDialog() {
      this.currentDeleteComment = null
    },
    // 确认删除
    confirmDelete() {
      if (this.currentDeleteComment) {
        const index = this.comments.indexOf(this.currentDeleteComment)
        if (index > -1) {
          this.comments.splice(index, 1)
          this.$message.success('删除成功')
        }
      }
      this.showDeleteDialog = false
      this.currentDeleteComment = null
    },
    // 置顶评论
    topComment(comment) {
      comment.isTop = !comment.isTop
      this.$message.success(comment.isTop ? '置顶成功' : '取消置顶成功')
    },
    // 提交评论
    submitComment() {
      if (!this.newComment.trim()) return

      // 模拟评论提交
      const newCommentObj = {
        id: this.comments.length + 1,
        avatar: 'https://picsum.photos/50/50?random=' + (this.comments.length + 1),
        nickname: '当前用户',
        content: this.newComment,
        likeCount: 0,
        replyCount: 0,
        time: new Date().toLocaleString(),
        isTop: false,
        hasImage: false,
        device: 'iPhone',
        showReplyBox: false,
        replyContent: ''
      }

      this.comments.unshift(newCommentObj)
      this.newComment = ''
      this.$message.success('评论发布成功')
      // 更新热门评论词
      this.generateHotWords()
    },
    // 插入表情
    insertEmoji(emoji) {
      this.newComment += emoji
      this.showEmojiPicker = false
    },
    // 按关键词筛选评论
    filterByWord(word) {
      // 这里可以实现按关键词筛选评论的功能
      this.$message.info(`筛选包含"${word}"的评论`)
    },
    // 导出数据
    exportData() {
      const header = ['ID', '用户昵称', '评论内容', '点赞数', '回复数', '发布时间', '是否置顶', '是否带图', '设备']
      const data = this.comments.map(comment => [
        comment.id,
        comment.nickname,
        comment.content,
        comment.likeCount,
        comment.replyCount,
        comment.time,
        comment.isTop ? '是' : '否',
        comment.hasImage ? '是' : '否',
        comment.device
      ])

      export_json_to_excel({ header, data, filename: '音乐评论数据.xlsx' })
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    // 当前页码变化
    handleCurrentChange(page) {
      this.currentPage = page
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
  gap: 20px;
}

/* 顶部歌曲信息区 */
.song-info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.song-cover {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.song-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.song-artist {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.comment-count {
  font-size: 16px;
  font-weight: bold;
  color: #304156;
}

/* 中间评论管理区 */
.comment-management-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.comment-management-section.collapsed {
  height: 0;
  padding: 0;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.like-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.user-nickname {
  font-weight: bold;
  color: #304156;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.reply-box {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 右侧互动数据看板 */
.interaction-dashboard {
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.interaction-dashboard.collapsed {
  width: 60px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.dashboard-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.dashboard-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-item h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.chart {
  width: 100%;
  height: 200px;
}

.word-cloud-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.word-cloud-item h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.word-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.word-cloud span {
  cursor: pointer;
  transition: all 0.3s;
}

.word-cloud span:hover {
  transform: scale(1.1);
}

.export-button {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 评论输入框 */
.comment-input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 表情选择器 */
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (min-width: 1600px) {
  .music-comment-container {
    flex-direction: row;
  }

  .comment-management-section {
    flex: 2;
  }

  .interaction-dashboard {
    flex: 1;
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  .music-comment-container {
    flex-direction: column;
  }

  .interaction-dashboard {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    z-index: 1000;
  }
}

@media (max-width: 768px) {
  .music-comment-container {
    padding: 10px;
  }

  .song-info-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .song-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .song-actions {
    width: 100%;
    justify-content: space-between;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .like-filter {
    width: 100%;
  }

  .comment-item {
    flex-direction: column;
  }

  .interaction-dashboard {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 250px;
    z-index: 1000;
  }

  .comment-management-section {
    margin-top: 80px;
  }
}
</style>