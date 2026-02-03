<template>
  <div class="listening-checkin">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-date"></i>
          听歌打卡日记
        </h2>
        <p class="page-subtitle">记录每一天的音乐心情</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">
          今日打卡
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="el-icon-date"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalDays }}</div>
          <div class="stat-label">累计打卡天数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="el-icon-fire"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ currentStreak }}</div>
          <div class="stat-label">连续打卡天数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="el-icon-headset"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalSongs }}</div>
          <div class="stat-label">记录歌曲数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <i class="el-icon-moon"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ thisMonthDays }}</div>
          <div class="stat-label">本月打卡</div>
        </div>
      </div>
    </div>

    <!-- 月度日历视图 -->
    <div class="calendar-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="el-icon-calendar"></i>
          月度打卡日历
        </h3>
        <div class="month-selector">
          <el-button icon="el-icon-arrow-left" circle size="small" @click="prevMonth"></el-button>
          <span class="current-month">{{ currentYearMonth }}</span>
          <el-button icon="el-icon-arrow-right" circle size="small" @click="nextMonth"></el-button>
        </div>
      </div>
      <CheckinCalendar 
        :year="calendarYear" 
        :month="calendarMonth"
        :checkin-dates="checkinDates"
        @date-click="onCalendarDateClick"
      />
    </div>

    <!-- 打卡记录列表 -->
    <div class="records-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="el-icon-document"></i>
          打卡记录
        </h3>
        <div class="filter-bar">
          <el-date-picker
            v-model="filterDate"
            type="date"
            placeholder="按日期筛选"
            size="small"
            clearable
            @change="filterRecords"
          ></el-date-picker>
          <el-button icon="el-icon-refresh" size="small" @click="resetFilter">重置</el-button>
        </div>
      </div>
      
      <div v-if="filteredRecords.length === 0" class="empty-state">
        <i class="el-icon-document-delete"></i>
        <p>暂无打卡记录</p>
        <el-button type="primary" size="small" @click="openAddDialog">去打卡</el-button>
      </div>
      
      <div v-else class="records-list">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="record-card"
          :class="{ 'today': isToday(record.date) }"
        >
          <div class="record-date">
            <div class="date-day">{{ formatDay(record.date) }}</div>
            <div class="date-month">{{ formatMonth(record.date) }}</div>
            <div v-if="isToday(record.date)" class="today-badge">今天</div>
          </div>
          <div class="record-content">
            <div class="record-mood">
              <span class="mood-tag" :class="'mood-' + record.mood">
                {{ getMoodLabel(record.mood) }}
              </span>
              <span class="record-time">{{ record.time }}</span>
            </div>
            <div class="record-note">{{ record.note || '没有写下心情...' }}</div>
            <div v-if="record.songs && record.songs.length > 0" class="record-songs">
              <div class="songs-title">
                <i class="el-icon-music"></i>
                今日歌曲 ({{ record.songs.length }}首)
              </div>
              <div class="songs-list">
                <div 
                  v-for="(song, index) in record.songs.slice(0, 3)" 
                  :key="index"
                  class="song-item"
                  @click="playSong(song)"
                >
                  <img :src="song.cover || defaultCover" alt="cover" class="song-cover">
                  <div class="song-info">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="song-artist">{{ song.artist }}</div>
                  </div>
                  <i class="el-icon-video-play play-icon"></i>
                </div>
                <div v-if="record.songs.length > 3" class="more-songs">
                  +{{ record.songs.length - 3 }} 首更多歌曲
                </div>
              </div>
            </div>
          </div>
          <div class="record-actions">
            <el-button type="text" icon="el-icon-edit" @click="editRecord(record)">编辑</el-button>
            <el-button type="text" icon="el-icon-delete" class="delete-btn" @click="deleteRecord(record.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <CheckinDialog
      :visible.sync="dialogVisible"
      :edit-data="editingRecord"
      @save="onSaveRecord"
    />
  </div>
</template>

<script>
import CheckinCalendar from '@/components/listeningCheckin/checkinCalendar.vue'
import CheckinDialog from '@/components/listeningCheckin/checkinDialog.vue'
import { getCheckinRecords, saveCheckinRecord, deleteCheckinRecord } from '@/utils/checkinStorage.js'

export default {
  name: 'ListeningCheckin',
  components: {
    CheckinCalendar,
    CheckinDialog
  },
  data() {
    return {
      records: [],
      filterDate: null,
      dialogVisible: false,
      editingRecord: null,
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth() + 1,
      defaultCover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
      moodOptions: [
        { value: 'happy', label: '开心', icon: '😊' },
        { value: 'calm', label: '平静', icon: '😌' },
        { value: 'excited', label: '兴奋', icon: '🤩' },
        { value: 'sad', label: '难过', icon: '😢' },
        { value: 'tired', label: '疲惫', icon: '😴' },
        { value: 'romantic', label: '浪漫', icon: '🥰' }
      ]
    }
  },
  computed: {
    checkinDates() {
      return this.records.map(r => r.date)
    },
    filteredRecords() {
      if (this.filterDate) {
        const dateStr = this.formatDate(this.filterDate)
        return this.records.filter(r => r.date === dateStr)
      }
      return [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    currentYearMonth() {
      return `${this.calendarYear}年${this.calendarMonth}月`
    },
    totalDays() {
      return this.records.length
    },
    totalSongs() {
      return this.records.reduce((sum, r) => sum + (r.songs?.length || 0), 0)
    },
    thisMonthDays() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      return this.records.filter(r => {
        const d = new Date(r.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      }).length
    },
    currentStreak() {
      if (this.records.length === 0) return 0
      
      const sortedDates = [...this.records]
        .map(r => new Date(r.date))
        .sort((a, b) => b - a)
      
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let checkDate = new Date(today)
      
      for (const date of sortedDates) {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        
        if (d.getTime() === checkDate.getTime()) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (d.getTime() < checkDate.getTime()) {
          break
        }
      }
      
      return streak
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    loadRecords() {
      this.records = getCheckinRecords()
    },
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDay(dateStr) {
      return new Date(dateStr).getDate()
    },
    formatMonth(dateStr) {
      const month = new Date(dateStr).getMonth() + 1
      return `${month}月`
    },
    isToday(dateStr) {
      return dateStr === this.formatDate(new Date())
    },
    getMoodLabel(mood) {
      const option = this.moodOptions.find(m => m.value === mood)
      return option ? `${option.icon} ${option.label}` : mood
    },
    openAddDialog() {
      this.editingRecord = null
      this.dialogVisible = true
    },
    editRecord(record) {
      this.editingRecord = { ...record }
      this.dialogVisible = true
    },
    onSaveRecord(record) {
      saveCheckinRecord(record)
      this.loadRecords()
      this.$message.success(this.editingRecord ? '编辑成功' : '打卡成功')
    },
    deleteRecord(id) {
      this.$confirm('确定要删除这条打卡记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCheckinRecord(id)
        this.loadRecords()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    filterRecords() {
      // 筛选逻辑在 computed 中处理
    },
    resetFilter() {
      this.filterDate = null
    },
    prevMonth() {
      if (this.calendarMonth === 1) {
        this.calendarMonth = 12
        this.calendarYear--
      } else {
        this.calendarMonth--
      }
    },
    nextMonth() {
      if (this.calendarMonth === 12) {
        this.calendarMonth = 1
        this.calendarYear++
      } else {
        this.calendarMonth++
      }
    },
    onCalendarDateClick(date) {
      this.filterDate = new Date(date)
    },
    playSong(song) {
      // 播放歌曲逻辑，可以调用 Vuex 或父组件方法
      this.$message.info(`正在播放: ${song.name} - ${song.artist}`)
    }
  }
}
</script>

<style scoped>
.listening-checkin {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title i {
  color: #ec4141;
}

.page-subtitle {
  color: #999;
  font-size: 14px;
  margin: 0;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 日历区域 */
.calendar-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #ec4141;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-month {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
  text-align: center;
}

/* 记录区域 */
.records-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 20px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.record-card:hover {
  background: #f0f1f2;
}

.record-card.today {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffd4d4;
}

.record-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.date-day {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.today-badge {
  font-size: 10px;
  color: #ec4141;
  background: #ffe5e5;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 6px;
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-mood {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.mood-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.mood-happy { background: #fff3cd; color: #856404; }
.mood-calm { background: #d1ecf1; color: #0c5460; }
.mood-excited { background: #f8d7da; color: #721c24; }
.mood-sad { background: #e2e3e5; color: #383d41; }
.mood-tired { background: #d4edda; color: #155724; }
.mood-romantic { background: #f3e5f5; color: #6a1b9a; }

.record-time {
  font-size: 12px;
  color: #999;
}

.record-note {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.record-songs {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.songs-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.song-item:hover {
  background: #f5f5f5;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-icon {
  color: #ec4141;
  font-size: 20px;
}

.more-songs {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 4px;
}

.record-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.delete-btn {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .record-card {
    flex-direction: column;
  }
  
  .record-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
