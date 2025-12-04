<template>
  <div class="lyric-poster-container">
    <!-- 页面顶部 -->
    <div class="page-header">
      <h1>歌词海报生成器</h1>
      <el-button type="text" @click="clearAll">清空编辑</el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧歌词编辑区 -->
      <div class="left-panel">
        <!-- 歌词输入框 -->
        <div class="lyric-input-section">
          <h2>歌词输入</h2>
          <el-input
            type="textarea"
            v-model="lyricInput"
            placeholder="请输入或粘贴歌词，支持导入本地txt文件"
            :rows="10"
            class="lyric-textarea"
          ></el-input>
          <div class="input-actions">
            <el-button type="primary" @click="importLyricFile">
              <i class="el-icon-upload"></i> 导入歌词文件
            </el-button>
            <input
              ref="fileInput"
              type="file"
              accept=".txt"
              style="display: none"
              @change="handleFileImport"
            />
          </div>
        </div>

        <!-- 歌词分段预览 -->
        <div class="lyric-preview-section">
          <h2>歌词分段</h2>
          <div class="lyric-lines">
            <div
              v-for="(line, index) in lyricLines"
              :key="index"
              class="lyric-line"
              :class="{ selected: selectedLines.includes(index) }"
              @click="toggleLineSelection(index)"
            >
              {{ line }}
            </div>
          </div>
        </div>

        <!-- 歌词截取设置 -->
        <div class="lyric-trim-section">
          <h2>歌词截取</h2>
          <el-slider
            v-model="selectedLineCount"
            :min="1"
            :max="4"
            :marks="{ 1: '1句', 2: '2句', 3: '3句', 4: '4句' }"
            class="line-count-slider"
          ></el-slider>
        </div>

        <!-- 样式设置区 -->
        <div class="style-settings-section">
          <h2>样式设置</h2>
          
          <!-- 字体选择 -->
          <div class="setting-item">
            <label>字体</label>
            <el-select v-model="fontFamily" class="setting-select">
              <el-option label="思源黑体" value="Noto Sans SC"></el-option>
              <el-option label="楷体" value="KaiTi"></el-option>
              <el-option label="手写体" value="Ma Shan Zheng"></el-option>
              <el-option label="宋体" value="SimSun"></el-option>
              <el-option label="微软雅黑" value="Microsoft YaHei"></el-option>
              <el-option label="苹方" value="PingFang SC"></el-option>
            </el-select>
          </div>

          <!-- 字体大小 -->
          <div class="setting-item">
            <label>字体大小</label>
            <el-slider
              v-model="fontSize"
              :min="20"
              :max="80"
              :marks="{ 20: '20px', 40: '40px', 60: '60px', 80: '80px' }"
              class="slider"
            ></el-slider>
          </div>

          <!-- 行间距 -->
          <div class="setting-item">
            <label>行间距</label>
            <el-slider
              v-model="lineHeight"
              :min="1"
              :max="3"
              :step="0.1"
              :marks="{ 1: '1', 2: '2', 3: '3' }"
              class="slider"
            ></el-slider>
          </div>

          <!-- 对齐方式 -->
          <div class="setting-item">
            <label>对齐方式</label>
            <div class="alignment-options">
              <el-button
                type="text"
                :class="{ active: textAlign === 'left' }"
                @click="textAlign = 'left'"
              >
                <i class="el-icon-align-left"></i>
              </el-button>
              <el-button
                type="text"
                :class="{ active: textAlign === 'center' }"
                @click="textAlign = 'center'"
              >
                <i class="el-icon-align-center"></i>
              </el-button>
              <el-button
                type="text"
                :class="{ active: textAlign === 'right' }"
                @click="textAlign = 'right'"
              >
                <i class="el-icon-align-right"></i>
              </el-button>
            </div>
          </div>

          <!-- 文字颜色 -->
          <div class="setting-item">
            <label>文字颜色</label>
            <el-color-picker v-model="textColor" show-alpha></el-color-picker>
          </div>

          <!-- 描边效果 -->
          <div class="setting-item">
            <label>描边效果</label>
            <el-switch v-model="strokeEnabled" class="setting-switch"></el-switch>
          </div>
          <div v-if="strokeEnabled" class="setting-item">
            <label>描边粗细</label>
            <el-slider
              v-model="strokeWidth"
              :min="0"
              :max="3"
              :step="0.5"
              :marks="{ 0: '0px', 1: '1px', 2: '2px', 3: '3px' }"
              class="slider"
            ></el-slider>
          </div>
        </div>
      </div>

      <!-- 右侧海报预览区 -->
      <div class="right-panel">
        <!-- 海报画布 -->
        <div class="poster-preview-section">
          <h2>海报预览</h2>
          <div
            class="poster-canvas"
            :class="`ratio-${posterRatio}`"
            :style="{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
          >
            <div
              class="lyric-content"
              :style="{
                fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight,
                textAlign,
                color: textColor,
                WebkitTextStroke: strokeEnabled ? `${strokeWidth}px #000` : '0px',
                textShadow: strokeEnabled ? `0 0 ${strokeWidth * 2}px rgba(0, 0, 0, 0.5)` : 'none'
              }"
            >
              <p v-for="(line, index) in selectedLyricLines" :key="index">
                {{ line }}
              </p>
            </div>
          </div>
        </div>

        <!-- 模板/背景设置区 -->
        <div class="template-section">
          <h2>模板/背景</h2>
          <div class="template-list">
            <div
              v-for="(template, index) in templates"
              :key="index"
              class="template-item"
              :class="{ selected: selectedTemplate === index }"
              @click="selectTemplate(index)"
            >
              <div class="template-preview" :style="{ backgroundImage: `url(${template.image})` }"></div>
            </div>
            <div
              class="template-item upload-template"
              @click="uploadBackground"
            >
              <i class="el-icon-plus"></i>
              <span>上传背景</span>
              <input
                ref="backgroundInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleBackgroundUpload"
              />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="toggleRatio">
            切换比例 ({{ posterRatio === '3:4' ? '1:1' : posterRatio === '1:1' ? '4:3' : '3:4' }})
          </el-button>
          <el-button @click="resetTemplate">重置模板</el-button>
          <el-button type="success" @click="savePoster">
            <i class="el-icon-download"></i> 保存海报
          </el-button>
        </div>
      </div>
    </div>

    <!-- 撤销/重做按钮 -->
    <div class="undo-redo-buttons">
      <el-button
        type="text"
        :disabled="undoStack.length === 0"
        @click="undo"
      >
        <i class="el-icon-back"></i> 撤销
      </el-button>
      <el-button
        type="text"
        :disabled="redoStack.length === 0"
        @click="redo"
      >
        <i class="el-icon-right"></i> 重做
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LyricPoster',
  data() {
    return {
      // 歌词相关
      lyricInput: '',
      lyricLines: [],
      selectedLines: [],
      selectedLineCount: 2,
      
      // 样式相关
      fontFamily: 'Noto Sans SC',
      fontSize: 40,
      lineHeight: 1.5,
      textAlign: 'center',
      textColor: '#ffffff',
      strokeEnabled: false,
      strokeWidth: 1,
      
      // 海报相关
      posterRatio: '3:4',
      selectedTemplate: 0,
      backgroundImage: '',
      
      // 模板列表
      templates: [
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM2Y2FmZjMiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM5ZmM5YzMiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjY2NjY2MiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM5Njk2OTYiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM2NjY2NjYiLz48L3N2Zz4=' },
        { image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmNlYzMiLz48L3N2Zz4=' }
      ],
      
      // 撤销/重做栈
      undoStack: [],
      redoStack: [],
      maxHistory: 10
    }
  },
  computed: {
    selectedLyricLines() {
      return this.selectedLines.slice(0, this.selectedLineCount).map(index => this.lyricLines[index])
    }
  },
  watch: {
    lyricInput() {
      this.parseLyricLines()
      this.saveState()
    },
    selectedLines() {
      this.saveState()
    },
    selectedLineCount() {
      this.saveState()
    },
    fontFamily() {
      this.saveState()
    },
    fontSize() {
      this.saveState()
    },
    lineHeight() {
      this.saveState()
    },
    textAlign() {
      this.saveState()
    },
    textColor() {
      this.saveState()
    },
    strokeEnabled() {
      this.saveState()
    },
    strokeWidth() {
      this.saveState()
    },
    posterRatio() {
      this.saveState()
    },
    selectedTemplate() {
      this.saveState()
    },
    backgroundImage() {
      this.saveState()
    }
  },
  mounted() {
    this.loadState()
    this.selectTemplate(0)
  },
  methods: {
    // 解析歌词行
    parseLyricLines() {
      this.lyricLines = this.lyricInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      
      // 自动选择前n行
      if (this.selectedLines.length === 0 && this.lyricLines.length > 0) {
        this.selectedLines = Array.from({ length: Math.min(this.selectedLineCount, this.lyricLines.length) }, (_, i) => i)
      }
    },
    
    // 切换行选择
    toggleLineSelection(index) {
      const lineIndex = this.selectedLines.indexOf(index)
      if (lineIndex > -1) {
        this.selectedLines.splice(lineIndex, 1)
      } else {
        this.selectedLines.push(index)
      }
    },
    
    // 导入歌词文件
    importLyricFile() {
      this.$refs.fileInput.click()
    },
    
    // 处理文件导入
    handleFileImport(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.lyricInput = e.target.result
        }
        reader.readAsText(file, 'utf-8')
      }
      event.target.value = ''
    },
    
    // 选择模板
    selectTemplate(index) {
      this.selectedTemplate = index
      this.backgroundImage = this.templates[index].image
    },
    
    // 上传背景
    uploadBackground() {
      this.$refs.backgroundInput.click()
    },
    
    // 处理背景上传
    handleBackgroundUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.backgroundImage = e.target.result
          this.selectedTemplate = -1
        }
        reader.readAsDataURL(file)
      }
      event.target.value = ''
    },
    
    // 切换比例
    toggleRatio() {
      const ratios = ['3:4', '1:1', '4:3']
      const currentIndex = ratios.indexOf(this.posterRatio)
      this.posterRatio = ratios[(currentIndex + 1) % ratios.length]
    },
    
    // 重置模板
    resetTemplate() {
      this.selectTemplate(0)
    },
    
    // 清空所有
    clearAll() {
      this.$confirm('确定要清空所有编辑内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.lyricInput = ''
        this.lyricLines = []
        this.selectedLines = []
        this.selectedLineCount = 2
        this.fontFamily = 'Noto Sans SC'
        this.fontSize = 40
        this.lineHeight = 1.5
        this.textAlign = 'center'
        this.textColor = '#ffffff'
        this.strokeEnabled = false
        this.strokeWidth = 1
        this.posterRatio = '3:4'
        this.selectTemplate(0)
        this.$message.success('已清空所有内容')
      }).catch(() => {})
    },
    
    // 保存海报
    savePoster() {
      const canvas = document.createElement('canvas')
      const container = document.querySelector('.poster-canvas')
      const content = document.querySelector('.lyric-content')
      
      // 设置画布尺寸
      let width, height
      if (this.posterRatio === '3:4') {
        width = 600
        height = 800
      } else if (this.posterRatio === '1:1') {
        width = 800
        height = 800
      } else {
        width = 800
        height = 600
      }
      
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      // 绘制背景
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        
        // 绘制歌词
        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.textAlign = this.textAlign
        ctx.textBaseline = 'middle'
        
        if (this.strokeEnabled) {
          ctx.strokeStyle = '#000'
          ctx.lineWidth = this.strokeWidth
        }
        
        const lines = this.selectedLyricLines
        const lineHeight = this.fontSize * this.lineHeight
        const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2
        
        lines.forEach((line, index) => {
          const x = width / 2
          const y = startY + index * lineHeight
          
          if (this.strokeEnabled) {
            ctx.strokeText(line, x, y)
          }
          ctx.fillText(line, x, y)
        })
        
        // 下载图片
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
        link.download = `歌词海报_${timestamp}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        this.$message.success('海报已保存')
      }
      img.src = this.backgroundImage
    },
    
    // 保存状态到sessionStorage和撤销栈
    saveState() {
      const state = {
        lyricInput: this.lyricInput,
        lyricLines: this.lyricLines,
        selectedLines: [...this.selectedLines],
        selectedLineCount: this.selectedLineCount,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        lineHeight: this.lineHeight,
        textAlign: this.textAlign,
        textColor: this.textColor,
        strokeEnabled: this.strokeEnabled,
        strokeWidth: this.strokeWidth,
        posterRatio: this.posterRatio,
        selectedTemplate: this.selectedTemplate,
        backgroundImage: this.backgroundImage
      }
      
      // 保存到sessionStorage
      sessionStorage.setItem('lyricPosterState', JSON.stringify(state))
      
      // 保存到撤销栈
      this.undoStack.push(JSON.parse(JSON.stringify(this.$data)))
      
      // 限制栈的大小
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift()
      }
      
      // 清空重做栈
      this.redoStack = []
    },
    
    // 从sessionStorage加载状态
    loadState() {
      const savedState = sessionStorage.getItem('lyricPosterState')
      if (savedState) {
        const state = JSON.parse(savedState)
        Object.assign(this.$data, state)
      }
    },
    
    // 撤销
    undo() {
      if (this.undoStack.length > 0) {
        const currentState = JSON.parse(JSON.stringify(this.$data))
        this.redoStack.push(currentState)
        
        const previousState = this.undoStack.pop()
        Object.assign(this.$data, previousState)
      }
    },
    
    // 重做
    redo() {
      if (this.redoStack.length > 0) {
        const currentState = JSON.parse(JSON.stringify(this.$data))
        this.undoStack.push(currentState)
        
        const nextState = this.redoStack.pop()
        Object.assign(this.$data, nextState)
      }
    }
  }
}
</script>

<style scoped>
.lyric-poster-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.main-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.left-panel, .right-panel {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-panel {
  flex: 1;
  min-width: 400px;
  max-width: 600px;
}

.right-panel {
  flex: 1;
  min-width: 400px;
  max-width: 600px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.lyric-textarea {
  width: 100%;
  margin-bottom: 10px;
}

.input-actions {
  margin-bottom: 20px;
}

.lyric-lines {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.lyric-line {
  padding: 8px 12px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.lyric-line:hover {
  background-color: #e6f7ff;
}

.lyric-line.selected {
  background-color: #1890ff;
  color: #fff;
}

.line-count-slider {
  margin-bottom: 20px;
}

.style-settings-section {
  margin-top: 20px;
}

.setting-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  min-width: 80px;
  font-weight: 500;
  color: #333;
}

.setting-select {
  flex: 1;
}

.slider {
  flex: 1;
}

.alignment-options {
  display: flex;
  gap: 5px;
}

.alignment-options .el-button.active {
  background-color: #1890ff;
  color: #fff;
}

.poster-preview-section {
  margin-bottom: 20px;
}

.poster-canvas {
  position: relative;
  margin: 0 auto;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.poster-canvas.ratio-3\:4 {
  width: 300px;
  height: 400px;
}

.poster-canvas.ratio-1\:1 {
  width: 300px;
  height: 300px;
}

.poster-canvas.ratio-4\:3 {
  width: 400px;
  height: 300px;
}

.lyric-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.lyric-content p {
  margin: 0;
  line-height: 1.5;
}

.template-section {
  margin-bottom: 20px;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.template-item {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.template-item:hover {
  border-color: #1890ff;
}

.template-item.selected {
  border-color: #1890ff;
}

.template-preview {
  width: 100%;
  height: 80px;
  background-size: cover;
  background-position: center;
}

.upload-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  background-color: #f9f9f9;
  color: #999;
}

.upload-template i {
  font-size: 24px;
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.undo-redo-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}
</style>