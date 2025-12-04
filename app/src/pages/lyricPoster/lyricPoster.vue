<template>
  <div class="lyric-poster-generator">
    <!-- 页面顶部 -->
    <div class="page-header">
      <h1>歌词海报生成器</h1>
      <el-button type="danger" @click="clearAll">清空编辑</el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧歌词编辑区 -->
      <div class="left-panel">
        <!-- 歌词输入区域 -->
        <div class="lyric-input-section">
          <h2>歌词编辑</h2>
          <div class="input-toolbar">
            <el-button type="primary" size="small" @click="importLyricFile">
              <i class="el-icon-upload"></i> 导入歌词文件
            </el-button>
            <input 
              ref="fileInput" 
              type="file" 
              accept=".txt" 
              style="display: none;" 
              @change="handleFileImport"
            />
          </div>
          <el-input
            v-model="fullLyric"
            type="textarea"
            :rows="8"
            placeholder="请输入或粘贴歌词..."
            @input="updateLyricPreview"
          ></el-input>
        </div>

        <!-- 歌词预览区域 -->
        <div class="lyric-preview-section">
          <h3>歌词预览</h3>
          <div class="lyric-list">
            <div
              v-for="(line, index) in lyricLines"
              :key="index"
              :class="{ selected: selectedLyricIndices.includes(index) }"
              @click="toggleLyricLine(index)"
            >
              {{ line || '\u3000' }}
            </div>
          </div>
        </div>

        <!-- 歌词截取区域 -->
        <div class="lyric-select-section">
          <h3>歌词截取 (1-4句)</h3>
          <div class="selected-lyrics">
            <div
              v-for="(line, index) in selectedLyrics"
              :key="index"
              class="selected-line"
            >
              {{ line }}
            </div>
          </div>
        </div>

        <!-- 样式设置区域 -->
        <div class="style-settings-section">
          <h2>样式设置</h2>
          
          <!-- 字体选择 -->
          <div class="setting-item">
            <label>字体:</label>
            <el-select v-model="styleSettings.font" @change="updateStyle">
              <el-option label="思源黑体" value="'Source Han Sans SC', sans-serif"></el-option>
              <el-option label="微软雅黑" value="'Microsoft YaHei', sans-serif"></el-option>
              <el-option label="楷体" value="'KaiTi', serif"></el-option>
              <el-option label="宋体" value="'SimSun', serif"></el-option>
              <el-option label="手写体" value="'Ma Shan Zheng', cursive"></el-option>
              <el-option label="苹方" value="'PingFang SC', sans-serif"></el-option>
            </el-select>
          </div>

          <!-- 字体大小 -->
          <div class="setting-item">
            <label>字体大小:</label>
            <el-slider
              v-model="styleSettings.fontSize"
              :min="12"
              :max="72"
              @change="updateStyle"
            ></el-slider>
            <span>{{ styleSettings.fontSize }}px</span>
          </div>

          <!-- 文字颜色 -->
          <div class="setting-item">
            <label>文字颜色:</label>
            <el-color-picker
              v-model="styleSettings.textColor"
              @change="updateStyle"
            ></el-color-picker>
          </div>

          <!-- 描边效果 -->
          <div class="setting-item">
            <label>描边效果:</label>
            <el-switch
              v-model="styleSettings.stroke.enabled"
              @change="updateStyle"
            ></el-switch>
            <div v-if="styleSettings.stroke.enabled" class="stroke-settings">
              <el-slider
                v-model="styleSettings.stroke.width"
                :min="0"
                :max="3"
                :step="0.5"
                @change="updateStyle"
              ></el-slider>
              <span>{{ styleSettings.stroke.width }}px</span>
              <el-color-picker
                v-model="styleSettings.stroke.color"
                @change="updateStyle"
              ></el-color-picker>
            </div>
          </div>

          <!-- 行间距 -->
          <div class="setting-item">
            <label>行间距:</label>
            <el-slider
              v-model="styleSettings.lineHeight"
              :min="1"
              :max="3"
              :step="0.1"
              @change="updateStyle"
            ></el-slider>
            <span>{{ styleSettings.lineHeight }}em</span>
          </div>

          <!-- 对齐方式 -->
          <div class="setting-item">
            <label>对齐方式:</label>
            <el-radio-group v-model="styleSettings.textAlign" @change="updateStyle">
              <el-radio-button value="left"><i class="el-icon-align-left"></i></el-radio-button>
              <el-radio-button value="center"><i class="el-icon-align-center"></i></el-radio-button>
              <el-radio-button value="right"><i class="el-icon-align-right"></i></el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 撤销重做 -->
        <div class="undo-redo-section">
          <el-button type="default" size="small" @click="undo" :disabled="historyIndex <= 0">
            <i class="el-icon-refresh-left"></i> 撤销
          </el-button>
          <el-button type="default" size="small" @click="redo" :disabled="historyIndex >= history.length - 1">
            <i class="el-icon-refresh-right"></i> 重做
          </el-button>
        </div>
      </div>

      <!-- 右侧海报预览区 -->
      <div class="right-panel">
        <!-- 海报画布 -->
        <div class="canvas-container">
          <div 
            ref="posterCanvas" 
            class="poster-canvas"
            :style="canvasStyle"
          >
            <div class="lyric-content" :style="lyricStyle">
              <div v-for="(line, index) in selectedLyrics" :key="index" class="lyric-line">
                {{ line }}
              </div>
            </div>
          </div>
        </div>

        <!-- 模板/背景设置 -->
        <div class="template-section">
          <h2>模板/背景</h2>
          <div class="template-grid">
            <div
              v-for="(template, index) in templates"
              :key="index"
              :class="{ 'template-item': true, active: currentTemplate === index }"
              :style="{ background: template.background }"
              @click="selectTemplate(index)"
            ></div>
          </div>
          <div class="background-toolbar">
            <el-button type="default" size="small" @click="importBackground">
              <i class="el-icon-picture"></i> 上传背景图片
            </el-button>
            <input 
              ref="bgFileInput" 
              type="file" 
              accept="image/*" 
              style="display: none;" 
              @change="handleBackgroundImport"
            />
            <el-button type="text" size="small" @click="resetTemplate">重置模板</el-button>
          </div>
        </div>

        <!-- 海报比例设置 -->
        <div class="ratio-section">
          <h2>海报比例</h2>
          <el-radio-group v-model="canvasRatio" @change="updateCanvasRatio">
            <el-radio-button value="3:4">3:4</el-radio-button>
            <el-radio-button value="1:1">1:1</el-radio-button>
            <el-radio-button value="4:3">4:3</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="success" size="large" @click="savePoster">
            <i class="el-icon-download"></i> 保存海报
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'LyricPoster',
  data() {
    return {
      fullLyric: '',
      lyricLines: [],
      selectedLyricIndices: [],
      selectedLyrics: [],
      canvasRatio: '3:4',
      currentTemplate: 0,
      customBackground: null,
      
      styleSettings: {
        font: "'Source Han Sans SC', sans-serif",
        fontSize: 32,
        textColor: '#ffffff',
        lineHeight: 1.5,
        textAlign: 'center',
        stroke: {
          enabled: true,
          width: 1,
          color: '#000000'
        }
      },
      
      templates: [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
        { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }
      ],
      
      history: [],
      historyIndex: -1
    }
  },
  computed: {
    canvasStyle() {
      const ratio = this.canvasRatio.split(':')
      const width = ratio[0]
      const height = ratio[1]
      
      let style = {
        '--aspect-ratio': `${width}/${height}`
      }
      
      if (this.customBackground) {
        style.backgroundImage = `url(${this.customBackground})`
        style.backgroundSize = 'cover'
        style.backgroundPosition = 'center'
      } else {
        style.background = this.templates[this.currentTemplate].background
      }
      
      return style
    },
    
    lyricStyle() {
      const strokeStyle = this.styleSettings.stroke.enabled 
        ? {
            '-webkit-text-stroke': `${this.styleSettings.stroke.width}px ${this.styleSettings.stroke.color}`,
            'text-stroke': `${this.styleSettings.stroke.width}px ${this.styleSettings.stroke.color}`
          }
        : {
            '-webkit-text-stroke': '0px transparent',
            'text-stroke': '0px transparent'
          }
      
      return {
        fontFamily: this.styleSettings.font,
        fontSize: `${this.styleSettings.fontSize}px`,
        color: this.styleSettings.textColor,
        lineHeight: this.styleSettings.lineHeight,
        textAlign: this.styleSettings.textAlign,
        ...strokeStyle
      }
    }
  },
  created() {
    this.loadFromSessionStorage()
    this.saveToHistory()
  },
  methods: {
    // 歌词输入处理
    updateLyricPreview() {
      this.lyricLines = this.fullLyric.split('\n').filter(line => line.trim() !== '')
    },
    
    // 切换歌词行选择
    toggleLyricLine(index) {
      if (this.selectedLyricIndices.includes(index)) {
        this.selectedLyricIndices = this.selectedLyricIndices.filter(i => i !== index)
      } else {
        if (this.selectedLyricIndices.length < 4) {
          this.selectedLyricIndices.push(index)
        } else {
          this.$message.warning('最多只能选择4句歌词')
        }
      }
      this.updateSelectedLyrics()
      this.saveToHistory()
    },
    
    // 更新选中的歌词
    updateSelectedLyrics() {
      this.selectedLyrics = this.selectedLyricIndices
        .sort((a, b) => a - b)
        .map(index => this.lyricLines[index] || '')
    },
    
    // 导入歌词文件
    importLyricFile() {
      this.$refs.fileInput.click()
    },
    
    handleFileImport(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.fullLyric = e.target.result
          this.updateLyricPreview()
          // 导入后自动选择前1-4句歌词
          if (this.lyricLines.length > 0) {
            const selectCount = Math.min(4, this.lyricLines.length)
            this.selectedLyricIndices = Array.from({length: selectCount}, (_, i) => i)
            this.updateSelectedLyrics()
          }
          this.saveToHistory()
        }
        reader.readAsText(file, 'utf-8')
      }
      event.target.value = ''
    },
    
    // 样式更新
    updateStyle() {
      this.saveToHistory()
    },
    
    // 选择模板
    selectTemplate(index) {
      this.currentTemplate = index
      this.customBackground = null
      this.saveToHistory()
    },
    
    // 导入背景图片
    importBackground() {
      this.$refs.bgFileInput.click()
    },
    
    handleBackgroundImport(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.customBackground = e.target.result
          this.saveToHistory()
        }
        reader.readAsDataURL(file)
      }
      event.target.value = ''
    },
    
    // 重置模板
    resetTemplate() {
      this.currentTemplate = 0
      this.customBackground = null
      this.saveToHistory()
    },
    
    // 更新画布比例
    updateCanvasRatio() {
      this.saveToHistory()
    },
    
    // 保存海报
    async savePoster() {
      if (this.selectedLyrics.length === 0) {
        this.$message.warning('请先选择歌词内容')
        return
      }
      
      try {
        const canvas = await html2canvas(this.$refs.posterCanvas, {
          backgroundColor: null,
          scale: 2,
          logging: false
        })
        
        const link = document.createElement('a')
        link.download = `歌词海报_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        this.$message.success('海报保存成功')
      } catch (error) {
        console.error('保存海报失败:', error)
        this.$message.error('保存海报失败，请重试')
      }
    },
    
    // 清空所有编辑
    clearAll() {
      this.$confirm('确定要清空所有编辑内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fullLyric = ''
        this.lyricLines = []
        this.selectedLyricIndices = []
        this.selectedLyrics = []
        this.canvasRatio = '3:4'
        this.currentTemplate = 0
        this.customBackground = null
        
        this.styleSettings = {
          font: "'Source Han Sans SC', sans-serif",
          fontSize: 32,
          textColor: '#ffffff',
          lineHeight: 1.5,
          textAlign: 'center',
          stroke: {
            enabled: true,
            width: 1,
            color: '#000000'
          }
        }
        
        this.history = []
        this.historyIndex = -1
        this.saveToHistory()
        this.$message.success('已清空所有编辑内容')
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 保存到历史记录
    saveToHistory() {
      // 移除当前位置之后的历史记录
      this.history = this.history.slice(0, this.historyIndex + 1)
      
      // 保存当前状态
      const state = {
        fullLyric: this.fullLyric,
        lyricLines: [...this.lyricLines],
        selectedLyricIndices: [...this.selectedLyricIndices],
        selectedLyrics: [...this.selectedLyrics],
        canvasRatio: this.canvasRatio,
        currentTemplate: this.currentTemplate,
        customBackground: this.customBackground,
        styleSettings: JSON.parse(JSON.stringify(this.styleSettings))
      }
      
      this.history.push(state)
      
      // 限制历史记录数量
      if (this.history.length > 10) {
        this.history.shift()
      } else {
        this.historyIndex++
      }
      
      this.saveToSessionStorage()
    },
    
    // 撤销
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.restoreState(this.history[this.historyIndex])
      }
    },
    
    // 重做
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.restoreState(this.history[this.historyIndex])
      }
    },
    
    // 恢复状态
    restoreState(state) {
      this.fullLyric = state.fullLyric
      this.lyricLines = [...state.lyricLines]
      this.selectedLyricIndices = [...state.selectedLyricIndices]
      this.selectedLyrics = [...state.selectedLyrics]
      this.canvasRatio = state.canvasRatio
      this.currentTemplate = state.currentTemplate
      this.customBackground = state.customBackground
      this.styleSettings = JSON.parse(JSON.stringify(state.styleSettings))
      
      this.saveToSessionStorage()
    },
    
    // 保存到sessionStorage
    saveToSessionStorage() {
      const state = {
        fullLyric: this.fullLyric,
        lyricLines: this.lyricLines,
        selectedLyricIndices: this.selectedLyricIndices,
        selectedLyrics: this.selectedLyrics,
        canvasRatio: this.canvasRatio,
        currentTemplate: this.currentTemplate,
        customBackground: this.customBackground,
        styleSettings: this.styleSettings
      }
      sessionStorage.setItem('lyricPosterState', JSON.stringify(state))
    },
    
    // 从sessionStorage加载
    loadFromSessionStorage() {
      const savedState = sessionStorage.getItem('lyricPosterState')
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          this.fullLyric = state.fullLyric || ''
          this.lyricLines = state.lyricLines || []
          this.selectedLyricIndices = state.selectedLyricIndices || []
          this.selectedLyrics = state.selectedLyrics || []
          this.canvasRatio = state.canvasRatio || '3:4'
          this.currentTemplate = state.currentTemplate || 0
          this.customBackground = state.customBackground || null
          this.styleSettings = state.styleSettings || this.styleSettings
        } catch (error) {
          console.error('加载保存的状态失败:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.lyric-poster-generator {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 左侧面板 */
.left-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.left-panel h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.left-panel h3 {
  font-size: 14px;
  margin: 20px 0 10px;
  color: #666;
}

.lyric-input-section .input-toolbar {
  margin-bottom: 10px;
}

.lyric-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.lyric-list > div {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  line-height: 1.6;
}

.lyric-list > div:hover {
  background-color: #f5f7fa;
}

.lyric-list > div.selected {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left: 4px solid #1890ff;
}

.selected-lyrics {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  min-height: 100px;
  background-color: #fafafa;
}

.selected-line {
  padding: 8px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1.6;
  border-left: 4px solid #1890ff;
}

.style-settings-section {
  margin-top: 20px;
}

.setting-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.setting-item label {
  width: 80px;
  font-size: 14px;
  color: #666;
  text-align: right;
}

.setting-item .el-select,
.setting-item .el-slider {
  flex: 1;
}

.setting-item span {
  min-width: 60px;
  text-align: right;
  font-size: 12px;
  color: #999;
}

.stroke-settings {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.undo-redo-section {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* 右侧面板 */
.right-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-panel h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.canvas-container {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.poster-canvas {
  position: relative;
  width: 100%;
  padding-bottom: calc(100% / (var(--aspect-ratio, 3/4)));
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.lyric-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  padding: 40px;
  box-sizing: border-box;
}

.lyric-line {
  margin-bottom: 16px;
  word-break: break-word;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.template-section {
  margin-bottom: 20px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.template-item {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
}

.template-item:hover {
  transform: scale(1.05);
}

.template-item.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.background-toolbar {
  display: flex;
  gap: 10px;
}

.ratio-section {
  margin-bottom: 20px;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>