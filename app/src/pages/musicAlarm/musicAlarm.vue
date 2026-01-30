<template>
  <div class="music-alarm-container">
    <div class="alarm-header">
      <h2>音乐闹钟</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddAlarmDialog">新建闹钟</el-button>
    </div>
    
    <div class="alarm-list" v-if="alarms.length > 0">
      <div class="alarm-item" v-for="(alarm, index) in alarms" :key="alarm.id">
        <div class="alarm-info">
          <div class="alarm-time">{{ formatTime(alarm.hour, alarm.minute) }}</div>
          <div class="alarm-repeat">{{ formatRepeat(alarm.repeat) }}</div>
          <div class="alarm-music" v-if="alarm.music">{{ alarm.music.name }} - {{ alarm.music.artist }}</div>
        </div>
        <div class="alarm-controls">
          <el-switch v-model="alarm.enabled" @change="toggleAlarm(alarm)"></el-switch>
          <el-button type="text" icon="el-icon-edit" @click="editAlarm(alarm)"></el-button>
          <el-button type="text" icon="el-icon-delete" @click="deleteAlarm(alarm.id)"></el-button>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <i class="el-icon-alarm-clock"></i>
      <p>暂无闹钟，点击上方按钮创建</p>
    </div>

    <!-- 添加/编辑闹钟对话框 -->
    <el-dialog :title="isEdit ? '编辑闹钟' : '新建闹钟'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="alarmForm" :rules="rules" ref="alarmForm" label-width="80px">
        <el-form-item label="时间" prop="time">
          <el-time-picker
            v-model="alarmForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间">
          </el-time-picker>
        </el-form-item>
        
        <el-form-item label="重复" prop="repeat">
          <el-checkbox-group v-model="alarmForm.repeat">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="铃声" prop="music">
          <el-button @click="showMusicSelector = true" type="primary">
            {{ alarmForm.music ? alarmForm.music.name + ' - ' + alarmForm.music.artist : '选择音乐' }}
          </el-button>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="alarmForm.note" placeholder="可选，添加备注"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 音乐选择对话框 -->
    <el-dialog title="选择音乐" :visible.sync="showMusicSelector" width="800px">
      <div class="music-selector">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="本地音乐" name="local">
            <div class="local-music">
              <el-input
                placeholder="搜索本地音乐"
                v-model="musicSearchQuery"
                prefix-icon="el-icon-search"
                clearable>
              </el-input>
              <div class="music-list">
                <div 
                  class="music-item" 
                  v-for="music in filteredLocalMusic" 
                  :key="music.id"
                  @click="selectMusic(music)">
                  <div class="music-info">
                    <div class="music-name">{{ music.name }}</div>
                    <div class="music-artist">{{ music.artist }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="默认铃声" name="default">
            <div class="default-music">
              <div 
                class="music-item" 
                v-for="music in defaultRingtones" 
                :key="music.id"
                @click="selectMusic(music)">
                <div class="music-info">
                  <div class="music-name">{{ music.name }}</div>
                  <div class="music-artist">{{ music.artist }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'musicAlarm',
  data() {
    return {
      alarms: [],
      dialogVisible: false,
      isEdit: false,
      showMusicSelector: false,
      activeTab: 'local',
      musicSearchQuery: '',
      currentEditId: null,
      alarmForm: {
        time: '',
        repeat: [],
        music: null,
        note: ''
      },
      rules: {
        time: [
          { required: true, message: '请选择闹钟时间', trigger: 'change' }
        ],
        repeat: [
          { type: 'array', required: true, message: '请选择重复周期', trigger: 'change' }
        ]
      },
      // 模拟本地音乐数据，实际应从API获取
      localMusic: [
        { id: 1, name: '晴天', artist: '周杰伦', url: 'music1.mp3' },
        { id: 2, name: '七里香', artist: '周杰伦', url: 'music2.mp3' },
        { id: 3, name: '告白气球', artist: '周杰伦', url: 'music3.mp3' },
        { id: 4, name: '演员', artist: '薛之谦', url: 'music4.mp3' },
        { id: 5, name: '丑八怪', artist: '薛之谦', url: 'music5.mp3' }
      ],
      // 默认铃声
      defaultRingtones: [
        { id: 101, name: '默认铃声1', artist: '系统', url: 'default1.mp3' },
        { id: 102, name: '默认铃声2', artist: '系统', url: 'default2.mp3' },
        { id: 103, name: '默认铃声3', artist: '系统', url: 'default3.mp3' }
      ],
      // 闹钟定时器
      alarmTimers: {}
    }
  },
  computed: {
    filteredLocalMusic() {
      if (!this.musicSearchQuery) return this.localMusic;
      return this.localMusic.filter(music => 
        music.name.toLowerCase().includes(this.musicSearchQuery.toLowerCase()) ||
        music.artist.toLowerCase().includes(this.musicSearchQuery.toLowerCase())
      );
    }
  },
  created() {
    this.loadAlarms();
    this.setupNotificationPermission();
    this.checkAlarms();
    this.loadUserMusic();
  },
  beforeDestroy() {
    this.clearAllTimers();
  },
  methods: {
    // 加载用户音乐
    loadUserMusic() {
      // 如果用户已登录，获取用户歌单中的音乐
      if (this.$store.state.cookie && this.$store.state.personalList.length > 0) {
        // 获取用户喜欢的音乐列表
        const favoriteListId = this.$store.state.personalList[0].id;
        this.$http.get("playlist/detail", {
          params: {
            id: favoriteListId,
          },
        }).then((res) => {
          if (res.data.code === 200) {
            const trackIds = res.data.playlist.trackIds.map(item => item.id).join(",");
            // 获取歌曲详情
            this.$http.get("song/detail", {
              params: {
                ids: trackIds,
              },
            }).then((songRes) => {
              if (songRes.data.code === 200) {
                this.localMusic = songRes.data.songs.map(song => ({
                  id: song.id,
                  name: song.name,
                  artist: song.ar.map(artist => artist.name).join('/'),
                  url: `/song/url?id=${song.id}`, // 这里需要获取实际的音乐URL
                  picUrl: song.al.picUrl
                }));
              }
            });
          }
        }).catch((error) => {
          console.error('获取用户音乐失败:', error);
          // 如果获取失败，使用默认音乐列表
        });
      }
    },
    
    // 加载闹钟数据
    loadAlarms() {
      const savedAlarms = localStorage.getItem('musicAlarms');
      if (savedAlarms) {
        this.alarms = JSON.parse(savedAlarms);
      }
    },
    
    // 保存闹钟数据
    saveAlarms() {
      localStorage.setItem('musicAlarms', JSON.stringify(this.alarms));
    },
    
    // 显示添加闹钟对话框
    showAddAlarmDialog() {
      this.isEdit = false;
      this.currentEditId = null;
      this.alarmForm = {
        time: '',
        repeat: [],
        music: null,
        note: ''
      };
      this.dialogVisible = true;
    },
    
    // 编辑闹钟
    editAlarm(alarm) {
      this.isEdit = true;
      this.currentEditId = alarm.id;
      this.alarmForm = {
        time: `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`,
        repeat: [...alarm.repeat],
        music: alarm.music,
        note: alarm.note || ''
      };
      this.dialogVisible = true;
    },
    
    // 保存闹钟
    saveAlarm() {
      this.$refs.alarmForm.validate(valid => {
        if (valid) {
          const [hour, minute] = this.alarmForm.time.split(':').map(Number);
          
          if (this.isEdit) {
            // 编辑模式
            const index = this.alarms.findIndex(alarm => alarm.id === this.currentEditId);
            if (index !== -1) {
              this.alarms[index] = {
                ...this.alarms[index],
                hour,
                minute,
                repeat: this.alarmForm.repeat,
                music: this.alarmForm.music,
                note: this.alarmForm.note
              };
            }
          } else {
            // 新建模式
            const newAlarm = {
              id: Date.now(),
              hour,
              minute,
              repeat: this.alarmForm.repeat,
              music: this.alarmForm.music,
              note: this.alarmForm.note,
              enabled: true
            };
            this.alarms.push(newAlarm);
          }
          
          this.saveAlarms();
          this.setupAlarmTimers();
          this.dialogVisible = false;
          this.$message.success(this.isEdit ? '闹钟已更新' : '闹钟已创建');
        }
      });
    },
    
    // 删除闹钟
    deleteAlarm(id) {
      this.$confirm('确定要删除这个闹钟吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.alarms = this.alarms.filter(alarm => alarm.id !== id);
        this.saveAlarms();
        this.setupAlarmTimers();
        this.$message.success('闹钟已删除');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    // 切换闹钟状态
    toggleAlarm(alarm) {
      alarm.enabled = !alarm.enabled;
      this.saveAlarms();
      this.setupAlarmTimers();
    },
    
    // 选择音乐
    selectMusic(music) {
      this.alarmForm.music = music;
      this.showMusicSelector = false;
    },
    
    // 格式化时间显示
    formatTime(hour, minute) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },
    
    // 格式化重复周期显示
    formatRepeat(repeat) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      if (repeat.length === 7) return '每天';
      if (repeat.length === 0) return '不重复';
      return repeat.map(day => days[parseInt(day)]).join('、');
    },
    
    // 设置通知权限
    setupNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },
    
    // 检查闹钟
    checkAlarms() {
      this.setupAlarmTimers();
      // 每分钟检查一次
      setInterval(() => {
        this.setupAlarmTimers();
      }, 60000);
    },
    
    // 设置闹钟定时器
    setupAlarmTimers() {
      // 清除所有现有定时器
      this.clearAllTimers();
      
      const now = new Date();
      const currentDay = now.getDay().toString();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      this.alarms.forEach(alarm => {
        if (!alarm.enabled) return;
        
        // 检查今天是否应该触发闹钟
        if (!alarm.repeat.includes(currentDay)) return;
        
        // 计算到闹钟时间的毫秒数
        let alarmTime = new Date();
        alarmTime.setHours(alarm.hour, alarm.minute, 0, 0);
        
        // 如果闹钟时间已过，设置为明天
        if (alarmTime < now) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }
        
        const timeUntilAlarm = alarmTime - now;
        
        // 设置定时器
        this.alarmTimers[alarm.id] = setTimeout(() => {
          this.triggerAlarm(alarm);
        }, timeUntilAlarm);
      });
    },
    
    // 清除所有定时器
    clearAllTimers() {
      Object.values(this.alarmTimers).forEach(timer => clearTimeout(timer));
      this.alarmTimers = {};
    },
    
    // 触发闹钟
    triggerAlarm(alarm) {
      // 发送浏览器通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('音乐闹钟', {
          body: `${this.formatTime(alarm.hour, alarm.minute)} - ${alarm.note || '闹钟响了'}`,
          icon: '/favicon.ico'
        });
      }
      
      // 播放音乐
      if (alarm.music) {
        // 如果是本地音乐，需要先获取实际的音乐URL
        if (alarm.music.url.includes('/song/url?id=')) {
          const songId = alarm.music.url.split('=')[1];
          this.$http.get('song/url', {
            params: {
              id: songId
            }
          }).then(res => {
            if (res.data.code === 200 && res.data.data.length > 0) {
              const actualUrl = res.data.data[0].url;
              // 设置音乐URL并播放
              this.$store.dispatch('saveMusicUrl', actualUrl);
              // 设置音乐详情
              const musicDetail = {
                al: {
                  name: alarm.music.name,
                  picUrl: alarm.music.picUrl || '/assets/imgs/disc.png',
                },
                ar: [{name: alarm.music.artist}],
                alia: [],
                name: alarm.music.name,
              };
              this.$store.dispatch('saveMusicDetail', musicDetail);
              // 设置播放状态为播放
              this.$store.dispatch('saveIsPlaying', true);
            }
          }).catch(error => {
            console.error('获取音乐URL失败:', error);
          });
        } else {
          // 默认铃声直接播放
          this.$store.dispatch('saveMusicUrl', alarm.music.url);
          // 设置音乐详情
          const musicDetail = {
            al: {
              name: alarm.music.name,
              picUrl: '/assets/imgs/disc.png',
            },
            ar: [{name: alarm.music.artist}],
            alia: [],
            name: alarm.music.name,
          };
          this.$store.dispatch('saveMusicDetail', musicDetail);
          // 设置播放状态为播放
          this.$store.dispatch('saveIsPlaying', true);
        }
      }
      
      // 如果是重复闹钟，设置下一次触发
      if (alarm.repeat.length > 0) {
        this.setupAlarmTimers();
      }
    }
  }
}
</script>

<style scoped>
.music-alarm-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.alarm-header h2 {
  margin: 0;
  color: #333;
}

.alarm-list {
  margin-top: 20px;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
}

.alarm-item:hover {
  background-color: #f0f0f0;
}

.alarm-info {
  flex: 1;
}

.alarm-time {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.alarm-repeat {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.alarm-music {
  font-size: 14px;
  color: #888;
}

.alarm-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}

.music-selector {
  height: 400px;
}

.local-music, .default-music {
  height: 300px;
  overflow-y: auto;
}

.music-list {
  margin-top: 15px;
}

.music-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.music-item:hover {
  background-color: #f5f5f5;
}

.music-info {
  display: flex;
  flex-direction: column;
}

.music-name {
  font-weight: 500;
  color: #333;
}

.music-artist {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>