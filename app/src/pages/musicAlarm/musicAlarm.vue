<template>
  <div class="music-alarm-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="header-title">音乐闹钟</span>
        <el-button type="primary" size="mini" class="add-button" @click="showAddDialog">+ 添加闹钟</el-button>
      </div>

      <el-table :data="alarms" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="闹钟时间" width="150">
          <template slot-scope="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="songName" label="铃声" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="repeatDays" label="重复周期" width="200">
          <template slot-scope="scope">
            {{ formatRepeatDays(scope.row.repeatDays) }}
          </template>
        </el-table-column>
        <el-table-column prop="isEnabled" label="状态" width="120">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              @change="toggleAlarm(scope.row)"
              :active-text="scope.row.isEnabled ? '已开启' : '已关闭'"
              inactive-text=""
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="deleteAlarm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="alarms.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无闹钟" :image-size="200"></el-empty>
        <el-button type="primary" @click="showAddDialog" style="margin-top: 20px;">创建第一个闹钟</el-button>
      </div>
    </el-card>

    <el-dialog
      title="添加闹钟"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="alarmForm" :rules="rules" ref="alarmForm" label-width="100px">
        <el-form-item label="闹钟时间" prop="time">
          <el-time-picker
            v-model="alarmForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>

        <el-form-item label="重复周期" prop="repeatDays">
          <el-checkbox-group v-model="alarmForm.repeatDays">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="选择铃声">
          <el-button type="primary" @click="showSongPicker">选择歌曲</el-button>
          <span v-if="alarmForm.songId" style="margin-left: 10px;">
            {{ alarmForm.songName }} - {{ alarmForm.artistName }}
          </span>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm" :loading="saving">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="选择铃声"
      :visible.sync="songPickerVisible"
      width="800px"
    >
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="在线歌曲" name="online">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索歌曲"
            clearable
            @clear="loadSongs"
            @input="debounceSearch"
            style="margin-bottom: 20px;"
          ></el-input>

          <el-table
            :data="songs"
            style="width: 100%"
            v-loading="songsLoading"
            @row-click="selectSong"
            highlight-current-row
          >
            <el-table-column prop="name" label="歌曲名" width="250" show-overflow-tooltip></el-table-column>
            <el-table-column prop="artist" label="歌手" width="150" show-overflow-tooltip></el-table-column>
            <el-table-column prop="album" label="专辑" width="200" show-overflow-tooltip></el-table-column>
          </el-table>

          <el-pagination
            v-if="total > 0"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="20"
            layout="total, prev, pager, next"
            :total="total"
            style="margin-top: 20px;"
          ></el-pagination>
        </el-tab-pane>

        <el-tab-pane label="本地歌曲" name="local">
          <div style="margin-bottom: 20px;">
            <el-upload
              ref="localUpload"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="10"
              accept="audio/*"
              :file-list="localFileList"
              drag
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将音乐文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                支持上传 MP3、WAV、OGG、FLAC、AAC、M4A 等格式，最多上传 10 个文件
              </div>
            </el-upload>
          </div>

          <el-table
            :data="localSongs"
            style="width: 100%"
            @row-click="selectLocalSong"
            highlight-current-row
          >
            <el-table-column prop="name" label="歌曲名" width="300" show-overflow-tooltip></el-table-column>
            <el-table-column prop="size" label="大小" width="120">
              <template slot-scope="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="格式" width="100"></el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="playLocalSong(scope.row)">预览</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicAlarm',
  data() {
    return {
      alarms: [],
      loading: false,
      dialogVisible: false,
      songPickerVisible: false,
      saving: false,
      songs: [],
      songsLoading: false,
      searchKeyword: '',
      currentPage: 1,
      total: 0,
      editingId: null,
      activeTab: 'online',
      localSongs: [],
      localFileList: [],
      alarmForm: {
        time: '',
        repeatDays: [],
        songId: '',
        songName: '',
        artistName: '',
        songUrl: '',
        fileData: null,
        fileType: null
      },
      rules: {
        time: [
          { required: true, message: '请选择闹钟时间', trigger: 'change' }
        ],
        repeatDays: [
          { required: true, message: '请选择重复周期', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadAlarms();
    this.requestNotificationPermission();
    this.startAlarmChecker();
  },
  beforeDestroy() {
    this.stopAlarmChecker();
  },
  methods: {
    loadAlarms() {
      this.loading = true;
      const alarmsStr = localStorage.getItem('musicAlarms');
      this.alarms = alarmsStr ? JSON.parse(alarmsStr) : [];
      this.loading = false;
    },
    saveAlarms() {
      localStorage.setItem('musicAlarms', JSON.stringify(this.alarms));
    },
    showAddDialog() {
      this.editingId = null;
      this.resetForm();
      this.dialogVisible = true;
    },
    showEditDialog(alarm) {
      this.editingId = alarm.id;
      this.alarmForm = {
        time: alarm.time,
        repeatDays: [...alarm.repeatDays],
        songId: alarm.songId,
        songName: alarm.songName,
        artistName: alarm.artistName,
        songUrl: alarm.songUrl
      };
      this.dialogVisible = true;
    },
    resetForm() {
      this.alarmForm = {
        time: '',
        repeatDays: [],
        songId: '',
        songName: '',
        artistName: '',
        songUrl: ''
      };
      this.editingId = null;
      if (this.$refs.alarmForm) {
        this.$refs.alarmForm.resetFields();
      }
    },
    showSongPicker() {
      this.songPickerVisible = true;
      this.loadLocalSongs();
      this.loadSongs();
    },
    loadSongs() {
      this.songsLoading = true;
      const mockSongs = [
        { id: 1, name: '晴天', artist: '周杰伦', album: '叶惠美' },
        { id: 2, name: '七里香', artist: '周杰伦', album: '七里香' },
        { id: 3, name: '稻香', artist: '周杰伦', album: '魔杰座' },
        { id: 4, name: '夜曲', artist: '周杰伦', album: '十一月的萧邦' },
        { id: 5, name: '青花瓷', artist: '周杰伦', album: '我很忙' },
        { id: 6, name: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事' },
        { id: 7, name: '成都', artist: '赵雷', album: '无法长大' },
        { id: 8, name: '理想', artist: '赵雷', album: '吉姆餐厅' },
        { id: 9, name: '南方姑娘', artist: '赵雷', album: '赵小雷' },
        { id: 10, name: '消愁', artist: '毛不易', album: '巨星不易工作室 No.1' },
        { id: 11, name: '像我这样的人', artist: '毛不易', album: '巨星不易工作室 No.1' },
        { id: 12, name: '不染', artist: '毛不易', album: '浴火成诗' },
        { id: 13, name: '往后余生', artist: '马良/孙茜茹', album: '往后余生' },
        { id: 14, name: '春风十里', artist: '鹿先森乐队', album: '所有的酒，都不如你' },
        { id: 15, name: '安和桥', artist: '宋冬野', album: '安和桥北' },
        { id: 16, name: '成都', artist: '赵雷', album: '无法长大' },
        { id: 17, name: '演员', artist: '薛之谦', album: '绅士' },
        { id: 18, name: '体面', artist: '于文文', album: '体面' },
        { id: 19, name: '说散就散', artist: 'JC陈咏桐', album: '说散就散' },
        { id: 20, name: '我们不一样', artist: '大壮', album: '我们不一样' }
      ];
      
      let filteredSongs = mockSongs;
      if (this.searchKeyword) {
        filteredSongs = mockSongs.filter(song => 
          song.name.includes(this.searchKeyword) || 
          song.artist.includes(this.searchKeyword)
        );
      }
      
      this.total = filteredSongs.length;
      this.songs = filteredSongs.slice((this.currentPage - 1) * 20, this.currentPage * 20);
      this.songsLoading = false;
    },
    selectSong(row) {
      this.alarmForm.songId = row.id;
      this.alarmForm.songName = row.name;
      this.alarmForm.artistName = row.artist;
      this.alarmForm.fileData = null;
      this.alarmForm.fileType = null;
      this.getSongUrl(row.id);
      this.songPickerVisible = false;
    },
    getSongUrl(songId) {
      this.$http.get('/song/url', { params: { id: songId } })
        .then(res => {
          if (res.data.code === 200 && res.data.data[0].url) {
            this.alarmForm.songUrl = res.data.data[0].url;
          } else {
            this.$message.warning('该歌曲无法播放，请选择其他歌曲');
          }
        })
        .catch(err => {
          console.error('获取歌曲URL失败:', err);
        });
    },
    handleTabChange(tab) {
      if (tab.name === 'local') {
        this.loadLocalSongs();
      }
    },
    handleFileChange(file, fileList) {
      this.localFileList = fileList;
      this.readFiles(fileList);
    },
    readFiles(fileList) {
      this.localSongs = [];
      fileList.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const song = {
            id: 'local_' + Date.now() + '_' + index,
            name: file.name.replace(/\.[^/.]+$/, ''),
            size: file.size,
            type: file.type.split('/')[1].toUpperCase() || '未知',
            fileData: e.target.result,
            fileName: file.name,
            originalFile: file
          };
          this.localSongs.push(song);
        };
        reader.readAsDataURL(file.raw || file);
      });
    },
    loadLocalSongs() {
      const savedLocalSongs = localStorage.getItem('localMusicSongs');
      if (savedLocalSongs) {
        this.localSongs = JSON.parse(savedLocalSongs);
      }
    },
    saveLocalSongs() {
      localStorage.setItem('localMusicSongs', JSON.stringify(this.localSongs));
    },
    selectLocalSong(row) {
      this.alarmForm.songId = row.id;
      this.alarmForm.songName = row.name;
      this.alarmForm.artistName = '本地歌曲';
      this.alarmForm.fileData = row.fileData;
      this.alarmForm.fileType = row.type;
      this.alarmForm.songUrl = null;
      this.saveLocalSongs();
      this.songPickerVisible = false;
    },
    playLocalSong(row) {
      if (row.fileData) {
        const audio = new Audio(row.fileData);
        audio.play().catch(err => {
          console.error('播放失败:', err);
          this.$message.error('播放失败');
        });
        this.$message.success(`正在播放：${row.name}`);
        setTimeout(() => {
          audio.pause();
        }, 10000);
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    },
    debounceSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1;
        this.loadSongs();
      }, 300);
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadSongs();
    },
    saveAlarm() {
      this.$refs.alarmForm.validate(valid => {
        if (valid) {
          if (!this.alarmForm.songId) {
            this.$message.warning('请选择铃声');
            return;
          }
          this.saving = true;
          const alarm = {
            id: this.editingId || Date.now().toString(),
            time: this.alarmForm.time,
            repeatDays: this.alarmForm.repeatDays,
            songId: this.alarmForm.songId,
            songName: this.alarmForm.songName,
            artistName: this.alarmForm.artistName,
            songUrl: this.alarmForm.songUrl,
            fileData: this.alarmForm.fileData,
            fileType: this.alarmForm.fileType,
            isEnabled: true
          };
          if (this.editingId) {
            const index = this.alarms.findIndex(a => a.id === this.editingId);
            if (index !== -1) {
              this.alarms.splice(index, 1, alarm);
            }
            this.$message.success('闹钟更新成功');
          } else {
            this.alarms.push(alarm);
            this.$message.success('闹钟添加成功');
          }
          this.saveAlarms();
          this.dialogVisible = false;
          this.saving = false;
        }
      });
    },
    toggleAlarm(alarm) {
      this.saveAlarms();
      if (alarm.isEnabled) {
        this.$message.success('闹钟已开启');
      } else {
        this.$message.info('闹钟已关闭');
      }
    },
    deleteAlarm(alarm) {
      this.$confirm('确定要删除这个闹钟吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.alarms.findIndex(a => a.id === alarm.id);
        if (index !== -1) {
          this.alarms.splice(index, 1);
          this.saveAlarms();
          this.$message.success('删除成功');
        }
      }).catch(() => {});
    },
    formatTime(time) {
      return time || '--:--';
    },
    formatRepeatDays(days) {
      if (!days || days.length === 0) return '不重复';
      const dayNames = {
        '0': '周日',
        '1': '周一',
        '2': '周二',
        '3': '周三',
        '4': '周四',
        '5': '周五',
        '6': '周六'
      };
      return days.map(d => dayNames[d]).join(', ');
    },
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },
    startAlarmChecker() {
      this.alarmChecker = setInterval(() => {
        this.checkAlarms();
      }, 60000);
      this.checkAlarms();
    },
    stopAlarmChecker() {
      if (this.alarmChecker) {
        clearInterval(this.alarmChecker);
      }
    },
    checkAlarms() {
      const now = new Date();
      const currentTime = this.formatCurrentTime(now);
      const currentDay = now.getDay().toString();

      this.alarms.forEach(alarm => {
        if (alarm.isEnabled && alarm.time === currentTime) {
          if (alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay)) {
            this.triggerAlarm(alarm);
          }
        }
      });
    },
    formatCurrentTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    triggerAlarm(alarm) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('音乐闹钟', {
          body: `该起床啦！正在播放：${alarm.songName}`,
          icon: 'https://music.163.com/favicon.ico'
        });
      }
      if (alarm.fileData) {
        const audio = new Audio(alarm.fileData);
        audio.loop = true;
        audio.play().catch(err => {
          console.error('播放音频失败:', err);
        });
        this.$message.success(`音乐闹钟已触发，正在播放：${alarm.songName}`);
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 30000);
      } else if (alarm.songUrl) {
        const audio = new Audio(alarm.songUrl);
        audio.loop = true;
        audio.play().catch(err => {
          console.error('播放音频失败:', err);
        });
        this.$message.success(`音乐闹钟已触发，正在播放：${alarm.songName}`);
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 30000);
      }
    }
  }
}
</script>

<style scoped>
.music-alarm-container {
  padding: 20px;
}

.box-card {
  max-width: 100%;
}

.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.add-button {
  margin-left: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
</style>
