<template>
  <div class="listening-checkin">
    <el-card class="header-card">
      <div slot="header" class="clearfix">
        <span>🎵 听歌打卡日记</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="showAddDialog">
          <i class="el-icon-plus"></i> 今日打卡
        </el-button>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">{{ totalDays }}</div>
          <div class="stat-label">累计打卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ currentMonthDays }}</div>
          <div class="stat-label">本月打卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ continuousDays }}</div>
          <div class="stat-label">连续打卡</div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="list-card">
          <div slot="header" class="clearfix">
            <span>📝 打卡记录</span>
            <el-date-picker
              v-model="filterDate"
              type="month"
              placeholder="选择月份"
              style="float: right"
              size="small"
              @change="handleFilterChange"
            />
          </div>
          <el-timeline v-if="filteredRecords.length > 0">
            <el-timeline-item
              v-for="record in filteredRecords"
              :key="record.id"
              :timestamp="formatDate(record.date)"
              placement="top"
            >
              <el-card shadow="hover" class="record-card">
                <div class="record-header">
                  <div class="mood-tag">
                    <span class="mood-emoji">{{ getMoodEmoji(record.mood) }}</span>
                    <span class="mood-text">{{ getMoodText(record.mood) }}</span>
                  </div>
                  <div class="record-actions">
                    <el-button type="text" size="small" @click="editRecord(record)">
                      <i class="el-icon-edit"></i>
                    </el-button>
                    <el-button type="text" size="small" style="color: #f56c6c" @click="deleteRecord(record)">
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </div>
                </div>
                <div class="record-content" v-if="record.content">
                  {{ record.content }}
                </div>
                <div class="record-song" v-if="record.song">
                  <el-tag type="info" size="small" class="song-tag">
                    <i class="el-icon-music"></i>
                    {{ record.song.name }} - {{ record.song.artist }}
                  </el-tag>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无打卡记录" :image-size="100">
            <el-button size="small" type="primary" @click="showAddDialog">去打卡</el-button>
          </el-empty>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="calendar-card">
          <div slot="header" class="clearfix">
            <span>📅 打卡日历</span>
          </div>
          <el-date-picker
            v-model="calendarMonth"
            type="month"
            placeholder="选择月份"
            style="width: 100%; margin-bottom: 15px"
            @change="updateCalendar"
          />
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>
            <div class="calendar-days">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                :class="['calendar-day', { 'has-record': day.hasRecord, 'empty': day.isEmpty, 'today': day.isToday }]"
              >
                <span class="day-number">{{ day.day }}</span>
                <span v-if="day.hasRecord" class="record-indicator">🎵</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="心情" prop="mood">
          <el-radio-group v-model="form.mood" class="mood-group">
            <el-radio-button label="happy">😄 开心</el-radio-button>
            <el-radio-button label="relaxed">😌 放松</el-radio-button>
            <el-radio-button label="sad">😢 伤感</el-radio-button>
            <el-radio-button label="energetic">⚡  energetic</el-radio-button>
            <el-radio-button label="peaceful">🕊️ 平静</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="心情文字">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="记录今天听歌的心情..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="关联歌曲">
          <div class="song-select">
            <el-button size="small" type="primary" @click="selectFromPlaylist">从播放列表选择</el-button>
            <div v-if="form.song" class="selected-song">
              <el-tag closable @close="form.song = null">
                {{ form.song.name }} - {{ form.song.artist }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="选择歌曲"
      :visible.sync="songDialogVisible"
      width="600px"
    >
      <el-table
        :data="playlistSongs"
        style="width: 100%"
        @row-click="handleSongSelect"
        highlight-current-row
      >
        <el-table-column label="歌曲" width="200">
          <template slot-scope="scope">
            <div class="song-name">{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="歌手" width="150">
          <template slot-scope="scope">
            <div class="song-artist">{{ scope.row.artist }}</div>
          </template>
        </el-table-column>
        <el-table-column label="专辑">
          <template slot-scope="scope">
            <div class="song-album">{{ scope.row.album }}</div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button @click="songDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCheckinRecords,
  addCheckinRecord,
  updateCheckinRecord,
  deleteCheckinRecord
} from '@/utils/checkinStorage'

export default {
  name: 'ListeningCheckin',
  data() {
    return {
      records: [],
      filterDate: null,
      calendarMonth: new Date(),
      dialogVisible: false,
      dialogTitle: '新增打卡',
      editingId: null,
      form: {
        date: new Date().toISOString().split('T')[0],
        mood: '',
        content: '',
        song: null
      },
      rules: {
        date: [{ required: true, message: '请选择日期', trigger: 'change' }],
        mood: [{ required: true, message: '请选择心情', trigger: 'change' }]
      },
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      songDialogVisible: false,
      playlistSongs: []
    }
  },
  computed: {
    totalDays() {
      const uniqueDates = new Set(this.records.map(r => new Date(r.date).toDateString()))
      return uniqueDates.size
    },
    currentMonthDays() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const monthRecords = this.records.filter(r => {
        const d = new Date(r.date)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      const uniqueDates = new Set(monthRecords.map(r => new Date(r.date).toDateString()))
      return uniqueDates.size
    },
    continuousDays() {
      if (this.records.length === 0) return 0
      const sortedDates = [...new Set(this.records.map(r => new Date(r.date).toDateString()))]
        .sort((a, b) => new Date(b) - new Date(a))
      
      let count = 0
      let currentDate = new Date()
      
      for (let i = 0; i < sortedDates.length; i++) {
        const recordDate = new Date(sortedDates[i])
        const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24))
        
        if (diffDays === count) {
          count++
        } else if (diffDays === count + 1) {
          count++
          currentDate = recordDate
        } else {
          break
        }
      }
      return count
    },
    filteredRecords() {
      if (!this.filterDate) {
        return this.records
      }
      const filterYear = this.filterDate.getFullYear()
      const filterMonth = this.filterDate.getMonth()
      return this.records.filter(r => {
        const d = new Date(r.date)
        return d.getFullYear() === filterYear && d.getMonth() === filterMonth
      })
    }
  },
  mounted() {
    this.loadRecords()
    this.updateCalendar()
    this.loadPlaylistSongs()
  },
  methods: {
    loadRecords() {
      this.records = getCheckinRecords()
    },
    showAddDialog() {
      this.dialogTitle = '新增打卡'
      this.editingId = null
      this.form = {
        date: new Date().toISOString().split('T')[0],
        mood: '',
        content: '',
        song: null
      }
      this.dialogVisible = true
    },
    editRecord(record) {
      this.dialogTitle = '编辑打卡'
      this.editingId = record.id
      this.form = {
        date: record.date,
        mood: record.mood,
        content: record.content || '',
        song: record.song || null
      }
      this.dialogVisible = true
    },
    deleteRecord(record) {
      this.$confirm('确定删除这条打卡记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCheckinRecord(record.id)
        this.loadRecords()
        this.updateCalendar()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.editingId) {
            updateCheckinRecord(this.editingId, {
              date: this.form.date,
              mood: this.form.mood,
              content: this.form.content,
              song: this.form.song
            })
            this.$message.success('更新成功')
          } else {
            addCheckinRecord({
              date: this.form.date,
              mood: this.form.mood,
              content: this.form.content,
              song: this.form.song
            })
            this.$message.success('打卡成功')
          }
          this.dialogVisible = false
          this.loadRecords()
          this.updateCalendar()
        }
      })
    },
    handleFilterChange() {
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    getMoodEmoji(mood) {
      const moods = {
        happy: '😄',
        relaxed: '😌',
        sad: '😢',
        energetic: '⚡',
        peaceful: '🕊️'
      }
      return moods[mood] || '😊'
    },
    getMoodText(mood) {
      const moods = {
        happy: '开心',
        relaxed: '放松',
        sad: '伤感',
        energetic: '活力',
        peaceful: '平静'
      }
      return moods[mood] || mood
    },
    updateCalendar() {
      const year = this.calendarMonth ? this.calendarMonth.getFullYear() : new Date().getFullYear()
      const month = this.calendarMonth ? this.calendarMonth.getMonth() : new Date().getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startDayOfWeek = firstDay.getDay()
      
      this.calendarDays = []
      
      for (let i = 0; i < startDayOfWeek; i++) {
        this.calendarDays.push({ day: '', isEmpty: true, hasRecord: false, isToday: false })
      }
      
      const today = new Date()
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
      
      const monthRecords = getCheckinRecords().filter(r => {
        const d = new Date(r.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      const recordDates = new Set(monthRecords.map(r => new Date(r.date).getDate()))
      
      for (let day = 1; day <= daysInMonth; day++) {
        this.calendarDays.push({
          day,
          isEmpty: false,
          hasRecord: recordDates.has(day),
          isToday: isCurrentMonth && today.getDate() === day
        })
      }
    },
    selectFromPlaylist() {
      this.songDialogVisible = true
    },
    loadPlaylistSongs() {
      const playList = this.$store.state.playList || []
      const hisMusicList = this.$store.state.hisMusicList || []
      const allSongs = [...playList, ...hisMusicList]
      this.playlistSongs = allSongs.map(song => ({
        id: song.id,
        name: song.name || song.title,
        artist: song.ar ? song.ar.map(a => a.name).join('/') : song.artist || '未知歌手',
        album: song.al ? song.al.name : song.album || '未知专辑'
      }))
    },
    handleSongSelect(row) {
      this.form.song = {
        id: row.id,
        name: row.name,
        artist: row.artist
      }
      this.songDialogVisible = false
    }
  }
}
</script>

<style scoped>
.listening-checkin {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.content-row {
  margin-top: 0;
}

.list-card {
  min-height: 500px;
}

.record-card {
  margin-bottom: 10px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mood-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-emoji {
  font-size: 24px;
}

.mood-text {
  font-size: 16px;
  font-weight: 500;
}

.record-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.record-song {
  margin-top: 10px;
}

.song-tag {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-card {
  min-height: 500px;
}

.calendar-grid {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 500;
  color: #606266;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background-color: #f5f7fa;
}

.calendar-day.empty {
  background-color: #fafafa;
}

.calendar-day.today {
  background-color: #ecf5ff;
}

.calendar-day.today .day-number {
  color: #409eff;
  font-weight: bold;
}

.calendar-day.has-record {
  background-color: #e1f3d8;
}

.day-number {
  font-size: 14px;
  color: #606266;
}

.record-indicator {
  font-size: 12px;
  margin-top: 2px;
}

.mood-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.song-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-song {
  margin-top: 5px;
}

.song-name, .song-artist, .song-album {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-timeline-item__timestamp {
  color: #909399;
  font-size: 12px;
}
</style>
