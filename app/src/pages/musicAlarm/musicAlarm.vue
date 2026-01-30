<template>
  <div class="music-alarm">
    <div class="alarm-header">
      <h2>音乐闹钟</h2>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddDialog">
        新建闹钟
      </el-button>
    </div>

    <div class="alarm-list" v-if="alarms.length">
      <div
        v-for="alarm in alarms"
        :key="alarm.id"
        class="alarm-item"
        :class="{ disabled: !alarm.enabled }"
      >
        <div class="alarm-time">
          <span class="time">{{ alarm.time }}</span>
          <span class="label">{{ alarm.label }}</span>
        </div>
        <div class="alarm-repeat">
          <span v-if="alarm.repeat.length === 0">仅一次</span>
          <span v-else>{{ formatRepeat(alarm.repeat) }}</span>
        </div>
        <div class="alarm-song">
          <i class="el-icon-music"></i>
          <span>{{ alarm.songName || '默认铃声' }}</span>
        </div>
        <div class="alarm-actions">
          <el-switch
            v-model="alarm.enabled"
            @change="toggleAlarm(alarm)"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
          <el-button type="text" size="small" @click="editAlarm(alarm)">
            编辑
          </el-button>
          <el-button type="text" size="small" style="color: #f56c6c" @click="deleteAlarm(alarm.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <i class="el-icon-alarm-clock"></i>
      <p>暂无闹钟，点击上方按钮添加</p>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="currentAlarm" label-width="80px">
        <el-form-item label="闹钟时间">
          <el-time-select
            v-model="currentAlarm.time"
            :picker-options="{
              start: '00:00',
              step: '00:01',
              end: '23:59'
            }"
            placeholder="选择时间"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="闹钟标签">
          <el-input v-model="currentAlarm.label" placeholder="如：起床闹钟"></el-input>
        </el-form-item>
        <el-form-item label="重复周期">
          <el-checkbox-group v-model="currentAlarm.repeat">
            <el-checkbox label="0">周日</el-checkbox>
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="选择铃声">
          <el-button size="small" @click="selectSong">
            {{ currentAlarm.songName || '选择本地歌曲' }}
          </el-button>
          <input
            type="file"
            ref="fileInput"
            accept="audio/*"
            style="display: none"
            @change="handleFileChange"
          />
        </el-form-item>
        <el-form-item label="启用闹钟">
          <el-switch
            v-model="currentAlarm.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">确定</el-button>
      </span>
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
      dialogTitle: '新建闹钟',
      currentAlarm: {
        id: null,
        time: '07:00',
        label: '闹钟',
        repeat: [],
        enabled: true,
        songUrl: '',
        songName: ''
      },
      audio: null,
      checkInterval: null
    }
  },
  computed: {
    isEdit() {
      return this.currentAlarm.id !== null
    }
  },
  mounted() {
    this.loadAlarms()
    this.requestNotificationPermission()
    this.startAlarmCheck()
  },
  beforeDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
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
    showAddDialog() {
      this.dialogTitle = '新建闹钟'
      this.currentAlarm = {
        id: null,
        time: '07:00',
        label: '闹钟',
        repeat: [],
        enabled: true,
        songUrl: '',
        songName: ''
      }
      this.dialogVisible = true
    },
    editAlarm(alarm) {
      this.dialogTitle = '编辑闹钟'
      this.currentAlarm = JSON.parse(JSON.stringify(alarm))
      this.dialogVisible = true
    },
    saveAlarm() {
      if (!this.currentAlarm.time) {
        this.$message.warning('请选择闹钟时间')
        return
      }

      if (this.isEdit) {
        const index = this.alarms.findIndex(a => a.id === this.currentAlarm.id)
        if (index !== -1) {
          this.alarms[index] = { ...this.currentAlarm }
        }
      } else {
        this.currentAlarm.id = Date.now().toString()
        this.alarms.push({ ...this.currentAlarm })
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
      const index = this.alarms.findIndex(a => a.id === alarm.id)
      if (index !== -1) {
        this.alarms[index].enabled = alarm.enabled
        this.saveAlarms()
      }
    },
    selectSong() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.currentAlarm.songUrl = URL.createObjectURL(file)
        this.currentAlarm.songName = file.name
      }
      event.target.value = ''
    },
    formatRepeat(repeat) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      if (repeat.length === 7) return '每天'
      if (repeat.length === 2 && repeat.includes('1') && repeat.includes('5')) {
        return '工作日'
      }
      return repeat.map(d => days[parseInt(d)]).join('、')
    },
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },
    startAlarmCheck() {
      this.checkInterval = setInterval(() => {
        this.checkAlarms()
      }, 1000)
    },
    checkAlarms() {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const currentDay = now.getDay().toString()

      this.alarms.forEach(alarm => {
        if (!alarm.enabled) return
        if (alarm.time !== currentTime) return

        if (alarm.repeat.length > 0 && !alarm.repeat.includes(currentDay)) {
          return
        }

        if (!alarm.lastTriggered || !alarm.lastTriggered.includes(currentTime)) {
          this.triggerAlarm(alarm)
        }
      })
    },
    triggerAlarm(alarm) {
      alarm.lastTriggered = new Date().toISOString().split('T')[0] + ' ' + alarm.time
      this.saveAlarms()

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('音乐闹钟', {
          body: `${alarm.label} - ${alarm.time}`,
          icon: '/favicon.ico',
          tag: alarm.id
        })
      }

      if (alarm.songUrl) {
        if (this.audio) {
          this.audio.pause()
        }
        this.audio = new Audio(alarm.songUrl)
        this.audio.loop = true
        this.audio.play().catch(() => {
          this.$message.warning('请点击页面允许播放音乐')
        })

        this.$alert(`${alarm.label} 时间到了！`, '闹钟提醒', {
          confirmButtonText: '关闭',
          callback: () => {
            if (this.audio) {
              this.audio.pause()
              this.audio = null
            }
          }
        })
      } else {
        this.$alert(`${alarm.label} 时间到了！`, '闹钟提醒', {
          confirmButtonText: '知道了'
        })
      }
    }
  }
}
</script>

<style scoped>
.music-alarm {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.alarm-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alarm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.alarm-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alarm-item.disabled {
  opacity: 0.5;
}

.alarm-time {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.alarm-time .time {
  font-size: 32px;
  font-weight: 500;
  color: #333;
}

.alarm-time .label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.alarm-repeat {
  font-size: 14px;
  color: #999;
  min-width: 100px;
}

.alarm-song {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  min-width: 150px;
}

.alarm-song i {
  color: #409eff;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state p {
  font-size: 16px;
}

.el-checkbox {
  margin-right: 10px;
}
</style>
