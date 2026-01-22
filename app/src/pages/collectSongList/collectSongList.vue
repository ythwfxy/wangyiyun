<template>
  <div class="collectSongList">
    <div class="pageHeader">
      <h1>我的收藏歌单</h1>
    </div>
    <div class="listContainer">
      <div class="listHeader">
        <div class="headerItem checkbox">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        </div>
        <div class="headerItem songName">
          <h3>歌曲名</h3>
        </div>
        <div class="headerItem singer">
          <h3>歌手</h3>
        </div>
        <div class="headerItem duration">
          <h3>时长</h3>
        </div>
        <div class="headerItem collectTime">
          <h3>收藏时间</h3>
        </div>
        <div class="headerItem action">
          <h3>操作</h3>
        </div>
      </div>
      <div class="listContent" ref="listContent">
        <div 
          v-for="(song, index) in sortedSongList" 
          :key="song.id" 
          class="listItem"
          :class="{ hover: hoverIndex === index }"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
        >
          <div class="itemContent checkbox">
            <el-checkbox v-model="song.checked" @change="handleSelectChange"></el-checkbox>
          </div>
          <div class="itemContent songName">
            <span>{{ song.name }}</span>
          </div>
          <div class="itemContent singer">
            <span>{{ song.singer }}</span>
          </div>
          <div class="itemContent duration">
            <span>{{ song.duration }}</span>
          </div>
          <div class="itemContent collectTime">
            <span>{{ song.collectTime }}</span>
          </div>
          <div class="itemContent action">
            <el-button type="text" size="small" @click="handleCancelCollect(song)">取消收藏</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="listFooter">
      <div class="footerLeft">
        <el-button type="primary" size="small" @click="handleBatchCancelCollect" :disabled="!selectedCount">
          批量取消收藏 ({{ selectedCount }})
        </el-button>
      </div>
      <div class="footerRight">
        <el-button type="text" size="small" @click="sortByCollectTime">
          按收藏时间排序 {{ sortOrder === 'desc' ? '↓' : '↑' }}
        </el-button>
      </div>
    </div>
    
    <!-- 二次确认弹窗 -->
    <el-dialog
      title="取消收藏"
      :visible.sync="confirmDialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <span>{{ confirmDialogMessage }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCancelCollect">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'collectSongList',
  data() {
    return {
      songList: [],
      hoverIndex: -1,
      selectAll: false,
      confirmDialogVisible: false,
      confirmDialogMessage: '',
      selectedSong: null,
      sortOrder: 'desc'
    }
  },
  computed: {
    sortedSongList() {
      return [...this.songList].sort((a, b) => {
        const timeA = new Date(a.collectTime).getTime()
        const timeB = new Date(b.collectTime).getTime()
        return this.sortOrder === 'desc' ? timeB - timeA : timeA - timeB
      })
    },
    selectedCount() {
      return this.songList.filter(song => song.checked).length
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      // 检查localStorage中是否已有数据
      const storedData = localStorage.getItem('collectSongList')
      if (storedData) {
        this.songList = JSON.parse(storedData)
      } else {
        // 生成50条模拟数据
        this.songList = this.generateMockData()
        // 存入localStorage
        localStorage.setItem('collectSongList', JSON.stringify(this.songList))
      }
    },
    generateMockData() {
      const mockData = []
      const songNames = ['晴天', '雨天', '雪天', '春天', '夏天', '秋天', '冬天', '早晨', '中午', '晚上']
      const singers = ['周杰伦', '林俊杰', '陈奕迅', '王力宏', '陶喆', '孙燕姿', '张惠妹', '那英', '韩红', '李宇春']
      
      for (let i = 1; i <= 50; i++) {
        const name = songNames[Math.floor(Math.random() * songNames.length)] + i
        const singer = singers[Math.floor(Math.random() * singers.length)]
        const duration = `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        const collectTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN')
        
        mockData.push({
          id: i,
          name,
          singer,
          duration,
          collectTime,
          checked: false
        })
      }
      
      return mockData
    },
    handleSelectAll(val) {
      this.songList.forEach(song => {
        song.checked = val
      })
    },
    handleSelectChange() {
      this.selectAll = this.songList.every(song => song.checked)
    },
    handleCancelCollect(song) {
      this.selectedSong = song
      this.confirmDialogMessage = `确定要取消收藏歌曲 "${song.name}" 吗？`
      this.confirmDialogVisible = true
    },
    handleBatchCancelCollect() {
      const selectedCount = this.songList.filter(song => song.checked).length
      if (selectedCount > 0) {
        this.confirmDialogMessage = `确定要取消收藏选中的 ${selectedCount} 首歌曲吗？`
        this.confirmDialogVisible = true
      }
    },
    confirmCancelCollect() {
      if (this.selectedSong) {
        // 单首取消收藏
        this.songList = this.songList.filter(song => song.id !== this.selectedSong.id)
        this.selectedSong = null
      } else {
        // 批量取消收藏
        this.songList = this.songList.filter(song => !song.checked)
      }
      // 更新localStorage
      localStorage.setItem('collectSongList', JSON.stringify(this.songList))
      // 重置全选状态
      this.selectAll = false
      // 关闭弹窗
      this.confirmDialogVisible = false
    },
    sortByCollectTime() {
      this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
    }
  }
}
</script>

<style scoped>
.collectSongList {
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
}

.pageHeader {
  margin-bottom: 20px;
}

.pageHeader h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.listContainer {
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.listHeader {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.headerItem {
  display: flex;
  align-items: center;
}

.headerItem h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.listContent {
  max-height: 600px;
  overflow-y: auto;
}

.listItem {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.listItem:hover {
  background-color: #f5f5f5;
}

.listItem.hover {
  background-color: #f5f5f5;
}

.itemContent {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 80px;
}

.songName {
  flex: 1;
  min-width: 400px;
}

.singer {
  width: 250px;
}

.duration {
  width: 120px;
  text-align: center;
}

.collectTime {
  width: 220px;
  text-align: center;
}

.action {
  width: 120px;
  text-align: center;
}

.listFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.footerLeft {
  display: flex;
  align-items: center;
}

.footerRight {
  display: flex;
  align-items: center;
}

/* 滚动条样式 */
.listContent::-webkit-scrollbar {
  width: 8px;
}

.listContent::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.listContent::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.listContent::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>