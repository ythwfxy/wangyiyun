<template>
  <div class="collect-playlist-container">
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>收藏时间：</label>
        <el-select v-model="filters.collectTime" placeholder="请选择" @change="onFilterChange">
          <el-option label="近7天" value="7d"></el-option>
          <el-option label="近30天" value="30d"></el-option>
          <el-option label="自定义" value="custom"></el-option>
        </el-select>
        <el-date-picker
          v-if="filters.collectTime === 'custom'"
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="onFilterChange"
        ></el-date-picker>
      </div>
      <div class="filter-item">
        <label>歌单类型：</label>
        <el-select v-model="filters.playlistType" placeholder="请选择" @change="onFilterChange">
          <el-option label="自建" value="self"></el-option>
          <el-option label="收藏" value="collect"></el-option>
          <el-option label="合作" value="collab"></el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <label>播放量区间：</label>
        <el-slider
          v-model="filters.playCountRange"
          :min="0"
          :max="100000"
          :step="1000"
          range
          @change="onFilterChange"
        ></el-slider>
        <span class="play-count-text">{{ filters.playCountRange[0] }} - {{ filters.playCountRange[1] }}</span>
      </div>
      <div class="filter-item">
        <el-button type="primary" @click="resetFilters">重置筛选</el-button>
      </div>
    </div>

    <!-- 布局切换和视图切换 -->
    <div class="toolbar">
      <div class="layout-toggle">
        <label>布局：</label>
        <el-radio-group v-model="layoutMode" @change="onLayoutChange">
          <el-radio-button label="three-column">三栏布局</el-radio-button>
          <el-radio-button label="two-column">两栏布局</el-radio-button>
        </el-radio-group>
      </div>
      <div class="view-toggle">
        <label>视图：</label>
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="switchView('grid')">
            <i class="el-icon-s-grid"></i> 网格
          </el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="switchView('list')">
            <i class="el-icon-s-order"></i> 列表
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 中间歌单列表区 -->
    <div class="main-content">
      <div class="playlist-section" :class="{ 'with-sidebar': layoutMode === 'three-column' }">
        <!-- 列表视图表头 -->
        <div v-if="viewMode === 'list'" class="list-header">
          <div class="header-item">封面</div>
          <div class="header-item">名称</div>
          <div class="header-item">创建者</div>
          <div class="header-item">播放量</div>
          <div class="header-item">收藏时间</div>
          <div class="header-item">操作</div>
        </div>

        <!-- 歌单列表 -->
        <div class="playlist-container" :class="viewMode">
          <div
            v-for="(playlist, index) in displayPlaylists"
            :key="playlist.id"
            class="playlist-item"
            @mouseenter="showPlayButton(index)"
            @mouseleave="hidePlayButton(index)"
          >
            <!-- 网格视图 -->
            <div v-if="viewMode === 'grid'" class="grid-item">
              <div class="playlist-cover">
                <img :src="playlist.coverUrl" :alt="playlist.name" class="cover-img" />
                <div
                  v-if="playlist.showPlayButton"
                  class="play-button-overlay"
                  @click.stop="playPlaylist(playlist)"
                >
                  <i class="el-icon-play-circle"></i>
                </div>
              </div>
              <div class="playlist-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-creator">by {{ playlist.creator }}</p>
                <p class="playlist-stats">
                  <span>播放量：{{ playlist.playCount }}</span>
                  <span>收藏时间：{{ playlist.collectTime }}</span>
                </p>
              </div>
              <div class="playlist-actions">
                <el-button type="danger" size="small" @click.stop="deletePlaylist(playlist.id)">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
            </div>

            <!-- 列表视图 -->
            <div v-if="viewMode === 'list'" class="list-item">
              <div class="list-item-content">
                <div class="item-cover">
                  <img :src="playlist.coverUrl" :alt="playlist.name" class="cover-img" />
                </div>
                <div class="item-name">{{ playlist.name }}</div>
                <div class="item-creator">{{ playlist.creator }}</div>
                <div class="item-playcount">{{ playlist.playCount }}</div>
                <div class="item-collecttime">{{ playlist.collectTime }}</div>
                <div class="item-actions">
                  <el-button type="primary" size="small" @click.stop="playPlaylist(playlist)">
                    <i class="el-icon-play"></i> 播放
                  </el-button>
                  <el-button type="danger" size="small" @click.stop="deletePlaylist(playlist.id)">
                    <i class="el-icon-delete"></i> 删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more-container">
          <el-button
            v-if="hasMore"
            type="default"
            loading="loading"
            @click="loadMore"
          >
            加载更多
          </el-button>
          <div v-else class="no-more-text">没有更多歌单了</div>
        </div>
      </div>

      <!-- 右侧统计看板 -->
      <div v-if="layoutMode === 'three-column'" class="stats-sidebar">
        <div class="stats-card">
          <h3>收藏歌单播放量趋势</h3>
          <div class="chart-container">
            <el-radio-group v-model="trendPeriod" @change="updateTrendChart">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
            </el-radio-group>
            <div id="trendChart" class="chart"></div>
          </div>
        </div>

        <div class="stats-card">
          <h3>歌单风格占比</h3>
          <div class="chart-container">
            <div id="styleChart" class="chart"></div>
          </div>
        </div>

        <div class="stats-actions">
          <el-button type="primary" @click="exportData">
            <i class="el-icon-download"></i> 导出CSV
          </el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog
      title="删除歌单"
      :visible.sync="deleteDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>删除后不可恢复，确定要删除吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'collectPlaylist',
  data() {
    return {
      // 筛选条件
      filters: {
        collectTime: '',
        dateRange: [],
        playlistType: '',
        playCountRange: [0, 100000]
      },
      // 布局模式
      layoutMode: 'three-column',
      // 视图模式
      viewMode: 'grid',
      // 歌单数据
      playlists: [],
      // 显示的歌单数据
      displayPlaylists: [],
      // 每页显示数量
      pageSize: 20,
      // 当前页码
      currentPage: 1,
      // 是否有更多数据
      hasMore: true,
      // 删除弹窗
      deleteDialogVisible: false,
      // 要删除的歌单ID
      deletePlaylistId: null,
      // 趋势图周期
      trendPeriod: 'day',
      // 趋势图实例
      trendChart: null,
      // 风格图实例
      styleChart: null
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    // 初始化图表
    this.initCharts()
    // 监听滚动事件
    this.$nextTick(() => {
      window.addEventListener('scroll', this.handleScroll)
    })
    // 检查网络状态
    this.checkNetworkStatus()
  },
  beforeDestroy() {
    // 移除滚动事件监听
    window.removeEventListener('scroll', this.handleScroll)
    // 销毁图表
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
      // 从URL参数恢复筛选条件
      this.restoreFiltersFromUrl()
      // 从localStorage恢复视图模式
      this.restoreViewMode()
      // 模拟生成100条歌单数据
      this.generateMockData()
      // 筛选和分页
      this.filterAndPaginate()
    },
    // 生成模拟数据
    generateMockData() {
      const styles = ['流行', '摇滚', '电子', '古典', '嘻哈', '民谣', '爵士', '金属']
      const creators = ['用户1', '用户2', '用户3', '用户4', '用户5']
      
      for (let i = 1; i <= 100; i++) {
        const now = new Date()
        const collectTime = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        
        this.playlists.push({
          id: i,
          name: `歌单${i}`,
          coverUrl: `https://picsum.photos/200/200?random=${i}`,
          creator: creators[Math.floor(Math.random() * creators.length)],
          playCount: Math.floor(Math.random() * 100000),
          collectTime: collectTime.toLocaleDateString(),
          style: styles[Math.floor(Math.random() * styles.length)],
          showPlayButton: false
        })
      }
    },
    // 筛选和分页
    filterAndPaginate() {
      let filtered = [...this.playlists]
      
      // 收藏时间筛选
      if (this.filters.collectTime === '7d') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(playlist => new Date(playlist.collectTime) >= sevenDaysAgo)
      } else if (this.filters.collectTime === '30d') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(playlist => new Date(playlist.collectTime) >= thirtyDaysAgo)
      } else if (this.filters.collectTime === 'custom' && this.filters.dateRange.length === 2) {
        const startDate = this.filters.dateRange[0]
        const endDate = this.filters.dateRange[1]
        filtered = filtered.filter(playlist => {
          const collectDate = new Date(playlist.collectTime)
          return collectDate >= startDate && collectDate <= endDate
        })
      }
      
      // 歌单类型筛选
      if (this.filters.playlistType) {
        // 这里简化处理，实际项目中应该根据类型筛选
        filtered = filtered.filter(playlist => playlist.style)
      }
      
      // 播放量区间筛选
      filtered = filtered.filter(playlist => {
        return playlist.playCount >= this.filters.playCountRange[0] && playlist.playCount <= this.filters.playCountRange[1]
      })
      
      // 分页
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      this.displayPlaylists = filtered.slice(startIndex, endIndex)
      this.hasMore = endIndex < filtered.length
    },
    // 筛选条件变化
    onFilterChange() {
      // 重置页码
      this.currentPage = 1
      // 筛选和分页
      this.filterAndPaginate()
      // 同步筛选条件到URL
      this.syncFiltersToUrl()
    },
    // 重置筛选
    resetFilters() {
      this.filters = {
        collectTime: '',
        dateRange: [],
        playlistType: '',
        playCountRange: [0, 100000]
      }
      this.onFilterChange()
    },
    // 布局切换
    onLayoutChange() {
      // 同步布局模式到URL
      this.syncLayoutToUrl()
    },
    // 视图切换
    switchView(view) {
      this.viewMode = view
      // 保存视图模式到localStorage
      localStorage.setItem('playlistViewMode', view)
    },
    // 显示播放按钮
    showPlayButton(index) {
      this.$set(this.displayPlaylists[index], 'showPlayButton', true)
    },
    // 隐藏播放按钮
    hidePlayButton(index) {
      this.$set(this.displayPlaylists[index], 'showPlayButton', false)
    },
    // 播放歌单
    playPlaylist(playlist) {
      console.log('播放歌单:', playlist.name)
      // 实际项目中这里应该触发播放逻辑
    },
    // 删除歌单
    deletePlaylist(id) {
      this.deletePlaylistId = id
      this.deleteDialogVisible = true
    },
    // 确认删除
    confirmDelete() {
      // 实际项目中这里应该调用API删除歌单
      this.playlists = this.playlists.filter(playlist => playlist.id !== this.deletePlaylistId)
      this.filterAndPaginate()
      this.deleteDialogVisible = false
      this.$message.success('歌单删除成功')
    },
    // 关闭弹窗
    handleClose() {
      this.deleteDialogVisible = false
    },
    // 加载更多
    loadMore() {
      this.currentPage++
      this.filterAndPaginate()
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
    // 初始化图表
    initCharts() {
      // 播放量趋势图
      this.trendChart = echarts.init(document.getElementById('trendChart'))
      this.updateTrendChart()
      
      // 歌单风格占比图
      this.styleChart = echarts.init(document.getElementById('styleChart'))
      this.updateStyleChart()
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.trendChart.resize()
        this.styleChart.resize()
      })
    },
    // 更新趋势图
    updateTrendChart() {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      const weeks = ['第1周', '第2周', '第3周', '第4周']
      
      const xAxisData = this.trendPeriod === 'day' ? days : weeks
      const seriesData = xAxisData.map(() => Math.floor(Math.random() * 100000))
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: seriesData,
            type: 'line',
            smooth: true
          }
        ]
      }
      
      this.trendChart.setOption(option)
    },
    // 更新风格图
    updateStyleChart() {
      const styles = ['流行', '摇滚', '电子', '古典', '嘻哈', '民谣', '爵士', '金属']
      const data = styles.map(style => {
        return {
          value: Math.floor(Math.random() * 100),
          name: style
        }
      })
      
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
            data: data
          }
        ]
      }
      
      this.styleChart.setOption(option)
    },
    // 导出数据
    exportData() {
      // 实际项目中这里应该导出真实数据
      const csvContent = 'data:text/csv;charset=utf-8,' 
        + 'ID,名称,创建者,播放量,收藏时间,风格\n' 
        + this.playlists.map(e => `${e.id},${e.name},${e.creator},${e.playCount},${e.collectTime},${e.style}`).join('\n')
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', 'collect_playlists.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.$message.success('数据导出成功')
    },
    // 从URL参数恢复筛选条件
    restoreFiltersFromUrl() {
      const params = new URLSearchParams(window.location.hash.split('?')[1])
      
      this.filters.collectTime = params.get('collectTime') || ''
      this.filters.playlistType = params.get('playlistType') || ''
      
      const playCountRange = params.get('playCountRange')
      if (playCountRange) {
        this.filters.playCountRange = playCountRange.split(',').map(Number)
      }
      
      const dateRange = params.get('dateRange')
      if (dateRange) {
        this.filters.dateRange = dateRange.split(',').map(str => new Date(str))
      }
      
      this.layoutMode = params.get('layout') || 'three-column'
    },
    // 同步筛选条件到URL
    syncFiltersToUrl() {
      const params = new URLSearchParams()
      
      if (this.filters.collectTime) {
        params.set('collectTime', this.filters.collectTime)
      }
      if (this.filters.playlistType) {
        params.set('playlistType', this.filters.playlistType)
      }
      if (this.filters.playCountRange) {
        params.set('playCountRange', this.filters.playCountRange.join(','))
      }
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.set('dateRange', this.filters.dateRange.map(date => date.toISOString()).join(','))
      }
      
      params.set('layout', this.layoutMode)
      
      const currentHash = window.location.hash.split('?')[0]
      window.location.hash = `${currentHash}?${params.toString()}`
    },
    // 同步布局模式到URL
    syncLayoutToUrl() {
      const params = new URLSearchParams(window.location.hash.split('?')[1])
      params.set('layout', this.layoutMode)
      
      const currentHash = window.location.hash.split('?')[0]
      window.location.hash = `${currentHash}?${params.toString()}`
    },
    // 从localStorage恢复视图模式
    restoreViewMode() {
      const savedViewMode = localStorage.getItem('playlistViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },
    // 检查网络状态
    checkNetworkStatus() {
      window.addEventListener('online', this.handleNetworkOnline)
      window.addEventListener('offline', this.handleNetworkOffline)
    },
    // 网络恢复
    handleNetworkOnline() {
      this.$message.success('网络已恢复')
      // 恢复之前保存的筛选条件
      const savedFilters = localStorage.getItem('savedFilters')
      if (savedFilters) {
        this.filters = JSON.parse(savedFilters)
        this.onFilterChange()
        localStorage.removeItem('savedFilters')
      }
    },
    // 网络中断
    handleNetworkOffline() {
      this.$message.error('网络已中断，筛选条件将保存到本地')
      // 保存筛选条件到localStorage
      localStorage.setItem('savedFilters', JSON.stringify(this.filters))
    }
  }
}
</script>

<style scoped>
.collect-playlist-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部筛选区 */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: 500;
  white-space: nowrap;
}

.play-count-text {
  font-size: 14px;
  color: #666;
  min-width: 120px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.layout-toggle, .view-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.layout-toggle label, .view-toggle label {
  font-weight: 500;
}

/* 中间内容区 */
.main-content {
  display: flex;
  gap: 20px;
}

/* 歌单列表区 */
.playlist-section {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.playlist-section.with-sidebar {
  flex: 2;
}

/* 列表视图表头 */
.list-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.header-item {
  flex: 1;
  text-align: left;
}

.header-item:first-child {
  flex: 0 0 80px;
}

.header-item:last-child {
  flex: 0 0 120px;
}

/* 歌单容器 */
.playlist-container {
  margin-top: 20px;
}

/* 网格视图 */
.playlist-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.grid-item {
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.playlist-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.grid-item:hover .cover-img {
  transform: scale(1.1);
}

.play-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.play-button-overlay i {
  font-size: 48px;
  color: white;
  transition: all 0.3s ease;
}

.play-button-overlay:hover i {
  transform: scale(1.2);
}

.playlist-info {
  padding: 15px;
}

.playlist-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-creator {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.playlist-stats {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.playlist-actions {
  padding: 0 15px 15px;
  display: flex;
  justify-content: flex-end;
}

/* 列表视图 */
.playlist-container.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.list-item:hover {
  background-color: #f0f0f0;
}

.list-item-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
}

.item-cover {
  flex: 0 0 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.item-name {
  flex: 2;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-creator {
  flex: 1;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-playcount {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.item-collecttime {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.item-actions {
  flex: 0 0 150px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 加载更多 */
.load-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.no-more-text {
  font-size: 14px;
  color: #999;
}

/* 右侧统计看板 */
.stats-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.chart-container {
  position: relative;
  height: 250px;
}

.chart-container .el-radio-group {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.chart {
  width: 100%;
  height: 100%;
}

.stats-actions {
  display: flex;
  justify-content: center;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .main-content {
    flex-direction: column;
  }
  
  .playlist-section.with-sidebar {
    flex: 1;
  }
  
  .stats-sidebar {
    flex-direction: row;
  }
  
  .stats-card {
    flex: 1;
  }
}

@media (max-width: 1200px) {
  .stats-sidebar {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .playlist-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .list-item-content {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .item-actions {
    flex: 1 1 100%;
    justify-content: flex-start;
  }
}
</style>