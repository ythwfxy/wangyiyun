<template>
  <div class="music-alarm">
    <div class="alarm-header">
      <h2>音乐闹钟</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加闹钟</el-button>
    </div>

    <div class="alarm-list">
      <div v-if="alarms.length === 0" class="empty-state">
        <i class="el-icon-alarm-clock"></i>
        <p>暂无闹钟，点击右上角添加</p>
      </div>
      <div v-else class="alarm-items">
        <div v-for="alarm in alarms" :key="alarm.id" class="alarm-item" :class="{ 'alarm-off': !alarm.enabled }">
          <div class="alarm-info">
            <div class="alarm-time">{{ formatTime(alarm.time) }}</div>
            <div class="alarm-days">{{ formatDays(alarm.days) }}</div>
            <div class="alarm-song">{{ alarm.songName || '默认铃声' }}</div>
          </div>
          <div class="alarm-actions">
            <el-switch v-model="alarm.enabled" @change="toggleAlarm(alarm)"></el-switch>
            <el-button type="text" icon="el-icon-edit" @click="editAlarm(alarm)"></el-button>
            <el-button type="text" icon="el-icon-delete" @click="deleteAlarm(alarm.id)"></el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog :title="isEdit ? '编辑闹钟' : '添加闹钟'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="currentAlarm" label-width="100px">
        <el-form-item label="闹钟时间">
          <el-time-picker v-model="currentAlarm.time" format="HH:mm" value-format="HH:mm" placeholder="选择时间"></el-time-picker>
        </el-form-item>
        <el-form-item label="重复周期">
          <el-checkbox-group v-model="currentAlarm.days">
            <el-checkbox :label="0">周日</el-checkbox>
            <el-checkbox :label="1">周一</el-checkbox>
            <el-checkbox :label="2">周二</el-checkbox>
            <el-checkbox :label="3">周三</el-checkbox>
            <el-checkbox :label="4">周四</el-checkbox>
            <el-checkbox :label="5">周五</el-checkbox>
            <el-checkbox :label="6">周六</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="铃声选择">
          <el-select v-model="currentAlarm.songId" placeholder="选择铃声" style="width: 100%">
            <el-option label="默认铃声" value=""></el-option>
            <el-option v-for="song in localSongs" :key="song.id" :label="song.name" :value="song.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义铃声">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept="audio/*"
          >
            <el-button size="small" icon="el-icon-upload">上传本地音乐</el-button>
          </el-upload>
          <div v-if="currentAlarm.songFile" class="song-file-info">
            <i class="el-icon-document"></i>
            {{ currentAlarm.songFile.name }}
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">确定</el-button>
      </span>
    </el-dialog>

    <audio ref="alarmAudio" preload="auto"></audio>
  </div>
</template>

<script>
export default {
  name: 'musicAlarm',
  data() {
    return {
      alarms: [],
      localSongs: [],
      dialogVisible: false,
      isEdit: false,
      currentAlarm: {
        id: null,
        time: '',
        days: [],
        songId: '',
        songName: '',
        songFile: null,
        enabled: true
      },
      checkInterval: null
    }
  },
  created() {
    this.loadAlarms()
    this.loadLocalSongs()
    this.requestNotificationPermission()
    this.startAlarmCheck()
  },
  beforeDestroy() {
    this.stopAlarmCheck()
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
    loadLocalSongs() {
      const saved = localStorage.getItem('localSongs')
      if (saved) {
        this.localSongs = JSON.parse(saved)
      }
    },
    saveLocalSongs() {
      localStorage.setItem('localSongs', JSON.stringify(this.localSongs))
    },
    showAddDialog() {
      this.isEdit = false
      this.currentAlarm = {
        id: Date.now(),
        time: '',
        days: [],
        songId: '',
        songName: '',
        songFile: null,
        enabled: true
      }
      this.dialogVisible = true
    },
    editAlarm(alarm) {
      this.isEdit = true
      this.currentAlarm = {
        id: alarm.id,
        time: alarm.time,
        days: [...alarm.days],
        songId: alarm.songId,
        songName: alarm.songName,
        songFile: null,
        enabled: alarm.enabled
      }
      this.dialogVisible = true
    },
    saveAlarm() {
      if (!this.currentAlarm.time) {
        this.$message.warning('请选择闹钟时间')
        return
      }
      if (this.currentAlarm.days.length === 0) {
        this.$message.warning('请选择重复周期')
        return
      }

      const alarmData = {
        id: this.currentAlarm.id,
        time: this.currentAlarm.time,
        days: this.currentAlarm.days,
        songId: this.currentAlarm.songId,
        songName: this.currentAlarm.songName,
        songFile: this.currentAlarm.songFile ? {
          name: this.currentAlarm.songFile.name,
          url: URL.createObjectURL(this.currentAlarm.songFile.raw)
        } : null,
        enabled: this.currentAlarm.enabled
      }

      if (this.isEdit) {
        const index = this.alarms.findIndex(a => a.id === this.currentAlarm.id)
        if (index !== -1) {
          this.alarms[index] = alarmData
        }
      } else {
        this.alarms.push(alarmData)
      }

      this.saveAlarms()
      this.dialogVisible = false
      this.$message.success('闹钟保存成功')
    },
    deleteAlarm(id) {
      this.$confirm('确定要删除这个闹钟吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.alarms = this.alarms.filter(a => a.id !== id)
        this.saveAlarms()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    toggleAlarm(alarm) {
      this.saveAlarms()
    },
    handleFileChange(file) {
      this.currentAlarm.songFile = file
      this.currentAlarm.songName = file.name
    },
    formatTime(time) {
      return time || '--:--'
    },
    formatDays(days) {
      if (days.length === 7) return '每天'
      if (days.length === 0) return '不重复'
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return days.map(d => dayNames[d]).join(' ')
    },
    requestNotificationPermission() {
      if ('Notification' in window) {
        Notification.requestPermission()
      }
    },
    startAlarmCheck() {
      this.checkInterval = setInterval(() => {
        this.checkAlarms()
      }, 1000)
    },
    stopAlarmCheck() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
      }
    },
    checkAlarms() {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const currentDay = now.getDay()

      this.alarms.forEach(alarm => {
        if (!alarm.enabled) return
        if (alarm.time !== currentTime) return
        if (!alarm.days.includes(currentDay)) return

        this.triggerAlarm(alarm)
      })
    },
    triggerAlarm(alarm) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('音乐闹钟', {
          body: `现在是 ${alarm.time}，闹钟响了！`,
          icon: '/favicon.ico'
        })
      }

      if (alarm.songFile && alarm.songFile.url) {
        this.playAlarmSound(alarm.songFile.url)
      } else {
        this.$message.success(`闹钟响了！现在是 ${alarm.time}`)
      }
    },
    playAlarmSound(url) {
      const audio = this.$refs.alarmAudio
      audio.src = url
      audio.play().catch(err => {
        console.error('播放失败:', err)
        this.$message.warning('铃声播放失败')
      })
    }
  }
}
</script>

<style scoped>
.music-alarm {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.alarm-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state i {
  font-size: 60px;
  margin-bottom: 20px;
  display: block;
}

.empty-state p {
  font-size: 14px;
}

.alarm-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.alarm-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alarm-item.alarm-off {
  opacity: 0.6;
}

.alarm-info {
  flex: 1;
}

.alarm-time {
  font-size: 32px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.alarm-days {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.alarm-song {
  font-size: 13px;
  color: #999;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.song-file-info {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.song-file-info i {
  margin-right: 5px;
}
</style>
