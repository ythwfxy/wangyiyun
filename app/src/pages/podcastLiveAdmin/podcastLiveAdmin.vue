<template>
  <div class="podcast-live-admin">
    <!-- 顶部直播状态栏 -->
    <div class="top-status-bar">
      <div class="status-info">
        <span class="status-label">当前状态:</span>
        <span class="status-value" :class="currentStatus.class">{{ currentStatus.text }}</span>
      </div>
      <div class="stats-info">
        <span class="stat-item">累计观看: {{ totalViews }}</span>
        <span class="stat-item">实时在线: {{ currentOnline }}</span>
        <span class="stat-item">礼物收益: {{ giftIncome }} 元</span>
      </div>
      <div class="control-buttons">
        <el-button type="primary" :disabled="!canStart" @click="startLive">一键开播</el-button>
        <el-button type="warning" :disabled="!canPause" @click="pauseLive">暂停直播</el-button>
        <el-button type="danger" :disabled="!canEnd" @click="endLive">结束直播</el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧场次管理Tab -->
      <div class="left-tab-panel">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <el-tab-pane label="待开播场次" name="upcoming">
            <div class="tab-content">
              <el-button type="primary" icon="el-icon-plus" @click="createLive">创建场次</el-button>
              <el-table :data="upcomingLives" style="width: 100%">
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="startTime" label="开播时间" width="150"></el-table-column>
                <el-table-column prop="tags" label="标签" width="150">
                  <template slot-scope="scope">
                    <el-tag v-for="tag in scope.row.tags" :key="tag" size="small">{{ tag }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editLive(scope.row)">编辑</el-button>
                    <el-button type="success" size="small" @click="topLive(scope.row)">置顶</el-button>
                    <el-button type="danger" size="small" @click="deleteLive(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="直播中场次" name="live">
            <div class="tab-content">
              <el-table :data="liveLives" style="width: 100%">
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="currentOnline" label="实时在线" width="100"></el-table-column>
                <el-table-column prop="giftIncome" label="礼物收益" width="100"></el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button type="warning" size="small" @click="pauseLive(scope.row)">暂停</el-button>
                    <el-button type="danger" size="small" @click="endLive(scope.row)">结束</el-button>
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
                style="margin-bottom: 10px"
              ></el-date-picker>
              <el-table :data="historyLives" style="width: 100%">
                <el-table-column prop="title" label="场次标题" width="200"></el-table-column>
                <el-table-column prop="startTime" label="开播时间" width="150"></el-table-column>
                <el-table-column prop="endTime" label="结束时间" width="150"></el-table-column>
                <el-table-column prop="totalViews" label="总观看" width="100"></el-table-column>
                <el-table-column prop="peakOnline" label="峰值在线" width="100"></el-table-column>
                <el-table-column label="操作" width="200">
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="viewReplay(scope.row)">查看回放</el-button>
                    <el-button type="danger" size="small" @click="deleteHistoryLive(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中央实时监控区 -->
      <div class="central-monitor">
        <div v-if="activeTab === 'live'" class="live-monitor">
          <div class="chart-container">
            <h3>实时在线人数趋势</h3>
            <div id="onlineTrendChart" style="width: 100%; height: 300px"></div>
          </div>
          <div class="chart-container">
            <h3>观众地域分布</h3>
            <div id="regionChart" style="width: 100%; height: 300px"></div>
          </div>
          <div class="chart-container">
            <h3>礼物收益实时统计</h3>
            <div id="giftIncomeChart" style="width: 100%; height: 300px"></div>
          </div>
        </div>
        <div v-if="activeTab === 'history'" class="history-monitor">
          <div class="replay-container">
            <h3>直播回放</h3>
            <video controls style="width: 100%">
              <source src="#" type="video/mp4">
              您的浏览器不支持HTML5视频播放。
            </video>
          </div>
          <div class="data-summary">
            <h3>直播数据汇总</h3>
            <el-card>
              <div class="data-item">总观看: {{ selectedHistoryLive?.totalViews || 0 }}</div>
              <div class="data-item">峰值在线: {{ selectedHistoryLive?.peakOnline || 0 }}</div>
              <div class="data-item">平均停留时长: {{ selectedHistoryLive?.avgStayTime || 0 }} 分钟</div>
            </el-card>
          </div>
        </div>
        <div v-if="activeTab === 'upcoming'" class="upcoming-monitor">
          <h3>待开播场次排期表</h3>
          <el-timeline>
            <el-timeline-item v-for="live in upcomingLives" :key="live.id" :timestamp="live.startTime">
              <el-card>
                <h4>{{ live.title }}</h4>
                <p>标签: <el-tag v-for="tag in live.tags" :key="tag" size="small">{{ tag }}</el-tag></p>
                <p>倒计时: {{ live.countdown }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 右侧互动管理面板 -->
      <div class="right-interaction-panel">
        <div class="panel-section">
          <h3>实时评论/礼物弹幕</h3>
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <span class="comment-user">{{ comment.user }}:</span>
              <span class="comment-content">{{ comment.content }}</span>
              <el-button type="danger" size="mini" @click="deleteComment(comment)">删除</el-button>
              <el-button type="warning" size="mini" @click="banUser(comment.user)">禁言</el-button>
            </div>
          </div>
        </div>
        <div class="panel-section">
          <h3>观众列表</h3>
          <el-select v-model="audienceFilter" placeholder="筛选观众" style="width: 100%; margin-bottom: 10px">
            <el-option label="全部观众" value="all"></el-option>
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通观众" value="normal"></el-option>
            <el-option label="新观众" value="new"></el-option>
          </el-select>
          <div class="audience-list">
            <div v-for="audience in filteredAudiences" :key="audience.id" class="audience-item">
              <span class="audience-name">{{ audience.name }}</span>
              <span class="audience-level">Lv.{{ audience.level }}</span>
              <el-button type="primary" size="mini" @click="inviteMic(audience)">上麦邀请</el-button>
              <el-button type="danger" size="mini" @click="banUser(audience.name)">禁言</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑场次弹窗 -->
    <el-dialog title="创建直播场次" :visible.sync="createDialogVisible" width="500px">
      <el-form :model="liveForm" label-width="80px">
        <el-form-item label="场次标题">
          <el-input v-model="liveForm.title" placeholder="请输入场次标题"></el-input>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload action="#" :show-file-list="false" :before-upload="beforeUpload">
            <img v-if="liveForm.cover" :src="liveForm.cover" style="width: 200px; height: 112px; object-fit: cover; cursor: pointer">
            <div v-else style="width: 200px; height: 112px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer">
              <i class="el-icon-plus"></i> 上传封面
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="开播时间">
          <el-date-picker v-model="liveForm.startTime" type="datetime" placeholder="选择开播时间" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="liveForm.tags" multiple placeholder="请选择标签" style="width: 100%">
            <el-option label="音乐杂谈" value="音乐杂谈"></el-option>
            <el-option label="翻唱现场" value="翻唱现场"></el-option>
            <el-option label="原创音乐" value="原创音乐"></el-option>
            <el-option label="音乐教学" value="音乐教学"></el-option>
            <el-option label="乐器演奏" value="乐器演奏"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLive">保存</el-button>
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
      currentStatus: { text: '未开播', class: 'status-offline' },
      totalViews: 0,
      currentOnline: 0,
      giftIncome: 0,
      // Tab切换
      activeTab: 'upcoming',
      // 场次数据
      upcomingLives: [
        { id: 1, title: '音乐杂谈直播', startTime: '2025-11-27 19:00', tags: ['音乐杂谈'], countdown: '23小时59分钟' },
        { id: 2, title: '翻唱现场直播', startTime: '2025-11-28 20:00', tags: ['翻唱现场'], countdown: '47小时59分钟' }
      ],
      liveLives: [
        { id: 3, title: '正在直播的场次', currentOnline: 1234, giftIncome: 567.89 }
      ],
      historyLives: [
        { id: 4, title: '历史直播场次1', startTime: '2025-11-25 19:00', endTime: '2025-11-25 21:00', totalViews: 5000, peakOnline: 2000, avgStayTime: 45 },
        { id: 5, title: '历史直播场次2', startTime: '2025-11-26 20:00', endTime: '2025-11-26 22:30', totalViews: 8000, peakOnline: 3000, avgStayTime: 60 }
      ],
      // 评论和观众数据
      comments: [
        { id: 1, user: '观众1', content: '这个直播太棒了！' },
        { id: 2, user: '观众2', content: '支持主播！' },
        { id: 3, user: '观众3', content: '礼物走一波！' }
      ],
      audiences: [
        { id: 1, name: '观众1', level: 10, type: 'normal' },
        { id: 2, name: '观众2', level: 15, type: 'admin' },
        { id: 3, name: '观众3', level: 5, type: 'new' }
      ],
      audienceFilter: 'all',
      // 弹窗控制
      createDialogVisible: false,
      liveForm: {
        title: '',
        cover: '',
        startTime: '',
        tags: []
      },
      // 图表实例
      onlineTrendChart: null,
      regionChart: null,
      giftIncomeChart: null
    }
  },
  computed: {
    // 筛选后的观众列表
    filteredAudiences() {
      if (this.audienceFilter === 'all') return this.audiences
      return this.audiences.filter(audience => audience.type === this.audienceFilter)
    },
    // 直播控制按钮状态
    canStart() {
      return this.currentStatus.text === '未开播'
    },
    canPause() {
      return this.currentStatus.text === '直播中'
    },
    canEnd() {
      return this.currentStatus.text === '直播中'
    },
    // 选中的历史直播
    selectedHistoryLive() {
      return this.historyLives[0]
    }
  },
  mounted() {
    // 初始化图表
    this.initCharts()
    // 模拟实时数据刷新
    this.startRealTimeUpdate()
  },
  beforeDestroy() {
    // 销毁图表
    if (this.onlineTrendChart) this.onlineTrendChart.dispose()
    if (this.regionChart) this.regionChart.dispose()
    if (this.giftIncomeChart) this.giftIncomeChart.dispose()
  },
  methods: {
    // 初始化图表
    initCharts() {
      // 实时在线人数趋势图
      this.onlineTrendChart = echarts.init(document.getElementById('onlineTrendChart'))
      this.onlineTrendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['19:00', '19:01', '19:02', '19:03', '19:04', '19:05'] },
        yAxis: { type: 'value' },
        series: [{ data: [1000, 1200, 1500, 1300, 1400, 1600], type: 'line' }]
      })

      // 观众地域分布图
      this.regionChart = echarts.init(document.getElementById('regionChart'))
      this.regionChart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          name: '观众地域分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 335, name: '北京' },
            { value: 310, name: '上海' },
            { value: 234, name: '广州' },
            { value: 135, name: '深圳' },
            { value: 1548, name: '其他' }
          ]
        }]
      })

      // 礼物收益实时统计图
      this.giftIncomeChart = echarts.init(document.getElementById('giftIncomeChart'))
      this.giftIncomeChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['19:00', '19:01', '19:02', '19:03', '19:04', '19:05'] },
        yAxis: { type: 'value' },
        series: [{ data: [100, 200, 150, 300, 250, 400], type: 'bar' }]
      })
    },
    // 模拟实时数据刷新
    startRealTimeUpdate() {
      setInterval(() => {
        this.currentOnline = Math.floor(Math.random() * 1000) + 1000
        this.giftIncome = (Math.random() * 1000).toFixed(2)
      }, 5000)
    },
    // Tab切换处理
    handleTabClick(tab) {
      console.log('Tab clicked:', tab.name)
    },
    // 创建直播场次
    createLive() {
      this.createDialogVisible = true
      this.liveForm = { title: '', cover: '', startTime: '', tags: [] }
    },
    // 编辑直播场次
    editLive(live) {
      this.createDialogVisible = true
      this.liveForm = { ...live }
    },
    // 保存直播场次
    saveLive() {
      if (this.liveForm.id) {
        // 编辑现有场次
        const index = this.upcomingLives.findIndex(live => live.id === this.liveForm.id)
        if (index !== -1) this.upcomingLives[index] = { ...this.liveForm }
      } else {
        // 创建新场次
        this.upcomingLives.push({ ...this.liveForm, id: Date.now(), countdown: '23小时59分钟' })
      }
      this.createDialogVisible = false
    },
    // 置顶直播场次
    topLive(live) {
      const index = this.upcomingLives.findIndex(item => item.id === live.id)
      if (index !== -1) {
        const [removed] = this.upcomingLives.splice(index, 1)
        this.upcomingLives.unshift(removed)
      }
    },
    // 删除直播场次
    deleteLive(live) {
      this.$confirm('确定要删除该直播场次吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.upcomingLives.findIndex(item => item.id === live.id)
        if (index !== -1) this.upcomingLives.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    // 删除历史直播场次
    deleteHistoryLive(live) {
      this.$confirm('确定要删除该历史直播场次吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.historyLives.findIndex(item => item.id === live.id)
        if (index !== -1) this.historyLives.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    // 查看直播回放
    viewReplay(live) {
      console.log('View replay:', live)
    },
    // 开始直播
    startLive() {
      this.currentStatus = { text: '直播中', class: 'status-live' }
      this.$message.success('直播已开始')
    },
    // 暂停直播
    pauseLive(live) {
      this.currentStatus = { text: '已暂停', class: 'status-paused' }
      this.$message.warning('直播已暂停')
    },
    // 结束直播
    endLive(live) {
      this.$confirm('确定要结束直播吗？', '提示', { type: 'warning' }).then(() => {
        this.currentStatus = { text: '已结束', class: 'status-ended' }
        this.$message.success('直播已结束')
      }).catch(() => {})
    },
    // 删除评论
    deleteComment(comment) {
      const index = this.comments.findIndex(item => item.id === comment.id)
      if (index !== -1) this.comments.splice(index, 1)
      this.$message.success('评论已删除')
    },
    // 禁言用户
    banUser(user) {
      this.$confirm(`确定要禁言用户${user}吗？`, '提示', { type: 'warning' }).then(() => {
        this.$message.success(`用户${user}已禁言`)
      }).catch(() => {})
    },
    // 上麦邀请
    inviteMic(audience) {
      this.$confirm(`确定要邀请用户${audience.name}上麦吗？`, '提示', { type: 'info' }).then(() => {
        this.$message.success(`已邀请用户${audience.name}上麦`)
      }).catch(() => {})
    },
    // 上传封面前处理
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('请上传图片文件')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB')
        return false
      }
      // 模拟上传
      const reader = new FileReader()
      reader.onload = (e) => {
        this.liveForm.cover = e.target.result
      }
      reader.readAsDataURL(file)
      return false
    }
  }
}
</script>

<style scoped>
.podcast-live-admin {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部状态栏 */
.top-status-bar {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-info .status-value {
  font-weight: bold;
  margin-left: 10px;
}

.status-offline { color: #999; }
.status-live { color: #f56c6c; }
.status-paused { color: #e6a23c; }
.status-ended { color: #67c23a; }

.stats-info .stat-item {
  margin-right: 30px;
  font-size: 14px;
}

.control-buttons button {
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
  background-color: #f5f7fa;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.left-tab-panel .el-tabs__content {
  padding: 10px;
}

.tab-content .el-button {
  margin-bottom: 10px;
}

/* 中央监控区 */
.central-monitor {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  overflow-y: auto;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-container h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.replay-container video {
  margin-bottom: 20px;
}

.data-summary .data-item {
  margin-bottom: 10px;
  font-size: 14px;
}

/* 右侧互动面板 */
.right-interaction-panel {
  width: 350px;
  background-color: #f5f7fa;
  border-left: 1px solid #eee;
  overflow-y: auto;
  padding: 10px;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.comment-list .comment-item {
  margin-bottom: 10px;
  padding: 5px;
  background-color: #fff;
  border-radius: 4px;
}

.comment-item .comment-user {
  font-weight: bold;
  margin-right: 10px;
}

.comment-item button {
  margin-left: 10px;
}

.audience-list .audience-item {
  margin-bottom: 10px;
  padding: 5px;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audience-item .audience-name {
  font-weight: bold;
}

.audience-item .audience-level {
  color: #999;
  margin-right: 10px;
}
</style>