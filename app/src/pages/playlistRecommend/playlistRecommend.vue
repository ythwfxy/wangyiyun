<template>
  <div class="playlist-recommend-container">
    <!-- 顶部分类筛选区 -->
    <div class="filter-section">
      <el-form :model="filterForm" :inline="true" class="filter-form">
        <el-form-item label="音乐风格">
          <el-select v-model="filterForm.style" placeholder="请选择音乐风格" @change="handleFilterChange">
            <el-option label="全部" value=""></el-option>
            <el-option label="流行" value="pop"></el-option>
            <el-option label="摇滚" value="rock"></el-option>
            <el-option label="电子" value="electronic"></el-option>
            <el-option label="嘻哈" value="hiphop"></el-option>
            <el-option label="古典" value="classical"></el-option>
            <el-option label="民谣" value="folk"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="歌单类型">
          <el-select v-model="filterForm.type" placeholder="请选择歌单类型" @change="handleFilterChange">
            <el-option label="全部" value=""></el-option>
            <el-option label="自建" value="self"></el-option>
            <el-option label="收藏" value="collect"></el-option>
            <el-option label="推荐" value="recommend"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="播放量区间">
          <el-slider
            v-model="filterForm.playCountRange"
            :min="1000"
            :max="100000"
            :step="1000"
            range
            @change="handleFilterChange"
          ></el-slider>
          <span class="play-count-range-text">
            {{ filterForm.playCountRange[0] }} - {{ filterForm.playCountRange[1] }}
          </span>
        </el-form-item>
      </el-form>
      <div class="filter-actions">
        <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        <el-button @click="toggleListVisible">
          {{ listVisible ? '收起列表' : '展开列表' }}
        </el-button>
      </div>
    </div>

    <!-- 中间歌单推荐列表区 -->
    <div class="main-content">
      <div class="playlist-section" v-if="listVisible">
        <!-- 视图切换 -->
        <div class="view-switcher">
          <el-button-group>
            <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="switchView('grid')">
              <i class="el-icon-s-grid"></i> 网格视图
            </el-button>
            <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="switchView('list')">
              <i class="el-icon-s-order"></i> 列表视图
            </el-button>
          </el-button-group>
        </div>

        <!-- 歌单列表 -->
        <div class="playlist-list" :class="viewMode">
          <!-- 网格视图 -->
          <div class="playlist-card" v-for="playlist in filteredPlaylists" :key="playlist.id" v-if="viewMode === 'grid'">
            <div class="card-cover" @click="playAll(playlist)">
              <img :src="playlist.cover" :alt="playlist.name" class="cover-img" loading="lazy">
              <div class="play-overlay">
                <i class="el-icon-play-circle"></i>
              </div>
            </div>
            <div class="card-content">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <div class="playlist-tags">
                <el-tag size="small" v-for="tag in playlist.tags" :key="tag">{{ tag }}</el-tag>
              </div>
              <div class="playlist-stats">
                <span><i class="el-icon-video-play"></i> {{ formatNumber(playlist.playCount) }}</span>
                <span><i class="el-icon-star-off"></i> {{ formatNumber(playlist.collectCount) }}</span>
              </div>
              <div class="card-actions">
                <el-button size="small" @click="toggleCollect(playlist)">
                  {{ playlist.isCollected ? '取消收藏' : '收藏' }}
                </el-button>
                <el-button size="small" type="primary" @click="addToMyRecommend(playlist)">
                  添加至我的推荐
                </el-button>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <el-table
            v-if="viewMode === 'list'"
            :data="filteredPlaylists"
            border
            style="width: 100%"
            :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }"
          >
            <el-table-column prop="cover" label="封面" width="120">
              <template slot-scope="scope">
                <img :src="scope.row.cover" :alt="scope.row.name" class="list-cover-img" loading="lazy">
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
                <el-button size="small" @click="toggleCollect(scope.row)">
                  {{ scope.row.isCollected ? '取消收藏' : '收藏' }}
                </el-button>
                <el-button size="small" type="primary" @click="addToMyRecommend(scope.row)">
                  添加至我的推荐
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页/加载更多 -->
        <div class="pagination-section">
          <el-button v-if="hasMore" type="primary" @click="loadMore" :loading="loading">
            {{ loading ? '加载中...' : '加载更多' }}
          </el-button>
          <span v-else>已加载全部歌单</span>
        </div>
      </div>

      <!-- 右侧分类数据看板 -->
      <div class="dashboard-section">
        <div class="dashboard-card">
          <h3>各风格歌单播放量占比</h3>
          <div id="playCountPieChart" style="height: 300px;"></div>
        </div>
        <div class="dashboard-card">
          <h3>推荐歌单收藏趋势</h3>
          <div id="collectTrendChart" style="height: 300px;"></div>
        </div>
        <div class="dashboard-card">
          <h3>用户偏好风格标签</h3>
          <div class="preference-tags">
            <el-tag
              v-for="tag in preferenceTags"
              :key="tag"
              :type="activePreferenceTag === tag ? 'primary' : 'default'"
              @click="filterByPreferenceTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="dashboard-actions">
          <el-button type="primary" @click="exportData">导出数据(CSV)</el-button>
        </div>
      </div>
    </div>

    <!-- 添加至我的推荐确认弹窗 -->
    <el-dialog title="添加至我的推荐" :visible.sync="addToRecommendDialogVisible" width="30%">
      <p>确定要将歌单"{{ selectedPlaylistName }}"添加至我的推荐吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addToRecommendDialogVisible = false">取消</el-button>
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
      filterForm: {
        style: '',
        type: '',
        playCountRange: [1000, 100000]
      },
      // 歌单数据
      playlists: [],
      // 筛选后的歌单
      filteredPlaylists: [],
      // 列表可见性
      listVisible: true,
      // 视图模式
      viewMode: 'grid',
      // 加载状态
      loading: false,
      // 分页
      currentPage: 1,
      pageSize: 15,
      hasMore: true,
      // 数据看板
      playCountPieChart: null,
      collectTrendChart: null,
      preferenceTags: ['流行', '摇滚', '电子', '嘻哈', '古典', '民谣'],
      activePreferenceTag: '',
      // 弹窗
      addToRecommendDialogVisible: false,
      selectedPlaylistName: '',
      selectedPlaylistId: null
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    // 初始化图表
    this.initCharts()
    // 监听网络状态
    this.listenNetworkStatus()
    // 从URL参数获取列表可见性
    this.getListVisibleFromUrl()
    // 从localStorage获取视图模式
    this.getViewModeFromLocalStorage()
  },
  beforeDestroy() {
    // 销毁图表
    if (this.playCountPieChart) {
      this.playCountPieChart.dispose()
    }
    if (this.collectTrendChart) {
      this.collectTrendChart.dispose()
    }
  },
  computed: {
    // 计算筛选后的歌单
    filteredPlaylists() {
      let result = [...this.playlists]

      // 按音乐风格筛选
      if (this.filterForm.style) {
        result = result.filter(playlist => playlist.style === this.filterForm.style)
      }

      // 按歌单类型筛选
      if (this.filterForm.type) {
        result = result.filter(playlist => playlist.type === this.filterForm.type)
      }

      // 按播放量区间筛选
      result = result.filter(playlist => {
        return playlist.playCount >= this.filterForm.playCountRange[0] &&
               playlist.playCount <= this.filterForm.playCountRange[1]
      })

      // 按用户偏好标签筛选
      if (this.activePreferenceTag) {
        const tagMap = {
          '流行': 'pop',
          '摇滚': 'rock',
          '电子': 'electronic',
          '嘻哈': 'hiphop',
          '古典': 'classical',
          '民谣': 'folk'
        }
        const style = tagMap[this.activePreferenceTag]
        result = result.filter(playlist => playlist.style === style)
      }

      // 分页
      return result.slice(0, this.currentPage * this.pageSize)
    }
  },
  methods: {
    // 初始化数据
    initData() {
      // 模拟150条歌单数据
      const styles = ['pop', 'rock', 'electronic', 'hiphop', 'classical', 'folk']
      const types = ['self', 'collect', 'recommend']
      const tags = [
        ['流行', '华语'],
        ['摇滚', '欧美'],
        ['电子', 'EDM'],
        ['嘻哈', '说唱'],
        ['古典', '纯音乐'],
        ['民谣', '抒情']
      ]

      for (let i = 1; i <= 150; i++) {
        const styleIndex = Math.floor(Math.random() * styles.length)
        this.playlists.push({
          id: i,
          name: `歌单${i} - ${styles[styleIndex]}精选`,
          cover: `https://picsum.photos/200/200?random=${i}`,
          style: styles[styleIndex],
          type: types[Math.floor(Math.random() * types.length)],
          tags: tags[styleIndex],
          playCount: Math.floor(Math.random() * 99000) + 1000,
          collectCount: Math.floor(Math.random() * 9900) + 100,
          isCollected: Math.random() > 0.5
        })
      }
    },

    // 初始化图表
    initCharts() {
      // 播放量占比饼图
      this.playCountPieChart = echarts.init(document.getElementById('playCountPieChart'))
      const pieOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['流行', '摇滚', '电子', '嘻哈', '古典', '民谣']
        },
        series: [
          {
            name: '播放量',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 335, name: '流行' },
              { value: 310, name: '摇滚' },
              { value: 234, name: '电子' },
              { value: 135, name: '嘻哈' },
              { value: 1548, name: '古典' },
              { value: 134, name: '民谣' }
            ],
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
      this.playCountPieChart.setOption(pieOption)

      // 收藏趋势折线图
      this.collectTrendChart = echarts.init(document.getElementById('collectTrendChart'))
      const lineOption = {
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
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '收藏数',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210]
          }
        ]
      }
      this.collectTrendChart.setOption(lineOption)

      // 响应式调整
      window.addEventListener('resize', () => {
        this.playCountPieChart.resize()
        this.collectTrendChart.resize()
      })
    },

    // 监听网络状态
    listenNetworkStatus() {
      window.addEventListener('online', () => {
        this.$message.success('网络已连接')
        // 检查是否有保存的筛选条件
        const savedFilters = localStorage.getItem('playlistRecommendFilters')
        if (savedFilters) {
          this.$confirm('检测到之前保存的筛选条件，是否恢复？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            this.filterForm = JSON.parse(savedFilters)
            this.handleFilterChange()
          }).catch(() => {
            // 用户取消恢复
          })
        }
      })

      window.addEventListener('offline', () => {
        this.$message.warning('网络已断开，筛选条件将自动保存')
        // 保存筛选条件到localStorage
        localStorage.setItem('playlistRecommendFilters', JSON.stringify(this.filterForm))
      })
    },

    // 从URL参数获取列表可见性
    getListVisibleFromUrl() {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
      const listVisibleParam = urlParams.get('listVisible')
      if (listVisibleParam !== null) {
        this.listVisible = listVisibleParam === 'true'
      }
    },

    // 从localStorage获取视图模式
    getViewModeFromLocalStorage() {
      const savedViewMode = localStorage.getItem('playlistRecommendViewMode')
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }
    },

    // 筛选条件变化
    handleFilterChange() {
      // 防抖处理
      clearTimeout(this.filterTimeout)
      this.filterTimeout = setTimeout(() => {
        // 重置分页
        this.currentPage = 1
        this.hasMore = true
        // 更新URL参数
        this.updateUrlParams()
      }, 200)
    },

    // 更新URL参数
    updateUrlParams() {
      const urlParams = new URLSearchParams()
      Object.keys(this.filterForm).forEach(key => {
        if (this.filterForm[key] !== '') {
          if (Array.isArray(this.filterForm[key])) {
            urlParams.set(key, this.filterForm[key].join(','))
          } else {
            urlParams.set(key, this.filterForm[key])
          }
        }
      })
      urlParams.set('listVisible', this.listVisible)

      const currentHash = window.location.hash.split('?')[0]
      window.location.hash = `${currentHash}?${urlParams.toString()}`
    },

    // 重置筛选
    resetFilters() {
      this.filterForm = {
        style: '',
        type: '',
        playCountRange: [1000, 100000]
      }
      this.activePreferenceTag = ''
      this.handleFilterChange()
    },

    // 切换列表可见性
    toggleListVisible() {
      this.listVisible = !this.listVisible
      this.updateUrlParams()
    },

    // 切换视图模式
    switchView(mode) {
      this.viewMode = mode
      localStorage.setItem('playlistRecommendViewMode', mode)
    },

    // 播放全部
    playAll(playlist) {
      this.$message.success(`开始播放歌单：${playlist.name}`)
    },

    // 收藏/取消收藏
    toggleCollect(playlist) {
      playlist.isCollected = !playlist.isCollected
      this.$message.success(playlist.isCollected ? '收藏成功' : '取消收藏成功')
    },

    // 添加至我的推荐
    addToMyRecommend(playlist) {
      this.selectedPlaylistName = playlist.name
      this.selectedPlaylistId = playlist.id
      this.addToRecommendDialogVisible = true
    },

    // 确认添加至我的推荐
    confirmAddToMyRecommend() {
      this.$message.success(`歌单"${this.selectedPlaylistName}"已添加至我的推荐`)
      this.addToRecommendDialogVisible = false
    },

    // 加载更多
    loadMore() {
      this.loading = true
      setTimeout(() => {
        this.currentPage++
        this.loading = false
        // 检查是否还有更多数据
        if (this.currentPage * this.pageSize >= this.filteredPlaylists.length) {
          this.hasMore = false
        }
      }, 1000)
    },

    // 按偏好标签筛选
    filterByPreferenceTag(tag) {
      if (this.activePreferenceTag === tag) {
        this.activePreferenceTag = ''
      } else {
        this.activePreferenceTag = tag
      }
      // 重置分页
      this.currentPage = 1
      this.hasMore = true
    },

    // 导出数据
    exportData() {
      // 准备CSV数据
      const headers = ['歌单名称', '音乐风格', '歌单类型', '播放量', '收藏数', '是否收藏']
      const rows = this.filteredPlaylists.map(playlist => {
        return [
          playlist.name,
          playlist.style,
          playlist.type,
          playlist.playCount,
          playlist.collectCount,
          playlist.isCollected ? '是' : '否'
        ]
      })

      // 转换为CSV字符串
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n')

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `歌单推荐数据_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    }
  }
}
</script>

<style scoped>
.playlist-recommend-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  flex: 1;
}

.play-count-range-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.filter-actions {
  margin-left: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
}

.playlist-section {
  flex: 2;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-switcher {
  margin-bottom: 20px;
}

.playlist-list {
  margin-bottom: 20px;
}

/* 网格视图 */
.playlist-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.playlist-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.playlist-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-cover:hover .cover-img {
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

.card-cover:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  font-size: 48px;
  color: #fff;
}

.card-content {
  padding: 15px;
}

.playlist-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-tags {
  margin-bottom: 10px;
}

.playlist-tags .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
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
  gap: 5px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

/* 列表视图 */
.playlist-list.list {
  width: 100%;
}

.list-cover-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination-section {
  text-align: center;
  padding: 20px 0;
}

.dashboard-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-card {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dashboard-card h3 {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dashboard-actions {
  margin-top: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .main-content {
    flex-direction: column;
  }

  .dashboard-section {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .dashboard-card {
    flex: 1 1 calc(50% - 10px);
  }
}

@media (max-width: 1200px) {
  .dashboard-card {
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }

  .playlist-list.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>