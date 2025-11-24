<template>
  <div class="playlist-recommend">
    <!-- 顶部分类筛选区 -->
    <div class="filter-section">
      <el-row gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-select v-model="filters.style" placeholder="选择音乐风格" @change="onFilterChange">
            <el-option label="全部" value=""></el-option>
            <el-option label="流行" value="pop"></el-option>
            <el-option label="摇滚" value="rock"></el-option>
            <el-option label="电子" value="electronic"></el-option>
            <el-option label="民谣" value="folk"></el-option>
            <el-option label="古典" value="classical"></el-option>
            <el-option label="嘻哈" value="hiphop"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-select v-model="filters.type" placeholder="选择歌单类型" @change="onFilterChange">
            <el-option label="全部" value=""></el-option>
            <el-option label="自建" value="self"></el-option>
            <el-option label="收藏" value="collect"></el-option>
            <el-option label="推荐" value="recommend"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="16" :lg="12">
          <div class="play-count-filter">
            <span>播放量区间：{{ filters.playCount.min }} - {{ filters.playCount.max }}</span>
            <el-slider
              v-model="filters.playCount"
              :min="1000"
              :max="100000"
              :step="1000"
              range
              @change="onFilterChange"
            ></el-slider>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 中间歌单推荐列表区 -->
    <div class="main-content">
      <!-- 列表控制区 -->
      <div class="list-control">
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="switchViewMode('grid')">
            <i class="el-icon-s-grid"></i> 网格视图
          </el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="switchViewMode('list')">
            <i class="el-icon-s-order"></i> 列表视图
          </el-button>
        </el-button-group>
        <el-button @click="toggleListVisible">
          {{ listVisible ? '收起列表' : '展开列表' }}
        </el-button>
      </div>

      <!-- 歌单列表 -->
      <div v-if="listVisible" class="playlist-container">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="grid-view">
          <el-card
            v-for="(playlist, index) in paginatedPlaylists"
            :key="playlist.id"
            class="playlist-card"
            hover
          >
            <div class="card-header" @click="playAll(playlist)">
              <el-image
                :src="playlist.cover"
                :lazy="true"
                class="playlist-cover"
              ></el-image>
              <div class="play-overlay">
                <i class="el-icon-play-circle"></i>
              </div>
            </div>
            <div class="card-body">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <div class="playlist-tags">
                <el-tag size="small" v-for="tag in playlist.tags" :key="tag">{{ tag }}</el-tag>
              </div>
              <div class="playlist-stats">
                <span><i class="el-icon-video-play"></i> {{ formatNumber(playlist.playCount) }}</span>
                <span><i class="el-icon-star-on"></i> {{ formatNumber(playlist.collectCount) }}</span>
              </div>
              <div class="card-actions">
                <el-button
                  size="small"
                  :type="playlist.isCollected ? 'primary' : 'default'"
                  @click="toggleCollect(playlist)"
                >
                  {{ playlist.isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button size="small" @click="addToMyRecommend(playlist)">
                  添加至我的推荐
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-table
            :data="paginatedPlaylists"
            border
            style="width: 100%"
            height="calc(100vh - 300px)"
          >
            <el-table-column prop="cover" label="封面" width="120">
              <template slot-scope="scope">
                <el-image
                  :src="scope.row.cover"
                  :lazy="true"
                  class="list-cover"
                  @click="playAll(scope.row)"
                ></el-image>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="歌单名称" min-width="200"></el-table-column>
            <el-table-column prop="tags" label="风格标签" min-width="150">
              <template slot-scope="scope">
                <el-tag size="small" v-for="tag in scope.row.tags" :key="tag">{{ tag }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="playCount" label="播放量" width="120">
              <template slot-scope="scope">
                {{ formatNumber(scope.row.playCount) }}
              </template>
            </el-table-column>
            <el-table-column prop="collectCount" label="收藏数" width="120">
              <template slot-scope="scope">
                {{ formatNumber(scope.row.collectCount) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  :type="scope.row.isCollected ? 'primary' : 'default'"
                  @click="toggleCollect(scope.row)"
                >
                  {{ scope.row.isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button size="small" @click="addToMyRecommend(scope.row)">
                  添加至我的推荐
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 加载更多 -->
        <div v-if="loading" class="loading-more">
          <el-loading-spinner></el-loading-spinner>
          <span>加载中...</span>
        </div>
        <div v-else-if="!hasMoreData" class="no-more-data">
          <span>没有更多数据了</span>
        </div>
      </div>
    </div>

    <!-- 右侧分类数据看板 -->
    <div class="dashboard-section">
      <div class="dashboard-card">
        <h3>各风格歌单播放量占比</h3>
        <div id="playCountPieChart" style="width: 100%; height: 300px;"></div>
      </div>
      <div class="dashboard-card">
        <h3>推荐歌单收藏趋势</h3>
        <div id="collectTrendChart" style="width: 100%; height: 300px;"></div>
      </div>
      <div class="dashboard-card">
        <h3>用户偏好风格标签</h3>
        <div class="preference-tags">
          <el-tag
            v-for="tag in preferenceTags"
            :key="tag"
            :type="filters.style === tag ? 'primary' : 'default'"
            @click="filterByTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="dashboard-actions">
        <el-button @click="exportData">导出数据(CSV)</el-button>
      </div>
    </div>

    <!-- 添加至我的推荐确认弹窗 -->
    <el-dialog
      title="添加至我的推荐"
      :visible.sync="addRecommendDialogVisible"
      width="30%"
    >
      <p>确定将歌单 "{{ currentPlaylist?.name }}" 添加至我的推荐吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRecommendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddToMyRecommend">确定</el-button>
      </span>
    </el-dialog>

    <!-- 网络恢复提示弹窗 -->
    <el-dialog
      title="网络恢复"
      :visible.sync="networkRecoveryDialogVisible"
      width="30%"
    >
      <p>网络已恢复，是否恢复之前的筛选条件？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="networkRecoveryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="restoreFilters">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from '@/utils/debounce'

export default {
  name: 'PlaylistRecommend',
  data() {
    return {
      // 筛选条件
      filters: {
        style: '',
        type: '',
        playCount: [1000, 100000]
      },
      // 歌单数据
      playlists: [],
      // 分页数据
      currentPage: 1,
      pageSize: 15,
      // 视图模式
      viewMode: 'grid',
      // 列表可见性
      listVisible: true,
      // 加载状态
      loading: false,
      // 是否有更多数据
      hasMoreData: true,
      // 弹窗状态
      addRecommendDialogVisible: false,
      networkRecoveryDialogVisible: false,
      // 当前操作的歌单
      currentPlaylist: null,
      // 用户偏好标签
      preferenceTags: ['流行', '摇滚', '电子', '民谣', '古典', '嘻哈'],
      // 图表实例
      playCountPieChart: null,
      collectTrendChart: null
    }
  },
  computed: {
    // 分页后的歌单数据
    paginatedPlaylists() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredPlaylists.slice(start, end)
    },
    // 筛选后的歌单数据
    filteredPlaylists() {
      return this.playlists.filter(playlist => {
        // 风格筛选
        const styleMatch = !this.filters.style || playlist.tags.includes(this.filters.style)
        // 类型筛选
        const typeMatch = !this.filters.type || playlist.type === this.filters.type
        // 播放量筛选
        const playCountMatch = playlist.playCount >= this.filters.playCount[0] && playlist.playCount <= this.filters.playCount[1]
        return styleMatch && typeMatch && playCountMatch
      })
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    // 初始化视图模式
    this.initViewMode()
    // 初始化列表可见性
    this.initListVisible()
    // 初始化图表
    this.initCharts()
    // 监听滚动事件
    this.$nextTick(() => {
      window.addEventListener('scroll', this.handleScroll)
    })
    // 监听网络状态
    this.initNetworkListener()
  },
  beforeDestroy() {
    // 移除滚动事件监听
    window.removeEventListener('scroll', this.handleScroll)
    // 销毁图表
    if (this.playCountPieChart) {
      this.playCountPieChart.dispose()
    }
    if (this.collectTrendChart) {
      this.collectTrendChart.dispose()
    }
  },
  methods: {
    // 初始化数据
    initData() {
      // 模拟150条歌单数据
      this.playlists = Array.from({ length: 150 }, (_, i) => {
        const styles = ['流行', '摇滚', '电子', '民谣', '古典', '嘻哈']
        const types = ['self', 'collect', 'recommend']
        return {
          id: i + 1,
          name: `歌单${i + 1}`,
          cover: `https://picsum.photos/seed/playlist${i + 1}/300/300`,
          tags: [styles[Math.floor(Math.random() * styles.length)]],
          type: types[Math.floor(Math.random() * types.length)],
          playCount: Math.floor(Math.random() * 99000) + 1000,
          collectCount: Math.floor(Math.random() * 9900) + 100,
          isCollected: Math.random() > 0.5
        }
      })
    },
    // 初始化视图模式
    initViewMode() {
      const savedViewMode = localStorage.getItem('playlistViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },
    // 初始化列表可见性
    initListVisible() {
      const listVisibleParam = this.$route.query.listVisible
      if (listVisibleParam !== undefined) {
        this.listVisible = listVisibleParam === 'true'
      }
    },
    // 初始化图表
    initCharts() {
      // 播放量占比饼图
      this.playCountPieChart = echarts.init(document.getElementById('playCountPieChart'))
      this.updatePlayCountPieChart()

      // 收藏趋势折线图
      this.collectTrendChart = echarts.init(document.getElementById('collectTrendChart'))
      this.updateCollectTrendChart()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.playCountPieChart.resize()
        this.collectTrendChart.resize()
      })
    },
    // 更新播放量占比饼图
    updatePlayCountPieChart() {
      const styleCounts = {
        '流行': 0,
        '摇滚': 0,
        '电子': 0,
        '民谣': 0,
        '古典': 0,
        '嘻哈': 0
      }

      this.playlists.forEach(playlist => {
        playlist.tags.forEach(tag => {
          if (styleCounts[tag] !== undefined) {
            styleCounts[tag] += playlist.playCount
          }
        })
      })

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '播放量',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: Object.entries(styleCounts).map(([name, value]) => ({ name, value })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      this.playCountPieChart.setOption(option)
    },
    // 更新收藏趋势折线图
    updateCollectTrendChart() {
      // 模拟最近7天的收藏数据
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      const collectData = days.map(() => Math.floor(Math.random() * 1000) + 100)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['收藏数']
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
          data: days
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '收藏数',
            type: 'line',
            stack: '总量',
            data: collectData
          }
        ]
      }

      this.collectTrendChart.setOption(option)
    },
    // 切换视图模式
    switchViewMode(mode) {
      this.viewMode = mode
      localStorage.setItem('playlistViewMode', mode)
    },
    // 切换列表可见性
    toggleListVisible() {
      this.listVisible = !this.listVisible
      // 更新URL参数
      this.$router.push({
        query: {
          ...this.$route.query,
          listVisible: this.listVisible
        }
      })
    },
    // 筛选条件变化
    onFilterChange: debounce(function() {
      // 重置分页
      this.currentPage = 1
      // 更新URL参数
      this.updateUrlParams()
      // 更新图表
      this.updatePlayCountPieChart()
    }, 200),
    // 更新URL参数
    updateUrlParams() {
      this.$router.push({
        query: {
          style: this.filters.style,
          type: this.filters.type,
          playCountMin: this.filters.playCount[0],
          playCountMax: this.filters.playCount[1],
          listVisible: this.listVisible
        }
      })
    },
    // 按标签筛选
    filterByTag(tag) {
      this.filters.style = tag
      this.onFilterChange()
    },
    // 播放全部
    playAll(playlist) {
      this.$message.success(`开始播放歌单 "${playlist.name}" 的全部歌曲`)
    },
    // 收藏/取消收藏
    toggleCollect(playlist) {
      playlist.isCollected = !playlist.isCollected
      this.$message.success(playlist.isCollected ? '收藏成功' : '取消收藏成功')
    },
    // 添加至我的推荐
    addToMyRecommend(playlist) {
      this.currentPlaylist = playlist
      this.addRecommendDialogVisible = true
    },
    // 确认添加至我的推荐
    confirmAddToMyRecommend() {
      this.addRecommendDialogVisible = false
      this.$message.success(`歌单 "${this.currentPlaylist.name}" 已添加至我的推荐`)
    },
    // 导出数据
    exportData() {
      // 准备CSV数据
      const headers = ['歌单名称', '风格标签', '类型', '播放量', '收藏数', '是否收藏']
      const rows = this.filteredPlaylists.map(playlist => [
        playlist.name,
        playlist.tags.join(','),
        playlist.type,
        playlist.playCount,
        playlist.collectCount,
        playlist.isCollected ? '是' : '否'
      ])

      // 生成CSV内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '歌单推荐数据.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num.toString()
    },
    // 滚动事件处理
    handleScroll() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = document.documentElement.clientHeight || window.innerHeight

      // 触底加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && !this.loading && this.hasMoreData) {
        this.loadMore()
      }
    },
    // 加载更多
    loadMore() {
      this.loading = true
      // 模拟加载延迟
      setTimeout(() => {
        this.currentPage++
        // 检查是否还有更多数据
        if (this.paginatedPlaylists.length >= this.filteredPlaylists.length) {
          this.hasMoreData = false
        }
        this.loading = false
      }, 1000)
    },
    // 初始化网络监听
    initNetworkListener() {
      window.addEventListener('online', this.handleNetworkOnline)
      window.addEventListener('offline', this.handleNetworkOffline)
    },
    // 网络恢复
    handleNetworkOnline() {
      // 检查是否有保存的筛选条件
      const savedFilters = localStorage.getItem('playlistFilters')
      if (savedFilters) {
        this.networkRecoveryDialogVisible = true
      }
    },
    // 网络断开
    handleNetworkOffline() {
      // 保存筛选条件到localStorage
      localStorage.setItem('playlistFilters', JSON.stringify(this.filters))
      this.$message.warning('网络已断开，筛选条件已保存')
    },
    // 恢复筛选条件
    restoreFilters() {
      this.networkRecoveryDialogVisible = false
      const savedFilters = localStorage.getItem('playlistFilters')
      if (savedFilters) {
        this.filters = JSON.parse(savedFilters)
        this.onFilterChange()
        this.$message.success('筛选条件已恢复')
      }
    }
  }
}
</script>

<style scoped>
.playlist-recommend {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.play-count-filter {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.play-count-filter span {
  margin-bottom: 10px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  margin-bottom: 20px;
  overflow-y: auto;
}

.list-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.playlist-container {
  width: 100%;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.playlist-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.card-header {
  position: relative;
  cursor: pointer;
}

.playlist-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
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
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.card-header:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  font-size: 48px;
  color: #fff;
}

.card-body {
  padding: 15px;
}

.playlist-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-tags {
  margin-bottom: 10px;
}

.playlist-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.playlist-stats span {
  display: flex;
  align-items: center;
}

.playlist-stats i {
  margin-right: 5px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}

.list-view {
  width: 100%;
}

.list-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-more span {
  margin-left: 10px;
}

.no-more-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
}

.dashboard-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.dashboard-card {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.dashboard-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dashboard-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .dashboard-section {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    z-index: 1000;
  }
}

@media (max-width: 768px) {
  .playlist-recommend {
    padding: 10px;
  }

  .filter-section {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    margin-bottom: 0;
    border-radius: 8px 8px 0 0;
    z-index: 1000;
  }

  .main-content {
    margin-bottom: 120px;
  }

  .dashboard-section {
    position: static;
    width: 100%;
    max-height: none;
  }
}
</style>