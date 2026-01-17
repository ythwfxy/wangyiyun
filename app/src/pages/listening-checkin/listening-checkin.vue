<template>
  <div class="listening-checkin">
    <div class="header">
      <h1>听歌打卡日记</h1>
      <div class="date-selector">
        <el-date-picker
          v-model="currentDate"
          type="month"
          placeholder="选择月份"
          value-format="yyyy-MM"
          @change="onMonthChange"
        ></el-date-picker>
      </div>
    </div>

    <div class="main-content">
      <div class="calendar-section">
        <div class="calendar-header">
          <el-button @click="prevMonth" icon="el-icon-arrow-left"></el-button>
          <h2>{{ currentMonthText }}</h2>
          <el-button @click="nextMonth" icon="el-icon-arrow-right"></el-button>
        </div>
        <div class="calendar-grid">
          <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
          <div
            class="day-cell"
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="{
              'has-checkin': day.hasCheckin,
              'current-month': day.isCurrentMonth,
              'today': day.isToday
            }"
            @click="selectDay(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.hasCheckin" class="checkin-dot"></span>
          </div>
        </div>
      </div>

      <div class="checkin-section">
        <div class="checkin-header">
          <h3>{{ selectedDateText }}的打卡</h3>
          <el-button type="primary" @click="showAddForm = true" v-if="!selectedCheckin">
            + 新建打卡
          </el-button>
        </div>

        <div v-if="selectedCheckin" class="checkin-card">
          <div class="checkin-content">
            <div class="mood-section">
              <span class="label">心情:</span>
              <span class="mood">{{ selectedCheckin.mood }}</span>
            </div>
            <div class="feeling-section">
              <span class="label">心情描述:</span>
              <p class="feeling">{{ selectedCheckin.feeling }}</p>
            </div>
            <div v-if="selectedCheckin.song" class="song-section">
              <span class="label">关联歌曲:</span>
              <div class="song-info">
                <img :src="selectedCheckin.song.al?.picUrl" alt="歌曲封面" class="song-cover" />
                <div class="song-details">
                  <span class="song-name">{{ selectedCheckin.song.name }}</span>
                  <span class="singer-name">{{ selectedCheckin.song.ar?.[0]?.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="checkin-actions">
            <el-button type="warning" @click="showEditForm = true">编辑</el-button>
            <el-button type="danger" @click="deleteCheckin">删除</el-button>
          </div>
        </div>

        <div v-else class="no-checkin">
          <p>今天还没有打卡哦~</p>
        </div>
      </div>
    </div>

    <el-dialog
      title="新建打卡"
      :visible.sync="showAddForm"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="newCheckin" label-width="80px">
        <el-form-item label="心情">
          <el-select v-model="newCheckin.mood" placeholder="选择心情">
            <el-option label="开心" value="开心"></el-option>
            <el-option label="平静" value="平静"></el-option>
            <el-option label="忧伤" value="忧伤"></el-option>
            <el-option label="兴奋" value="兴奋"></el-option>
            <el-option label="放松" value="放松"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="心情描述">
          <el-input type="textarea" v-model="newCheckin.feeling" placeholder="描述一下今天的心情吧"></el-input>
        </el-form-item>
        <el-form-item label="关联歌曲">
          <div class="song-search">
            <el-input v-model="songSearch" placeholder="搜索歌曲" @keyup.enter="searchSongs"></el-input>
            <el-button @click="searchSongs" icon="el-icon-search"></el-button>
          </div>
          <div v-if="searchResults.length > 0" class="song-list">
            <div
              class="song-item"
              v-for="song in searchResults"
              :key="song.id"
              @click="selectSong(song)"
            >
              <img :src="song.al?.picUrl" alt="" class="song-item-cover" />
              <span>{{ song.name }} - {{ song.ar?.[0]?.name }}</span>
            </div>
          </div>
          <div v-if="newCheckin.song" class="selected-song">
            <img :src="newCheckin.song.al?.picUrl" alt="" class="song-item-cover" />
            <span>{{ newCheckin.song.name }} - {{ newCheckin.song.ar?.[0]?.name }}</span>
            <el-button icon="el-icon-close" @click="newCheckin.song = null"></el-button>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="addCheckin">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="编辑打卡"
      :visible.sync="showEditForm"
      width="500px"
    >
      <el-form :model="editCheckin" label-width="80px">
        <el-form-item label="心情">
          <el-select v-model="editCheckin.mood" placeholder="选择心情">
            <el-option label="开心" value="开心"></el-option>
            <el-option label="平静" value="平静"></el-option>
            <el-option label="忧伤" value="忧伤"></el-option>
            <el-option label="兴奋" value="兴奋"></el-option>
            <el-option label="放松" value="放松"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="心情描述">
          <el-input type="textarea" v-model="editCheckin.feeling" placeholder="描述一下今天的心情吧"></el-input>
        </el-form-item>
        <el-form-item label="关联歌曲">
          <div class="song-search">
            <el-input v-model="editSongSearch" placeholder="搜索歌曲" @keyup.enter="searchEditSongs"></el-input>
            <el-button @click="searchEditSongs" icon="el-icon-search"></el-button>
          </div>
          <div v-if="editSearchResults.length > 0" class="song-list">
            <div
              class="song-item"
              v-for="song in editSearchResults"
              :key="song.id"
              @click="selectEditSong(song)"
            >
              <img :src="song.al?.picUrl" alt="" class="song-item-cover" />
              <span>{{ song.name }} - {{ song.ar?.[0]?.name }}</span>
            </div>
          </div>
          <div v-if="editCheckin.song" class="selected-song">
            <img :src="editCheckin.song.al?.picUrl" alt="" class="song-item-cover" />
            <span>{{ editCheckin.song.name }} - {{ editCheckin.song.ar?.[0]?.name }}</span>
            <el-button icon="el-icon-close" @click="editCheckin.song = null"></el-button>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditForm = false">取消</el-button>
        <el-button type="primary" @click="updateCheckin">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ListeningCheckin',
  data() {
    return {
      currentDate: '',
      selectedDate: '',
      calendarDays: [],
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      checkins: {},
      selectedCheckin: null,
      showAddForm: false,
      showEditForm: false,
      songSearch: '',
      searchResults: [],
      editSongSearch: '',
      editSearchResults: [],
      mockSongs: [
        { id: 1, name: '晴天', ar: [{ name: '周杰伦' }], al: { picUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg' } },
        { id: 2, name: '起风了', ar: [{ name: '买辣椒也用券' }], al: { picUrl: 'https://p1.music.126.net/B9fE9gM90QrB0Z1t1X7r4Q==/109951163216667688.jpg' } },
        { id: 3, name: '孤勇者', ar: [{ name: '陈奕迅' }], al: { picUrl: 'https://p1.music.126.net/gGmzINW1Q91Yf2x7Z4zYJg==/109951165955861756.jpg' } },
        { id: 4, name: '平凡之路', ar: [{ name: '朴树' }], al: { picUrl: 'https://p1.music.126.net/9h5EHLf6iZ2x9x7zJ2X7kQ==/109951163049052142.jpg' } },
        { id: 5, name: '小幸运', ar: [{ name: '田馥甄' }], al: { picUrl: 'https://p1.music.126.net/9h5EHLf6iZ2x9x7zJ2X7kQ==/109951163049052142.jpg' } },
        { id: 6, name: '七里香', ar: [{ name: '周杰伦' }], al: { picUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg' } },
        { id: 7, name: '夜曲', ar: [{ name: '周杰伦' }], al: { picUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg' } },
        { id: 8, name: '稻香', ar: [{ name: '周杰伦' }], al: { picUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg' } },
        { id: 9, name: '年少有为', ar: [{ name: '李荣浩' }], al: { picUrl: 'https://p1.music.126.net/F9g5R1xX7X5Z8xJ3xJ9kLw==/109951164738916302.jpg' } },
        { id: 10, name: '演员', ar: [{ name: '薛之谦' }], al: { picUrl: 'https://p1.music.126.net/7J8x7Z5x3x9JxLxMxNxPw==/109951163823340730.jpg' } }
      ],
      newCheckin: {
        mood: '',
        feeling: '',
        song: null
      },
      editCheckin: {
        mood: '',
        feeling: '',
        song: null
      }
    }
  },
  computed: {
    currentMonthText() {
      if (!this.currentDate) return ''
      const date = new Date(this.currentDate + '-01')
      return `${date.getFullYear()}年${date.getMonth() + 1}月`
    },
    selectedDateText() {
      if (!this.selectedDate) return ''
      const date = new Date(this.selectedDate)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
  },
  mounted() {
    const now = new Date()
    this.currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    this.selectedDate = this.formatDate(now)
    this.loadCheckins()
    this.generateCalendar()
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    loadCheckins() {
      const saved = localStorage.getItem('listeningCheckins')
      if (saved) {
        this.checkins = JSON.parse(saved)
      }
    },
    saveCheckins() {
      localStorage.setItem('listeningCheckins', JSON.stringify(this.checkins))
    },
    generateCalendar() {
      if (!this.currentDate) return
      
      const [year, month] = this.currentDate.split('-').map(Number)
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      const daysInMonth = lastDay.getDate()
      const startDayOfWeek = firstDay.getDay()
      
      this.calendarDays = []
      
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const prevDay = new Date(year, month - 1, 1 - i)
        this.calendarDays.push({
          date: this.formatDate(prevDay),
          day: prevDay.getDate(),
          isCurrentMonth: false,
          hasCheckin: !!this.checkins[this.formatDate(prevDay)],
          isToday: this.formatDate(prevDay) === this.formatDate(new Date())
        })
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day)
        const dateStr = this.formatDate(date)
        this.calendarDays.push({
          date: dateStr,
          day: day,
          isCurrentMonth: true,
          hasCheckin: !!this.checkins[dateStr],
          isToday: dateStr === this.formatDate(new Date())
        })
      }
      
      const remainingDays = 42 - this.calendarDays.length
      for (let day = 1; day <= remainingDays; day++) {
        const nextDay = new Date(year, month, day)
        this.calendarDays.push({
          date: this.formatDate(nextDay),
          day: nextDay.getDate(),
          isCurrentMonth: false,
          hasCheckin: !!this.checkins[this.formatDate(nextDay)],
          isToday: this.formatDate(nextDay) === this.formatDate(new Date())
        })
      }
      
      this.loadSelectedCheckin()
    },
    selectDay(day) {
      this.selectedDate = day.date
      this.loadSelectedCheckin()
    },
    loadSelectedCheckin() {
      this.selectedCheckin = this.checkins[this.selectedDate] || null
    },
    prevMonth() {
      const [year, month] = this.currentDate.split('-').map(Number)
      const prev = new Date(year, month - 2, 1)
      this.currentDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
      this.generateCalendar()
    },
    nextMonth() {
      const [year, month] = this.currentDate.split('-').map(Number)
      const next = new Date(year, month, 1)
      this.currentDate = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
      this.generateCalendar()
    },
    onMonthChange() {
      this.generateCalendar()
    },
    searchSongs() {
      if (!this.songSearch.trim()) {
        this.searchResults = this.mockSongs
        return
      }
      
      this.searchResults = this.mockSongs.filter(song => 
        song.name.includes(this.songSearch) || 
        song.ar[0].name.includes(this.songSearch)
      )
    },
    searchEditSongs() {
      if (!this.editSongSearch.trim()) {
        this.editSearchResults = this.mockSongs
        return
      }
      
      this.editSearchResults = this.mockSongs.filter(song => 
        song.name.includes(this.editSongSearch) || 
        song.ar[0].name.includes(this.editSongSearch)
      )
    },
    selectSong(song) {
      this.newCheckin.song = song
      this.searchResults = []
    },
    selectEditSong(song) {
      this.editCheckin.song = song
      this.editSearchResults = []
    },
    addCheckin() {
      if (!this.newCheckin.mood || !this.newCheckin.feeling) {
        this.$message.warning('请填写完整信息')
        return
      }
      
      const checkin = {
        ...this.newCheckin,
        date: this.selectedDate,
        createdAt: new Date().toISOString()
      }
      
      this.checkins[this.selectedDate] = checkin
      this.saveCheckins()
      this.generateCalendar()
      this.loadSelectedCheckin()
      this.showAddForm = false
      this.resetForm()
      this.$message.success('打卡成功')
    },
    updateCheckin() {
      if (!this.editCheckin.mood || !this.editCheckin.feeling) {
        this.$message.warning('请填写完整信息')
        return
      }
      
      this.checkins[this.selectedDate] = {
        ...this.editCheckin,
        date: this.selectedDate,
        updatedAt: new Date().toISOString()
      }
      
      this.saveCheckins()
      this.loadSelectedCheckin()
      this.showEditForm = false
      this.$message.success('更新成功')
    },
    deleteCheckin() {
      this.$confirm('确定要删除这条打卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delete this.checkins[this.selectedDate]
        this.saveCheckins()
        this.generateCalendar()
        this.loadSelectedCheckin()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    resetForm() {
      this.newCheckin = {
        mood: '',
        feeling: '',
        song: null
      }
      this.songSearch = ''
      this.searchResults = []
    },
    showEditCheckin() {
      this.editCheckin = { ...this.selectedCheckin }
      this.showEditForm = true
    }
  },
  watch: {
    showEditForm(val) {
      if (val) {
        this.showEditCheckin()
      }
    }
  }
}
</script>

<style scoped>
.listening-checkin {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 28px;
  color: #c62f2f;
  margin: 0;
}

.date-selector {
  margin-left: auto;
}

.main-content {
  display: flex;
  gap: 20px;
}

.calendar-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  margin: 0;
  font-size: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.weekday {
  text-align: center;
  padding: 10px;
  font-weight: bold;
  color: #666;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.day-cell:hover {
  background-color: #e6e7ea;
}

.day-cell.has-checkin {
  background-color: #ffe4e1;
}

.day-cell.current-month {
  color: #333;
}

.day-cell:not(.current-month) {
  color: #ccc;
}

.day-cell.today {
  border: 2px solid #c62f2f;
}

.day-number {
  font-size: 16px;
}

.checkin-dot {
  position: absolute;
  bottom: 2px;
  width: 6px;
  height: 6px;
  background-color: #c62f2f;
  border-radius: 50%;
}

.checkin-section {
  width: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkin-header h3 {
  margin: 0;
  font-size: 18px;
}

.checkin-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.mood-section,
.feeling-section,
.song-section {
  margin-bottom: 15px;
}

.label {
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.mood {
  font-size: 18px;
  color: #c62f2f;
}

.feeling {
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.song-details {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-weight: bold;
  color: #333;
}

.singer-name {
  color: #666;
  font-size: 14px;
}

.checkin-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.no-checkin {
  text-align: center;
  padding: 40px;
  color: #999;
}

.song-search {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.song-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #f5f5f5;
}

.song-item-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.selected-song {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>