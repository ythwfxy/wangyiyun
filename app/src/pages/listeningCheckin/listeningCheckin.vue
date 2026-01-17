<template>
  <div class="listening-checkin">
    <div class="header">
      <h2>听歌打卡日记</h2>
      <div class="view-toggle">
        <el-button type="primary" :class="{ active: currentView === 'list' }" @click="currentView = 'list'">列表视图</el-button>
        <el-button type="primary" :class="{ active: currentView === 'calendar' }" @click="currentView = 'calendar'">日历视图</el-button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="currentView === 'list'" class="list-view">
      <div class="toolbar">
        <el-date-picker
          v-model="filterDate"
          type="month"
          placeholder="选择月份"
          format="yyyy年MM月"
          value-format="yyyy-MM"
          @change="filterByMonth">
        </el-date-picker>
        <el-button type="primary" @click="showAddDialog">新增打卡</el-button>
      </div>

      <div class="checkin-list">
        <div v-for="record in filteredRecords" :key="record.id" class="checkin-item">
          <div class="checkin-date">{{ formatDate(record.date) }}</div>
          <div class="checkin-content">
            <div class="mood">心情: {{ record.mood }}</div>
            <div class="songs">
              <span>歌曲:</span>
              <div v-for="song in record.songs" :key="song.id" class="song-item">
                <img :src="song.picUrl" alt="歌曲封面" class="song-cover">
                <div class="song-info">
                  <div class="song-name">{{ song.name }}</div>
                  <div class="song-artist">{{ song.artist }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="checkin-actions">
            <el-button size="small" @click="editRecord(record)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRecord(record.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 日历视图 -->
    <div v-if="currentView === 'calendar'" class="calendar-view">
      <div class="calendar-toolbar">
        <el-button @click="prevMonth" icon="el-icon-arrow-left">上个月</el-button>
        <span class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
        <el-button @click="nextMonth">下个月<i class="el-icon-arrow-right el-icon--right"></i></el-button>
      </div>
      <div class="calendar-grid">
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days">
          <div v-for="day in calendarDays" :key="day.date" 
               :class="['day', { 'has-checkin': day.hasCheckin, 'other-month': !day.isCurrentMonth }]"
               @click="viewDayDetail(day)">
            <div class="day-number">{{ day.day }}</div>
            <div v-if="day.hasCheckin" class="checkin-indicator">🎵</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑打卡对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="currentRecord" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="currentRecord.date"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="心情">
          <el-select v-model="currentRecord.mood" placeholder="选择心情">
            <el-option label="开心" value="开心"></el-option>
            <el-option label="平静" value="平静"></el-option>
            <el-option label="忧郁" value="忧郁"></el-option>
            <el-option label="兴奋" value="兴奋"></el-option>
            <el-option label="怀旧" value="怀旧"></el-option>
            <el-option label="感动" value="感动"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联歌曲">
          <div class="song-selector">
            <el-button @click="showSongSelector = true">选择歌曲</el-button>
            <div v-if="currentRecord.songs.length" class="selected-songs">
              <div v-for="(song, index) in currentRecord.songs" :key="index" class="selected-song">
                <img :src="song.picUrl" alt="歌曲封面" class="song-cover-small">
                <span>{{ song.name }} - {{ song.artist }}</span>
                <el-button size="mini" type="text" @click="removeSong(index)">移除</el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="currentRecord.note" placeholder="记录听歌感受..."></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </div>
    </el-dialog>

    <!-- 歌曲选择对话框 -->
    <el-dialog title="选择歌曲" :visible.sync="showSongSelector" width="60%">
      <div class="song-search">
        <el-input v-model="songQuery" placeholder="搜索歌曲" @keyup.enter.native="searchSongs">
          <el-button slot="append" icon="el-icon-search" @click="searchSongs"></el-button>
        </el-input>
      </div>
      <div class="song-list">
        <div v-for="song in songResults" :key="song.id" class="song-result-item" @click="selectSong(song)">
          <img :src="song.album.picUrl" alt="歌曲封面" class="song-cover">
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">{{ song.artists[0].name }}</div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSongSelector = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ListeningCheckin',
  data() {
    return {
      currentView: 'list', // 'list' 或 'calendar'
      checkinRecords: [],
      filterDate: '',
      dialogVisible: false,
      dialogTitle: '新增打卡',
      currentRecord: {
        id: '',
        date: '',
        mood: '',
        songs: [],
        note: ''
      },
      showSongSelector: false,
      songQuery: '',
      songResults: [],
      // 日历相关
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    filteredRecords() {
      if (!this.filterDate) return this.checkinRecords;
      return this.checkinRecords.filter(record => 
        record.date.startsWith(this.filterDate)
      );
    },
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
      
      const firstDayOfWeek = firstDay.getDay();
      const lastDateOfMonth = lastDay.getDate();
      const prevLastDateOfMonth = prevLastDay.getDate();
      
      const days = [];
      
      // 上个月的日期
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(prevLastDateOfMonth - i).padStart(2, '0')}`;
        days.push({
          day: prevLastDateOfMonth - i,
          date: date,
          isCurrentMonth: false,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      // 当前月的日期
      for (let i = 1; i <= lastDateOfMonth; i++) {
        const date = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          day: i,
          date: date,
          isCurrentMonth: true,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      // 下个月的日期
      const remainingDays = 42 - days.length; // 保证6行
      for (let i = 1; i <= remainingDays; i++) {
        const date = `${this.currentYear}-${String(this.currentMonth + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          day: i,
          date: date,
          isCurrentMonth: false,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      return days;
    }
  },
  created() {
    this.loadRecords();
  },
  methods: {
    loadRecords() {
      const records = localStorage.getItem('listeningCheckinRecords');
      if (records) {
        this.checkinRecords = JSON.parse(records);
      }
    },
    saveRecords() {
      localStorage.setItem('listeningCheckinRecords', JSON.stringify(this.checkinRecords));
    },
    showAddDialog() {
      this.currentRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mood: '',
        songs: [],
        note: ''
      };
      this.dialogTitle = '新增打卡';
      this.dialogVisible = true;
    },
    editRecord(record) {
      this.currentRecord = { ...record };
      this.dialogTitle = '编辑打卡';
      this.dialogVisible = true;
    },
    saveRecord() {
      if (!this.currentRecord.date || !this.currentRecord.mood) {
        this.$message.error('请填写日期和心情');
        return;
      }
      
      const existingIndex = this.checkinRecords.findIndex(r => r.id === this.currentRecord.id);
      if (existingIndex >= 0) {
        this.checkinRecords[existingIndex] = { ...this.currentRecord };
      } else {
        this.checkinRecords.push({ ...this.currentRecord });
      }
      
      this.saveRecords();
      this.dialogVisible = false;
      this.$message.success('保存成功');
    },
    deleteRecord(id) {
      this.$confirm('确定要删除这条打卡记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.checkinRecords = this.checkinRecords.filter(r => r.id !== id);
        this.saveRecords();
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    filterByMonth() {
      // 日期变化时自动触发计算属性重新计算
    },
    // 日历相关方法
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    hasCheckinOnDate(dateStr) {
      return this.checkinRecords.some(record => record.date === dateStr);
    },
    viewDayDetail(day) {
      if (!day.hasCheckin) return;
      
      const record = this.checkinRecords.find(r => r.date === day.date);
      if (record) {
        this.editRecord(record);
      }
    },
    // 歌曲选择相关方法
    searchSongs() {
      if (!this.songQuery.trim()) {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      
      console.log('开始搜索歌曲，关键词:', this.songQuery.trim());
      
      this.$http.get('/cloudsearch', {
        params: {
          keywords: this.songQuery.trim(),
          type: 1,
          limit: 20,
          offset: 0,
          cookie: localStorage.getItem('cookie')
        }
      }).then(res => {
        console.log('搜索结果:', res.data);
        if (res.data.result && res.data.result.songs) {
          this.songResults = res.data.result.songs;
          console.log('找到歌曲数量:', this.songResults.length);
        } else {
          this.songResults = [];
          this.$message.info('未找到相关歌曲');
        }
      }).catch(error => {
        console.error('搜索歌曲失败:', error);
        console.error('错误详情:', error.response);
        this.$message.error('搜索歌曲失败: ' + (error.message || '未知错误'));
      });
    },
    selectSong(song) {
      const songInfo = {
        id: song.id,
        name: song.name,
        artist: song.artists[0].name,
        picUrl: song.album.picUrl
      };
      
      // 检查是否已经选择过这首歌
      const existingIndex = this.currentRecord.songs.findIndex(s => s.id === song.id);
      if (existingIndex === -1) {
        this.currentRecord.songs.push(songInfo);
      } else {
        this.$message.warning('已经选择过这首歌');
      }
      
      this.showSongSelector = false;
    },
    removeSong(index) {
      this.currentRecord.songs.splice(index, 1);
    }
  }
}
</script>

<style scoped>
.listening-checkin {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-toggle .el-button.active {
  background-color: #409EFF;
  color: white;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkin-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  align-items: center;
}

.checkin-date {
  width: 120px;
  font-weight: bold;
  color: #409EFF;
}

.checkin-content {
  flex: 1;
}

.mood {
  margin-bottom: 10px;
  font-weight: bold;
}

.songs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.song-info {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-weight: bold;
}

.song-artist {
  font-size: 12px;
  color: #909399;
}

.checkin-actions {
  display: flex;
  gap: 10px;
}

/* 日历视图样式 */
.calendar-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.current-month {
  font-size: 18px;
  font-weight: bold;
}

.calendar-grid {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f7fa;
}

.weekday {
  text-align: center;
  padding: 10px 0;
  font-weight: bold;
  border-right: 1px solid #e4e7ed;
}

.weekday:last-child {
  border-right: none;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day {
  height: 100px;
  border-right: 1px solid #e4e7ed;
  border-top: 1px solid #e4e7ed;
  padding: 5px;
  position: relative;
  cursor: pointer;
}

.day:nth-child(7n) {
  border-right: none;
}

.other-month {
  background-color: #f5f7fa;
  color: #c0c4cc;
}

.has-checkin {
  background-color: #ecf5ff;
}

.day-number {
  font-weight: bold;
}

.checkin-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 16px;
}

/* 歌曲选择相关样式 */
.song-selector {
  width: 100%;
}

.selected-songs {
  margin-top: 10px;
}

.selected-song {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.song-cover-small {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.song-search {
  margin-bottom: 15px;
}

.song-list {
  max-height: 300px;
  overflow-y: auto;
}

.song-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.song-result-item:hover {
  background-color: #f5f7fa;
}
</style>