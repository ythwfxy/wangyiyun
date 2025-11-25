<template>
  <div class="musician-dashboard">
    <!-- 顶部数据概览栏 -->
    <div class="overview-bar">
      <div class="overview-item" @click="goToDetail('playCount')">
        <div class="overview-value">{{ totalPlayCount }}</div>
        <div class="overview-label">总播放量</div>
        <div class="overview-change" :class="{ positive: playCountChange > 0, negative: playCountChange < 0 }">
          {{ playCountChange > 0 ? '+' : '' }}{{ playCountChange }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('newFans')">
        <div class="overview-value">{{ newFansCount }}</div>
        <div class="overview-label">新增粉丝数</div>
        <div class="overview-change" :class="{ positive: newFansChange > 0, negative: newFansChange < 0 }">
          {{ newFansChange > 0 ? '+' : '' }}{{ newFansChange }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('revenue')">
        <div class="overview-value">¥{{ totalRevenue }}</div>
        <div class="overview-label">作品收益</div>
        <div class="overview-change" :class="{ positive: revenueChange > 0, negative: revenueChange < 0 }">
          {{ revenueChange > 0 ? '+' : '' }}{{ revenueChange }}%
        </div>
      </div>
      <div class="overview-item" @click="goToDetail('weeklyPlay')">
        <div class="overview-value">{{ weeklyPlayCount }}</div>
        <div class="overview-label">本周播放</div>
        <div class="overview-change" :class="{ positive: weeklyPlayChange > 0, negative: weeklyPlayChange < 0 }">
          {{ weeklyPlayChange > 0 ? '+' : '' }}{{ weeklyPlayChange }}%
        </div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧功能导航Tab -->
      <div class="function-tabs">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <el-tab-pane label="作品数据" name="songData">
            <!-- 作品数据内容 -->
            <div class="song-data-content">
              <div class="filter-section">
                <el-select v-model="timeRange" placeholder="选择时间范围" @change="handleTimeRangeChange">
                  <el-option label="日" value="day"></el-option>
                  <el-option label="周" value="week"></el-option>
                  <el-option label="月" value="month"></el-option>
                </el-select>
                <el-input v-model="songFilter" placeholder="按作品名称筛选" style="width: 300px; margin-left: 20px;"></el-input>
                <el-button type="primary" style="margin-left: 20px;">导出Excel</el-button>
              </div>
              <div class="chart-section">
                <div class="play-trend-chart" ref="playTrendChart"></div>
                <div class="play-pie-chart" ref="playPieChart"></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="听众分析" name="audienceAnalysis">
            <!-- 听众分析内容 -->
            <div class="audience-analysis-content">
              <div class="chart-section">
                <div class="region-map-chart" ref="regionMapChart"></div>
                <div class="age-gender-chart" ref="ageGenderChart"></div>
                <div class="time-distribution-chart" ref="timeDistributionChart"></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="收益结算" name="revenueSettlement">
            <!-- 收益结算内容 -->
            <div class="revenue-settlement-content">
              <div class="filter-section">
                <el-select v-model="revenueFilter" placeholder="选择收益类型" @change="handleRevenueFilterChange">
                  <el-option label="全部收益" value="all"></el-option>
                  <el-option label="播放收益" value="play"></el-option>
                  <el-option label="赞赏收益" value="reward"></el-option>
                  <el-option label="版权收益" value="copyright"></el-option>
                </el-select>
                <el-date-picker v-model="revenueDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="margin-left: 20px;"></el-date-picker>
              </div>
              <div class="revenue-details">
                <el-table :data="revenueList" border>
                  <el-table-column prop="date" label="日期" width="150"></el-table-column>
                  <el-table-column prop="songName" label="作品名称" width="250"></el-table-column>
                  <el-table-column prop="type" label="收益类型" width="150"></el-table-column>
                  <el-table-column prop="amount" label="金额" width="150"></el-table-column>
                  <el-table-column prop="description" label="描述"></el-table-column>
                </el-table>
              </div>
              <div class="withdrawal-section">
                <el-button type="primary" :disabled="!isCertified" @click="showWithdrawalDialog = true">提现申请</el-button>
                <el-button style="margin-left: 20px;">查看结算进度</el-button>
                <el-button style="margin-left: 20px;">查看提现记录</el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="作品管理" name="songManagement">
            <!-- 作品管理内容 -->
            <div class="song-management-content">
              <div class="filter-section">
                <el-select v-model="songStatusFilter" placeholder="选择作品状态" @change="handleSongStatusFilterChange">
                  <el-option label="全部" value="all"></el-option>
                  <el-option label="上架" value="online"></el-option>
                  <el-option label="下架" value="offline"></el-option>
                </el-select>
                <el-button type="primary" style="margin-left: 20px;">批量下架</el-button>
                <el-button style="margin-left: 20px;">批量设置版权</el-button>
              </div>
              <div class="song-list">
                <el-table :data="songList" border>
                  <el-table-column type="selection" width="55"></el-table-column>
                  <el-table-column prop="cover" label="封面" width="100">
                    <template slot-scope="scope">
                      <img :src="scope.row.cover" style="width: 80px; height: 80px; border-radius: 4px;">
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="作品名称" width="250"></el-table-column>
                  <el-table-column prop="playCount" label="播放量" width="150"></el-table-column>
                  <el-table-column prop="status" label="状态" width="150">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
                        {{ scope.row.status === 'online' ? '上架' : '下架' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                      <el-button size="small" @click="handleSongStatusChange(scope.row)">
                        {{ scope.row.status === 'online' ? '下架' : '上架' }}
                      </el-button>
                      <el-button size="small" style="margin-left: 10px;" @click="showEditDialog = true">编辑简介</el-button>
                      <el-button size="small" style="margin-left: 10px;" @click="showCopyrightDialog = true">修改版权</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧听众画像面板 -->
      <div class="audience-profile-panel">
        <div class="panel-title">听众画像</div>
        <div class="profile-tags">
          <el-tag type="info" @click="filterByTag('age')">95后占比60%</el-tag>
          <el-tag type="info" @click="filterByTag('time')">偏好深夜听歌</el-tag>
          <el-tag type="info" @click="filterByTag('region')">一线城市占比45%</el-tag>
          <el-tag type="info" @click="filterByTag('gender')">男性占比55%</el-tag>
          <el-tag type="info" @click="filterByTag('device')">手机端占比80%</el-tag>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">12,543</div>
            <div class="stat-label">总听众数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">892</div>
            <div class="stat-label">日活跃听众</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">3,210</div>
            <div class="stat-label">周活跃听众</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">6,789</div>
            <div class="stat-label">月活跃听众</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提现申请弹窗 -->
    <el-dialog title="提现申请" :visible.sync="showWithdrawalDialog" width="500px">
      <el-form :model="withdrawalForm" label-width="100px">
        <el-form-item label="提现金额">
          <el-input v-model="withdrawalForm.amount" placeholder="请输入提现金额"></el-input>
        </el-form-item>
        <el-form-item label="提现方式">
          <el-select v-model="withdrawalForm.method" placeholder="请选择提现方式">
            <el-option label="支付宝" value="alipay"></el-option>
            <el-option label="微信" value="wechat"></el-option>
            <el-option label="银行卡" value="bank"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账户信息">
          <el-input v-model="withdrawalForm.account" placeholder="请输入账户信息"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showWithdrawalDialog = false">取消</el-button>
        <el-button type="primary" @click="submitWithdrawal">确认提现</el-button>
      </span>
    </el-dialog>

    <!-- 编辑简介弹窗 -->
    <el-dialog title="编辑作品简介" :visible.sync="showEditDialog" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="作品名称">
          <el-input v-model="editForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="作品简介">
          <el-input v-model="editForm.description" type="textarea" rows="5"></el-input>
        </el-form-item>
        <el-form-item label="创作标签">
          <el-select v-model="editForm.tags" multiple placeholder="请选择创作标签">
            <el-option label="流行" value="pop"></el-option>
            <el-option label="摇滚" value="rock"></el-option>
            <el-option label="电子" value="electronic"></el-option>
            <el-option label="民谣" value="folk"></el-option>
            <el-option label="古典" value="classical"></el-option>
            <el-option label="嘻哈" value="hiphop"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存修改</el-button>
      </span>
    </el-dialog>

    <!-- 修改版权弹窗 -->
    <el-dialog title="修改版权信息" :visible.sync="showCopyrightDialog" width="500px">
      <el-form :model="copyrightForm" label-width="100px">
        <el-form-item label="作品名称">
          <el-input v-model="copyrightForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="版权类型">
          <el-select v-model="copyrightForm.type" placeholder="请选择版权类型">
            <el-option label="原创" value="original"></el-option>
            <el-option label="翻唱" value="cover"></el-option>
            <el-option label="改编" value="adaptation"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版权说明">
          <el-input v-model="copyrightForm.description" type="textarea" rows="5"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCopyrightDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCopyright">保存修改</el-button>
      </span>
    </el-dialog>

    <!-- 实名认证引导弹窗 -->
    <el-dialog title="实名认证提示" :visible.sync="showCertificationDialog" width="500px" :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="text-align: center; padding: 20px 0;">
        <i class="el-icon-info" style="font-size: 48px; color: #409EFF; margin-bottom: 20px;"></i>
        <p style="font-size: 16px; margin-bottom: 20px;">您尚未完成实名认证，无法进行提现操作</p>
        <p style="font-size: 14px; color: #606266; margin-bottom: 30px;">请先完成实名认证，以便正常使用收益结算功能</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCertificationDialog = false">取消</el-button>
        <el-button type="primary" @click="goToCertification">去实名认证</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'musicianDashboard',
  data() {
    return {
      // 顶部概览数据
      totalPlayCount: '1,234,567',
      playCountChange: 12.5,
      newFansCount: '892',
      newFansChange: 8.3,
      totalRevenue: '12,345.67',
      revenueChange: -2.1,
      weeklyPlayCount: '456,789',
      weeklyPlayChange: 15.7,

      // 活跃Tab
      activeTab: 'songData',

      // 作品数据筛选条件
      timeRange: 'day',
      songFilter: '',

      // 收益结算筛选条件
      revenueFilter: 'all',
      revenueDateRange: null,
      isCertified: false, // 模拟未实名认证状态

      // 作品管理筛选条件
      songStatusFilter: 'all',

      // 弹窗控制
      showWithdrawalDialog: false,
      showEditDialog: false,
      showCopyrightDialog: false,
      showCertificationDialog: false,

      // 表单数据
      withdrawalForm: {
        amount: '',
        method: '',
        account: ''
      },
      editForm: {
        name: '',
        description: '',
        tags: []
      },
      copyrightForm: {
        name: '',
        type: '',
        description: ''
      },

      // 模拟数据
      revenueList: [
        { date: '2023-10-01', songName: '歌曲1', type: '播放收益', amount: '123.45', description: '播放量收益' },
        { date: '2023-10-01', songName: '歌曲2', type: '赞赏收益', amount: '56.78', description: '用户赞赏' },
        { date: '2023-10-02', songName: '歌曲1', type: '播放收益', amount: '98.76', description: '播放量收益' },
        { date: '2023-10-02', songName: '歌曲3', type: '版权收益', amount: '456.78', description: '版权授权' },
        { date: '2023-10-03', songName: '歌曲2', type: '播放收益', amount: '76.54', description: '播放量收益' }
      ],
      songList: [
        { id: 1, cover: 'https://picsum.photos/80/80', name: '歌曲1', playCount: '123,456', status: 'online' },
        { id: 2, cover: 'https://picsum.photos/80/80', name: '歌曲2', playCount: '78,901', status: 'online' },
        { id: 3, cover: 'https://picsum.photos/80/80', name: '歌曲3', playCount: '45,678', status: 'offline' },
        { id: 4, cover: 'https://picsum.photos/80/80', name: '歌曲4', playCount: '23,456', status: 'online' },
        { id: 5, cover: 'https://picsum.photos/80/80', name: '歌曲5', playCount: '98,765', status: 'online' }
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
      this.playTrendChart = echarts.init(this.$refs.playTrendChart)
      this.updatePlayTrendChart()

      // 播放量占比饼图
      this.playPieChart = echarts.init(this.$refs.playPieChart)
      this.updatePlayPieChart()

      // 听众地域分布图
      this.regionMapChart = echarts.init(this.$refs.regionMapChart)
      this.updateRegionMapChart()

      // 年龄性别分布图
      this.ageGenderChart = echarts.init(this.$refs.ageGenderChart)
      this.updateAgeGenderChart()

      // 听歌时段分布图
      this.timeDistributionChart = echarts.init(this.$refs.timeDistributionChart)
      this.updateTimeDistributionChart()

      // 响应式调整
      window.addEventListener('resize', () => {
        this.playTrendChart.resize()
        this.playPieChart.resize()
        this.regionMapChart.resize()
        this.ageGenderChart.resize()
        this.timeDistributionChart.resize()
      })
    },

    // 更新播放量趋势图
    updatePlayTrendChart() {
      const option = {
        title: { text: '作品播放量趋势' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['歌曲1', '歌曲2', '歌曲3'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: { type: 'value' },
        series: [
          { name: '歌曲1', type: 'line', stack: '总量', data: [120, 132, 101, 134, 90, 230, 210] },
          { name: '歌曲2', type: 'line', stack: '总量', data: [220, 182, 191, 234, 290, 330, 310] },
          { name: '歌曲3', type: 'line', stack: '总量', data: [150, 232, 201, 154, 190, 330, 410] }
        ]
      }
      this.playTrendChart.setOption(option)
    },

    // 更新播放量占比饼图
    updatePlayPieChart() {
      const option = {
        title: { text: '各作品播放占比', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          { name: '播放量', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 40, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: 335, name: '歌曲1' },
              { value: 310, name: '歌曲2' },
              { value: 234, name: '歌曲3' },
              { value: 135, name: '歌曲4' },
              { value: 1548, name: '歌曲5' }
            ]
          }
        ]
      }
      this.playPieChart.setOption(option)
    },

    // 更新听众地域分布图
    updateRegionMapChart() {
      const option = {
        title: { text: '听众地域分布' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          { name: '听众数', type: 'map', mapType: 'china', roam: true,
            label: { show: true },
            data: [
              { name: '北京', value: 12345 },
              { name: '上海', value: 23456 },
              { name: '广州', value: 18901 },
              { name: '深圳', value: 21098 },
              { name: '杭州', value: 15678 },
              { name: '南京', value: 12345 },
              { name: '成都', value: 19876 },
              { name: '武汉', value: 14567 },
              { name: '西安', value: 11234 },
              { name: '重庆', value: 20123 }
            ]
          }
        ]
      }
      this.regionMapChart.setOption(option)
    },

    // 更新年龄性别分布图
    updateAgeGenderChart() {
      const option = {
        title: { text: '听众年龄性别分布' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['男性', '女性'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['18岁以下', '18-24岁', '25-30岁', '31-35岁', '36-40岁', '40岁以上'] },
        yAxis: { type: 'value' },
        series: [
          { name: '男性', type: 'bar', stack: '总量', data: [320, 302, 301, 334, 390, 330] },
          { name: '女性', type: 'bar', stack: '总量', data: [120, 132, 101, 134, 90, 230] }
        ]
      }
      this.ageGenderChart.setOption(option)
    },

    // 更新听歌时段分布图
    updateTimeDistributionChart() {
      const option = {
        title: { text: '听众听歌时段分布' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          { name: '听歌人数', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: 335, name: '0-6点' },
              { value: 310, name: '6-12点' },
              { value: 234, name: '12-18点' },
              { value: 135, name: '18-24点' }
            ]
          }
        ]
      }
      this.timeDistributionChart.setOption(option)
    },

    // 模拟实时数据刷新
    startDataRefresh() {
      setInterval(() => {
        // 随机更新一些数据
        this.totalPlayCount = (parseInt(this.totalPlayCount.replace(/,/g, '')) + Math.floor(Math.random() * 1000)).toLocaleString()
        this.newFansCount = (parseInt(this.newFansCount) + Math.floor(Math.random() * 10)).toString()
        this.totalRevenue = (parseFloat(this.totalRevenue.replace(/¥/g, '')) + Math.random() * 10).toFixed(2)
        this.weeklyPlayCount = (parseInt(this.weeklyPlayCount.replace(/,/g, '')) + Math.floor(Math.random() * 500)).toLocaleString()

        // 随机更新图表数据
        this.updatePlayTrendChart()
        this.updatePlayPieChart()
      }, 10000)
    },

    // 跳转到详情页
    goToDetail(type) {
      console.log('跳转到', type, '详情页')
      // 这里可以添加路由跳转逻辑
    },

    // Tab切换处理
    handleTabClick(tab) {
      console.log('切换到', tab.name, 'Tab')
      // 如果切换到收益结算Tab且未实名认证，显示引导弹窗
      if (tab.name === 'revenueSettlement' && !this.isCertified) {
        this.showCertificationDialog = true
      }
    },

    // 时间范围变化处理
    handleTimeRangeChange(value) {
      console.log('时间范围变化为', value)
      // 这里可以添加时间范围变化后的逻辑
    },

    // 收益类型筛选变化处理
    handleRevenueFilterChange(value) {
      console.log('收益类型筛选变化为', value)
      // 这里可以添加收益类型筛选变化后的逻辑
    },

    // 作品状态筛选变化处理
    handleSongStatusFilterChange(value) {
      console.log('作品状态筛选变化为', value)
      // 这里可以添加作品状态筛选变化后的逻辑
    },

    // 听众标签筛选
    filterByTag(tag) {
      console.log('按标签筛选', tag)
      // 这里可以添加标签筛选后的逻辑
    },

    // 作品状态切换
    handleSongStatusChange(row) {
      row.status = row.status === 'online' ? 'offline' : 'online'
      console.log('作品', row.name, '状态切换为', row.status)
    },

    // 提交提现申请
    submitWithdrawal() {
      if (!this.isCertified) {
        this.showCertificationDialog = true
        return
      }
      // 这里可以添加提现申请提交逻辑
      this.$message.success('提现申请提交成功')
      this.showWithdrawalDialog = false
    },

    // 提交编辑简介
    submitEdit() {
      // 这里可以添加编辑简介提交逻辑
      this.$message.success('作品简介修改成功')
      this.showEditDialog = false
    },

    // 提交版权修改
    submitCopyright() {
      // 这里可以添加版权修改提交逻辑
      this.$message.success('版权信息修改成功')
      this.showCopyrightDialog = false
    },

    // 去实名认证
    goToCertification() {
      console.log('跳转到实名认证页面')
      this.showCertificationDialog = false
      // 这里可以添加路由跳转逻辑
    }
  }
}
</script>

<style scoped>
.musician-dashboard {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

/* 顶部数据概览栏 */
.overview-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.overview-item {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  margin-right: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.overview-item:last-child {
  margin-right: 0;
}

.overview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.overview-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.overview-change {
  font-size: 12px;
}

.overview-change.positive {
  color: #67c23a;
}

.overview-change.negative {
  color: #f56c6c;
}

/* 主体内容区 */
.main-content {
  display: flex;
  height: calc(100% - 120px);
}

/* 左侧功能导航Tab */
.function-tabs {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
  overflow: hidden;
}

.function-tabs .el-tabs__content {
  padding: 20px;
  height: calc(100% - 55px);
  overflow-y: auto;
}

/* 右侧听众画像面板 */
.audience-profile-panel {
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.profile-tags {
  margin-bottom: 20px;
}

.profile-tags .el-tag {
  margin-bottom: 10px;
  cursor: pointer;
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stat-item {
  width: 130px;
  height: 80px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #606266;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 图表区域 */
.chart-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.play-trend-chart,
.region-map-chart {
  width: 100%;
  height: 300px;
}

.play-pie-chart,
.age-gender-chart,
.time-distribution-chart {
  width: calc(50% - 10px);
  height: 300px;
}

/* 表格区域 */
.revenue-details,
.song-list {
  margin-bottom: 20px;
  height: calc(100% - 120px);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .audience-profile-panel {
    width: 250px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .function-tabs {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .audience-profile-panel {
    width: 100%;
    height: 300px;
  }

  .play-pie-chart,
  .age-gender-chart,
  .time-distribution-chart {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .overview-bar {
    flex-direction: column;
  }

  .overview-item {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .function-tabs .el-tabs__header {
    display: flex;
    overflow-x: auto;
  }

  .function-tabs .el-tabs__nav {
    flex-wrap: nowrap;
  }
}
</style>