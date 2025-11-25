<template>
  <div class="collect-playlist-container">
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <el-row gutter="20">
        <el-col :span="6">
          <el-select v-model="filterData.collectTime" placeholder="选择收藏时间" @change="onFilterChange">
            <el-option label="近7天" value="7d"></el-option>
            <el-option label="近30天" value="30d"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
          <el-date-picker
            v-if="filterData.collectTime === 'custom'"
            v-model="filterData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onFilterChange"
          ></el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterData.playlistType" placeholder="选择歌单类型" @change="onFilterChange">
            <el-option label="自建" value="self"></el-option>
            <el-option label="收藏" value="collect"></el-option>
            <el-option label="合作" value="collab"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <div class="play-count-filter">
            <span>播放量区间：{{ filterData.playCountRange[0] }} - {{ filterData.playCountRange[1] }} 万</span>
            <el-slider
              v-model="filterData.playCountRange"
              :min="0"
              :max="10"
              :step="0.5"
              range
              @change="onFilterChange"
            ></el-slider>
          </div>
        </el-col>
        <el-col :span="6">
          <el-button-group class="view-toggle">
            <el-button type="primary" :icon="viewMode === 'grid' ? 'el-icon-picture' : 'el-icon-picture-outline'" @click="toggleViewMode('grid')">
              网格视图
            </el-button>
            <el-button type="primary" :icon="viewMode === 'list' ? 'el-icon-document' : 'el-icon-document-outline'" @click="toggleViewMode('list')">
              列表视图
            </el-button>
          </el-button-group>
          <el-button type="success" :icon="layoutMode === 'three-column' ? 'el-icon-menu' : 'el-icon-more'" @click="toggleLayoutMode">
            {{ layoutMode === 'three-column' ? '隐藏统计看板' : '显示统计看板' }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 中间歌单列表区 -->
    <div class="playlist-section" :class="{ 'with-sidebar': layoutMode === 'three-column' }">
      <!-- 网格视图 -->
      <div class="grid-view" v-if="viewMode === 'grid'">
        <el-row gutter="20">
          <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="(playlist, index) in displayedPlaylists" :key="playlist.id">
            <div class="playlist-card" @click="playPlaylist(playlist)">
              <div class="card-image">
                <img :src="playlist.cover" :alt="playlist.name" class="lazy-load" loading="lazy">
                <el-button type="primary" icon="el-icon-play" class="play-button" @click.stop="playPlaylist(playlist)"></el-button>
              </div>
              <div class="card-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-desc">{{ playlist.description }}</p>
                <div class="card-meta">
                  <span>播放量：{{ playlist.playCount }} 万</span>
                  <span>收藏时间：{{ playlist.collectTime }}</span>
                </div>
              </div>
              <el-button type="danger" icon="el-icon-delete" class="delete-button" @click.stop="deletePlaylist(playlist)"></el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 列表视图 -->
      <div class="list-view" v-else>
        <el-table :data="displayedPlaylists" border style="width: 100%" header-cell-class-name="sticky-header">
          <el-table-column prop="name" label="歌单名称" min-width="200"></el-table-column>
          <el-table-column prop="description" label="描述" min-width="300"></el-table-column>
          <el-table-column prop="playCount" label="播放量（万）" width="120"></el-table-column>
          <el-table-column prop="collectTime" label="收藏时间" width="180"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-play" size="small" @click="playPlaylist(scope.row)">播放</el-button>
              <el-button type="danger" icon="el-icon-delete" size="small" @click="deletePlaylist(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <el-button type="primary" loading @click="loadMore">加载中...</el-button>
      </div>
      <div class="no-more" v-else-if="displayedPlaylists.length > 0">
        <span>没有更多歌单了</span>
      </div>
      <div class="no-data" v-else>
        <span>没有找到匹配的歌单</span>
      </div>
    </div>

    <!-- 右侧统计看板 -->
    <div class="stats-section" v-if="layoutMode === 'three-column'">
      <div class="stats-card">
        <h3>收藏歌单播放量趋势</h3>
        <el-radio-group v-model="trendTimeRange" @change="updateTrendChart">
          <el-radio label="day">日趋势</el-radio>
          <el-radio label="week">周趋势</el-radio>
        </el-radio-group>
        <div id="trendChart" class="chart-container"></div>
        <el-button type="primary" icon="el-icon-download" @click="exportCSV">导出CSV</el-button>
      </div>
      <div class="stats-card">
        <h3>歌单风格占比</h3>
        <div id="styleChart" class="chart-container"></div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog title="确认删除" :visible.sync="deleteDialogVisible" width="30%">
      <span>删除后不可恢复，确定要删除此歌单吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>

    <!-- 网络恢复提示 -->
    <el-alert type="success" :visible.sync="networkAlertVisible" closable :title="networkAlertMessage" show-icon></el-alert>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'CollectPlaylist',
  data() {
    return {
      // 筛选条件
      filterData: {
        collectTime: '7d',
        dateRange: null,
        playlistType: '',
        playCountRange: [0, 10]
      },
      // 视图模式
      viewMode: 'grid',
      // 布局模式
      layoutMode: 'three-column',
      // 趋势图时间范围
      trendTimeRange: 'day',
      // 歌单数据
      playlistData: [],
      // 显示的歌单数据
      displayedPlaylists: [],
      // 分页
      pageSize: 20,
      currentPage: 1,
      // 加载状态
      hasMore: true,
      // 删除弹窗
      deleteDialogVisible: false,
      currentDeletePlaylist: null,
      // 网络状态
      networkAlertVisible: false,
      networkAlertMessage: '',
      // ECharts实例
      trendChart: null,
      styleChart: null
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    // 初始化视图模式
    this.initViewMode()
    // 初始化布局模式
    this.initLayoutMode()
    // 初始化筛选条件
    this.initFilterData()
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
    // 销毁ECharts实例
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    if (this.styleChart) {
      this.styleChart.dispose()
    }
  },
  methods: {
    // 初始化数据
    initData() {
      // 模拟100条歌单数据
      this.playlistData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `歌单 ${i + 1}`,
        description: `这是歌单 ${i + 1} 的描述`,
        cover: `https://picsum.photos/200/200?random=${i + 1}`,
        playCount: (Math.random() * 10).toFixed(1),
        collectTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        style: ['流行', '摇滚', '电子', '古典', '爵士'][Math.floor(Math.random() * 5)]
      }))
      // 加载第一页数据
      this.loadMore()
      // 初始化图表
      this.$nextTick(() => {
        this.initTrendChart()
        this.initStyleChart()
      })
    },
    // 初始化视图模式
    initViewMode() {
      const savedViewMode = localStorage.getItem('collectPlaylistViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },
    // 初始化布局模式
    initLayoutMode() {
      const savedLayoutMode = this.$route.query.layout || 'three-column'
      this.layoutMode = savedLayoutMode
    },
    // 初始化筛选条件
    initFilterData() {
      // 从URL参数获取筛选条件
      const query = this.$route.query
      if (query.collectTime) {
        this.filterData.collectTime = query.collectTime
      }
      if (query.playlistType) {
        this.filterData.playlistType = query.playlistType
      }
      if (query.playCountMin && query.playCountMax) {
        this.filterData.playCountRange = [parseFloat(query.playCountMin), parseFloat(query.playCountMax)]
      }
      // 从localStorage获取保存的筛选条件（网络中断时）
      const savedFilterData = localStorage.getItem('collectPlaylistFilterData')
      if (savedFilterData && !navigator.onLine) {
        this.filterData = JSON.parse(savedFilterData)
      }
    },
    // 初始化趋势图
    initTrendChart() {
      this.trendChart = echarts.init(document.getElementById('trendChart'))
      this.updateTrendChart()
    },
    // 初始化风格饼图
    initStyleChart() {
      this.styleChart = echarts.init(document.getElementById('styleChart'))
      this.updateStyleChart()
    },
    // 更新趋势图
    updateTrendChart() {
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.trendTimeRange === 'day' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : ['第1周', '第2周', '第3周', '第4周']
        },
        yAxis: {
          type: 'value',
          name: '播放量（万）'
        },
        series: [
          {
            data: this.trendTimeRange === 'day' ? [120, 200, 150, 180, 220, 300, 250] : [500, 600, 700, 800],
            type: 'line',
            smooth: true
          }
        ]
      }
      this.trendChart.setOption(option)
    },
    // 更新风格饼图
    updateStyleChart() {
      const styleData = this.playlistData.reduce((acc, playlist) => {
        acc[playlist.style] = (acc[playlist.style] || 0) + 1
        return acc
      }, {})
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '风格占比',
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
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: Object.entries(styleData).map(([name, value]) => ({ name, value }))
          }
        ]
      }
      this.styleChart.setOption(option)
    },
    // 切换视图模式
    toggleViewMode(mode) {
      this.viewMode = mode
      localStorage.setItem('collectPlaylistViewMode', mode)
    },
    // 切换布局模式
    toggleLayoutMode() {
      this.layoutMode = this.layoutMode === 'three-column' ? 'two-column' : 'three-column'
      // 更新URL参数
      this.$router.push({
        query: {
          ...this.$route.query,
          layout: this.layoutMode
        }
      })
    },
    // 筛选条件变化
    onFilterChange() {
      // 重置分页
      this.currentPage = 1
      this.displayedPlaylists = []
      this.hasMore = true
      // 加载第一页数据
      this.loadMore()
      // 更新URL参数
      this.updateUrlParams()
      // 保存筛选条件到localStorage
      localStorage.setItem('collectPlaylistFilterData', JSON.stringify(this.filterData))
    },
    // 更新URL参数
    updateUrlParams() {
      const query = {
        collectTime: this.filterData.collectTime,
        playlistType: this.filterData.playlistType,
        playCountMin: this.filterData.playCountRange[0],
        playCountMax: this.filterData.playCountRange[1],
        layout: this.layoutMode
      }
      this.$router.push({
        query
      })
    },
    // 加载更多数据
    loadMore() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      const filteredData = this.filterPlaylists()
      const newData = filteredData.slice(startIndex, endIndex)
      this.displayedPlaylists = [...this.displayedPlaylists, ...newData]
      this.currentPage++
      // 检查是否还有更多数据
      this.hasMore = endIndex < filteredData.length
    },
    // 筛选歌单
    filterPlaylists() {
      return this.playlistData.filter(playlist => {
        // 收藏时间筛选
        let collectTimeMatch = true
        if (this.filterData.collectTime === '7d') {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          collectTimeMatch = new Date(playlist.collectTime) >= sevenDaysAgo
        } else if (this.filterData.collectTime === '30d') {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          collectTimeMatch = new Date(playlist.collectTime) >= thirtyDaysAgo
        } else if (this.filterData.collectTime === 'custom' && this.filterData.dateRange) {
          const [startDate, endDate] = this.filterData.dateRange
          collectTimeMatch = new Date(playlist.collectTime) >= startDate && new Date(playlist.collectTime) <= endDate
        }

        // 歌单类型筛选
        let typeMatch = true
        if (this.filterData.playlistType) {
          // 这里只是模拟，实际需要根据歌单类型字段筛选
          typeMatch = true
        }

        // 播放量筛选
        const playCount = parseFloat(playlist.playCount)
        const [minPlayCount, maxPlayCount] = this.filterData.playCountRange
        const playCountMatch = playCount >= minPlayCount && playCount <= maxPlayCount

        return collectTimeMatch && typeMatch && playCountMatch
      })
    },
    // 滚动事件处理
    handleScroll() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = document.documentElement.clientHeight || window.innerHeight
      // 触底加载更多
      if (scrollTop + clientHeight >= scrollHeight - 200 && this.hasMore) {
        this.loadMore()
      }
    },
    // 播放歌单
    playPlaylist(playlist) {
      console.log('播放歌单:', playlist.name)
    },
    // 删除歌单
    deletePlaylist(playlist) {
      this.currentDeletePlaylist = playlist
      this.deleteDialogVisible = true
    },
    // 确认删除
    confirmDelete() {
      const index = this.playlistData.findIndex(item => item.id === this.currentDeletePlaylist.id)
      if (index !== -1) {
        this.playlistData.splice(index, 1)
        // 重新筛选和加载数据
        this.onFilterChange()
        // 更新图表
        this.updateStyleChart()
      }
      this.deleteDialogVisible = false
      this.currentDeletePlaylist = null
    },
    // 导出CSV
    exportCSV() {
      const headers = ['歌单名称', '描述', '播放量（万）', '收藏时间', '风格']
      const rows = this.playlistData.map(playlist => [
        playlist.name,
        playlist.description,
        playlist.playCount,
        playlist.collectTime,
        playlist.style
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'collect_playlist.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 初始化网络监听
    initNetworkListener() {
      window.addEventListener('online', this.handleNetworkOnline)
      window.addEventListener('offline', this.handleNetworkOffline)
    },
    // 网络恢复
    handleNetworkOnline() {
      this.networkAlertMessage = '网络已恢复'
      this.networkAlertVisible = true
      // 恢复筛选条件
      const savedFilterData = localStorage.getItem('collectPlaylistFilterData')
      if (savedFilterData) {
        this.filterData = JSON.parse(savedFilterData)
        this.onFilterChange()
      }
    },
    // 网络断开
    handleNetworkOffline() {
      // 保存筛选条件到localStorage
      localStorage.setItem('collectPlaylistFilterData', JSON.stringify(this.filterData))
    }
  }
}
</script>

<style scoped>
.collect-playlist-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  gap: 20px;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.play-count-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.view-toggle {
  margin-right: 10px;
}

.playlist-section {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.playlist-section.with-sidebar {
  width: 75%;
}

.grid-view {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.playlist-card {
  width: 200px;
  height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.playlist-card:hover .card-image img {
  transform: scale(1.1);
}

.play-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transition: all 0.3s ease;
}

.playlist-card:hover .play-button {
  opacity: 1;
}

.card-info {
  padding: 10px;
  height: 80px;
  overflow: hidden;
}

.playlist-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  font-size: 11px;
  color: #ccc;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: all 0.3s ease;
}

.playlist-card:hover .delete-button {
  opacity: 1;
}

.list-view {
  width: 100%;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 100;
}

.load-more, .no-more, .no-data {
  text-align: center;
  padding: 20px;
}

.stats-section {
  width: 25%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .playlist-section.with-sidebar {
    width: 70%;
  }
  
  .stats-section {
    width: 30%;
  }
}

@media (max-width: 1200px) {
  .collect-playlist-container {
    flex-direction: column;
  }
  
  .playlist-section.with-sidebar {
    width: 100%;
  }
  
  .stats-section {
    width: 100%;
    flex-direction: row;
  }
  
  .stats-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .filter-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    border-radius: 8px 8px 0 0;
  }
  
  .playlist-section {
    margin-bottom: 120px;
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .playlist-card {
    width: 100%;
    height: auto;
    display: flex;
  }
  
  .card-image {
    width: 120px;
    height: 120px;
  }
  
  .card-info {
    flex: 1;
    height: auto;
  }
}
</style>