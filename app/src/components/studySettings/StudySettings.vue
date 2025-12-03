<template>
  <div class="study-settings">
    <h2>抗干扰设置</h2>
    
    <el-form label-width="150px">
      <!-- 深度抗干扰模式 -->
      <el-form-item label="深度抗干扰模式">
        <el-switch v-model="settings.deepFocus" @change="toggleDeepFocus"></el-switch>
        <span class="tip">开启后屏蔽除紧急通知外的所有系统通知</span>
      </el-form-item>

      <!-- 音乐风格偏好 -->
      <el-form-item label="音乐风格偏好">
        <el-checkbox-group v-model="settings.musicStyles">
          <el-checkbox label="无歌词纯音乐"></el-checkbox>
          <el-checkbox label="轻节奏古典乐"></el-checkbox>
          <el-checkbox label="电子纯音乐"></el-checkbox>
          <el-checkbox label="自然音效"></el-checkbox>
          <el-checkbox label="白噪音"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 计时提示音 -->
      <el-form-item label="计时提示音">
        <el-select v-model="settings.alertSound" placeholder="请选择">
          <el-option label="自然音效" value="nature"></el-option>
          <el-option label="电子音效" value="electronic"></el-option>
          <el-option label="钢琴音" value="piano"></el-option>
          <el-option label="静音" value="silent"></el-option>
        </el-select>
      </el-form-item>

      <!-- 背景主题 -->
      <el-form-item label="背景主题">
        <el-radio-group v-model="settings.theme">
          <el-radio-button label="light">极简白</el-radio-button>
          <el-radio-button label="dark">深夜黑</el-radio-button>
          <el-radio-button label="green">护眼绿</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 屏幕常亮 -->
      <el-form-item label="屏幕常亮">
        <el-switch v-model="settings.keepScreenOn"></el-switch>
        <span class="tip">专注过程中保持屏幕常亮</span>
      </el-form-item>

      <!-- 音量设置 -->
      <el-form-item label="专注模式音量">
        <el-slider v-model="settings.focusVolume" :min="0" :max="100"></el-slider>
        <span class="volume-value">{{ settings.focusVolume }}%</span>
      </el-form-item>

      <el-form-item label="休息模式音量">
        <el-slider v-model="settings.breakVolume" :min="0" :max="100"></el-slider>
        <span class="volume-value">{{ settings.breakVolume }}%</span>
      </el-form-item>

      <!-- 自动开始休息 -->
      <el-form-item label="自动开始休息">
        <el-switch v-model="settings.autoBreak"></el-switch>
        <span class="tip">专注结束后自动开始休息</span>
      </el-form-item>

      <!-- 休息提醒时间 -->
      <el-form-item label="休息提醒时间">
        <el-select v-model="settings.breakRemind" placeholder="请选择">
          <el-option label="休息结束前30秒" value="30"></el-option>
          <el-option label="休息结束前1分钟" value="60"></el-option>
          <el-option label="休息结束前2分钟" value="120"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div class="settings-actions">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">重置默认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudySettings',
  data() {
    return {
      settings: {
        deepFocus: false,
        musicStyles: ['无歌词纯音乐', '轻节奏古典乐'],
        alertSound: 'piano',
        theme: 'light',
        keepScreenOn: true,
        focusVolume: 50,
        breakVolume: 70,
        autoBreak: true,
        breakRemind: '30'
      }
    }
  },
  methods: {
    toggleDeepFocus(value) {
      if (value) {
        this.$confirm('开启深度抗干扰模式将屏蔽所有通知，确定要开启吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 开启深度抗干扰模式逻辑
        }).catch(() => {
          this.settings.deepFocus = false
        })
      }
    },
    saveSettings() {
      // 保存设置到本地存储
      localStorage.setItem('studySettings', JSON.stringify(this.settings))
      this.$message.success('设置已保存')
      this.$emit('close')
    },
    resetSettings() {
      this.$confirm('确定要重置所有设置为默认值吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.settings = {
          deepFocus: false,
          musicStyles: ['无歌词纯音乐', '轻节奏古典乐'],
          alertSound: 'piano',
          theme: 'light',
          keepScreenOn: true,
          focusVolume: 50,
          breakVolume: 70,
          autoBreak: true,
          breakRemind: '30'
        }
        this.$message.success('设置已重置')
      })
    }
  },
  created() {
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('studySettings')
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings)
    }
  }
}
</script>

<style scoped>
.study-settings {
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.study-settings h2 {
  margin: 0 0 20px;
  font-size: 24px;
  color: #333;
  text-align: center;
}

.tip {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

.volume-value {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
  min-width: 40px;
  display: inline-block;
  text-align: right;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>