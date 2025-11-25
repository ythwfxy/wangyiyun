<template>
  <div class="podcast-live-admin">
    <!-- 顶部直播状态栏 -->
    <div class="top-status-bar">
      <div class="status-info">
        <span class="status-label">当前状态：</span>
        <span :class="['status-value', currentStatus]">{{ statusText }}</span>
      </div>
      <div class="data-info">
        <span class="data-item">累计观看人数：{{ totalViews }}</span>
        <span class="data-item">实时在线人数：{{ onlineUsers }}</span>
        <span class="data-item">礼物收益：¥{{ giftRevenue }}</span>
      </div>
      <div class="control-buttons">
        <el-button :disabled="isDisabled('start')" @click="handleStartLive" type="primary">一键开播</el-button>
        <el-button :disabled="isDisabled('pause')" @click="handlePauseLive" type="warning">暂停直播</el-button>
        <el-button :disabled="isDisabled('end')" @click="handleEndLive" type="danger">结束直播</el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧场次管理Tab -->
      <div class="left-tab-panel">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="待开播场次" name="upcoming">
            <div class="tab-content">
              <el-button type="primary" @click="handleCreateLive" style="margin-bottom: 16px;">创建场次</el-button>
              <el-table :data="upcomingLives" border>
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="startTime" label="开播时间" width="150"></el-table-column>
                <el-table-column prop="tags" label="标签" width="150">
                  <template slot-scope="scope">
                    <el-tag v-for="tag in scope.row.tags" :key="tag" size="small">{{ tag }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button size="small" @click="handleEditLive(scope.row)">编辑</el-button>
                    <el-button size="small" type="warning" @click="handleTopLive(scope.row)">置顶</el-button>
                    <el-button size="small" type="danger" @click="handleDeleteLive(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="直播中场次" name="live">
            <div class="tab-content">
              <el-table :data="liveLives" border>
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="startTime" label="开播时间" width="150"></el-table-column>
                <el-table-column prop="duration" label="直播时长" width="100"></el-table-column>
                <el-table-column label="操作" width="150">
                  <template slot-scope="scope">
                    <el-button size="small" @click="handleViewLive(scope.row)">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="历史场次" name="history">
            <div class="tab-content">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-bottom: 16px;">
              </el-date-picker>
              <el-table :data="historyLives" border>
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="startTime" label="开播时间" width="150"></el-table-column>
                <el-table-column prop="duration" label="直播时长" width="100"></el-table-column>
                <el-table-column prop="totalViews" label="总观看人数" width="120"></el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button size="small" @click="handleViewReplay(scope.row)">回放</el-button>
                    <el-button size="small" type="danger" @click="handleDeleteHistoryLive(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中央实时监控区 -->
      <div class="center-monitor-panel">
        <div v-if="activeTab === 'live'" class="monitor-content">
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="chart-container">
                <h3>实时在线人数趋势</h3>
                <div ref="onlineChart" class="chart"></div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <h3>观众地域分布</h3>
                <div ref="regionChart" class="chart"></div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="16" style="margin-top: 16px;">
            <el-col :span="24">
              <div class="chart-container">
                <h3>礼物收益实时统计</h3>
                <div ref="giftChart" class="chart"></div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-else-if="activeTab === 'history'" class="replay-content">
          <div v-if="selectedReplay" class="replay-player">
            <video controls width="100%" height="400px">
              <source :src="selectedReplay.url" type="video/mp4">
              您的浏览器不支持HTML5视频播放。
            </video>
            <div class="replay-info">
              <h3>{{ selectedReplay.title }}</h3>
              <p>总观看人数：{{ selectedReplay.totalViews }}</p>
              <p>峰值在线人数：{{ selectedReplay.peakOnline }}</p>
              <p>平均停留时长：{{ selectedReplay.avgStayTime }}</p>
              <el-button type="primary" @click="handleClipReplay">剪辑回放</el-button>
            </div>
          </div>
          <div v-else class="no-replay-selected">
            <p>请选择一个历史场次查看回放</p>
          </div>
        </div>
        <div v-else-if="activeTab === 'upcoming'" class="upcoming-content">
          <div class="schedule-table">
            <h3>场次排期表</h3>
            <el-timeline>
              <el-timeline-item v-for="(live, index) in upcomingLives" :key="live.id" :timestamp="live.startTime">
                <el-card>
                  <h4>{{ live.title }}</h4>
                  <p>标签：<el-tag v-for="tag in live.tags" :key="tag" size="small">{{ tag }}</el-tag></p>
                  <p>倒计时：{{ live.countdown }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>

      <!-- 右侧互动管理面板 -->
      <div class="right-interaction-panel">
        <el-tabs v-model="interactionTab" type="card">
          <el-tab-pane label="实时评论" name="comments">
            <div class="tab-content">
              <el-input v-model="commentFilter" placeholder="筛选评论" style="margin-bottom: 16px;"></el-input>
              <div class="comments-list" ref="commentsList">
                <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <img :src="comment.avatar" alt="头像" class="avatar">
                    <span class="username">{{ comment.username }}</span>
                    <span class="time">{{ comment.time }}</span>
                  </div>
                  <div class="comment-content">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <el-button size="mini" @click="handleBanUser(comment.userid)">禁言</el-button>
                    <el-button size="mini" type="danger" @click="handleDeleteComment(comment.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="观众列表" name="audience">
            <div class="tab-content">
              <el-select v-model="audienceFilter" placeholder="筛选观众类型" style="margin-bottom: 16px;">
                <el-option label="全部观众" value="all"></el-option>
                <el-option label="管理员" value="admin"></el-option>
                <el-option label="普通观众" value="normal"></el-option>
                <el-option label="新观众" value="new"></el-option>
              </el-select>
              <div class="audience-list" ref="audienceList">
                <div v-for="audience in filteredAudience" :key="audience.id" class="audience-item">
                  <img :src="audience.avatar" alt="头像" class="avatar">
                  <div class="audience-info">
                    <span class="username">{{ audience.username }}</span>
                    <span class="level">Lv.{{ audience.level }}</span>
                  </div>
                  <div class="audience-actions">
                    <el-button size="mini" @click="handleInviteMic(audience.id)">上麦邀请</el-button>
                    <el-button size="mini" @click="handleBanUser(audience.id)">禁言</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 创建/编辑场次弹窗 -->
    <el-dialog title="创建直播场次" :visible.sync="createDialogVisible" width="500px">
      <el-form :model="liveForm" label-width="80px">
        <el-form-item label="场次标题">
          <el-input v-model="liveForm.title" placeholder="请输入场次标题"></el-input>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload">
            <img v-if="liveForm.cover" :src="liveForm.cover" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="开播时间">
          <el-date-picker
            v-model="liveForm.startTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag v-for="tag in liveForm.tags" :key="tag" closable :disable-transitions="false"
            @close="handleTagClose(tag)">
            {{ tag }}
          </el-tag>
          <el-input
            v-if="liveForm.tags.length < 5"
            class="input-new-tag"
            v-model="inputTag"
            ref="saveTagInput"
            size="small"
            placeholder="输入标签"
            @keyup.enter.native="handleTagAdd"
            @blur="handleTagAdd">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveLive">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'PodcastLiveAdmin',
  data() {
    return {
      // 直播状态
      currentStatus: 'offline', // offline, live, paused, ended
      statusText: '未开播',
      totalViews: 0,
      onlineUsers: 0,
      giftRevenue: 0,
      
      // 标签页
      activeTab: 'upcoming',
      interactionTab: 'comments',
      
      // 场次数据
      upcomingLives: [
        { id: 1, title: '音乐杂谈直播', startTime: '2023-10-15 19:00:00', tags: ['音乐杂谈', '翻唱现场'], countdown: '2天3小时' },
        { id: 2, title: '新歌发布会', startTime: '2023-10-18 20:00:00', tags: ['新歌发布', '现场演唱'], countdown: '5天4小时' }
      ],
      liveLives: [
        { id: 3, title: '正在进行的直播', startTime: '2023-10-13 18:00:00', duration: '1小时30分' }
      ],
      historyLives: [
        { id: 4, title: '上周直播回放', startTime: '2023-10-08 19:00:00', duration: '2小时15分', totalViews: 1250 },
        { id: 5, title: '之前的直播', startTime: '2023-10-01 20:00:00', duration: '1小时45分', totalViews: 890 }
      ],
      
      // 日期范围
      dateRange: null,
      
      // 选中的回放
      selectedReplay: null,
      
      // 评论数据
      comments: [
        { id: 1, userid: 1001, username: '观众1', avatar: 'https://picsum.photos/40/40', content: '直播很棒！', time: '10:00' },
        { id: 2, userid: 1002, username: '观众2', avatar: 'https://picsum.photos/40/41', content: '支持主播！', time: '10:01' },
        { id: 3, userid: 1003, username: '观众3', avatar: 'https://picsum.photos/40/42', content: '这首歌很好听！', time: '10:02' }
      ],
      commentFilter: '',
      
      // 观众数据
      audience: [
        { id: 1001, username: '观众1', avatar: 'https://picsum.photos/40/40', level: 5, type: 'normal' },
        { id: 1002, username: '观众2', avatar: 'https://picsum.photos/40/41', level: 8, type: 'admin' },
        { id: 1003, username: '观众3', avatar: 'https://picsum.photos/40/42', level: 3, type: 'new' }
      ],
      audienceFilter: 'all',
      
      // 创建/编辑表单
      createDialogVisible: false,
      liveForm: {
        id: null,
        title: '',
        cover: '',
        startTime: '',
        tags: []
      },
      inputTag: ''
    }
  },
  computed: {
    filteredComments() {
      if (!this.commentFilter) return this.comments
      return this.comments.filter(comment => comment.content.includes(this.commentFilter))
    },
    filteredAudience() {
      if (this.audienceFilter === 'all') return this.audience
      return this.audience.filter(audience => audience.type === this.audienceFilter)
    }
  },
  mounted() {
    // 初始化图表
    this.initCharts()
    
    // 模拟实时数据更新
    this.startDataUpdate()
  },
  methods: {
    // 检查按钮是否禁用
    isDisabled(action) {
      if (action === 'start') return this.currentStatus !== 'offline'
      if (action === 'pause') return this.currentStatus !== 'live'
      if (action === 'end') return this.currentStatus !== 'live' && this.currentStatus !== 'paused'
      return false
    },
    
    // 处理开播
    handleStartLive() {
      this.currentStatus = 'live'
      this.statusText = '直播中'
      this.$message.success('直播已开始')
    },
    
    // 处理暂停直播
    handlePauseLive() {
      this.currentStatus = 'paused'
      this.statusText = '已暂停'
      this.$message.warning('直播已暂停')
    },
    
    // 处理结束直播
    handleEndLive() {
      this.currentStatus = 'ended'
      this.statusText = '已结束'
      this.$message.info('直播已结束')
    },
    
    // 处理创建直播
    handleCreateLive() {
      this.liveForm = { id: null, title: '', cover: '', startTime: '', tags: [] }
      this.createDialogVisible = true
    },
    
    // 处理编辑直播
    handleEditLive(live) {
      this.liveForm = JSON.parse(JSON.stringify(live))
      this.createDialogVisible = true
    },
    
    // 处理置顶直播
    handleTopLive(live) {
      const index = this.upcomingLives.findIndex(item => item.id === live.id)
      if (index > 0) {
        this.upcomingLives.splice(index, 1)
        this.upcomingLives.unshift(live)
        this.$message.success('场次已置顶')
      }
    },
    
    // 处理删除直播
    handleDeleteLive(live) {
      this.$confirm('确定要删除这个场次吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.upcomingLives.findIndex(item => item.id === live.id)
        if (index !== -1) {
          this.upcomingLives.splice(index, 1)
          this.$message.success('场次已删除')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 处理查看直播
    handleViewLive(live) {
      this.$message.info('查看直播详情')
    },
    
    // 处理查看回放
    handleViewReplay(live) {
      this.selectedReplay = {
        id: live.id,
        title: live.title,
        url: 'https://picsum.photos/800/450', // 模拟视频URL
        totalViews: live.totalViews,
        peakOnline: 500,
        avgStayTime: '45分钟'
      }
    },
    
    // 处理删除历史直播
    handleDeleteHistoryLive(live) {
      this.$confirm('确定要删除这个历史场次吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.historyLives.findIndex(item => item.id === live.id)
        if (index !== -1) {
          this.historyLives.splice(index, 1)
          this.$message.success('历史场次已删除')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 处理剪辑回放
    handleClipReplay() {
      this.$message.info('剪辑回放功能开发中')
    },
    
    // 处理禁言用户
    handleBanUser(userid) {
      this.$message.warning('用户已禁言')
    },
    
    // 处理删除评论
    handleDeleteComment(commentId) {
      const index = this.comments.findIndex(item => item.id === commentId)
      if (index !== -1) {
        this.comments.splice(index, 1)
        this.$message.success('评论已删除')
      }
    },
    
    // 处理上麦邀请
    handleInviteMic(audienceId) {
      this.$confirm('确定要邀请该观众上麦吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$message.success('上麦邀请已发送')
      }).catch(() => {
        this.$message.info('已取消邀请')
      })
    },
    
    // 上传封面之前的检查
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return false
      }
      // 模拟上传成功
      const reader = new FileReader()
      reader.onload = (e) => {
        this.liveForm.cover = e.target.result
      }
      reader.readAsDataURL(file)
      return false
    },
    
    // 处理标签添加
    handleTagAdd() {
      const inputTag = this.inputTag.trim()
      if (inputTag && this.liveForm.tags.indexOf(inputTag) === -1) {
        this.liveForm.tags.push(inputTag)
      }
      this.inputTag = ''
    },
    
    // 处理标签删除
    handleTagClose(tag) {
      const index = this.liveForm.tags.indexOf(tag)
      if (index !== -1) {
        this.liveForm.tags.splice(index, 1)
      }
    },
    
    // 处理保存直播
    handleSaveLive() {
      if (!this.liveForm.title || !this.liveForm.startTime) {
        this.$message.error('请填写必填项')
        return
      }
      
      if (this.liveForm.id) {
        // 编辑模式
        const index = this.upcomingLives.findIndex(item => item.id === this.liveForm.id)
        if (index !== -1) {
          this.upcomingLives[index] = JSON.parse(JSON.stringify(this.liveForm))
          this.$message.success('场次已更新')
        }
      } else {
        // 创建模式
        this.liveForm.id = Date.now()
        this.liveForm.countdown = '1天2小时'
        this.upcomingLives.push(JSON.parse(JSON.stringify(this.liveForm)))
        this.$message.success('场次已创建')
      }
      
      this.createDialogVisible = false
    },
    
    // 初始化图表
    initCharts() {
      // 实时在线人数趋势图
      this.onlineChart = echarts.init(this.$refs.onlineChart)
      this.onlineChartOption = {
        title: { text: '实时在线人数' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05'] },
        yAxis: { type: 'value' },
        series: [{ data: [120, 132, 101, 134, 90, 230], type: 'line' }]
      }
      this.onlineChart.setOption(this.onlineChartOption)
      
      // 观众地域分布图
      this.regionChart = echarts.init(this.$refs.regionChart)
      this.regionChartOption = {
        title: { text: '观众地域分布' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          { name: '观众数', type: 'pie', radius: '50%', data: [
            { value: 335, name: '北京' },
            { value: 310, name: '上海' },
            { value: 234, name: '广州' },
            { value: 135, name: '深圳' },
            { value: 1548, name: '其他' }
          ], emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }
        ]
      }
      this.regionChart.setOption(this.regionChartOption)
      
      // 礼物收益实时统计图
      this.giftChart = echarts.init(this.$refs.giftChart)
      this.giftChartOption = {
        title: { text: '礼物收益实时统计' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05'] },
        yAxis: { type: 'value' },
        series: [{ data: [120, 132, 101, 134, 90, 230], type: 'bar' }]
      }
      this.giftChart.setOption(this.giftChartOption)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        this.onlineChart.resize()
        this.regionChart.resize()
        this.giftChart.resize()
      })
    },
    
    // 模拟实时数据更新
    startDataUpdate() {
      setInterval(() => {
        // 更新在线人数
        this.onlineUsers = Math.floor(Math.random() * 1000) + 500
        
        // 更新礼物收益
        this.giftRevenue += Math.floor(Math.random() * 100)
        
        // 更新图表数据
        if (this.activeTab === 'live') {
          const now = new Date()
          const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
          
          // 更新在线人数趋势图
          this.onlineChartOption.xAxis.data.push(timeStr)
          this.onlineChartOption.series[0].data.push(Math.floor(Math.random() * 1000) + 500)
          if (this.onlineChartOption.xAxis.data.length > 10) {
            this.onlineChartOption.xAxis.data.shift()
            this.onlineChartOption.series[0].data.shift()
          }
          this.onlineChart.setOption(this.onlineChartOption)
          
          // 更新礼物收益统计图
          this.giftChartOption.xAxis.data.push(timeStr)
          this.giftChartOption.series[0].data.push(Math.floor(Math.random() * 100))
          if (this.giftChartOption.xAxis.data.length > 10) {
            this.giftChartOption.xAxis.data.shift()
            this.giftChartOption.series[0].data.shift()
          }
          this.giftChart.setOption(this.giftChartOption)
        }
      }, 5000)
    }
  }
}
</script>

<style scoped>
.podcast-live-admin {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: 250px; /* 匹配侧边栏宽度 */
}

/* 顶部状态栏 */
.top-status-bar {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-info {
  display: flex;
  align-items: center;
}

.status-label {
  font-weight: 500;
  margin-right: 10px;
}

.status-value {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-value.offline {
  background-color: #f5f5f5;
  color: #666;
}

.status-value.live {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-value.paused {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-value.ended {
  background-color: #f0f9ff;
  color: #67c23a;
}

.data-info {
  display: flex;
  align-items: center;
}

.data-item {
  margin-right: 30px;
  font-weight: 500;
}

.control-buttons {
  display: flex;
  align-items: center;
}

.control-buttons .el-button {
  margin-left: 10px;
}

/* 主要内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧Tab面板 */
.left-tab-panel {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.left-tab-panel .el-tabs__header {
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-content {
  padding: 16px;
}

/* 中央监控区 */
.center-monitor-panel {
  flex: 1;
  background-color: #f5f7fa;
  padding: 16px;
  overflow-y: auto;
}

.monitor-content .chart-container {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-container h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.chart {
  width: 100%;
  height: calc(100% - 40px);
}

.replay-content {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.no-replay-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.replay-player video {
  border-radius: 4px;
  margin-bottom: 16px;
}

.replay-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.replay-info p {
  margin: 8px 0;
  color: #666;
}

.upcoming-content {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.schedule-table h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

/* 右侧互动面板 */
.right-interaction-panel {
  width: 350px;
  background-color: #fff;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
}

.right-interaction-panel .el-tabs__header {
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.comments-list, .audience-list {
  max-height: 500px;
  overflow-y: auto;
}

.comment-item, .audience-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child, .audience-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-weight: 500;
  margin-right: 12px;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-bottom: 8px;
  line-height: 1.5;
}

.comment-actions, .audience-actions {
  display: flex;
  justify-content: flex-end;
}

.comment-actions .el-button, .audience-actions .el-button {
  margin-left: 8px;
}

.audience-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audience-info {
  flex: 1;
  margin-left: 8px;
}

.level {
  font-size: 12px;
  color: #999;
}

/* 上传封面样式 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .right-interaction-panel {
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .left-tab-panel {
    width: 250px;
  }
  
  .right-interaction-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .podcast-live-admin {
    margin-left: 0;
  }
  
  .top-status-bar {
    flex-direction: column;
    height: auto;
    padding: 10px;
    align-items: flex-start;
  }
  
  .status-info, .data-info, .control-buttons {
    margin-bottom: 10px;
  }
  
  .data-info .data-item {
    margin-right: 15px;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .left-tab-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .center-monitor-panel {
    flex: 1;
  }
}
</style>