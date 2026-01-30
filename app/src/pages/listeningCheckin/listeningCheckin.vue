<template>
  <div class="listening-checkin">
    <div class="header">
      <h2>听歌打卡日记</h2>
      <div class="view-toggle">
        <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="switchView('list')">列表视图</el-button>
        <el-button :type="viewMode === 'calendar' ? 'primary' : ''" @click="switchView('calendar')">日历视图</el-button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="filter-section">
        <el-date-picker
          v-model="filterMonth"
          type="month"
          placeholder="选择月份"
          format="yyyy年MM月"
          value-format="yyyy-MM"
          @change="filterByMonth"
          clearable>
        </el-date-picker>
        <el-button type="primary" @click="openAddDialog" icon="el-icon-plus">新增打卡</el-button>
      </div>

      <div class="checkin-list" v-if="filteredCheckins.length > 0">
        <div class="checkin-item" v-for="(item, index) in filteredCheckins" :key="item.id">
          <div class="checkin-date">{{ formatDate(item.date) }}</div>
          <div class="checkin-content">
            <div class="mood-section">
              <span class="label">心情：</span>
              <span class="mood">{{ item.mood }}</span>
            </div>
            <div class="song-section" v-if="item.song">
              <span class="label">歌曲：</span>
              <span class="song">{{ item.song.name }} - {{ item.song.artist }}</span>
            </div>
            <div class="note-section" v-if="item.note">
              <span class="label">笔记：</span>
              <span class="note">{{ item.note }}</span>
            </div>
          </div>
          <div class="checkin-actions">
            <el-button size="mini" type="primary" @click="editCheckin(item)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteCheckin(item.id)">删除</el-button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>暂无打卡记录</p>
      </div>
    </div>

    <!-- 日历视图 -->
    <div v-if="viewMode === 'calendar'" class="calendar-view">
      <div class="calendar-header">
        <el-button @click="prevMonth" icon="el-icon-arrow-left">上个月</el-button>
        <span class="current-month">{{ currentMonthDisplay }}</span>
        <el-button @click="nextMonth">下个月<i class="el-icon-arrow-right el-icon--right"></i></el-button>
        <el-button type="primary" @click="openAddDialog" icon="el-icon-plus">新增打卡</el-button>
      </div>
      <div class="calendar-grid">
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days">
          <div 
            v-for="day in calendarDays" 
            :key="day.date" 
            class="day"
            :class="{ 
              'other-month': !day.isCurrentMonth,
              'has-checkin': day.hasCheckin,
              'today': day.isToday
            }"
            @click="selectDate(day)">
            <div class="day-number">{{ day.day }}</div>
            <div v-if="day.hasCheckin" class="checkin-indicator"></div>
          </div>
        </div>
      </div>
      
      <!-- 选中日期的打卡详情 -->
      <div v-if="selectedDateCheckins.length > 0" class="selected-date-details">
        <h3>{{ selectedDateDisplay }} 的打卡记录</h3>
        <div class="checkin-details" v-for="item in selectedDateCheckins" :key="item.id">
          <div class="mood-section">
            <span class="label">心情：</span>
            <span class="mood">{{ item.mood }}</span>
          </div>
          <div class="song-section" v-if="item.song">
            <span class="label">歌曲：</span>
            <span class="song">{{ item.song.name }} - {{ item.song.artist }}</span>
          </div>
          <div class="note-section" v-if="item.note">
            <span class="label">笔记：</span>
            <span class="note">{{ item.note }}</span>
          </div>
          <div class="actions">
            <el-button size="mini" type="primary" @click="editCheckin(item)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteCheckin(item.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑打卡对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑打卡' : '新增打卡'" 
      :visible.sync="showAddDialog" 
      width="500px"
      @close="resetForm">
      <el-form :model="checkinForm" :rules="rules" ref="checkinForm" label-width="80px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="checkinForm.date"
            type="date"
            placeholder="选择日期"
            format="yyyy年MM月dd日"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="心情" prop="mood">
          <el-select v-model="checkinForm.mood" placeholder="选择心情">
            <el-option
              v-for="mood in moodOptions"
              :key="mood.value"
              :label="mood.label"
              :value="mood.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联歌曲">
          <el-button @click="showSongSelector = true" type="text">
            {{ checkinForm.song ? `${checkinForm.song.name} - ${checkinForm.song.artist}` : '选择歌曲' }}
          </el-button>
        </el-form-item>
        <el-form-item label="笔记">
          <el-input
            type="textarea"
            v-model="checkinForm.note"
            placeholder="记录你的听歌感受..."
            :rows="4">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCheckin">确定</el-button>
      </div>
    </el-dialog>

    <!-- 歌曲选择对话框 -->
    <el-dialog
      title="选择歌曲"
      :visible.sync="showSongSelector"
      width="800px">
      <div class="song-selector">
        <el-input
          placeholder="搜索歌曲"
          v-model="songSearchKeyword"
          @keyup.enter.native="searchSongs">
          <el-button slot="append" icon="el-icon-search" @click="searchSongs"></el-button>
        </el-input>
        <div class="song-list" v-if="searchResults.length > 0">
          <div 
            class="song-item" 
            v-for="song in searchResults" 
            :key="song.id"
            @click="selectSong(song)">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>
        </div>
        <div v-else class="no-song-results">
          <p>暂无搜索结果，请输入关键词搜索</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSongSelector = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'listeningCheckin',
  data() {
    return {
      viewMode: 'list', // 'list' 或 'calendar'
      checkins: [], // 所有打卡记录
      filteredCheckins: [], // 筛选后的打卡记录
      filterMonth: '', // 筛选月份
      showAddDialog: false, // 是否显示新增/编辑对话框
      showSongSelector: false, // 是否显示歌曲选择对话框
      isEditing: false, // 是否正在编辑
      currentEditId: null, // 当前编辑的记录ID
      songSearchKeyword: '', // 歌曲搜索关键词
      searchResults: [], // 歌曲搜索结果
      currentMonth: new Date(), // 当前日历显示的月份
      selectedDate: null, // 日历视图中选中的日期
      
      // 表单数据
      checkinForm: {
        date: new Date().toISOString().split('T')[0], // 默认今天
        mood: '',
        song: null,
        note: ''
      },
      
      // 表单验证规则
      rules: {
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        mood: [
          { required: true, message: '请选择心情', trigger: 'change' }
        ]
      },
      
      // 心情选项
      moodOptions: [
        { value: 'happy', label: '开心' },
        { value: 'sad', label: '难过' },
        { value: 'calm', label: '平静' },
        { value: 'excited', label: '兴奋' },
        { value: 'nostalgic', label: '怀旧' },
        { value: 'relaxed', label: '放松' },
        { value: 'melancholy', label: '忧郁' }
      ],
      
      // 星期标题
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    // 当前月份显示文本
    currentMonthDisplay() {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      return `${year}年${month + 1}月`;
    },
    
    // 日历天数数据
    calendarDays() {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      
      const days = [];
      
      // 上月末尾日期
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        days.push({
          day,
          date,
          isCurrentMonth: false,
          isToday: false,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      // 当月日期
      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && 
                       today.getMonth() === month && 
                       today.getDate() === i;
        
        days.push({
          day: i,
          date,
          isCurrentMonth: true,
          isToday,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      // 下月开始日期
      const remainingDays = 42 - days.length; // 确保显示6周
      for (let i = 1; i <= remainingDays; i++) {
        const date = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          day: i,
          date,
          isCurrentMonth: false,
          isToday: false,
          hasCheckin: this.hasCheckinOnDate(date)
        });
      }
      
      return days;
    },
    
    // 选中日期的打卡记录
    selectedDateCheckins() {
      if (!this.selectedDate) return [];
      return this.checkins.filter(item => item.date === this.selectedDate);
    },
    
    // 选中日期显示文本
    selectedDateDisplay() {
      if (!this.selectedDate) return '';
      return this.formatDate(this.selectedDate);
    }
  },
  created() {
    console.log('Component created');
    this.loadCheckins();
    this.filterByMonth();
  },
  mounted() {
    console.log('Component mounted, checkins:', this.checkins, 'type:', typeof this.checkins, 'isArray:', Array.isArray(this.checkins));
  },
  methods: {
    // 打开新增对话框
    openAddDialog() {
      console.log('Opening add dialog');
      this.resetForm();
      this.showAddDialog = true;
    },
    switchView(mode) {
      console.log('Switching view to:', mode);
      this.viewMode = mode;
    },
    loadCheckins() {
      const stored = localStorage.getItem('listeningCheckins');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // 确保解析出来的是数组
          const checkinsArray = Array.isArray(parsed) ? parsed : [];
          this.$set(this, 'checkins', checkinsArray);
        } catch (e) {
          console.error('Error parsing stored checkins:', e);
          this.$set(this, 'checkins', []);
        }
      } else {
        this.$set(this, 'checkins', []);
      }
      this.filterByMonth();
    },
    
    // 保存打卡记录到localStorage
    saveCheckinsToStorage() {
      localStorage.setItem('listeningCheckins', JSON.stringify(this.checkins));
    },
    
    // 按月份筛选
    filterByMonth() {
      if (!this.filterMonth) {
        this.filteredCheckins = [...this.checkins];
        return;
      }
      
      this.filteredCheckins = this.checkins.filter(item => {
        return item.date.startsWith(this.filterMonth);
      });
      
      // 按日期降序排序
      this.filteredCheckins.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // 检查某日期是否有打卡
    hasCheckinOnDate(date) {
      return this.checkins.some(item => item.date === date);
    },
    
    // 选择日期
    selectDate(day) {
      this.selectedDate = day.date;
    },
    
    // 上一个月
    prevMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    },
    
    // 下一个月
    nextMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    },
    
    // 格式化日期
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[date.getDay()];
      
      return `${year}年${month}月${day}日 ${weekday}`;
    },
    
    // 重置表单
    resetForm() {
      this.checkinForm = {
        date: new Date().toISOString().split('T')[0],
        mood: '',
        song: null,
        note: ''
      };
      this.isEditing = false;
      this.currentEditId = null;
      this.$refs.checkinForm && this.$refs.checkinForm.resetFields();
    },
    
    // 编辑打卡
    editCheckin(item) {
      this.isEditing = true;
      this.currentEditId = item.id;
      this.checkinForm = {
        date: item.date,
        mood: item.mood,
        song: item.song,
        note: item.note
      };
      this.showAddDialog = true;
    },
    
    // 删除打卡
    deleteCheckin(id) {
      this.$confirm('确定要删除这条打卡记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.checkins = this.checkins.filter(item => item.id !== id);
        this.saveCheckinsToStorage();
        this.filterByMonth();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    // 保存打卡
    saveCheckin() {
      console.log('saveCheckin called, this.checkins:', this.checkins, 'type:', typeof this.checkins, 'isArray:', Array.isArray(this.checkins));
      this.$refs.checkinForm.validate((valid) => {
        if (valid) {
          if (this.isEditing) {
            // 编辑模式
            const index = this.checkins.findIndex(item => item.id === this.currentEditId);
            if (index !== -1) {
              this.checkins[index] = {
                ...this.checkins[index],
                ...this.checkinForm
              };
            }
          } else {
            // 新增模式
            const newCheckin = {
              id: Date.now().toString(),
              ...this.checkinForm
            };
            console.log('About to push new checkin:', newCheckin);
            
            // 确保 checkins 是数组
            if (!Array.isArray(this.checkins)) {
              console.warn('checkins is not an array, resetting to empty array');
              this.$set(this, 'checkins', []);
            }
            
            this.checkins.push(newCheckin);
          }
          
          this.saveCheckinsToStorage();
          this.filterByMonth();
          this.showAddDialog = false;
          this.resetForm();
          this.$message({
            type: 'success',
            message: this.isEditing ? '编辑成功!' : '打卡成功!'
          });
        }
      });
    },
    
    // 搜索歌曲
    searchSongs() {
      if (!this.songSearchKeyword.trim()) return;
      
      // 模拟搜索结果 - 实际项目中应该调用API
      this.searchResults = [
        { id: '1', name: '晴天', artist: '周杰伦' },
        { id: '2', name: '七里香', artist: '周杰伦' },
        { id: '3', name: '告白气球', artist: '周杰伦' },
        { id: '4', name: '稻香', artist: '周杰伦' },
        { id: '5', name: '夜曲', artist: '周杰伦' }
      ].filter(song => 
        song.name.includes(this.songSearchKeyword) || 
        song.artist.includes(this.songSearchKeyword)
      );
    },
    
    // 选择歌曲
    selectSong(song) {
      this.checkinForm.song = song;
      this.showSongSelector = false;
      this.songSearchKeyword = '';
      this.searchResults = [];
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.view-toggle {
  display: flex;
  gap: 10px;
}

.filter-section {
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkin-date {
  font-weight: bold;
  color: #409EFF;
  font-size: 16px;
}

.checkin-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-section, .song-section, .note-section {
  display: flex;
  align-items: flex-start;
}

.label {
  font-weight: bold;
  min-width: 50px;
}

.mood {
  color: #409EFF;
}

.song {
  color: #67C23A;
}

.note {
  color: #909399;
}

.checkin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
}

/* 日历视图样式 */
.calendar-view {
  margin-top: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.current-month {
  font-size: 18px;
  font-weight: bold;
}

.calendar-grid {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f7fa;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
}

.weekday:last-child {
  border-right: none;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day {
  min-height: 80px;
  border-right: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  padding: 5px;
  cursor: pointer;
  position: relative;
}

.day:nth-child(7n) {
  border-right: none;
}

.other-month {
  background-color: #f9f9f9;
  color: #c0c4cc;
}

.today {
  background-color: #ecf5ff;
}

.has-checkin {
  background-color: #f0f9ff;
}

.day-number {
  font-size: 14px;
  margin-bottom: 5px;
}

.checkin-indicator {
  width: 6px;
  height: 6px;
  background-color: #409EFF;
  border-radius: 50%;
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.selected-date-details {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.selected-date-details h3 {
  margin-top: 0;
  color: #409EFF;
}

.checkin-details {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.checkin-details:last-child {
  border-bottom: none;
}

.actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 歌曲选择器样式 */
.song-selector {
  max-height: 400px;
  overflow-y: auto;
}

.song-list {
  margin-top: 15px;
}

.song-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.song-item:hover {
  background-color: #f5f7fa;
}

.song-name {
  font-weight: bold;
}

.song-artist {
  color: #909399;
  font-size: 12px;
}

.no-song-results {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>