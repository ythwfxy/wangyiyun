<template>
  <div class="music-alarm-container">
    <div class="header">
      <h2>音乐闹钟</h2>
      <el-button type="primary" @click="showAddDialog">+ 添加闹钟</el-button>
    </div>

    <div class="alarm-list" v-if="alarms.length > 0">
      <div class="alarm-item" v-for="alarm in alarms" :key="alarm.id">
        <div class="alarm-info">
          <div class="alarm-time">{{ alarm.time }}</div>
          <div class="alarm-repeat">{{ getRepeatText(alarm.repeat) }}</div>
          <div class="alarm-song" v-if="alarm.song">
            <span class="song-title">{{ alarm.song.name }}</span>
            <span class="song-artist">{{ alarm.song.artist }}</span>
          </div>
        </div>
        <div class="alarm-actions">
          <el-switch 
            v-model="alarm.enabled" 
            @change="toggleAlarm"
            active-text="开启" 
            inactive-text="关闭"
          ></el-switch>
          <el-button type="text" @click="showEditDialog(alarm)">编辑</el-button>
          <el-button type="text" @click="deleteAlarm(alarm.id)" class="delete-btn">删除</el-button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>暂无闹钟，点击上方按钮添加第一个音乐闹钟吧！</p>
    </div>

    <!-- Add/Edit Alarm Dialog -->
    <el-dialog 
      :title="editingAlarm ? '编辑闹钟' : '添加闹钟'" 
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="闹钟时间">
          <el-time-picker
            v-model="form.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
        
        <el-form-item label="重复周期">
          <el-checkbox-group v-model="form.repeat">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="提醒铃声">
          <el-select v-model="form.songId" placeholder="选择歌曲" style="width: 100%">
            <el-option 
              v-for="song in songs" 
              :key="song.id" 
              :label="song.name + ' - ' + song.artist" 
              :value="song.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicAlarm',
  data() {
    return {
      alarms: [],
      dialogVisible: false,
      editingAlarm: null,
      songs: [
        { id: 1, name: '晴天', artist: '周杰伦', url: 'qingtian.mp3' },
        { id: 2, name: '七里香', artist: '周杰伦', url: 'qilixiang.mp3' },
        { id: 3, name: '稻香', artist: '周杰伦', url: 'daoxiang.mp3' },
        { id: 4, name: '夜曲', artist: '周杰伦', url: 'yequ.mp3' },
        { id: 5, name: '青花瓷', artist: '周杰伦', url: 'qinghuaci.mp3' }
      ],
      form: {
        time: '',
        repeat: [],
        songId: null
      }
    }
  },
  mounted() {
    this.loadAlarms()
    this.requestNotificationPermission()
    this.startAlarmChecker()
  },
  methods: {
    loadAlarms() {
      const saved = localStorage.getItem('musicAlarms')
      if (saved) {
        this.alarms = JSON.parse(saved)
      }
    },
    
    saveAlarms() {
      localStorage.setItem('musicAlarms', JSON.stringify(this.alarms))
    },
    
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },
    
    startAlarmChecker() {
      setInterval(() => {
        this.checkAlarms()
      }, 10000)
    },
    
    checkAlarms() {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const currentDay = now.getDay().toString()
      
      this.alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          if (alarm.repeat.includes(currentDay) || alarm.repeat.length === 0) {
            this.triggerAlarm(alarm)
          }
        }
      })
    },
    
    triggerAlarm(alarm) {
      if (alarm.song) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('音乐闹钟', {
            body: `该起床啦！正在播放 ${alarm.song.name}`,
            icon: 'https://example.com/notification-icon.png'
          })
        }
        
        const audio = new Audio(alarm.song.url)
        audio.loop = true
        audio.play().catch(err => {
          console.error('Failed to play audio:', err)
          alert(`闹钟时间到！请播放歌曲: ${alarm.song.name}`)
        })
        
        this.$notify({
          title: '音乐闹钟',
          message: `正在播放 ${alarm.song.name}`,
          type: 'success',
          duration: 0
        })
      }
    },
    
    getRepeatText(repeat) {
      if (repeat.length === 0) return '仅一次'
      if (repeat.length === 7) return '每天'
      
      const dayMap = {
        '0': '周日', '1': '周一', '2': '周二', '3': '周三',
        '4': '周四', '5': '周五', '6': '周六'
      }
      return repeat.map(day => dayMap[day]).join('、')
    },
    
    showAddDialog() {
      this.editingAlarm = null
      this.form = {
        time: '',
        repeat: [],
        songId: null
      }
      this.dialogVisible = true
    },
    
    showEditDialog(alarm) {
      this.editingAlarm = alarm
      this.form = {
        time: alarm.time,
        repeat: [...alarm.repeat],
        songId: alarm.song ? alarm.song.id : null
      }
      this.dialogVisible = true
    },
    
    saveAlarm() {
      if (!this.form.time || !this.form.songId) {
        this.$message.error('请填写完整信息')
        return
      }
      
      const song = this.songs.find(s => s.id === this.form.songId)
      
      if (this.editingAlarm) {
        this.editingAlarm.time = this.form.time
        this.editingAlarm.repeat = this.form.repeat
        this.editingAlarm.song = song
      } else {
        this.alarms.push({
          id: Date.now(),
          time: this.form.time,
          repeat: this.form.repeat,
          song: song,
          enabled: true
        })
      }
      
      this.saveAlarms()
      this.dialogVisible = false
      this.$message.success(this.editingAlarm ? '闹钟已更新' : '闹钟已添加')
    },
    
    toggleAlarm() {
      this.saveAlarms()
    },
    
    deleteAlarm(id) {
      this.$confirm('确定要删除这个闹钟吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.alarms = this.alarms.filter(a => a.id !== id)
        this.saveAlarms()
        this.$message.success('闹钟已删除')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.music-alarm-container {
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

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alarm-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alarm-info {
  flex: 1;
}

.alarm-time {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.alarm-repeat {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.alarm-song {
  font-size: 14px;
  color: #999;
}

.song-title {
  margin-right: 10px;
}

.song-artist {
  color: #bbb;
}

.alarm-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.delete-btn {
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state p {
  font-size: 16px;
}
</style>