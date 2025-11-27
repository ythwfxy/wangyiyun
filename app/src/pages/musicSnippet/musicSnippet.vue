<template>
  <div class="music-snippet-container">
    <!-- 顶部功能区 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary">新建项目</button>
        <button class="btn btn-secondary">保存草稿</button>
        <button class="btn btn-success">导出作品</button>
      </div>
      <div class="toolbar-right">
        <div class="bpm-control">
          <label>BPM:</label>
          <input type="number" v-model="projectBPM" min="60" max="200">
        </div>
        <div class="key-control">
          <label>调性:</label>
          <select v-model="projectKey">
            <option value="C">C大调</option>
            <option value="D">D大调</option>
            <option value="E">E大调</option>
            <option value="F">F大调</option>
            <option value="G">G大调</option>
            <option value="A">A大调</option>
            <option value="B">B大调</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧素材库 -->
      <div class="sidebar-left">
        <div class="library-header">
          <h3>音乐素材库</h3>
          <div class="filter-tabs">
            <button class="filter-tab active">风格</button>
            <button class="filter-tab">乐器</button>
            <button class="filter-tab">类型</button>
          </div>
        </div>
        <div class="library-content">
          <div class="snippet-card" v-for="snippet in snippets" :key="snippet.id" draggable="true" @dragstart="onDragStart($event, snippet)">
            <div class="waveform-thumbnail"></div>
            <div class="snippet-info">
              <h4>{{ snippet.name }}</h4>
              <div class="snippet-tags">
                <span class="tag" v-for="tag in snippet.tags" :key="tag">{{ tag }}</span>
              </div>
              <div class="snippet-duration">{{ snippet.duration }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间创作区 -->
      <div class="timeline-container">
        <div class="timeline-header">
          <h3>创作区</h3>
          <div class="play-controls">
            <button class="btn-play">播放</button>
            <button class="btn-stop">停止</button>
          </div>
        </div>
        <div class="timeline-content" @drop="onDrop($event)" @dragover="onDragOver($event)">
          <div class="track" v-for="track in tracks" :key="track.id">
            <div class="track-header">{{ track.name }}</div>
            <div class="track-content">
              <div class="snippet-item" v-for="item in track.snippets" :key="item.id" :style="{ left: item.startTime + 'px', width: item.duration + 'px' }">
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="sidebar-right">
        <div class="properties-header">
          <h3>属性面板</h3>
        </div>
        <div class="properties-content">
          <div v-if="selectedSnippet">
            <h4>片段属性</h4>
            <div class="property-item">
              <label>名称:</label>
              <input type="text" v-model="selectedSnippet.name">
            </div>
            <div class="property-item">
              <label>原始时长:</label>
              <span>{{ selectedSnippet.originalDuration }}</span>
            </div>
            <div class="property-item">
              <label>起始时间:</label>
              <input type="number" v-model="selectedSnippet.startTime">
            </div>
            <div class="property-item">
              <label>音量:</label>
              <input type="range" v-model="selectedSnippet.volume" min="0" max="100">
            </div>
          </div>
          <div v-else>
            <h4>项目属性</h4>
            <div class="property-item">
              <label>项目名称:</label>
              <input type="text" v-model="projectName">
            </div>
            <div class="property-item">
              <label>BPM:</label>
              <span>{{ projectBPM }}</span>
            </div>
            <div class="property-item">
              <label>调性:</label>
              <span>{{ projectKey }}</span>
            </div>
            <div class="property-item">
              <label>总时长:</label>
              <span>{{ totalDuration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicSnippet',
  data() {
    return {
      projectName: '未命名项目',
      projectBPM: 120,
      projectKey: 'C',
      totalDuration: '0:00',
      selectedSnippet: null,
      tracks: [
        { id: 1, name: '旋律', snippets: [] },
        { id: 2, name: '贝斯', snippets: [] },
        { id: 3, name: '鼓点', snippets: [] },
        { id: 4, name: '音效', snippets: [] }
      ],
      snippets: [
        { id: 1, name: '流行旋律', tags: ['流行', '键盘'], duration: '0:16', originalDuration: '0:16', volume: 80 },
        { id: 2, name: '电子鼓点', tags: ['电子', '鼓'], duration: '0:08', originalDuration: '0:08', volume: 90 },
        { id: 3, name: '摇滚贝斯', tags: ['摇滚', '贝斯'], duration: '0:16', originalDuration: '0:16', volume: 75 },
        { id: 4, name: '民谣吉他', tags: ['民谣', '吉他'], duration: '0:24', originalDuration: '0:24', volume: 85 }
      ]
    }
  },
  methods: {
    onDragStart(event, snippet) {
      event.dataTransfer.setData('text/plain', JSON.stringify(snippet));
    },
    onDragOver(event) {
      event.preventDefault();
    },
    onDrop(event) {
      event.preventDefault();
      const snippetData = event.dataTransfer.getData('text/plain');
      const snippet = JSON.parse(snippetData);
      // 这里需要实现将片段添加到时间轴的逻辑
      console.log('Dropped snippet:', snippet);
    }
  }
}
</script>

<style scoped>
.music-snippet-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.btn {
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
}

.btn-success {
  background-color: #52c41a;
  color: #fff;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.bpm-control, .key-control {
  margin-left: 20px;
}

.bpm-control input, .key-control select {
  margin-left: 5px;
  padding: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-left {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.library-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-tabs {
  display: flex;
  margin-top: 10px;
}

.filter-tab {
  padding: 5px 10px;
  margin-right: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.filter-tab.active {
  border-bottom-color: #1890ff;
  color: #1890ff;
}

.library-content {
  padding: 15px;
}

.snippet-card {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.snippet-card:hover {
  background-color: #e9e9e9;
}

.waveform-thumbnail {
  width: 80px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-right: 10px;
}

.snippet-info {
  flex: 1;
}

.snippet-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.snippet-tags {
  margin-bottom: 5px;
}

.tag {
  display: inline-block;
  padding: 2px 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
  margin-right: 5px;
}

.snippet-duration {
  font-size: 12px;
  color: #666;
}

.timeline-container {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.timeline-content {
  padding: 15px;
}

.track {
  display: flex;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.track-header {
  width: 100px;
  padding: 10px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  font-weight: bold;
}

.track-content {
  flex: 1;
  padding: 10px;
  position: relative;
  background-color: #fff;
}

.snippet-item {
  position: absolute;
  padding: 5px;
  background-color: #1890ff;
  color: #fff;
  border-radius: 3px;
  font-size: 12px;
  cursor: move;
}

.sidebar-right {
  width: 300px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.properties-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.properties-content {
  padding: 15px;
}

.property-item {
  margin-bottom: 15px;
}

.property-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 14px;
}

.property-item input, .property-item select {
  width: 100%;
  padding: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>