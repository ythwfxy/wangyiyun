<template>
  <div class="podcast-creator">
    <!-- 顶部操作栏 -->
    <div class="top-toolbar">
      <div class="left-buttons">
        <el-button type="primary" icon="el-icon-plus">新建播客</el-button>
        <el-button icon="el-icon-document">打开草稿</el-button>
        <el-button icon="el-icon-save">保存</el-button>
        <el-button icon="el-icon-download">导出音频</el-button>
      </div>
      <div class="middle-info">
        <span>已录制时长: 00:00:00 / 总时长: 00:00:00</span>
        <el-select v-model="audioFormat" placeholder="选择格式" style="width: 100px; margin-left: 20px;">
          <el-option label="MP3" value="mp3"></el-option>
          <el-option label="WAV" value="wav"></el-option>
        </el-select>
      </div>
      <div class="right-info">
        <span>自动保存倒计时: 5:00</span>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧素材库面板 -->
      <div class="left-panel">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="我的音频片段">
            <div class="tab-content">
              <div class="filter-bar">
                <el-select v-model="audioFilter" placeholder="筛选" style="width: 150px;">
                  <el-option label="最近使用" value="recent"></el-option>
                  <el-option label="收藏" value="favorite"></el-option>
                  <el-option label="分类" value="category"></el-option>
                </el-select>
                <el-button type="primary" icon="el-icon-upload" size="small" style="margin-left: 10px;">上传音频</el-button>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in audioMaterials" :key="item.id">
                  <div class="material-info">
                    <el-icon class="material-icon">el-icon-microphone</el-icon>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <el-icon class="action-icon">el-icon-video-play</el-icon>
                    <el-icon class="action-icon">el-icon-star-off</el-icon>
                    <el-icon class="action-icon">el-icon-delete</el-icon>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="背景音乐库">
            <div class="tab-content">
              <div class="filter-bar">
                <el-select v-model="bgmFilter" placeholder="按风格筛选" style="width: 150px;">
                  <el-option label="舒缓" value="relax"></el-option>
                  <el-option label="轻快" value="cheerful"></el-option>
                  <el-option label="氛围感" value="atmospheric"></el-option>
                </el-select>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in bgmMaterials" :key="item.id">
                  <div class="material-info">
                    <el-icon class="material-icon">el-icon-music</el-icon>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <el-icon class="action-icon">el-icon-video-play</el-icon>
                    <el-icon class="action-icon">el-icon-star-off</el-icon>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="音效素材">
            <div class="tab-content">
              <div class="filter-bar">
                <el-select v-model="soundEffectFilter" placeholder="筛选" style="width: 150px;">
                  <el-option label="最近使用" value="recent"></el-option>
                  <el-option label="收藏" value="favorite"></el-option>
                  <el-option label="分类" value="category"></el-option>
                </el-select>
                <el-button type="primary" icon="el-icon-upload" size="small" style="margin-left: 10px;">上传音效</el-button>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in soundEffectMaterials" :key="item.id">
                  <div class="material-info">
                    <el-icon class="material-icon">el-icon-bell</el-icon>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <el-icon class="action-icon">el-icon-video-play</el-icon>
                    <el-icon class="action-icon">el-icon-star-off</el-icon>
                    <el-icon class="action-icon">el-icon-delete</el-icon>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中央创作编辑区 -->
      <div class="center-panel">
        <!-- 音频波形预览区 -->
        <div class="waveform-preview">
          <div class="waveform-container">
            <!-- 波形图将通过Web Audio API生成 -->
            <div class="waveform-placeholder">音频波形预览区</div>
          </div>
          <div class="waveform-controls">
            <el-button icon="el-icon-zoom-in" size="small">放大</el-button>
            <el-button icon="el-icon-zoom-out" size="small">缩小</el-button>
            <el-button icon="el-icon-position" size="small">定位</el-button>
            <el-button icon="el-icon-edit" size="small">添加标记</el-button>
          </div>
        </div>

        <!-- 录制控件 -->
        <div class="recording-controls">
          <el-select v-model="microphone" placeholder="选择麦克风" style="width: 150px;">
            <el-option label="默认麦克风" value="default"></el-option>
          </el-select>
          <el-switch v-model="noiseReduction" active-text="降噪开启" inactive-text="降噪关闭" style="margin-left: 10px;"></el-switch>
          <el-button type="danger" icon="el-icon-video-camera" size="small" style="margin-left: 10px;">开始录制</el-button>
          <el-button icon="el-icon-pause" size="small" style="margin-left: 10px;">暂停</el-button>
          <el-button icon="el-icon-stop" size="small" style="margin-left: 10px;">停止</el-button>
        </div>

        <!-- 多轨道编辑区 -->
        <div class="track-editor">
          <div class="track" v-for="track in tracks" :key="track.id">
            <div class="track-header">
              <span>{{ track.name }}</span>
              <div class="track-controls">
                <el-slider v-model="track.volume" min="0" max="100" style="width: 100px;"></el-slider>
                <el-switch v-model="track.mute" active-text="静音" inactive-text="取消静音" style="margin-left: 10px;"></el-switch>
                <el-switch v-model="track.solo" active-text="独奏" inactive-text="取消独奏" style="margin-left: 10px;"></el-switch>
              </div>
            </div>
            <div class="track-content">
              <!-- 轨道内容将通过拖拽添加 -->
              <div class="track-placeholder">拖拽音频片段到这里</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧发布设置面板 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>发布设置</h3>
        </div>
        <div class="panel-content">
          <!-- 基础信息 -->
          <div class="section">
            <h4>基础信息</h4>
            <el-form label-width="80px">
              <el-form-item label="标题">
                <el-input v-model="podcastTitle" placeholder="请输入播客标题"></el-input>
              </el-form-item>
              <el-form-item label="封面">
                <el-upload class="avatar-uploader" action="#" :show-file-list="false">
                  <img v-if="podcastCover" :src="podcastCover" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
              <el-form-item label="简介">
                <el-input v-model="podcastDescription" type="textarea" rows="4" placeholder="请输入播客简介"></el-input>
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="podcastCategory" placeholder="请选择分类">
                  <el-option label="音乐杂谈" value="music_talk"></el-option>
                  <el-option label="翻唱解析" value="cover_analysis"></el-option>
                  <el-option label="音乐人访谈" value="musician_interview"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 发布设置 -->
          <div class="section">
            <h4>发布设置</h4>
            <el-form label-width="80px">
              <el-form-item label="评论">
                <el-switch v-model="allowComment" active-text="开启" inactive-text="关闭"></el-switch>
              </el-form-item>
              <el-form-item label="下载">
                <el-switch v-model="allowDownload" active-text="允许" inactive-text="禁止"></el-switch>
              </el-form-item>
              <el-form-item label="发布时间">
                <el-select v-model="publishTimeType" placeholder="请选择发布时间">
                  <el-option label="立即发布" value="immediate"></el-option>
                  <el-option label="定时发布" value="scheduled"></el-option>
                </el-select>
                <el-date-picker v-if="publishTimeType === 'scheduled'" v-model="publishTime" type="datetime" placeholder="选择日期时间" style="margin-left: 10px;"></el-date-picker>
              </el-form-item>
              <el-form-item label="可见范围">
                <el-select v-model="visibility" placeholder="请选择可见范围">
                  <el-option label="公开" value="public"></el-option>
                  <el-option label="仅粉丝" value="fans_only"></el-option>
                  <el-option label="私密" value="private"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 预览与发布按钮 -->
          <div class="section">
            <el-button type="primary" icon="el-icon-video-play" style="width: 100%; margin-bottom: 10px;">预览</el-button>
            <el-button type="success" icon="el-icon-upload2" style="width: 100%;">发布</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PodcastCreator',
  data() {
    return {
      // 顶部操作栏
      audioFormat: 'mp3',

      // 左侧素材库
      activeTab: '我的音频片段',
      audioFilter: 'recent',
      bgmFilter: 'relax',
      soundEffectFilter: 'recent',

      // 素材数据
      audioMaterials: [
        { id: 1, name: '音频片段1', duration: '00:05:30' },
        { id: 2, name: '音频片段2', duration: '00:03:45' },
      ],
      bgmMaterials: [
        { id: 1, name: '舒缓背景音乐1', duration: '00:10:00' },
        { id: 2, name: '轻快背景音乐1', duration: '00:08:30' },
      ],
      soundEffectMaterials: [
        { id: 1, name: ' applause', duration: '00:00:10' },
        { id: 2, name: ' laughter', duration: '00:00:05' },
      ],

      // 中央编辑区
      microphone: 'default',
      noiseReduction: false,
      tracks: [
        { id: 1, name: '主音轨', volume: 80, mute: false, solo: false },
        { id: 2, name: '背景音乐轨', volume: 50, mute: false, solo: false },
        { id: 3, name: '音效轨', volume: 70, mute: false, solo: false },
      ],

      // 右侧发布设置
      podcastTitle: '',
      podcastCover: '',
      podcastDescription: '',
      podcastCategory: '',
      allowComment: true,
      allowDownload: true,
      publishTimeType: 'immediate',
      publishTime: '',
      visibility: 'public',
    }
  },
  mounted() {
    // 初始化音频波形
    this.initWaveform()
  },
  methods: {
    initWaveform() {
      // 使用Web Audio API生成音频波形
      console.log('初始化音频波形')
    },
  },
}
</script>

<style scoped>
.podcast-creator {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部操作栏 */
.top-toolbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.left-buttons button {
  margin-right: 10px;
}

.middle-info span {
  margin-right: 20px;
}

/* 主体内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧素材库面板 */
.left-panel {
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.tab-content {
  padding: 15px;
}

.filter-bar {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.material-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.material-item:hover {
  background-color: #e4e7ed;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.material-icon {
  font-size: 20px;
  color: #409eff;
}

.duration {
  font-size: 12px;
  color: #909399;
}

.material-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-icon {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.action-icon:hover {
  color: #409eff;
}

/* 中央创作编辑区 */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
}

.waveform-preview {
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.waveform-container {
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.waveform-placeholder {
  color: #909399;
  font-size: 14px;
}

.waveform-controls {
  margin-top: 10px;
}

.waveform-controls button {
  margin-right: 10px;
}

.recording-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.track-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.track {
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.track-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #e4e7ed;
  font-weight: 500;
}

.track-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.track-content {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.track-placeholder {
  color: #909399;
  font-size: 14px;
}

/* 右侧发布设置面板 */
.right-panel {
  width: 350px;
  background-color: #ffffff;
  border-left: 1px solid #e4e7ed;
  overflow-y: auto;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.panel-content {
  padding: 15px;
}

.section {
  margin-bottom: 25px;
}

.section h4 {
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 封面上传样式 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>