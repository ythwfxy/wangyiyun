<template>
  <div class="lyric-poster-container">
    <!-- 页面顶部 -->
    <div class="page-header">
      <h1 class="page-title">歌词海报生成器</h1>
      <button class="clear-btn" @click="clearAll">清空编辑</button>
    </div>

    <!-- 核心布局：左侧编辑区 + 右侧预览区 -->
    <div class="main-content">
      <!-- 左侧歌词编辑区 -->
      <div class="left-panel">
        <!-- 歌词输入区 -->
        <div class="lyric-input-section">
          <h3>歌词输入</h3>
          <textarea 
            v-model="lyricText" 
            placeholder="请输入或粘贴歌词，也可以点击下方按钮导入本地txt歌词文件" 
            class="lyric-input" 
            rows="8"
          ></textarea>
          <div class="input-actions">
            <input 
              type="file" 
              ref="fileInput" 
              accept=".txt" 
              style="display: none;" 
              @change="importLyricFile"
            />
            <button class="import-btn" @click="$refs.fileInput.click()">导入歌词文件</button>
          </div>
        </div>

        <!-- 歌词分段预览 -->
        <div class="lyric-preview-section">
          <h3>歌词分段</h3>
          <div class="lyric-segments">
            <div 
              v-for="(segment, index) in lyricSegments" 
              :key="index" 
              class="lyric-segment" 
              :class="{ selected: selectedSegments.includes(index) }"
              @click="toggleSegmentSelection(index)"
            >
              {{ segment }}
            </div>
          </div>
        </div>

        <!-- 歌词截取设置 -->
        <div class="lyric-trim-section">
          <h3>歌词截取</h3>
          <div class="trim-controls">
            <label>选择歌词句数：</label>
            <select v-model="selectedLineCount" @change="updateSelectedSegments">
              <option value="1">1句</option>
              <option value="2">2句</option>
              <option value="3">3句</option>
              <option value="4">4句</option>
            </select>
          </div>
          <div class="text-style-controls">
            <label>字体大小：</label>
            <input type="range" v-model="fontSize" min="20" max="80" step="1" />
            <span>{{ fontSize }}px</span>
          </div>
          <div class="text-style-controls">
            <label>行间距：</label>
            <input type="range" v-model="lineHeight" min="1" max="3" step="0.1" />
            <span>{{ lineHeight }}</span>
          </div>
          <div class="text-style-controls">
            <label>对齐方式：</label>
            <select v-model="textAlign">
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>

        <!-- 样式设置区 -->
        <div class="style-setting-section">
          <h3>样式设置</h3>
          <div class="style-controls">
            <div class="style-control-group">
              <label>字体选择：</label>
              <select v-model="selectedFont">
                <option value="SimHei">黑体</option>
                <option value="KaiTi">楷体</option>
                <option value="FangSong">仿宋</option>
                <option value="SimSun">宋体</option>
                <option value="Microsoft YaHei">微软雅黑</option>
                <option value="STSong">华文宋体</option>
              </select>
            </div>
            <div class="style-control-group">
              <label>文字颜色：</label>
              <input type="color" v-model="textColor" />
            </div>
            <div class="style-control-group">
              <label>描边效果：</label>
              <input type="checkbox" v-model="strokeEnabled" />
              <input 
                type="range" 
                v-model="strokeWidth" 
                min="0" 
                max="3" 
                step="0.5" 
                :disabled="!strokeEnabled"
              />
              <span>{{ strokeWidth }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧海报预览区 -->
      <div class="right-panel">
        <!-- 海报画布 -->
        <div class="poster-canvas-container">
          <div 
            class="poster-canvas" 
            :class="{ 'ratio-3-4': selectedRatio === '3:4', 'ratio-1-1': selectedRatio === '1:1', 'ratio-4-3': selectedRatio === '4:3' }"
            :style="{ backgroundImage: `url(${selectedBackground})` }"
          >
            <div 
              class="poster-text" 
              :style="{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                textAlign: textAlign,
                fontFamily: selectedFont,
                color: textColor,
                WebkitTextStroke: strokeEnabled ? `${strokeWidth}px #000` : '0px',
                textStroke: strokeEnabled ? `${strokeWidth}px #000` : '0px'
              }"
            >
              {{ selectedLyricText }}
            </div>
          </div>
        </div>

        <!-- 模板/背景设置区 -->
        <div class="template-background-section">
          <h3>模板/背景</h3>
          <div class="template-grid">
            <div 
              v-for="(template, index) in presetTemplates" 
              :key="index" 
              class="template-item" 
              :class="{ selected: selectedTemplateIndex === index }"
              @click="selectTemplate(index)"
            >
              <div class="template-preview" :style="{ background: template.background }">
                <div class="template-text-preview">歌词示例</div>
              </div>
            </div>
          </div>
          <div class="background-actions">
            <input 
              type="file" 
              ref="bgFileInput" 
              accept="image/*" 
              style="display: none;" 
              @change="uploadBackgroundImage"
            />
            <button class="upload-bg-btn" @click="$refs.bgFileInput.click()">上传背景图片</button>
            <button class="reset-template-btn" @click="resetTemplate">重置模板</button>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="poster-actions">
          <div class="ratio-selector">
            <label>海报比例：</label>
            <select v-model="selectedRatio">
              <option value="3:4">3:4</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
            </select>
          </div>
          <button class="save-btn" @click="savePoster">保存海报</button>
        </div>
      </div>
    </div>

    <!-- 撤销/重做按钮 -->
    <div class="undo-redo-container">
      <button class="undo-btn" @click="undo" :disabled="undoStack.length === 0">撤销</button>
      <button class="redo-btn" @click="redo" :disabled="redoStack.length === 0">重做</button>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'LyricPoster',
  data() {
    return {
      // 歌词相关
      lyricText: '',
      lyricSegments: [],
      selectedSegments: [],
      selectedLineCount: 1,
      selectedLyricText: '',

      // 文字样式
      fontSize: 40,
      lineHeight: 1.5,
      textAlign: 'center',
      selectedFont: 'Microsoft YaHei',
      textColor: '#ffffff',
      strokeEnabled: false,
      strokeWidth: 1,

      // 海报设置
      selectedRatio: '3:4',
      selectedTemplateIndex: 0,
      selectedBackground: '',
      presetTemplates: [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
        { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }
      ],

      // 操作历史
      undoStack: [],
      redoStack: []
    }
  },
  mounted() {
    // 从sessionStorage恢复数据
    this.restoreFromSessionStorage()
  },
  watch: {
    // 监听歌词文本变化，自动分段
    lyricText: function(newVal) {
      this.lyricSegments = newVal.split('\n').filter(segment => segment.trim() !== '')
      this.updateSelectedSegments()
      this.saveToSessionStorage()
    },

    // 监听选中的分段变化，更新显示的歌词文本
    selectedSegments: function(newVal) {
      this.selectedLyricText = newVal.map(index => this.lyricSegments[index]).join('\n')
      this.saveToSessionStorage()
    },

    // 监听样式变化
    fontSize: function() {
      this.saveToSessionStorage()
    },
    lineHeight: function() {
      this.saveToSessionStorage()
    },
    textAlign: function() {
      this.saveToSessionStorage()
    },
    selectedFont: function() {
      this.saveToSessionStorage()
    },
    textColor: function() {
      this.saveToSessionStorage()
    },
    strokeEnabled: function() {
      this.saveToSessionStorage()
    },
    strokeWidth: function() {
      this.saveToSessionStorage()
    },

    // 监听海报设置变化
    selectedRatio: function() {
      this.saveToSessionStorage()
    },
    selectedTemplateIndex: function() {
      this.selectTemplate(this.selectedTemplateIndex)
      this.saveToSessionStorage()
    }
  },
  methods: {
    // 导入歌词文件
    importLyricFile(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.lyricText = e.target.result
        }
        reader.readAsText(file)
      }
    },

    // 切换分段选择
    toggleSegmentSelection(index) {
      const segmentIndex = this.selectedSegments.indexOf(index)
      if (segmentIndex > -1) {
        this.selectedSegments.splice(segmentIndex, 1)
      } else {
        // 确保不超过选择的句数
        if (this.selectedSegments.length < this.selectedLineCount) {
          this.selectedSegments.push(index)
        }
      }
    },

    // 更新选中的分段（根据选择的句数）
    updateSelectedSegments() {
      // 如果当前选中的分段数超过新的句数，只保留前N个
      if (this.selectedSegments.length > this.selectedLineCount) {
        this.selectedSegments = this.selectedSegments.slice(0, this.selectedLineCount)
      } else if (this.selectedSegments.length < this.selectedLineCount) {
        // 如果当前选中的分段数少于新的句数，自动添加后面的分段
        for (let i = 0; i < this.selectedLineCount; i++) {
          if (!this.selectedSegments.includes(i)) {
            this.selectedSegments.push(i)
          }
        }
      }
    },

    // 选择模板
    selectTemplate(index) {
      this.selectedTemplateIndex = index
      this.selectedBackground = this.presetTemplates[index].background
    },

    // 上传背景图片
    uploadBackgroundImage(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedBackground = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    // 重置模板
    resetTemplate() {
      this.selectTemplate(0)
    },

    // 保存海报
    async savePoster() {
      try {
        const canvasElement = document.querySelector('.poster-canvas')
        if (!canvasElement) {
          console.error('Poster canvas element not found')
          return
        }

        // 使用html2canvas将海报画布转换为图片
        const canvas = await html2canvas(canvasElement, {
          scale: 2, // 提高图片分辨率
          useCORS: true // 允许跨域图片
        })

        // 将canvas转换为blob
        canvas.toBlob((blob) => {
          // 创建下载链接
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url

          // 生成默认文件名：歌词海报_YYYYMMDDHHMMSS.png
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          const hours = String(now.getHours()).padStart(2, '0')
          const minutes = String(now.getMinutes()).padStart(2, '0')
          const seconds = String(now.getSeconds()).padStart(2, '0')
          const fileName = `歌词海报_${year}${month}${day}${hours}${minutes}${seconds}.png`

          a.download = fileName
          a.click()

          // 释放URL对象
          URL.revokeObjectURL(url)
        }, 'image/png')

        console.log('海报保存成功')
      } catch (error) {
        console.error('海报保存失败:', error)
      }
    },

    // 清空所有编辑内容
    clearAll() {
      this.saveToUndoStack()
      this.lyricText = ''
      this.lyricSegments = []
      this.selectedSegments = []
      this.selectedLineCount = 1
      this.selectedLyricText = ''

      this.fontSize = 40
      this.lineHeight = 1.5
      this.textAlign = 'center'
      this.selectedFont = 'Microsoft YaHei'
      this.textColor = '#ffffff'
      this.strokeEnabled = false
      this.strokeWidth = 1

      this.selectedRatio = '3:4'
      this.selectedTemplateIndex = 0
      this.selectedBackground = this.presetTemplates[0].background

      this.redoStack = []
    },

    // 保存到撤销栈
    saveToUndoStack() {
      this.undoStack.push({
        lyricText: this.lyricText,
        lyricSegments: [...this.lyricSegments],
        selectedSegments: [...this.selectedSegments],
        selectedLineCount: this.selectedLineCount,
        selectedLyricText: this.selectedLyricText,

        fontSize: this.fontSize,
        lineHeight: this.lineHeight,
        textAlign: this.textAlign,
        selectedFont: this.selectedFont,
        textColor: this.textColor,
        strokeEnabled: this.strokeEnabled,
        strokeWidth: this.strokeWidth,

        selectedRatio: this.selectedRatio,
        selectedTemplateIndex: this.selectedTemplateIndex,
        selectedBackground: this.selectedBackground
      })

      // 最多保留10步操作记录
      if (this.undoStack.length > 10) {
        this.undoStack.shift()
      }
    },

    // 撤销
    undo() {
      if (this.undoStack.length > 0) {
        const lastState = this.undoStack.pop()
        this.redoStack.push({
          lyricText: this.lyricText,
          lyricSegments: [...this.lyricSegments],
          selectedSegments: [...this.selectedSegments],
          selectedLineCount: this.selectedLineCount,
          selectedLyricText: this.selectedLyricText,

          fontSize: this.fontSize,
          lineHeight: this.lineHeight,
          textAlign: this.textAlign,
          selectedFont: this.selectedFont,
          textColor: this.textColor,
          strokeEnabled: this.strokeEnabled,
          strokeWidth: this.strokeWidth,

          selectedRatio: this.selectedRatio,
          selectedTemplateIndex: this.selectedTemplateIndex,
          selectedBackground: this.selectedBackground
        })

        this.lyricText = lastState.lyricText
        this.lyricSegments = [...lastState.lyricSegments]
        this.selectedSegments = [...lastState.selectedSegments]
        this.selectedLineCount = lastState.selectedLineCount
        this.selectedLyricText = lastState.selectedLyricText

        this.fontSize = lastState.fontSize
        this.lineHeight = lastState.lineHeight
        this.textAlign = lastState.textAlign
        this.selectedFont = lastState.selectedFont
        this.textColor = lastState.textColor
        this.strokeEnabled = lastState.strokeEnabled
        this.strokeWidth = lastState.strokeWidth

        this.selectedRatio = lastState.selectedRatio
        this.selectedTemplateIndex = lastState.selectedTemplateIndex
        this.selectedBackground = lastState.selectedBackground
      }
    },

    // 重做
    redo() {
      if (this.redoStack.length > 0) {
        const nextState = this.redoStack.pop()
        this.undoStack.push({
          lyricText: this.lyricText,
          lyricSegments: [...this.lyricSegments],
          selectedSegments: [...this.selectedSegments],
          selectedLineCount: this.selectedLineCount,
          selectedLyricText: this.selectedLyricText,

          fontSize: this.fontSize,
          lineHeight: this.lineHeight,
          textAlign: this.textAlign,
          selectedFont: this.selectedFont,
          textColor: this.textColor,
          strokeEnabled: this.strokeEnabled,
          strokeWidth: this.strokeWidth,

          selectedRatio: this.selectedRatio,
          selectedTemplateIndex: this.selectedTemplateIndex,
          selectedBackground: this.selectedBackground
        })

        this.lyricText = nextState.lyricText
        this.lyricSegments = [...nextState.lyricSegments]
        this.selectedSegments = [...nextState.selectedSegments]
        this.selectedLineCount = nextState.selectedLineCount
        this.selectedLyricText = nextState.selectedLyricText

        this.fontSize = nextState.fontSize
        this.lineHeight = nextState.lineHeight
        this.textAlign = nextState.textAlign
        this.selectedFont = nextState.selectedFont
        this.textColor = nextState.textColor
        this.strokeEnabled = nextState.strokeEnabled
        this.strokeWidth = nextState.strokeWidth

        this.selectedRatio = nextState.selectedRatio
        this.selectedTemplateIndex = nextState.selectedTemplateIndex
        this.selectedBackground = nextState.selectedBackground
      }
    },

    // 保存到sessionStorage
    saveToSessionStorage() {
      sessionStorage.setItem('lyricPosterData', JSON.stringify({
        lyricText: this.lyricText,
        lyricSegments: [...this.lyricSegments],
        selectedSegments: [...this.selectedSegments],
        selectedLineCount: this.selectedLineCount,
        selectedLyricText: this.selectedLyricText,

        fontSize: this.fontSize,
        lineHeight: this.lineHeight,
        textAlign: this.textAlign,
        selectedFont: this.selectedFont,
        textColor: this.textColor,
        strokeEnabled: this.strokeEnabled,
        strokeWidth: this.strokeWidth,

        selectedRatio: this.selectedRatio,
        selectedTemplateIndex: this.selectedTemplateIndex,
        selectedBackground: this.selectedBackground
      }))
    },

    // 从sessionStorage恢复
    restoreFromSessionStorage() {
      const savedData = sessionStorage.getItem('lyricPosterData')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          this.lyricText = data.lyricText || ''
          this.lyricSegments = data.lyricSegments || []
          this.selectedSegments = data.selectedSegments || []
          this.selectedLineCount = data.selectedLineCount || 1
          this.selectedLyricText = data.selectedLyricText || ''

          this.fontSize = data.fontSize || 40
          this.lineHeight = data.lineHeight || 1.5
          this.textAlign = data.textAlign || 'center'
          this.selectedFont = data.selectedFont || 'Microsoft YaHei'
          this.textColor = data.textColor || '#ffffff'
          this.strokeEnabled = data.strokeEnabled || false
          this.strokeWidth = data.strokeWidth || 1

          this.selectedRatio = data.selectedRatio || '3:4'
          this.selectedTemplateIndex = data.selectedTemplateIndex || 0
          this.selectedBackground = data.selectedBackground || this.presetTemplates[0].background
        } catch (error) {
          console.error('Failed to restore data from sessionStorage:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.lyric-poster-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

/* 页面顶部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.clear-btn {
  background-color: #f5576c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background-color: #e0455a;
}

/* 核心布局 */
.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.left-panel {
  flex: 1;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.right-panel {
  flex: 1;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 歌词输入区 */
.lyric-input-section h3,
.lyric-preview-section h3,
.lyric-trim-section h3,
.style-setting-section h3,
.template-background-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.lyric-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.input-actions {
  margin-top: 10px;
}

.import-btn {
  background-color: #4facfe;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.import-btn:hover {
  background-color: #3b8bdb;
}

/* 歌词分段预览 */
.lyric-segments {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
}

.lyric-segment {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.lyric-segment:hover {
  background-color: #f0f0f0;
}

.lyric-segment.selected {
  background-color: #e6f3ff;
  border: 1px solid #4facfe;
}

/* 歌词截取设置 */
.lyric-trim-section,
.style-setting-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
}

.trim-controls,
.text-style-controls {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.trim-controls label,
.text-style-controls label {
  min-width: 100px;
  color: #555;
}

.trim-controls select,
.text-style-controls input[type="range"] {
  flex: 1;
}

.text-style-controls span {
  min-width: 40px;
  text-align: right;
  color: #555;
}

/* 样式设置区 */
.style-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.style-control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.style-control-group label {
  min-width: 100px;
  color: #555;
}

.style-control-group select,
.style-control-group input[type="color"],
.style-control-group input[type="checkbox"],
.style-control-group input[type="range"] {
  flex: 1;
}

.style-control-group input[type="range"] {
  max-width: 200px;
}

/* 海报画布 */
.poster-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 20px;
}

.poster-canvas {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.poster-canvas.ratio-3-4 {
  width: 300px;
  height: 400px;
}

.poster-canvas.ratio-1-1 {
  width: 400px;
  height: 400px;
}

.poster-canvas.ratio-4-3 {
  width: 400px;
  height: 300px;
}

.poster-text {
  position: relative;
  z-index: 1;
  padding: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  word-wrap: break-word;
  max-width: 100%;
}

/* 模板/背景设置区 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.template-item {
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.template-item:hover {
  border-color: #4facfe;
}

.template-item.selected {
  border-color: #4facfe;
}

.template-preview {
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.template-text-preview {
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.background-actions {
  display: flex;
  gap: 10px;
}

.upload-bg-btn,
.reset-template-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.upload-bg-btn:hover,
.reset-template-btn:hover {
  background-color: #5a6268;
}

/* 底部操作按钮 */
.poster-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.ratio-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.ratio-selector label {
  color: #555;
}

.save-btn {
  background-color: #43e97b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.save-btn:hover {
  background-color: #38d46a;
}

/* 撤销/重做按钮 */
.undo-redo-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.undo-btn,
.redo-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.undo-btn:hover,
.redo-btn:hover {
  background-color: #5a6268;
}

.undo-btn:disabled,
.redo-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .left-panel,
  .right-panel {
    max-width: 100%;
    width: 100%;
  }

  .poster-canvas-container {
    min-height: 400px;
  }

  .poster-canvas.ratio-3-4 {
    width: 240px;
    height: 320px;
  }

  .poster-canvas.ratio-1-1 {
    width: 320px;
    height: 320px;
  }

  .poster-canvas.ratio-4-3 {
    width: 320px;
    height: 240px;
  }
}

@media (max-width: 768px) {
  .lyric-poster-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  .template-preview {
    height: 120px;
  }

  .background-actions {
    flex-direction: column;
  }

  .poster-actions {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .ratio-selector {
    justify-content: space-between;
  }
}
</style>