<template>
  <div class="musician-dashboard">
    <!-- 顶部数据概览栏 -->
    <div class="overview-bar">
      <div class="overview-item" @click="goToDetail('playCount')">
        <div class="overview-value">{{ totalPlayCount }}</div>
        <div class="overview-label">总播放量</div>
        <div class="overview-trend" :class="playCountTrend > 0 ? 'up' : 'down'">
          {{ playCountTrend > 0 ? '+' : '' }}{{ playCountTrend }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('newFans')">
        <div class="overview-value">{{ newFansCount }}</div>
        <div class="overview-label">新增粉丝数</div>
        <div class="overview-trend" :class="newFansTrend > 0 ? 'up' : 'down'">
          {{ newFansTrend > 0 ? '+' : '' }}{{ newFansTrend }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('revenue')">
        <div class="overview-value">¥{{ totalRevenue }}</div>
        <div class="overview-label">作品收益</div>
        <div class="overview-trend" :class="revenueTrend > 0 ? 'up' : 'down'">
          {{ revenueTrend > 0 ? '+' : '' }}{{ revenueTrend }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('weeklyPlay')">
        <div class="overview-value">{{ weeklyPlayCount }}</div>
        <div class="overview-label">本周播放</div>
        <div class="overview-trend" :class="weeklyPlayTrend > 0 ? 'up' : 'down'">
          {{ weeklyPlayTrend > 0 ? '+' : '' }}{{ weeklyPlayTrend }}%
        </div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧功能导航Tab -->
      <div class="left-tab">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <el-tab-pane label="作品数据" name="workData">
            <div class="tab-content">
              <!-- 作品数据内容 -->
              <div class="work-data-content">
                <div class="filter-section">
                  <el-select v-model="timeRange" placeholder="选择时间范围" @change="handleTimeRangeChange">
                    <el-option label="日" value="day"></el-option>
                    <el-option label="周" value="week"></el-option>
                    <el-option label="月" value="month"></el-option>
                  </el-select>
                  <el-input v-model="workFilter" placeholder="按作品名称筛选" style="width: 200px; margin-left: 10px;"></el-input>
                  <el-button type="primary" @click="exportExcel">导出Excel</el-button>
                </div>
                <div class="chart-section">
                  <div class="trend-chart" id="trendChart"></div>
                  <div class="pie-chart" id="pieChart"></div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="听众分析" name="audienceAnalysis">
            <div class="tab-content">
              <!-- 听众分析内容 -->
              <div class="audience-analysis-content">
                <div class="map-chart" id="mapChart"></div>
                <div class="demographic-charts">
                  <div class="age-chart" id="ageChart"></div>
                  <div class="gender-chart" id="genderChart"></div>
                  <div class="time-chart" id="timeChart"></div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="收益结算" name="revenueSettlement">
            <div class="tab-content">
              <!-- 收益结算内容 -->
              <div class="revenue-settlement-content">
                <div class="filter-section">
                  <el-select v-model="revenueType" placeholder="选择收益类型" @change="handleRevenueTypeChange">
                    <el-option label="播放收益" value="play"></el-option>
                    <el-option label="赞赏收益" value="reward"></el-option>
                    <el-option label="版权收益" value="copyright"></el-option>
                  </el-select>
                  <el-date-picker v-model="revenueDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="margin-left: 10px;"></el-date-picker>
                </div>
                <div class="revenue-details">
                  <el-table :data="revenueList" border>
                    <el-table-column prop="workName" label="作品名称"></el-table-column>
                    <el-table-column prop="revenueType" label="收益类型"></el-table-column>
                    <el-table-column prop="amount" label="金额"></el-table-column>
                    <el-table-column prop="date" label="日期"></el-table-column>
                  </el-table>
                </div>
                <div class="withdraw-section">
                  <el-button type="primary" :disabled="!isCertified" @click="showWithdrawDialog">提现申请</el-button>
                  <el-dialog title="提现申请" :visible.sync="withdrawDialogVisible" width="500px">
                    <el-form :model="withdrawForm" label-width="80px">
                      <el-form-item label="提现金额">
                        <el-input v-model="withdrawForm.amount" placeholder="请输入提现金额"></el-input>
                      </el-form-item>
                      <el-form-item label="提现账户">
                        <el-select v-model="withdrawForm.account" placeholder="选择提现账户">
                          <el-option label="支付宝" value="alipay"></el-option>
                          <el-option label="微信" value="wechat"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                      <el-button @click="withdrawDialogVisible = false">取消</el-button>
                      <el-button type="primary" @click="confirmWithdraw">确认提现</el-button>
                    </span>
                  </el-dialog>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="作品管理" name="workManagement">
            <div class="tab-content">
              <!-- 作品管理内容 -->
              <div class="work-management-content">
                <div class="filter-section">
                  <el-select v-model="workStatus" placeholder="选择作品状态" @change="handleWorkStatusChange">
                    <el-option label="全部" value="all"></el-option>
                    <el-option label="上架" value="online"></el-option>
                    <el-option label="下架" value="offline"></el-option>
                  </el-select>
                  <el-button type="primary" @click="batchOperation('offline')">批量下架</el-button>
                  <el-button type="primary" @click="batchOperation('copyright')">批量设置版权</el-button>
                </div>
                <div class="work-list">
                  <el-table :data="workList" border @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column prop="cover" label="封面">
                      <template slot-scope="scope">
                        <img :src="scope.row.cover" style="width: 50px; height: 50px; object-fit: cover;">
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="作品名称"></el-table-column>
                    <el-table-column prop="playCount" label="播放量"></el-table-column>
                    <el-table-column prop="status" label="状态">
                      <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
                          {{ scope.row.status === 'online' ? '上架' : '下架' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button size="small" @click="toggleWorkStatus(scope.row)">
                          {{ scope.row.status === 'online' ? '下架' : '上架' }}
                        </el-button>
                        <el-button size="small" @click="editWork(scope.row)">编辑</el-button>
                        <el-button size="small" @click="editCopyright(scope.row)">版权</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中央核心数据区 -->
      <div class="center-content">
        <!-- 中央内容将根据左侧Tab切换显示 -->
      </div>

      <!-- 右侧听众画像面板 -->
      <div class="right-panel">
        <div class="panel-title">听众画像</div>
        <div class="tag-list">
          <el-tag v-for="tag in audienceTags" :key="tag" @click="filterByTag(tag)">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'MusicianDashboard',
  data() {
    return {
      // 顶部概览数据
      totalPlayCount: '12,345,678',
      playCountTrend: 12.5,
      newFansCount: '4,567',
      newFansTrend: 8.2,
      totalRevenue: '123,456',
      revenueTrend: -2.1,
      weeklyPlayCount: '567,890',
      weeklyPlayTrend: 15.3,

      // 左侧Tab
      activeTab: 'workData',

      // 作品数据筛选
      timeRange: 'day',
      workFilter: '',

      // 收益结算筛选
      revenueType: 'play',
      revenueDateRange: null,
      isCertified: false, // 模拟未实名认证
      withdrawDialogVisible: false,
      withdrawForm: {
        amount: '',
        account: ''
      },

      // 作品管理筛选
      workStatus: 'all',
      selectedWorks: [],

      // 听众画像标签
      audienceTags: [
        '95后占比60%',
        '偏好深夜听歌',
        '一线城市占比45%',
        '喜欢流行音乐',
        '活跃用户占比30%'
      ],

      // 模拟数据
      revenueList: [
        { workName: '歌曲1', revenueType: '播放收益', amount: '1234', date: '2025-11-25' },
        { workName: '歌曲2', revenueType: '播放收益', amount: '5678', date: '2025-11-25' },
        { workName: '歌曲1', revenueType: '赞赏收益', amount: '901', date: '2025-11-24' }
      ],

      workList: [
        { id: 1, name: '歌曲1', cover: 'https://via.placeholder.com/100', playCount: '123,456', status: 'online' },
        { id: 2, name: '歌曲2', cover: 'https://via.placeholder.com/100', playCount: '789,012', status: 'online' },
        { id: 3, name: '歌曲3', cover: 'https://via.placeholder.com/100', playCount: '456,789', status: 'offline' }
      ]
    }
  },
  mounted() {
    // 初始化图表
    this.initCharts()
    // 模拟实时数据刷新
    this.startDataRefresh()
  },
  methods: {
    // 初始化图表
    initCharts() {
      // 播放量趋势图
      const trendChart = echarts.init(document.getElementById('trendChart'))
      const trendOption = {
        title: { text: '作品播放量趋势' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
        yAxis: { type: 'value' },
        series: [{ data: [120, 200, 150, 180, 220, 300, 250], type: 'line' }]
      }
      trendChart.setOption(trendOption)

      // 作品播放占比饼图
      const pieChart = echarts.init(document.getElementById('pieChart'))
      const pieOption = {
        title: { text: '各作品播放占比' },
        tooltip: { trigger: 'item' },
        series: [{
          name: '播放量',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 335, name: '歌曲1' },
            { value: 310, name: '歌曲2' },
            { value: 234, name: '歌曲3' },
            { value: 135, name: '歌曲4' },
            { value: 1548, name: '歌曲5' }
          ]
        }]
      }
      pieChart.setOption(pieOption)

      // 听众地域分布地图
      const mapChart = echarts.init(document.getElementById('mapChart'))
      const mapOption = {
        title: { text: '听众地域分布' },
        tooltip: { trigger: 'item' },
        series: [{
          name: '听众数',
          type: 'map',
          map: 'china',
          data: [
            { name: '北京', value: 1234 },
            { name: '上海', value: 5678 },
            { name: '广州', value: 9012 },
            { name: '深圳', value: 3456 },
            { name: '杭州', value: 7890 }
          ]
        }]
      }
      mapChart.setOption(mapOption)

      // 年龄分布图表
      const ageChart = echarts.init(document.getElementById('ageChart'))
      const ageOption = {
        title: { text: '年龄分布' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['18-24', '25-34', '35-44', '45-54', '55+'] },
        yAxis: { type: 'value' },
        series: [{ data: [30, 40, 20, 8, 2], type: 'bar' }]
      }
      ageChart.setOption(ageOption)

      // 性别分布图表
      const genderChart = echarts.init(document.getElementById('genderChart'))
      const genderOption = {
        title: { text: '性别分布' },
        tooltip: { trigger: 'item' },
        series: [{
          name: '性别',
          type: 'pie',
          data: [
            { value: 55, name: '男' },
            { value: 45, name: '女' }
          ]
        }]
      }
      genderChart.setOption(genderOption)

      // 听歌时段分布图表
      const timeChart = echarts.init(document.getElementById('timeChart'))
      const timeOption = {
        title: { text: '听歌时段分布' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['0-6', '6-12', '12-18', '18-24'] },
        yAxis: { type: 'value' },
        series: [{ data: [10, 30, 40, 20], type: 'bar' }]
      }
      timeChart.setOption(timeOption)

      // 响应式调整
      window.addEventListener('resize', () => {
        trendChart.resize()
        pieChart.resize()
        mapChart.resize()
        ageChart.resize()
        genderChart.resize()
        timeChart.resize()
      })
    },

    // 模拟实时数据刷新
    startDataRefresh() {
      setInterval(() => {
        // 模拟数据变化
        this.totalPlayCount = (parseInt(this.totalPlayCount.replace(/,/g, '')) + Math.floor(Math.random() * 1000)).toLocaleString()
        this.newFansCount = (parseInt(this.newFansCount.replace(/,/g, '')) + Math.floor(Math.random() * 100)).toLocaleString()
        this.totalRevenue = (parseInt(this.totalRevenue.replace(/,/g, '')) + Math.floor(Math.random() * 1000)).toLocaleString()
        this.weeklyPlayCount = (parseInt(this.weeklyPlayCount.replace(/,/g, '')) + Math.floor(Math.random() * 5000)).toLocaleString()
      }, 10000)
    },

    // 跳转到详情页
    goToDetail(type) {
      console.log('跳转到', type, '详情页')
    },

    // Tab切换处理
    handleTabClick(tab) {
      console.log('切换到Tab:', tab.name)
    },

    // 时间范围变化处理
    handleTimeRangeChange(value) {
      console.log('时间范围变化:', value)
    },

    // 导出Excel
    exportExcel() {
      console.log('导出Excel')
    },

    // 收益类型变化处理
    handleRevenueTypeChange(value) {
      console.log('收益类型变化:', value)
    },

    // 显示提现对话框
    showWithdrawDialog() {
      if (!this.isCertified) {
        this.$message.warning('请先完成实名认证')
        return
      }
      this.withdrawDialogVisible = true
    },

    // 确认提现
    confirmWithdraw() {
      console.log('提现申请:', this.withdrawForm)
      this.withdrawDialogVisible = false
      this.$message.success('提现申请已提交')
    },

    // 作品状态变化处理
    handleWorkStatusChange(value) {
      console.log('作品状态变化:', value)
    },

    // 批量操作
    batchOperation(type) {
      if (this.selectedWorks.length === 0) {
        this.$message.warning('请先选择作品')
        return
      }
      console.log('批量操作:', type, '作品:', this.selectedWorks)
    },

    // 选择作品变化处理
    handleSelectionChange(selection) {
      this.selectedWorks = selection
    },

    // 切换作品状态
    toggleWorkStatus(work) {
      work.status = work.status === 'online' ? 'offline' : 'online'
      console.log('切换作品状态:', work)
    },

    // 编辑作品
    editWork(work) {
      console.log('编辑作品:', work)
    },

    // 编辑版权
    editCopyright(work) {
      console.log('编辑版权:', work)
    },

    // 按标签筛选
    filterByTag(tag) {
      console.log('按标签筛选:', tag)
    }
  }
}
</script>

<style scoped>
.musician-dashboard {
  padding: 20px;
  margin-left: 250px; /* 匹配侧边栏宽度 */
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部数据概览栏 */
.overview-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.overview-item {
  flex: 1;
  margin-right: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.overview-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.overview-item:last-child {
  margin-right: 0;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.overview-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.overview-trend {
  font-size: 12px;
  font-weight: bold;
}

.overview-trend.up {
  color: #67c23a;
}

.overview-trend.down {
  color: #f56c6c;
}

/* 主体内容区 */
.main-content {
  display: flex;
  gap: 20px;
}

/* 左侧功能导航Tab */
.left-tab {
  width: 250px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 20px;
}

/* 中央核心数据区 */
.center-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 右侧听众画像面板 */
.right-panel {
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 作品数据内容 */
.work-data-content {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-section {
  display: flex;
  gap: 20px;
}

.trend-chart {
  flex: 2;
  height: 300px;
}

.pie-chart {
  flex: 1;
  height: 300px;
}

/* 听众分析内容 */
.audience-analysis-content {
  padding: 20px;
}

.map-chart {
  height: 400px;
  margin-bottom: 20px;
}

.demographic-charts {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.age-chart, .gender-chart, .time-chart {
  flex: 1;
  min-width: 200px;
  height: 200px;
}

/* 收益结算内容 */
.revenue-settlement-content {
  padding: 20px;
}

.revenue-details {
  margin-bottom: 20px;
}

/* 作品管理内容 */
.work-management-content {
  padding: 20px;
}

.work-list {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .right-panel {
    display: none;
  }

  .left-tab {
    width: 100%;
    margin-bottom: 20px;
  }

  .main-content {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .musician-dashboard {
    margin-left: 0;
    padding: 10px;
  }

  .overview-bar {
    flex-direction: column;
    gap: 10px;
  }

  .overview-item {
    margin-right: 0;
  }

  .chart-section {
    flex-direction: column;
  }

  .trend-chart, .pie-chart {
    width: 100%;
  }

  .demographic-charts {
    flex-direction: column;
  }

  .age-chart, .gender-chart, .time-chart {
    width: 100%;
  }
}
</style>