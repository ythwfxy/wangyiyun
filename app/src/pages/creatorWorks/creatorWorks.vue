<template>
  <div class="creator-works-container">
    <!-- 顶部创作者信息区 -->
    <div class="creator-info-section">
      <div class="avatar-section">
        <el-avatar size="120" :src="creatorInfo.avatar" class="creator-avatar">
          {{ creatorInfo.artistName.charAt(0) }}
        </el-avatar>
        <div class="avatar-actions">
          <el-button type="primary" size="small" @click="showAvatarUpload">更换头像</el-button>
        </div>
      </div>
      
      <div class="basic-info-section">
        <div class="artist-name-section">
          <h2 class="artist-name">{{ creatorInfo.artistName }}</h2>
          <el-tag :type="certificationStatus.type" :icon="certificationStatus.icon">
            {{ certificationStatus.text }}
          </el-tag>
        </div>
        <div class="meta-info">
          <span class="meta-item">入驻时间：{{ creatorInfo.joinTime }}</span>
          <span class="meta-item">作品总数：{{ creatorInfo.totalWorks }}</span>
        </div>
      </div>
      
      <div class="data-overview-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="data-card">
              <div class="data-title">近30天播放量</div>
              <div class="data-value">{{ formatNumber(overviewData.playCount) }}</div>
              <div class="data-change" :class="overviewData.playCountChange > 0 ? 'up' : 'down'">
                <i class="el-icon-caret-top" v-if="overviewData.playCountChange > 0"></i>
                <i class="el-icon-caret-bottom" v-else></i>
                {{ Math.abs(overviewData.playCountChange) }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="data-card">
              <div class="data-title">新增粉丝数</div>
              <div class="data-value">{{ formatNumber(overviewData.newFans) }}</div>
              <div class="data-change" :class="overviewData.newFansChange > 0 ? 'up' : 'down'">
                <i class="el-icon-caret-top" v-if="overviewData.newFansChange > 0"></i>
                <i class="el-icon-caret-bottom" v-else></i>
                {{ Math.abs(overviewData.newFansChange) }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="data-card">
              <div class="data-title">作品收益金额</div>
              <div class="data-value">¥{{ overviewData.income.toFixed(2) }}</div>
              <div class="data-change" :class="overviewData.incomeChange > 0 ? 'up' : 'down'">
                <i class="el-icon-caret-top" v-if="overviewData.incomeChange > 0"></i>
                <i class="el-icon-caret-bottom" v-else></i>
                {{ Math.abs(overviewData.incomeChange) }}%
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="action-buttons-section">
        <el-button type="primary" @click="editProfile">编辑资料</el-button>
        <el-button type="success" :disabled="creatorInfo.level < 3" @click="openBenefits">
          开通权益
        </el-button>
        <el-button type="info" @click="downloadReport">作品分析报告下载</el-button>
      </div>
    </div>
    
    <!-- 中间作品管理区 -->
    <div class="works-management-section">
      <!-- 作品状态筛选栏 -->
      <div class="work-status-filter">
        <el-tag 
          v-for="(status, index) in workStatusList" 
          :key="index"
          :type="currentStatus === status.value ? 'primary' : ''"
          :class="{'active': currentStatus === status.value}"
          @click="changeStatus(status.value)"
        >
          {{ status.label }}
        </el-tag>
      </div>
      
      <!-- 筛选与视图控制区 -->
      <div class="filter-controls">
        <el-button type="primary" icon="el-icon-filter" @click="showAdvancedFilter = true">
          高级筛选
        </el-button>
        <div class="view-switcher">
          <i 
            class="el-icon-s-grid" 
            :class="{'active': viewMode === 'grid'}"
            @click="changeView('grid')"
          ></i>
          <i 
            class="el-icon-s-order" 
            :class="{'active': viewMode === 'list'}"
            @click="changeView('list')"
          ></i>
        </div>
      </div>
      
      <!-- 作品列表区 -->
      <div class="works-list" :class="viewMode">
        <div 
          v-if="viewMode === 'grid'" 
          class="work-card"
          v-for="work in filteredWorks" 
          :key="work.id"
        >
          <div class="work-cover">
            <img :src="work.cover" alt="{{ work.title }}">
            <div class="play-overlay">
              <i class="el-icon-video-play"></i>
            </div>
          </div>
          <div class="work-info">
            <div class="work-title">{{ work.title }}</div>
            <div class="work-meta">
              <el-tag size="mini">{{ work.type }}</el-tag>
              <span class="publish-time">{{ work.publishTime }}</span>
            </div>
            <div class="work-stats">
              <span class="stat-item">播放量: {{ formatNumber(work.playCount) }}</span>
              <span class="stat-item">收藏量: {{ formatNumber(work.favoriteCount) }}</span>
              <span class="stat-item">评论数: {{ formatNumber(work.commentCount) }}</span>
              <span class="stat-item">收益: ¥{{ work.income.toFixed(2) }}</span>
            </div>
            <div class="work-actions">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editWork(work)">
                编辑
              </el-button>
              <el-button size="mini" type="warning" icon="el-icon-delete" @click="removeWork(work)">
                下架
              </el-button>
              <el-button 
                size="mini" 
                type="success" 
                icon="el-icon-star-off" 
                @click="recommendWork(work)"
                v-if="work.status === 'published'"
              >
                推荐
              </el-button>
              <el-button size="mini" type="info" icon="el-icon-data-analysis" @click="analyzeWork(work)">
                数据分析
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 列表视图 -->
        <el-table 
          v-if="viewMode === 'list'" 
          :data="filteredWorks" 
          style="width: 100%"
        >
          <el-table-column prop="title" label="作品标题" min-width="200"></el-table-column>
          <el-table-column prop="type" label="类型" width="100"></el-table-column>
          <el-table-column prop="playCount" label="播放量" width="120" sortable></el-table-column>
          <el-table-column prop="favoriteCount" label="收藏量" width="120" sortable></el-table-column>
          <el-table-column prop="commentCount" label="评论数" width="120" sortable></el-table-column>
          <el-table-column prop="income" label="收益" width="120" sortable>
            <template slot-scope="scope">¥{{ scope.row.income.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160"></el-table-column>
          <el-table-column prop="status" label="状态" width="120"></el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editWork(scope.row)">
                编辑
              </el-button>
              <el-button size="mini" type="warning" icon="el-icon-delete" @click="removeWork(scope.row)">
                下架
              </el-button>
              <el-button 
                size="mini" 
                type="success" 
                icon="el-icon-star-off" 
                @click="recommendWork(scope.row)"
                v-if="scope.row.status === 'published'"
              >
                推荐
              </el-button>
              <el-button size="mini" type="info" icon="el-icon-data-analysis" @click="analyzeWork(scope.row)">
                数据分析
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination-section">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredWorks.length"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 右侧数据看板区 -->
    <div class="data-dashboard-section">
      <el-card title="作品趋势图">
        <div class="chart-container">
          <!-- 这里可以集成ECharts等图表库 -->
          <div class="placeholder-chart">作品趋势图占位</div>
        </div>
      </el-card>
      
      <el-card title="用户画像">
        <div class="user-portrait">
          <div class="gender-ratio">
            <div class="ratio-item">
              <span class="label">男</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: '65%' }"></div>
              </div>
              <span class="value">65%</span>
            </div>
            <div class="ratio-item">
              <span class="label">女</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: '35%' }"></div>
              </div>
              <span class="value">35%</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 高级筛选抽屉 -->
    <el-drawer
      title="高级筛选"
      :visible.sync="showAdvancedFilter"
      direction="right"
      size="50%"
    >
      <el-form :model="advancedFilter" label-width="80px">
        <el-form-item label="作品类型">
          <el-checkbox-group v-model="advancedFilter.types">
            <el-checkbox label="单曲" value="single"></el-checkbox>
            <el-checkbox label="专辑" value="album"></el-checkbox>
            <el-checkbox label="MV" value="mv"></el-checkbox>
            <el-checkbox label="翻唱" value="cover"></el-checkbox>
            <el-checkbox label="混音" value="remix"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="advancedFilter.publishTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="advancedFilter.tags"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tagLibrary"
              :key="tag"
              :label="tag"
              :value="tag"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="播放量区间">
          <el-slider
            v-model="advancedFilter.playCountRange"
            :min="0"
            :max="10000000"
            range
            :marks="{0: '0', 10000000: '1000万'}"
          ></el-slider>
        </el-form-item>
        <el-form-item label="收益状态">
          <el-radio-group v-model="advancedFilter.incomeStatus">
            <el-radio label="有收益"></el-radio>
            <el-radio label="无收益"></el-radio>
            <el-radio label="收益待结算"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="filter-actions">
        <el-button @click="resetFilter">重置</el-button>
        <el-button type="primary" @click="applyFilter">应用筛选</el-button>
      </div>
    </el-drawer>
    
    <!-- 头像上传弹窗 -->
    <el-dialog
      title="更换头像"
      :visible.sync="showAvatarUpload"
      width="50%"
    >
      <el-upload
        class="avatar-uploader"
        action="#"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="creatorInfo.avatar" :src="creatorInfo.avatar" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAvatarUpload = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CreatorWorks',
  data() {
    return {
      // 创作者信息
      creatorInfo: {
        artistName: '张三',
        avatar: '',
        certificationStatus: 'certified',
        joinTime: '2020-01-01',
        totalWorks: 15,
        level: 4
      },
      // 认证状态配置
      certificationStatus: {
        type: 'success',
        icon: 'el-icon-check',
        text: '已认证'
      },
      // 数据概览
      overviewData: {
        playCount: 123456,
        playCountChange: 12.5,
        newFans: 456,
        newFansChange: -3.2,
        income: 7890.12,
        incomeChange: 8.9
      },
      // 作品状态筛选
      workStatusList: [
        { label: '全部', value: 'all' },
        { label: '草稿', value: 'draft' },
        { label: '待审核', value: 'pending' },
        { label: '已发布', value: 'published' },
        { label: '已下架', value: 'removed' }
      ],
      currentStatus: 'all',
      // 高级筛选
      showAdvancedFilter: false,
      advancedFilter: {
        types: [],
        publishTime: [],
        tags: [],
        playCountRange: [0, 10000000],
        incomeStatus: ''
      },
      // 标签库
      tagLibrary: ['流行', '摇滚', '电子', '民谣', '古典', '爵士', '嘻哈'],
      // 视图模式
      viewMode: 'grid',
      // 分页配置
      currentPage: 1,
      pageSize: 12,
      pageSizes: [12, 24, 36],
      // 所有作品数据
      works: [
        { id: 1, title: '作品1', type: '单曲', cover: '', playCount: 12345, favoriteCount: 678, commentCount: 90, income: 123.45, publishTime: '2023-01-01', status: 'published', tags: ['流行'] },
        { id: 2, title: '作品2', type: '专辑', cover: '', playCount: 67890, favoriteCount: 1234, commentCount: 567, income: 890.12, publishTime: '2023-02-15', status: 'published', tags: ['摇滚'] },
        { id: 3, title: '作品3', type: 'MV', cover: '', playCount: 98765, favoriteCount: 2345, commentCount: 789, income: 1234.56, publishTime: '2023-03-20', status: 'pending', tags: ['电子'] },
        { id: 4, title: '作品4', type: '翻唱', cover: '', playCount: 45678, favoriteCount: 890, commentCount: 345, income: 567.89, publishTime: '2023-04-10', status: 'published', tags: ['民谣'] },
        { id: 5, title: '作品5', type: '混音', cover: '', playCount: 76543, favoriteCount: 1123, commentCount: 678, income: 901.23, publishTime: '2023-05-05', status: 'draft', tags: ['电子'] },
        { id: 6, title: '作品6', type: '单曲', cover: '', playCount: 23456, favoriteCount: 456, commentCount: 123, income: 345.67, publishTime: '2023-06-15', status: 'removed', tags: ['流行'] }
        // 更多模拟数据可以在这里添加
      ],
      // 头像上传
      showAvatarUpload: false
    }
  },
  computed: {
    // 筛选后的作品
    filteredWorks() {
      let filtered = [...this.works]
      
      // 状态筛选
      if (this.currentStatus !== 'all') {
        filtered = filtered.filter(work => work.status === this.currentStatus)
      }
      
      // 类型筛选
      if (this.advancedFilter.types.length > 0) {
        filtered = filtered.filter(work => this.advancedFilter.types.includes(work.type))
      }
      
      // 发布时间筛选
      if (this.advancedFilter.publishTime.length === 2) {
        const startTime = new Date(this.advancedFilter.publishTime[0])
        const endTime = new Date(this.advancedFilter.publishTime[1])
        filtered = filtered.filter(work => {
          const publishTime = new Date(work.publishTime)
          return publishTime >= startTime && publishTime <= endTime
        })
      }
      
      // 标签筛选
      if (this.advancedFilter.tags.length > 0) {
        filtered = filtered.filter(work => {
          return this.advancedFilter.tags.some(tag => work.tags.includes(tag))
        })
      }
      
      // 播放量区间筛选
      filtered = filtered.filter(work => {
        return work.playCount >= this.advancedFilter.playCountRange[0] && work.playCount <= this.advancedFilter.playCountRange[1]
      })
      
      // 收益状态筛选
      if (this.advancedFilter.incomeStatus) {
        filtered = filtered.filter(work => {
          if (this.advancedFilter.incomeStatus === '有收益') {
            return work.income > 0
          } else if (this.advancedFilter.incomeStatus === '无收益') {
            return work.income === 0
          } else if (this.advancedFilter.incomeStatus === '收益待结算') {
            return work.incomeStatus === 'pending'
          }
          return true
        })
      }
      
      return filtered
    }
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },
    // 更改作品状态
    changeStatus(status) {
      this.currentStatus = status
    },
    // 更改视图模式
    changeView(mode) {
      this.viewMode = mode
      // 保存视图模式到localStorage
      localStorage.setItem('creatorWorksViewMode', mode)
    },
    // 应用筛选
    applyFilter() {
      this.showAdvancedFilter = false
      // 保存筛选条件到localStorage
      localStorage.setItem('creatorWorksFilter', JSON.stringify(this.advancedFilter))
    },
    // 重置筛选
    resetFilter() {
      this.advancedFilter = {
        types: [],
        publishTime: [],
        tags: [],
        playCountRange: [0, 10000000],
        incomeStatus: ''
      }
    },
    // 编辑作品
    editWork(work) {
      console.log('编辑作品:', work)
    },
    // 下架作品
    removeWork(work) {
      this.$confirm('确定要下架该作品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行下架操作
        work.status = 'removed'
        this.$message({ type: 'success', message: '作品已下架' })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消下架' })
      })
    },
    // 推荐作品
    recommendWork(work) {
      console.log('推荐作品:', work)
    },
    // 分析作品
    analyzeWork(work) {
      console.log('分析作品:', work)
    },
    // 分页相关
    handleSizeChange(val) {
      this.pageSize = val
      localStorage.setItem('creatorWorksPageSize', val)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      localStorage.setItem('creatorWorksCurrentPage', val)
    },
    // 编辑资料
    editProfile() {
      console.log('编辑资料')
    },
    // 开通权益
    openBenefits() {
      if (this.creatorInfo.level < 3) {
        this.$message.warning('需达到L3等级才能开通权益')
        return
      }
      console.log('开通权益')
    },
    // 下载报告
    downloadReport() {
      console.log('下载报告')
    },
    // 头像上传相关
    handleAvatarSuccess(res, file) {
      this.creatorInfo.avatar = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    saveAvatar() {
      this.showAvatarUpload = false
      this.$message.success('头像已保存')
    }
  },
  mounted() {
    // 从localStorage加载用户偏好设置
    const savedViewMode = localStorage.getItem('creatorWorksViewMode')
    if (savedViewMode) {
      this.viewMode = savedViewMode
    }
    
    const savedFilter = localStorage.getItem('creatorWorksFilter')
    if (savedFilter) {
      this.advancedFilter = JSON.parse(savedFilter)
    }
    
    const savedPageSize = localStorage.getItem('creatorWorksPageSize')
    if (savedPageSize) {
      this.pageSize = parseInt(savedPageSize)
    }
    
    const savedCurrentPage = localStorage.getItem('creatorWorksCurrentPage')
    if (savedCurrentPage) {
      this.currentPage = parseInt(savedCurrentPage)
    }
  }
}
</script>

<style scoped>
.creator-works-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 100px; /* 底部margin等于音乐播放器高度 */
  background-color: #f5f7fa;
}

/* 顶部创作者信息区 */
.creator-info-section {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.creator-avatar {
  margin-right: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.creator-avatar:hover {
  transform: scale(1.2);
}

.basic-info-section {
  margin-bottom: 20px;
}

.artist-name-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.artist-name {
  font-size: 24px;
  margin-right: 10px;
}

.meta-info {
  color: #909399;
}

.meta-item {
  margin-right: 20px;
}

.data-overview-section {
  margin-bottom: 20px;
}

.data-card {
  text-align: center;
  transition: all 0.3s;
}

.data-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-change {
  font-size: 12px;
}

.data-change.up {
  color: #67c23a;
}

.data-change.down {
  color: #f56c6c;
}

.action-buttons-section {
  display: flex;
  gap: 10px;
}

/* 中间作品管理区 */
.works-management-section {
  flex: 1;
  margin-right: 20px;
}

.work-status-filter {
  background-color: white;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.work-status-filter .el-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.work-status-filter .el-tag.active {
  border-left: 3px solid #409eff;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-switcher {
  display: flex;
  gap: 10px;
  font-size: 20px;
  color: #909399;
}

.view-switcher i {
  cursor: pointer;
  transition: all 0.3s;
}

.view-switcher i.active {
  color: #409eff;
  transform: scale(1.2);
}

.works-list {
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 网格视图 */
.works-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.work-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
}

.work-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.work-cover {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  margin-bottom: 15px;
  overflow: hidden;
}

.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 40px;
}

.work-cover:hover .play-overlay {
  opacity: 1;
}

.work-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-meta {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.publish-time {
  font-size: 12px;
  color: #909399;
}

.work-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #606266;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.work-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* 列表视图 */
.works-list.list {
  overflow-x: auto;
}

.pagination-section {
  margin-top: 20px;
  text-align: center;
}

/* 右侧数据看板区 */
.data-dashboard-section {
  width: 300px;
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-chart {
  color: #909399;
  font-size: 14px;
}

.user-portrait {
  padding: 10px;
}

.gender-ratio {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e6e7ea;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .data-dashboard-section {
    width: 250px;
  }
}

@media (max-width: 1200px) {
  .creator-works-container {
    flex-direction: column;
  }
  
  .works-management-section {
    margin-right: 0;
  }
  
  .data-dashboard-section {
    width: 100%;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .works-list.grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>