<template>
  <div class="listening-checkin">
    <el-card class="header-card">
      <div class="header-content">
        <h2>🎵 听歌打卡日记</h2>
        <p class="subtitle">记录每一天的音乐心情</p>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="main-card">
          <div class="tabs-container">
            <el-tabs v-model="activeTab" @tab-click="handleTabChange">
              <el-tab-pane label="今日打卡" name="today">
                <div class="today-section">
                  <div class="date-display">
                    <span class="current-date">{{ currentDateText }}</span>
                    <span class="weekday">{{ currentWeekday }}</span>
                  </div>
                  
                  <div v-if="todayCheckIn" class="checkin-card">
                    <div class="mood-display">
                      <span class="mood-icon">{{ todayCheckIn.moodEmoji }}</span>
                      <span class="mood-text">{{ todayCheckIn.moodText }}</span>
                    </div>
                    <div class="song-display">
                      <span class="song-label">今日歌曲：</span>
                      <span class="song-title">{{ todayCheckIn.songName }}</span>
                      <span class="song-artist">- {{ todayCheckIn.artistName }}</span>
                    </div>
                    <div class="action-buttons">
                      <el-button type="primary" size="small" @click="editTodayCheckIn">编辑</el-button>
                      <el-button type="danger" size="small" @click="deleteTodayCheckIn">删除</el-button>
                    </div>
                  </div>
                  
                  <div v-else class="no-checkin">
                    <p>今天还没有打卡哦！</p>
                    <el-button type="primary" @click="openAddDialog" style="margin-top: 10px;">立即打卡</el-button>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="历史记录" name="history">
                <div class="history-section">
                  <el-date-picker
                    v-model="filterDate"
                    type="date"
                    placeholder="选择日期"
                    @change="handleDateFilter"
                    style="margin-bottom: 20px;"
                  >
                  </el-date-picker>
                  
                  <el-list v-loading="loading">
                    <el-item
                      v-for="record in filteredRecords"
                      :key="record.id"
                      class="history-item"
                    >
                      <div class="record-content">
                        <div class="record-date">
                          <span class="date">{{ formatDate(record.date) }}</span>
                          <span class="weekday">{{ getWeekday(record.date) }}</span>
                        </div>
                        <div class="record-details">
                          <div class="mood-row">
                            <span class="mood-icon">{{ record.moodEmoji }}</span>
                            <span class="mood-text">{{ record.moodText }}</span>
                          </div>
                          <div class="song-row">
                            <span class="song-label">关联歌曲：</span>
                            <span class="song-title">{{ record.songName }}</span>
                            <span class="song-artist">- {{ record.artistName }}</span>
                          </div>
                        </div>
                        <div class="record-actions">
                          <el-button type="text" @click="editCheckIn(record)">编辑</el-button>
                          <el-button type="text" @click="deleteCheckIn(record)">删除</el-button>
                        </div>
                      </div>
                    </el-item>
                  </el-list>
                  
                  <div v-if="filteredRecords.length === 0 && !loading" class="empty-state">
                    <p>暂无打卡记录</p>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="月度日历" name="calendar">
                <div class="calendar-section">
                  <div class="calendar-header">
                    <el-button type="text" @click="prevMonth">‹ 上月</el-button>
                    <span class="current-month">{{ currentMonthText }}</span>
                    <el-button type="text" @click="nextMonth">下月 ›</el-button>
                  </div>
                  
                  <div class="calendar-weekdays">
                    <div v-for="day in weekDays" :key="day" class="weekday-header">
                      {{ day }}
                    </div>
                  </div>
                  
                  <div class="calendar-grid">
                    <div
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      :class="getDayClass(day)"
                      class="calendar-day"
                      @click="handleDayClick(day)"
                    >
                      <span class="day-number">{{ day.date.getDate() }}</span>
                      <span v-if="day.hasCheckIn" class="checkin-dot"></span>
                    </div>
                  </div>
                  
                  <div class="calendar-legend">
                    <span class="legend-item">
                      <span class="legend-dot"></span>
                      <span>已打卡</span>
                    </span>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stats-card">
          <div class="stats-content">
            <h3>📊 打卡统计</h3>
            <div class="stat-item">
              <span class="stat-value">{{ totalCheckIns }}</span>
              <span class="stat-label">累计打卡</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ currentMonthCheckIns }}</span>
              <span class="stat-label">本月打卡</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ currentStreak }}</span>
              <span class="stat-label">连续打卡</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      :title="isEdit ? '编辑打卡' : '添加打卡'"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          >
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="心情">
          <div class="mood-selector">
            <div
              v-for="mood in moodOptions"
              :key="mood.emoji"
              :class="['mood-option', { selected: formData.moodEmoji === mood.emoji }]"
              @click="selectMood(mood)"
            >
              <span class="mood-option-emoji">{{ mood.emoji }}</span>
              <span class="mood-option-text">{{ mood.text }}</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="心情描述">
          <el-input
            v-model="formData.moodText"
            type="textarea"
            :rows="3"
            placeholder="描述一下今天的心情..."
          ></el-input>
        </el-form-item>
        
        <el-form-item label="关联歌曲">
          <el-select
            v-model="formData.songId"
            placeholder="选择或搜索歌曲"
            filterable
            allow-create
            @change="handleSongSelect"
          >
            <el-option
              v-for="song in songOptions"
              :key="song.id"
              :label="`${song.name} - ${song.artist}`"
              :value="song.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="歌曲备注">
          <el-input
            v-model="formData.songNote"
            type="textarea"
            :rows="2"
            placeholder="为什么喜欢这首歌..."
          ></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCheckIn">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="打卡详情"
      :visible.sync="detailDialogVisible"
      width="400px"
    >
      <div v-if="selectedRecord" class="detail-content">
        <div class="detail-date">{{ formatDate(selectedRecord.date) }} {{ getWeekday(selectedRecord.date) }}</div>
        <div class="detail-mood">
          <span class="detail-emoji">{{ selectedRecord.moodEmoji }}</span>
          <span class="detail-mood-text">{{ selectedRecord.moodText }}</span>
        </div>
        <div class="detail-song">
          <span class="detail-song-label">歌曲：</span>
          <span class="detail-song-title">{{ selectedRecord.songName }}</span>
          <span class="detail-song-artist">- {{ selectedRecord.artistName }}</span>
        </div>
        <div v-if="selectedRecord.songNote" class="detail-note">
          <span class="detail-note-label">备注：</span>
          <span class="detail-note-text">{{ selectedRecord.songNote }}</span>
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ListeningCheckIn',
  data() {
    return {
      activeTab: 'today',
      loading: false,
      dialogVisible: false,
      detailDialogVisible: false,
      isEdit: false,
      editingRecord: null,
      selectedRecord: null,
      filterDate: null,
      
      today: new Date(),
      currentMonth: new Date(),
      
      moodOptions: [
        { emoji: '😊', text: '开心' },
        { emoji: '🥰', text: '幸福' },
        { emoji: '😌', text: '放松' },
        { emoji: '🎶', text: '兴奋' },
        { emoji: '😢', text: '难过' },
        { emoji: '😴', text: '疲惫' },
        { emoji: '😤', text: '烦躁' },
        { emoji: '🤔', text: '思考' }
      ],
      
      songOptions: [],
      
      formData: {
        date: new Date(),
        moodEmoji: '😊',
        moodText: '',
        songId: null,
        songName: '',
        artistName: '',
        songNote: ''
      },
      
      checkInRecords: []
    }
  },
  
  computed: {
    currentDateText() {
      return this.formatDate(this.today)
    },
    
    currentWeekday() {
      return this.getWeekday(this.today)
    },
    
    currentMonthText() {
      const year = this.currentMonth.getFullYear()
      const month = this.currentMonth.getMonth() + 1
      return `${year}年${month}月`
    },
    
    todayCheckIn() {
      const todayStr = this.dateToKey(this.today)
      return this.checkInRecords.find(r => r.dateKey === todayStr)
    },
    
    filteredRecords() {
      let records = this.checkInRecords
      
      if (this.filterDate) {
        const filterStr = this.dateToKey(this.filterDate)
        records = records.filter(r => r.dateKey === filterStr)
      }
      
      return records.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    
    totalCheckIns() {
      return this.checkInRecords.length
    },
    
    currentMonthCheckIns() {
      const year = this.today.getFullYear()
      const month = this.today.getMonth()
      return this.checkInRecords.filter(r => {
        const date = new Date(r.date)
        return date.getFullYear() === year && date.getMonth() === month
      }).length
    },
    
    currentStreak() {
      const sortedRecords = this.checkInRecords
        .map(r => new Date(r.date))
        .sort((a, b) => b - a)
      
      if (sortedRecords.length === 0) return 0
      
      let streak = 0
      let checkDate = new Date()
      checkDate.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < 365; i++) {
        const dateKey = this.dateToKey(checkDate)
        const hasRecord = this.checkInRecords.some(r => r.dateKey === dateKey)
        
        if (hasRecord) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (i > 0) {
          break
        } else {
          checkDate.setDate(checkDate.getDate() - 1)
        }
      }
      
      return streak
    },
    
    weekDays() {
      return ['日', '一', '二', '三', '四', '五', '六']
    },
    
    calendarDays() {
      const year = this.currentMonth.getFullYear()
      const month = this.currentMonth.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const startDay = firstDay.getDay()
      const totalDays = lastDay.getDate()
      
      const days = []
      
      for (let i = 0; i < startDay; i++) {
        const prevDay = new Date(year, month, -startDay + i + 1)
        days.push({
          date: prevDay,
          isCurrentMonth: false,
          hasCheckIn: false
        })
      }
      
      for (let i = 1; i <= totalDays; i++) {
        const day = new Date(year, month, i)
        const dateKey = this.dateToKey(day)
        days.push({
          date: day,
          isCurrentMonth: true,
          hasCheckIn: this.checkInRecords.some(r => r.dateKey === dateKey)
        })
      }
      
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextDay = new Date(year, month + 1, i)
        days.push({
          date: nextDay,
          isCurrentMonth: false,
          hasCheckIn: false
        })
      }
      
      return days
    }
  },
  
  mounted() {
    this.loadRecords()
    this.loadSongOptions()
  },
  
  methods: {
    dateToKey(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}年${month}月${day}日`
    },
    
    getWeekday(date) {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return weekdays[date.getDay()]
    },
    
    loadRecords() {
      const stored = localStorage.getItem('listeningCheckInRecords')
      if (stored) {
        this.checkInRecords = JSON.parse(stored).map(r => ({
          ...r,
          date: new Date(r.date)
        }))
      }
    },
    
    saveRecords() {
      localStorage.setItem('listeningCheckInRecords', JSON.stringify(this.checkInRecords))
    },
    
    loadSongOptions() {
      this.songOptions = [
        { id: 1, name: '晴天', artist: '周杰伦' },
        { id: 2, name: '七里香', artist: '周杰伦' },
        { id: 3, name: '夜曲', artist: '周杰伦' },
        { id: 4, name: '稻香', artist: '周杰伦' },
        { id: 5, name: '告白气球', artist: '周杰伦' },
        { id: 6, name: '起风了', artist: '买辣椒也用券' },
        { id: 7, name: '年少有为', artist: '李荣浩' },
        { id: 8, name: '小幸运', artist: '田馥甄' },
        { id: 9, name: '后来', artist: '刘若英' },
        { id: 10, name: '遇见', artist: '孙燕姿' }
      ]
    },
    
    handleTabChange(tab) {
      if (tab.name === 'calendar') {
        this.currentMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1)
      }
    },
    
    handleDateFilter() {
      this.activeTab = 'history'
    },
    
    prevMonth() {
      const newMonth = new Date(this.currentMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      this.currentMonth = newMonth
    },
    
    nextMonth() {
      const newMonth = new Date(this.currentMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      this.currentMonth = newMonth
    },
    
    getDayClass(day) {
      const classes = ['calendar-day']
      
      if (!day.isCurrentMonth) {
        classes.push('other-month')
      }
      
      const todayKey = this.dateToKey(this.today)
      const dayKey = this.dateToKey(day.date)
      
      if (dayKey === todayKey) {
        classes.push('today')
      }
      
      if (day.hasCheckIn) {
        classes.push('has-checkin')
      }
      
      return classes
    },
    
    handleDayClick(day) {
      if (!day.isCurrentMonth) return
      
      const dateKey = this.dateToKey(day.date)
      const record = this.checkInRecords.find(r => r.dateKey === dateKey)
      
      if (record) {
        this.selectedRecord = record
        this.detailDialogVisible = true
      } else if (day.date.toDateString() === this.today.toDateString()) {
        this.openAddDialog()
      }
    },
    
    openAddDialog() {
      this.isEdit = false
      this.editingRecord = null
      this.formData = {
        date: new Date(this.today),
        moodEmoji: '😊',
        moodText: '',
        songId: null,
        songName: '',
        artistName: '',
        songNote: ''
      }
      this.dialogVisible = true
    },
    
    editTodayCheckIn() {
      if (this.todayCheckIn) {
        this.editCheckIn(this.todayCheckIn)
      }
    },
    
    editCheckIn(record) {
      this.isEdit = true
      this.editingRecord = record
      this.formData = {
        date: new Date(record.date),
        moodEmoji: record.moodEmoji,
        moodText: record.moodText,
        songId: record.songId,
        songName: record.songName,
        artistName: record.artistName,
        songNote: record.songNote || ''
      }
      this.dialogVisible = true
    },
    
    deleteTodayCheckIn() {
      if (this.todayCheckIn) {
        this.deleteCheckIn(this.todayCheckIn)
      }
    },
    
    deleteCheckIn(record) {
      this.$confirm('确定要删除这条打卡记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.checkInRecords.findIndex(r => r.id === record.id)
        if (index > -1) {
          this.checkInRecords.splice(index, 1)
          this.saveRecords()
          this.$message.success('删除成功')
        }
      }).catch(() => {})
    },
    
    selectMood(mood) {
      this.formData.moodEmoji = mood.emoji
    },
    
    handleSongSelect(songId) {
      const song = this.songOptions.find(s => s.id === songId)
      if (song) {
        this.formData.songName = song.name
        this.formData.artistName = song.artist
      }
    },
    
    saveCheckIn() {
      if (!this.formData.moodText.trim()) {
        this.$message.warning('请填写心情描述')
        return
      }
      
      if (!this.formData.songId) {
        this.$message.warning('请选择关联歌曲')
        return
      }
      
      const dateKey = this.dateToKey(this.formData.date)
      
      if (this.isEdit && this.editingRecord) {
        Object.assign(this.editingRecord, {
          date: this.formData.date,
          dateKey: dateKey,
          moodEmoji: this.formData.moodEmoji,
          moodText: this.formData.moodText,
          songId: this.formData.songId,
          songName: this.formData.songName,
          artistName: this.formData.artistName,
          songNote: this.formData.songNote
        })
      } else {
        const newRecord = {
          id: Date.now(),
          date: this.formData.date,
          dateKey: dateKey,
          moodEmoji: this.formData.moodEmoji,
          moodText: this.formData.moodText,
          songId: this.formData.songId,
          songName: this.formData.songName,
          artistName: this.formData.artistName,
          songNote: this.formData.songNote
        }
        this.checkInRecords.push(newRecord)
      }
      
      this.saveRecords()
      this.dialogVisible = false
      this.$message.success(this.isEdit ? '修改成功' : '打卡成功')
    }
  }
}
</script>

<style scoped>
.listening-checkin {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  text-align: center;
}

.header-content h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
}

.main-card {
  margin-bottom: 20px;
}

.tabs-container {
  padding: 10px 0;
}

.today-section {
  padding: 20px 0;
}

.date-display {
  text-align: center;
  margin-bottom: 30px;
}

.current-date {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.weekday {
  font-size: 16px;
  color: #666;
}

.checkin-card {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}

.mood-display {
  margin-bottom: 20px;
}

.mood-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.mood-text {
  font-size: 18px;
  color: #333;
}

.song-display {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  display: inline-block;
}

.song-label {
  color: #999;
  margin-right: 5px;
}

.song-title {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

.song-artist {
  color: #666;
}

.action-buttons {
  margin-top: 20px;
}

.no-checkin {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-checkin p {
  font-size: 18px;
  margin-bottom: 10px;
}

.history-section {
  padding: 10px 0;
}

.history-item {
  margin-bottom: 15px;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
}

.record-content:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.record-date {
  text-align: center;
}

.record-date .date {
  display: block;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.record-date .weekday {
  font-size: 12px;
  color: #999;
}

.record-details {
  flex: 1;
  margin: 0 20px;
}

.mood-row {
  margin-bottom: 8px;
}

.mood-row .mood-icon {
  font-size: 24px;
  margin-right: 10px;
}

.mood-row .mood-text {
  color: #333;
}

.song-row {
  font-size: 14px;
}

.song-row .song-label {
  color: #999;
  margin-right: 5px;
}

.song-row .song-title {
  color: #333;
  font-weight: 500;
  margin-right: 5px;
}

.song-row .song-artist {
  color: #666;
}

.record-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.calendar-section {
  padding: 10px 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
}

.current-month {
  font-weight: bold;
  color: #333;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
}

.weekday-header {
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 10px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.calendar-day:hover {
  background: #f0f0f0;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.today {
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

.calendar-day.has-checkin {
  background: #fff7e6;
}

.day-number {
  font-size: 16px;
}

.checkin-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  position: absolute;
  bottom: 5px;
}

.calendar-legend {
  margin-top: 20px;
  text-align: center;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  background: #52c41a;
  border-radius: 50%;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-content h3 {
  margin-bottom: 20px;
  color: #333;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.mood-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.mood-option {
  text-align: center;
  padding: 10px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.mood-option:hover {
  border-color: #1890ff;
}

.mood-option.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.mood-option-emoji {
  font-size: 24px;
  display: block;
  margin-bottom: 5px;
}

.mood-option-text {
  font-size: 12px;
  color: #666;
}

.detail-content {
  padding: 20px;
}

.detail-date {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-mood {
  text-align: center;
  margin-bottom: 20px;
}

.detail-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.detail-mood-text {
  font-size: 18px;
  color: #333;
}

.detail-song {
  text-align: center;
  margin-bottom: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-song-label {
  color: #999;
  margin-right: 5px;
}

.detail-song-title {
  color: #333;
  font-weight: bold;
  margin-right: 5px;
}

.detail-song-artist {
  color: #666;
}

.detail-note {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-note-label {
  color: #999;
  margin-right: 5px;
}

.detail-note-text {
  color: #333;
  line-height: 1.6;
}
</style>