<template>
  <div class="collect-playlist-container">
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <!-- 收藏时间筛选 -->
        <el-form-item label="收藏时间">
          <el-select v-model="filterForm.collectTime" placeholder="请选择" @change="handleFilterChange">
            <el-option label="近7天" value="7" />
            <el-option label="近30天" value="30" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-date-picker
            v-if="filterForm.collectTime === 'custom'"
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilterChange"
          />
        </el-form-item>
        
        <!-- 歌单类型筛选 -->
        <el-form-item label="歌单类型">
          <el-select v-model="filterForm.playlistType" placeholder="请选择" @change="handleFilterChange">
            <el-option label="自建" value="self" />
            <el-option label="收藏" value="collect" />
            <el-option label="合作" value="collab" />
          </el-select>
        </el-form-item>
        
        <!-- 播放量区间筛选 -->
        <el-form-item label="播放量区间">
          <el-slider
            v-model="filterForm.playCountRange"
            :min="0"
            :max="100000"
            :step="1000"
            range
            @change="handleFilterChange"
          />
          <span class="slider-value">{{ filterForm.playCountRange[0] }} - {{ filterForm.playCountRange[1] }}</span>
        </el-form-item>
        
        <!-- 布局切换 -->
        <el-form-item>
          <el-button-group>
            <el-button @click="toggleLayout('three-column')" :type="layout === 'three-column' ? 'primary' : 'default'">
              三栏布局
            </el-button>
            <el-button @click="toggleLayout('two-column')" :type="layout === 'two-column' ? 'primary' : 'default'">
              隐藏统计
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 中间内容区 -->
    <div class="content-section">
      <!-- 歌单列表区 -->
      <div class="playlist-section">
        <!-- 视图切换 -->
        <div class="view-toggle">
          <el-button-group>
            <el-button @click="toggleView('grid')" :type="viewMode === 'grid' ? 'primary' : 'default'">
              <i class="el-icon-s-grid"></i>
            </el-button>
            <el-button @click="toggleView('list')" :type="viewMode === 'list' ? 'primary' : 'default'">
              <i class="el-icon-menu"></i>
            </el-button>
          </el-button-group>
          <span class="playlist-count">共 {{ filteredPlaylists.length }} 个歌单</span>
        </div>
        
        <!-- 歌单列表 -->
        <div v-if="viewMode === 'grid'" class="playlist-grid">
          <div v-for="playlist in filteredPlaylists" :key="playlist.id" class="playlist-card">
            <div class="card-cover">
              <img :src="playlist.coverImgUrl" :alt="playlist.name" class="cover-img" loading="lazy" />
              <div class="play-btn" @click="playPlaylist(playlist)">
                <i class="el-icon-play-circle"></i>
              </div>
            </div>
            <div class="card-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-description">{{ playlist.description }}</p>
              <div class="playlist-meta">
                <span>{{ playlist.playCount }} 播放</span>
                <span>{{ playlist.trackCount }} 首</span>
                <span>{{ playlist.createTime }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button size="small" @click="deletePlaylist(playlist)">删除</el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="playlist-list">
          <el-table :data="filteredPlaylists" border stripe height="600" :header-cell-style="{ position: 'sticky', top: 0, zIndex: 10 }">
            <el-table-column prop="name" label="歌单名称" min-width="200" />
            <el-table-column prop="description" label="描述" min-width="300" />
            <el-table-column prop="playCount" label="播放量" width="120" />
            <el-table-column prop="trackCount" label="歌曲数" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="150" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button size="small" @click="playPlaylist(scope.row)">播放</el-button>
                <el-button size="small" type="danger" @click="deletePlaylist(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 加载更多 -->
        <div v-if="loading" class="loading-more">
          <el-loading-spinner size="large" />
          <span>加载中...</span>
        </div>
        <div v-else-if="!loading && filteredPlaylists.length === 0" class="no-data">
          <span>暂无歌单数据</span>
        </div>
      </div>
      
      <!-- 右侧统计看板 -->
      <div v-if="layout === 'three-column'" class="stats-section">
        <div class="stats-card">
          <h3>收藏歌单播放量趋势</h3>
          <el-radio-group v-model="trendPeriod" @change="updateTrendChart" button-style="solid">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
          </el-radio-group>
          <div id="trend-chart" ref="trendChart" class="chart-container"></div>
          <el-button size="small" @click="exportCSV">导出数据</el-button>
        </div>
        
        <div class="stats-card">
          <h3>歌单风格占比</h3>
          <div id="style-chart" ref="styleChart" class="chart-container"></div>
        </div>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <el-dialog title="确认删除" :visible.sync="deleteDialogVisible" width="30%" :before-close="handleClose">
      <span>删除后不可恢复，确定要删除这个歌单吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'CollectPlaylist',
  data() {
    return {
      filterForm: {
        collectTime: '7',
        dateRange: [],
        playlistType: '',
        playCountRange: [0, 100000]
      },
      layout: 'three-column',
      viewMode: 'grid',
      trendPeriod: 'day',
      loading: false,
      deleteDialogVisible: false,
      playlistToDelete: null,
      allPlaylists: [],
      filteredPlaylists: [],
      trendChart: null,
      styleChart: null,
      isOnline: true,
      networkStatus: null
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    
    // 初始化图表
    this.initCharts()
    
    // 监听网络状态
    this.networkStatus = navigator.onLine
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
    
    // 从URL参数恢复状态
    this.restoreStateFromURL()
  },
  beforeDestroy() {
    // 销毁图表
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    if (this.styleChart) {
      this.styleChart.dispose()
    }
    
    // 移除事件监听
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    window.removeEventListener('scroll', this.handleScroll)
  },
  computed: {
    // 过滤歌单数据
    filteredPlaylists() {
      return this.allPlaylists.filter(playlist => {
        // 收藏时间过滤
        if (this.filterForm.collectTime === '7') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          if (new Date(playlist.createTime) < sevenDaysAgo) {
            return false
          }
        } else if (this.filterForm.collectTime === '30') {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          if (new Date(playlist.createTime) < thirtyDaysAgo) {
            return false
          }
        } else if (this.filterForm.collectTime === 'custom' && this.filterForm.dateRange.length === 2) {
          const [startDate, endDate] = this.filterForm.dateRange
          if (new Date(playlist.createTime) < startDate || new Date(playlist.createTime) > endDate) {
            return false
          }
        }
        
        // 歌单类型过滤
        if (this.filterForm.playlistType && playlist.type !== this.filterForm.playlistType) {
          return false
        }
        
        // 播放量区间过滤
        if (playlist.playCount < this.filterForm.playCountRange[0] || playlist.playCount > this.filterForm.playCountRange[1]) {
          return false
        }
        
        return true
      })
    }
  },
  methods: {
    // 初始化数据
    initData() {
      // 模拟100条歌单数据
      this.allPlaylists = Array.from({ length: 100 }, (_, i) => {
        const types = ['self', 'collect', 'collab']
        const styles = ['流行', '摇滚', '电子', '民谣', '说唱', '古典', '爵士', '乡村']
        const now = new Date()
        const createTime = new Date(now.getTime() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        
        return {
          id: i + 1,
          name: `歌单 ${i + 1}`,
          description: `这是歌单 ${i + 1} 的描述内容，包含一些关于音乐风格和主题的信息。`,
          coverImgUrl: `https://picsum.photos/seed/playlist${i}/300/300.jpg`,
          playCount: Math.floor(Math.random() * 100000),
          trackCount: Math.floor(Math.random() * 200) + 10,
          createTime: createTime.toISOString().split('T')[0],
          type: types[Math.floor(Math.random() * types.length)],
          style: styles[Math.floor(Math.random() * styles.length)]
        }
      })
      
      this.loading = false
    },
    
    // 初始化图表
    initCharts() {
      // 播放量趋势图
      this.trendChart = echarts.init(this.$refs.trendChart)
      this.updateTrendChart()
      
      // 风格占比饼图
      this.styleChart = echarts.init(this.$refs.styleChart)
      this.updateStyleChart()
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.trendChart.resize()
        this.styleChart.resize()
      })
    },
    
    // 更新趋势图
    updateTrendChart() {
      const data = this.generateTrendData()
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '播放量',
            data: data.series,
            type: 'line',
            smooth: true
          }
        ]
      }
      this.trendChart.setOption(option)
    },
    
    // 更新风格占比图
    updateStyleChart() {
      const styleCount = {}
      this.allPlaylists.forEach(playlist => {
        styleCount[playlist.style] = (styleCount[playlist.style] || 0) + 1
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
            name: '歌单风格',
            type: 'pie',
            radius: '50%',
            data: Object.keys(styleCount).map(style => ({
              value: styleCount[style],
              name: style
            })),
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
      this.styleChart.setOption(option)
    },
    
    // 生成趋势数据
    generateTrendData() {
      const xAxis = []
      const series = []
      const now = new Date()
      
      if (this.trendPeriod === 'day') {
        // 生成最近7天的数据
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          xAxis.push(date.toISOString().split('T')[0])
          series.push(Math.floor(Math.random() * 10000))
        }
      } else {
        // 生成最近6周的数据
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
          xAxis.push(`第${Math.floor(date.getDate() / 7) + 1}周`)
          series.push(Math.floor(Math.random() * 50000))
        }
      }
      
      return { xAxis, series }
    },
    
    // 切换布局
    toggleLayout(layout) {
      this.layout = layout
      this.updateURLParams()
    },
    
    // 切换视图模式
    toggleView(view) {
      this.viewMode = view
      localStorage.setItem('playlistViewMode', view)
    },
    
    // 处理筛选条件变化
    handleFilterChange() {
      this.updateURLParams()
      if (!this.isOnline) {
        // 网络中断时保存筛选条件到localStorage
        localStorage.setItem('filterForm', JSON.stringify(this.filterForm))
      }
    },
    
    // 更新URL参数
    updateURLParams() {
      const params = new URLSearchParams()
      params.append('layout', this.layout)
      params.append('collectTime', this.filterForm.collectTime)
      if (this.filterForm.collectTime === 'custom' && this.filterForm.dateRange.length === 2) {
        params.append('startDate', this.filterForm.dateRange[0].toISOString().split('T')[0])
        params.append('endDate', this.filterForm.dateRange[1].toISOString().split('T')[0])
      }
      if (this.filterForm.playlistType) {
        params.append('playlistType', this.filterForm.playlistType)
      }
      params.append('playCountMin', this.filterForm.playCountRange[0])
      params.append('playCountMax', this.filterForm.playCountRange[1])
      
      this.$router.push({ path: this.$route.path, query: params })
    },
    
    // 从URL参数恢复状态
    restoreStateFromURL() {
      const query = this.$route.query
      
      // 恢复布局
      if (query.layout) {
        this.layout = query.layout
      }
      
      // 恢复筛选条件
      if (query.collectTime) {
        this.filterForm.collectTime = query.collectTime
      }
      if (query.startDate && query.endDate) {
        this.filterForm.dateRange = [new Date(query.startDate), new Date(query.endDate)]
      }
      if (query.playlistType) {
        this.filterForm.playlistType = query.playlistType
      }
      if (query.playCountMin && query.playCountMax) {
        this.filterForm.playCountRange = [parseInt(query.playCountMin), parseInt(query.playCountMax)]
      }
      
      // 恢复视图模式
      const savedViewMode = localStorage.getItem('playlistViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },
    
    // 播放歌单
    playPlaylist(playlist) {
      this.$message.success(`开始播放歌单：${playlist.name}`)
    },
    
    // 删除歌单
    deletePlaylist(playlist) {
      this.playlistToDelete = playlist
      this.deleteDialogVisible = true
    },
    
    // 确认删除
    confirmDelete() {
      const index = this.allPlaylists.findIndex(p => p.id === this.playlistToDelete.id)
      if (index !== -1) {
        this.allPlaylists.splice(index, 1)
        this.$message.success('歌单删除成功')
        this.updateStyleChart() // 更新图表
      }
      this.deleteDialogVisible = false
      this.playlistToDelete = null
    },
    
    // 关闭删除弹窗
    handleClose() {
      this.deleteDialogVisible = false
      this.playlistToDelete = null
    },
    
    // 导出CSV
    exportCSV() {
      const data = this.generateTrendData()
      const csvContent = 'data:text/csv;charset=utf-8,'
        + '日期,播放量\n'
        + data.xAxis.map((date, i) => `${date},${data.series[i]}`).join('\n')
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `播放量趋势_${this.trendPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    
    // 处理网络连接
    handleOnline() {
      this.isOnline = true
      
      // 恢复之前保存的筛选条件
      const savedFilterForm = localStorage.getItem('filterForm')
      if (savedFilterForm) {
        this.filterForm = JSON.parse(savedFilterForm)
        localStorage.removeItem('filterForm')
        this.$message.success('网络已恢复，已恢复之前的筛选条件')
      }
    },
    
    // 处理网络断开
    handleOffline() {
      this.isOnline = false
      this.$message.warning('网络连接已断开，筛选条件将保存到本地')
    },
    
    // 处理滚动事件
    handleScroll() {
      // 滚动时暂停图片加载
      const images = document.querySelectorAll('.cover-img')
      images.forEach(img => {
        if (img.getBoundingClientRect().top > window.innerHeight || img.getBoundingClientRect().bottom < 0) {
          img.setAttribute('loading', 'lazy')
        } else {
          img.removeAttribute('loading')
        }
      })
      
      // 触底加载更多（模拟）
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && !this.loading) {
        this.loading = true
        // 模拟加载延迟
        setTimeout(() => {
          // 这里可以添加真实的加载更多逻辑
          this.loading = false
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.collect-playlist-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-value {
  margin-left: 10px;
  color: #666;
}

.content-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.playlist-section {
  flex: 1;
  min-width: 600px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.playlist-count {
  color: #666;
  font-size: 14px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.playlist-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .cover-img {
  transform: scale(1.1);
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.playlist-card:hover .play-btn {
  opacity: 1;
}

.play-btn i {
  color: #fff;
  font-size: 30px;
  margin-left: 5px;
}

.card-info {
  padding: 15px;
}

.playlist-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.playlist-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 15px;
}

.card-actions {
  padding: 0 15px 15px;
  display: flex;
  justify-content: flex-end;
}

.playlist-list {
  margin-top: 20px;
}

.stats-section {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin: 20px 0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .stats-section {
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .content-section {
    flex-direction: column;
  }
  
  .stats-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .stats-card {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .collect-playlist-container {
    padding: 10px;
  }
  
  .filter-section {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .playlist-section {
    min-width: 100%;
    padding: 15px;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .stats-card {
    min-width: 100%;
  }
}
</style>