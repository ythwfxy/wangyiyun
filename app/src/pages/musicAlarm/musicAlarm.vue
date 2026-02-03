<template>
  <div class="music-alarm-page">
    <div class="alarm-header">
      <h2>音乐闹钟</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">新建闹钟</el-button>
    </div>

    <div class="alarm-list" v-if="alarms.length > 0">
      <div class="alarm-item" v-for="alarm in alarms" :key="alarm.id" :class="{ 'alarm-disabled': !alarm.enabled }">
        <div class="alarm-info">
          <div class="alarm-time">{{ alarm.time }}</div>
          <div class="alarm-details">
            <span class="alarm-name">{{ alarm.name }}</span>
            <span class="alarm-repeat">{{ formatRepeat(alarm.repeat) }}</span>
            <span class="alarm-song" v-if="alarm.songName">
              <i class="el-icon-music"></i> {{ alarm.songName }}
            </span>
          </div>
        </div>
        <div class="alarm-actions">
          <el-switch :value="alarm.enabled" @change="(val) => toggleAlarm(alarm, val)" active-color="#ec4141"></el-switch>
          <el-button type="text" icon="el-icon-edit" @click="editAlarm(alarm)">编辑</el-button>
          <el-button type="text" icon="el-icon-delete" class="delete-btn" @click="deleteAlarm(alarm.id)">删除</el-button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <i class="el-icon-alarm-clock"></i>
      <p>暂无闹钟</p>
      <p class="sub-text">点击上方按钮创建您的第一个音乐闹钟</p>
    </div>

    <!-- 添加/编辑闹钟对话框 -->
    <el-dialog :title="isEditing ? '编辑闹钟' : '新建闹钟'" :visible.sync="showAddDialog" width="500px" @close="resetForm">
      <el-form :model="alarmForm" label-width="80px">
        <el-form-item label="闹钟名称">
          <el-input v-model="alarmForm.name" placeholder="例如：起床闹钟"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-time-picker v-model="alarmForm.time" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 100%">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="重复">
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
        <el-form-item label="铃声">
          <div class="song-select">
            <el-input v-model="alarmForm.songName" readonly placeholder="选择本地歌曲">
              <el-button slot="append" icon="el-icon-folder-opened" @click="selectSong"></el-button>
            </el-input>
            <input type="file" ref="fileInput" accept="audio/*" style="display: none" @change="handleFileChange">
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">保存</el-button>
      </span>
    </el-dialog>

    <!-- 闹钟触发弹窗 -->
    <el-dialog title="闹钟响了！" :visible.sync="showTriggerDialog" :close-on-click-modal="false" :show-close="false" width="400px" center>
      <div class="trigger-content">
        <i class="el-icon-alarm-clock alarm-icon"></i>
        <h3>{{ triggeredAlarm ? triggeredAlarm.name : '' }}</h3>
        <p>{{ triggeredAlarm ? triggeredAlarm.time : '' }}</p>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="stopAlarm">关闭闹钟</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const ALARM_STORAGE_KEY = 'netease_music_alarms'

export default {
  name: 'MusicAlarm',
  data() {
    return {
      alarms: [],
      showAddDialog: false,
      showTriggerDialog: false,
      isEditing: false,
      editingId: null,
      triggeredAlarm: null,
      alarmForm: {
        name: '',
        time: '',
        repeat: [],
        songName: '',
        songData: null
      },
      audioPlayer: null,
      checkInterval: null,
      notificationPermission: false
    }
  },
  mounted() {
    this.loadAlarms()
    this.initAudioPlayer()
    this.requestNotificationPermission()
    this.startAlarmCheck()
  },
  beforeDestroy() {
    this.stopAlarmCheck()
    if (this.audioPlayer) {
      this.audioPlayer.pause()
      this.audioPlayer = null
    }
  },
  methods: {
    // 从 localStorage 加载闹钟数据
    loadAlarms() {
      const stored = localStorage.getItem(ALARM_STORAGE_KEY)
      if (stored) {
        this.alarms = JSON.parse(stored)
      }
    },

    // 保存闹钟数据到 localStorage
    saveAlarms() {
      localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(this.alarms))
    },

    // 初始化音频播放器
    initAudioPlayer() {
      this.audioPlayer = new Audio()
      this.audioPlayer.loop = true
    },

    // 请求通知权限
    async requestNotificationPermission() {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        this.notificationPermission = permission === 'granted'
      }
    },

    // 开始检查闹钟
    startAlarmCheck() {
      this.checkInterval = setInterval(() => {
        this.checkAlarms()
      }, 1000)
    },

    // 停止检查闹钟
    stopAlarmCheck() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
        this.checkInterval = null
      }
    },

    // 检查是否有闹钟需要触发
    checkAlarms() {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const currentDay = String(now.getDay())
      const currentSeconds = now.getSeconds()

      // 只在整分钟时检查（避免同一分钟内多次触发）
      if (currentSeconds !== 0) return

      this.alarms.forEach(alarm => {
        if (!alarm.enabled) return
        if (alarm.time !== currentTime) return
        if (alarm.repeat.length > 0 && !alarm.repeat.includes(currentDay)) return

        // 检查是否已经在这一分钟触发过
        const lastTriggered = alarm.lastTriggered
        const today = now.toDateString()
        if (lastTriggered === today) return

        // 触发闹钟
        this.triggerAlarm(alarm)
        alarm.lastTriggered = today
        this.saveAlarms()
      })
    },

    // 触发闹钟
    triggerAlarm(alarm) {
      this.triggeredAlarm = alarm
      this.showTriggerDialog = true

      // 播放音乐
      if (alarm.songData) {
        this.audioPlayer.src = alarm.songData
        this.audioPlayer.play().catch(err => {
          console.log('播放失败:', err)
        })
      }

      // 发送浏览器通知
      if (this.notificationPermission) {
        new Notification('音乐闹钟', {
          body: `${alarm.name} - ${alarm.time}`,
          icon: require('@/assets/logo.jpg')
        })
      }
    },

    // 停止闹钟
    stopAlarm() {
      if (this.audioPlayer) {
        this.audioPlayer.pause()
        this.audioPlayer.currentTime = 0
      }
      this.showTriggerDialog = false
      this.triggeredAlarm = null
    },

    // 选择本地歌曲
    selectSong() {
      this.$refs.fileInput.click()
    },

    // 处理文件选择
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.alarmForm.songName = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          this.alarmForm.songData = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    // 保存闹钟
    saveAlarm() {
      if (!this.alarmForm.time) {
        this.$message.warning('请选择闹钟时间')
        return
      }

      const alarmData = {
        id: this.isEditing ? this.editingId : Date.now().toString(),
        name: this.alarmForm.name || '闹钟',
        time: this.alarmForm.time,
        repeat: [...this.alarmForm.repeat],
        songName: this.alarmForm.songName,
        songData: this.alarmForm.songData,
        enabled: true,
        lastTriggered: null
      }

      if (this.isEditing) {
        const index = this.alarms.findIndex(a => a.id === this.editingId)
        if (index !== -1) {
          alarmData.enabled = this.alarms[index].enabled
          alarmData.lastTriggered = this.alarms[index].lastTriggered
          this.alarms.splice(index, 1, alarmData)
        }
      } else {
        this.alarms.push(alarmData)
      }

      this.saveAlarms()
      this.showAddDialog = false
      this.resetForm()
      this.$message.success(this.isEditing ? '闹钟已更新' : '闹钟已创建')
    },

    // 编辑闹钟
    editAlarm(alarm) {
      this.isEditing = true
      this.editingId = alarm.id
      this.alarmForm = {
        name: alarm.name,
        time: alarm.time,
        repeat: [...alarm.repeat],
        songName: alarm.songName,
        songData: alarm.songData
      }
      this.showAddDialog = true
    },

    // 删除闹钟
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
    },

    // 切换闹钟开关
    toggleAlarm(alarm, value) {
      alarm.enabled = value
      this.saveAlarms()
      this.$message.success(value ? '闹钟已开启' : '闹钟已关闭')
    },

    // 重置表单
    resetForm() {
      this.alarmForm = {
        name: '',
        time: '',
        repeat: [],
        songName: '',
        songData: null
      }
      this.isEditing = false
      this.editingId = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    // 格式化重复显示
    formatRepeat(repeat) {
      if (repeat.length === 0) return '仅一次'
      if (repeat.length === 7) return '每天'
      if (repeat.length === 5 && repeat.every(d => ['1', '2', '3', '4', '5'].includes(d))) return '工作日'
      if (repeat.length === 2 && repeat.every(d => ['0', '6'].includes(d))) return '周末'

      const dayMap = {
        '0': '日',
        '1': '一',
        '2': '二',
        '3': '三',
        '4': '四',
        '5': '五',
        '6': '六'
      }
      return '周' + [...repeat].sort().map(d => dayMap[d]).join('、')
    }
  }
}
</script>

<style scoped>
.music-alarm-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.alarm-header h2 {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.alarm-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.alarm-disabled {
  opacity: 0.6;
}

.alarm-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-time {
  font-size: 32px;
  font-weight: 300;
  color: #333;
  line-height: 1;
}

.alarm-details {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.alarm-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.alarm-repeat {
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.alarm-song {
  font-size: 13px;
  color: #ec4141;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.delete-btn {
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.sub-text {
  font-size: 14px;
  color: #bbb;
  margin-top: 10px !important;
}

.song-select {
  display: flex;
  gap: 10px;
}

.trigger-content {
  text-align: center;
  padding: 20px;
}

.alarm-icon {
  font-size: 80px;
  color: #ec4141;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.trigger-content h3 {
  margin: 20px 0 10px;
  font-size: 24px;
  color: #333;
}

.trigger-content p {
  margin: 0;
  font-size: 18px;
  color: #666;
}
</style>
