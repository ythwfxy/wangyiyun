<template>
  <div class="study-records">
    <div class="records-header">
      <h1>我的学习记录</h1>
      <el-button type="primary" @click="generateReport">生成报表</el-button>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">120小时</div>
        <div class="stat-label">本月总专注时长</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">30天</div>
        <div class="stat-label">连续专注天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">85%</div>
        <div class="stat-label">任务完成率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">15个</div>
        <div class="stat-label">已完成任务</div>
      </div>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <h3>每日专注时长</h3>
            <div class="chart-placeholder">柱状图占位</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <h3>专注场景分布</h3>
            <div class="chart-placeholder">饼图占位</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="history-section">
      <h2>专注历史</h2>
      <el-table :data="historyData" border>
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="duration" label="专注时长" width="120"></el-table-column>
        <el-table-column prop="scenario" label="学习场景" width="150"></el-table-column>
        <el-table-column prop="task" label="完成任务"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '完成' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyRecords',
  data() {
    return {
      historyData: [
        { date: '2024-01-15', duration: '2小时30分钟', scenario: '编程', task: '完成前端项目开发', status: '完成' },
        { date: '2024-01-14', duration: '1小时45分钟', scenario: '刷题', task: '数学试卷练习', status: '完成' },
        { date: '2024-01-13', duration: '3小时', scenario: '写作', task: '论文撰写', status: '完成' },
        { date: '2024-01-12', duration: '2小时', scenario: '背书', task: '英语单词背诵', status: '完成' },
        { date: '2024-01-11', duration: '1小时30分钟', scenario: '编程', task: '算法练习', status: '完成' }
      ]
    }
  },
  methods: {
    generateReport() {
      this.$message.success('报表生成成功')
    }
  }
}
</script>

<style scoped>
.study-records {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.records-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.stats-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #333;
}

.chart-placeholder {
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.history-section h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #333;
}

.history-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .stats-overview {
    flex-direction: column;
  }
  
  .stat-card {
    width: 100%;
  }
}
</style>