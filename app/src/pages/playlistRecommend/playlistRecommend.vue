<template>
  <div class="playlist-recommend">
    <!-- 顶部分类筛选区 -->
    <div class="filter-section">
      <el-form inline>
        <el-form-item label="音乐风格">
          <el-select v-model="filters.style" placeholder="请选择风格" multiple @change="handleFilterChange">
            <el-option label="流行" value="pop"></el-option>
            <el-option label="摇滚" value="rock"></el-option>
            <el-option label="电子" value="electronic"></el-option>
            <el-option label="民谣" value="folk"></el-option>
            <el-option label="古典" value="classical"></el-option>
            <el-option label="说唱" value="rap"></el-option>
            <el-option label="爵士" value="jazz"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="歌单类型">
          <el-select v-model="filters.type" placeholder="请选择类型" @change="handleFilterChange">
            <el-option label="自建" value="self"></el-option>
            <el-option label="收藏" value="collect"></el-option>
            <el-option label="推荐" value="recommend"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="播放量区间">
          <el-slider
            v-model="filters.playCountRange"
            :min="1000"
            :max="100000"
            :step="1000"
            range
            @change="handleFilterChange"
          ></el-slider>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 中间歌单推荐列表区 -->
    <div class="list-section">
      <!-- 视图切换和列表展开/收起控制 -->
      <div class="list-header">
        <div class="view-toggle">
          <el-button-group>
            <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="switchView('grid')">
              <i class="el-icon-s-grid"></i>
            </el-button>
            <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="switchView('list')">
              <i class="el-icon-s-order"></i>
            </el-button>
          </el-button-group>
        </div>
        <div class="list-toggle">
          <el-button @click="toggleListVisible">
            {{ listVisible ? '收起列表' : '展开列表' }}
            <i :class="listVisible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </el-button>
        </div>
      </div>

      <!-- 歌单列表 -->
      <div v-if="listVisible" class="playlist-container">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="grid-view">
          <div v-for="playlist in filteredPlaylists" :key="playlist.id" class="playlist-card">
            <div class="card-cover" @click="playAll(playlist)">
              <el-image :src="playlist.coverImgUrl" fit="cover" lazy></el-image>
              <div class="play-overlay">
                <i class="el-icon-play-circle"></i>
                <span>{{ playlist.playCount }}</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <div class="playlist-tags">
                <span v-for="tag in playlist.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <div class="playlist-stats">
                <span><i class="el-icon-headset"></i> {{ playlist.playCount }}</span>
                <span><i class="el-icon-star-off"></i> {{ playlist.bookmarkCount }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="text" @click="toggleBookmark(playlist)">
                <i :class="playlist.isBookmarked ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                {{ playlist.isBookmarked ? '已收藏' : '收藏' }}
              </el-button>
              <el-button type="text" @click="addToMyRecommend(playlist)">
                <i class="el-icon-plus"></i>
                添加到我的推荐
              </el-button>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-table :data="filteredPlaylists" stripe height="500">
            <el-table-column prop="name" label="歌单名称" min-width="200">
              <template slot-scope="scope">
                <div class="playlist-info">
                  <el-image :src="scope.row.coverImgUrl" fit="cover" lazy style="width: 60px; height: 60px; margin-right: 10px;"></el-image>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="tags" label="风格标签" min-width="150">
              <template slot-scope="scope">
                <span v-for="tag in scope.row.tags" :key="tag" class="tag">{{ tag }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="playCount" label="播放量" min-width="100">
              <template slot-scope="scope">
                <i class="el-icon-headset"></i> {{ scope.row.playCount }}
              </template>
            </el-table-column>
            <el-table-column prop="bookmarkCount" label="收藏数" min-width="100">
              <template slot-scope="scope">
                <i class="el-icon-star-off"></i> {{ scope.row.bookmarkCount }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200">
              <template slot-scope="scope">
                <el-button type="text" @click="playAll(scope.row)">
                  <i class="el-icon-play"></i> 播放全部
                </el-button>
                <el-button type="text" @click="toggleBookmark(scope.row)">
                  <i :class="scope.row.isBookmarked ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                  {{ scope.row.isBookmarked ? '已收藏' : '收藏' }}
                </el-button>
                <el-button type="text" @click="addToMyRecommend(scope.row)">
                  <i class="el-icon-plus"></i> 添加到我的推荐
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="filteredPlaylists.length"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 右侧分类数据看板 -->
    <div class="dashboard-section">
      <div class="dashboard-header">
        <h3>分类数据看板</h3>
        <el-button type="primary" @click="exportData">导出CSV</el-button>
      </div>

      <!-- 各风格歌单播放量占比饼图 -->
      <div class="chart-container">
        <h4>各风格歌单播放量占比</h4>
        <div ref="pieChart" class="chart"></div>
      </div>

      <!-- 推荐歌单收藏趋势折线图 -->
      <div class="chart-container">
        <h4>推荐歌单收藏趋势</h4>
        <div ref="lineChart" class="chart"></div>
      </div>

      <!-- 用户偏好风格标签 -->
      <div class="preference-tags">
        <h4>用户偏好风格标签</h4>
        <div class="tags-container">
          <span v-for="tag in preferenceTags" :key="tag" class="preference-tag" @click="filterByTag(tag)">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 添加到我的推荐确认弹窗 -->
    <el-dialog title="添加到我的推荐" :visible.sync="showAddDialog" @close="resetAddDialog">
      <div class="add-dialog-content">
        <p>确定将歌单 "{{ selectedPlaylist.name }}" 添加到我的推荐吗？</p>
        <el-form>
          <el-form-item label="推荐理由">
            <el-input v-model="addReason" type="textarea" :rows="3" placeholder="请输入推荐理由（可选）"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddToMyRecommend">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'PlaylistRecommend',
  data() {
    return {
      // 筛选条件
      filters: {
        style: [],
        type: '',
        playCountRange: [1000, 100000]
      },
      // 视图模式（grid/list）
      viewMode: 'grid',
      // 列表可见性
      listVisible: true,
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 15,
      // 歌单数据
      playlists: [],
      // 选中的歌单
      selectedPlaylist: null,
      // 添加到我的推荐弹窗可见性
      showAddDialog: false,
      // 添加理由
      addReason: '',
      // 用户偏好标签
      preferenceTags: ['流行', '摇滚', '电子', '民谣', '古典']
    }
  },
  computed: {
    // 过滤后的歌单
    filteredPlaylists() {
      let result = [...this.playlists]

      // 按风格筛选
      if (this.filters.style.length > 0) {
        result = result.filter(playlist => {
          return this.filters.style.some(style => playlist.tags.includes(style))
        })
      }

      // 按类型筛选
      if (this.filters.type) {
        result = result.filter(playlist => playlist.type === this.filters.type)
      }

      // 按播放量区间筛选
      result = result.filter(playlist => {
        return playlist.playCount >= this.filters.playCountRange[0] && playlist.playCount <= this.filters.playCountRange[1]
      })

      return result
    },
    // 分页后的歌单
    paginatedPlaylists() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      return this.filteredPlaylists.slice(startIndex, endIndex)
    }
  },
  mounted() {
    // 初始化歌单数据
    this.initPlaylists()

    // 初始化图表
    this.initCharts()

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', this.resizeCharts)

    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // 从URL参数中恢复列表可见性
    this.restoreListVisibleFromUrl()

    // 从localStorage中恢复视图模式
    this.restoreViewModeFromLocalStorage()
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.resizeCharts)
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    // 销毁图表实例
    if (this.pieChart) {
      this.pieChart.dispose()
    }
    if (this.lineChart) {
      this.lineChart.dispose()
    }
  },
  methods: {
    // 初始化歌单数据
    initPlaylists() {
      // 模拟150条歌单数据
      const styles = ['流行', '摇滚', '电子', '民谣', '古典', '说唱', '爵士']
      const types = ['self', 'collect', 'recommend']
      const playlists = []

      for (let i = 1; i <= 150; i++) {
        const styleCount = Math.floor(Math.random() * 3) + 1
        const playlistStyles = []

        for (let j = 0; j < styleCount; j++) {
          const randomStyle = styles[Math.floor(Math.random() * styles.length)]
          if (!playlistStyles.includes(randomStyle)) {
            playlistStyles.push(randomStyle)
          }
        }

        playlists.push({
          id: i,
          name: `歌单${i}`,
          coverImgUrl: `https://picsum.photos/seed/playlist${i}/200/200.jpg`,
          tags: playlistStyles,
          type: types[Math.floor(Math.random() * types.length)],
          playCount: Math.floor(Math.random() * 99000) + 1000,
          bookmarkCount: Math.floor(Math.random() * 10000) + 100,
          isBookmarked: Math.random() > 0.5
        })
      }

      this.playlists = playlists
    },
    // 初始化图表
    initCharts() {
      // 初始化饼图
      this.pieChart = echarts.init(this.$refs.pieChart)
      this.updatePieChart()

      // 初始化折线图
      this.lineChart = echarts.init(this.$refs.lineChart)
      this.updateLineChart()
    },
    // 更新饼图
    updatePieChart() {
      const stylePlayCount = {
        '流行': 0,
        '摇滚': 0,
        '电子': 0,
        '民谣': 0,
        '古典': 0,
        '说唱': 0,
        '爵士': 0
      }

      // 统计各风格的播放量
      this.playlists.forEach(playlist => {
        playlist.tags.forEach(tag => {
          if (stylePlayCount.hasOwnProperty(tag)) {
            stylePlayCount[tag] += playlist.playCount
          }
        })
      })

      const pieData = Object.keys(stylePlayCount).map(style => ({
        value: stylePlayCount[style],
        name: style
      }))

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
            data: pieData,
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

      this.pieChart.setOption(option)
    },
    // 更新折线图
    updateLineChart() {
      // 模拟最近7天的收藏趋势数据
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      const collectCount = days.map(() => Math.floor(Math.random() * 1000) + 500)

      const option = {
        tooltip: {
          trigger: 'axis'
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
            areaStyle: {},
            data: collectCount
          }
        ]
      }

      this.lineChart.setOption(option)
    },
    // 调整图表大小
    resizeCharts() {
      if (this.pieChart) {
        this.pieChart.resize()
      }
      if (this.lineChart) {
        this.lineChart.resize()
      }
    },
    // 处理筛选条件变化
    handleFilterChange() {
      // 防抖处理
      clearTimeout(this.filterTimeout)
      this.filterTimeout = setTimeout(() => {
        // 重置页码
        this.currentPage = 1
        // 更新图表
        this.updatePieChart()
        this.updateLineChart()
        // 保存筛选条件到localStorage
        this.saveFiltersToLocalStorage()
        // 更新URL参数
        this.updateUrlParams()
      }, 200)
    },
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        style: [],
        type: '',
        playCountRange: [1000, 100000]
      }
      this.currentPage = 1
      this.updatePieChart()
      this.updateLineChart()
      this.saveFiltersToLocalStorage()
      this.updateUrlParams()
    },
    // 切换视图模式
    switchView(mode) {
      this.viewMode = mode
      // 保存视图模式到localStorage
      localStorage.setItem('playlistViewMode', mode)
    },
    // 切换列表可见性
    toggleListVisible() {
      this.listVisible = !this.listVisible
      // 更新URL参数
      this.updateUrlParams()
    },
    // 处理页码变化
    handlePageChange(page) {
      this.currentPage = page
    },
    // 播放全部歌曲
    playAll(playlist) {
      this.$message.success(`正在播放歌单 "${playlist.name}" 的全部歌曲`)
    },
    // 收藏/取消收藏歌单
    toggleBookmark(playlist) {
      playlist.isBookmarked = !playlist.isBookmarked
      if (playlist.isBookmarked) {
        this.$message.success(`已收藏歌单 "${playlist.name}"`)
      } else {
        this.$message.success(`已取消收藏歌单 "${playlist.name}"`)
      }
    },
    // 添加到我的推荐
    addToMyRecommend(playlist) {
      this.selectedPlaylist = playlist
      this.showAddDialog = true
    },
    // 确认添加到我的推荐
    confirmAddToMyRecommend() {
      this.$message.success(`歌单 "${this.selectedPlaylist.name}" 已添加到我的推荐`)
      this.showAddDialog = false
      this.resetAddDialog()
    },
    // 重置添加到我的推荐弹窗
    resetAddDialog() {
      this.selectedPlaylist = null
      this.addReason = ''
    },
    // 按标签筛选
    filterByTag(tag) {
      if (this.filters.style.includes(tag)) {
        // 如果标签已经在筛选条件中，移除它
        this.filters.style = this.filters.style.filter(style => style !== tag)
      } else {
        // 如果标签不在筛选条件中，添加它
        this.filters.style.push(tag)
      }
      this.handleFilterChange()
    },
    // 导出数据为CSV
    exportData() {
      // 准备CSV数据
      const headers = ['歌单名称', '风格标签', '类型', '播放量', '收藏数', '是否收藏']
      const rows = this.filteredPlaylists.map(playlist => [
        playlist.name,
        playlist.tags.join(','),
        playlist.type === 'self' ? '自建' : playlist.type === 'collect' ? '收藏' : '推荐',
        playlist.playCount,
        playlist.bookmarkCount,
        playlist.isBookmarked ? '是' : '否'
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
      link.setAttribute('href', url)
      link.setAttribute('download', '歌单数据.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 处理网络在线
    handleOnline() {
      this.$message.success('网络已连接')
      // 检查是否有保存的筛选条件
      const savedFilters = localStorage.getItem('savedFilters')
      if (savedFilters) {
        this.$confirm('是否恢复之前的筛选条件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.filters = JSON.parse(savedFilters)
          this.handleFilterChange()
        }).catch(() => {
          // 用户取消恢复
        })
      }
    },
    // 处理网络离线
    handleOffline() {
      this.$message.warning('网络已断开，筛选条件将保存到本地')
      // 保存筛选条件到localStorage
      this.saveFiltersToLocalStorage()
    },
    // 保存筛选条件到localStorage
    saveFiltersToLocalStorage() {
      localStorage.setItem('savedFilters', JSON.stringify(this.filters))
    },
    // 从URL参数中恢复列表可见性
    restoreListVisibleFromUrl() {
      const params = new URLSearchParams(window.location.search)
      const listVisible = params.get('listVisible')
      if (listVisible !== null) {
        this.listVisible = listVisible === 'true'
      }
    },
    // 从localStorage中恢复视图模式
    restoreViewModeFromLocalStorage() {
      const savedViewMode = localStorage.getItem('playlistViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },
    // 更新URL参数
    updateUrlParams() {
      const params = new URLSearchParams(window.location.search)
      params.set('listVisible', this.listVisible)
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
    }
  }
}
</script>

<style scoped>
.playlist-recommend {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 20px;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-section {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.playlist-container {
  flex: 1;
  overflow-y: auto;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.playlist-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.playlist-card:hover .card-cover img {
  transform: scale(1.1);
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
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  font-size: 48px;
  color: #fff;
  margin-right: 10px;
}

.play-overlay span {
  color: #fff;
  font-size: 16px;
}

.card-info {
  padding: 15px;
}

.playlist-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-tags {
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  background-color: #e0e0e0;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.playlist-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-top: 1px solid #ddd;
  background-color: #fff;
}

.list-view {
  height: 100%;
}

.playlist-info {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dashboard-section {
  width: 350px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-container h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.chart {
  height: 200px;
}

.preference-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preference-tags h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preference-tag {
  display: inline-block;
  background-color: #e0e0e0;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preference-tag:hover {
  background-color: #c62f2f;
  color: #fff;
}

.add-dialog-content p {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .playlist-recommend {
    flex-direction: row;
  }

  .list-section {
    flex: 1;
    margin-right: 20px;
  }
}

@media (max-width: 1199px) {
  .dashboard-section {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .playlist-recommend {
    padding: 10px;
  }

  .filter-section {
    padding: 10px;
  }

  .list-section {
    padding: 10px;
  }

  .dashboard-section {
    padding: 10px;
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
}
</style>