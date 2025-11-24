<template>
  <div class="podcast-creator">
    <!-- 顶部操作栏 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <el-button type="primary" size="medium">新建播客</el-button>
        <el-button size="medium">打开草稿</el-button>
        <el-button size="medium">保存</el-button>
        <el-button size="medium">导出音频</el-button>
      </div>
      <div class="top-bar-center">
        <span>已录制时长: 0:00:00 / 总时长: 0:00:00</span>
        <el-select v-model="audioFormat" size="small" style="margin-left: 20px;">
          <el-option label="MP3" value="mp3"></el-option>
          <el-option label="WAV" value="wav"></el-option>
        </el-select>
      </div>
      <div class="top-bar-right">
        <span class="auto-save-tip">自动保存倒计时: 5:00</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧素材库面板 -->
      <aside class="sidebar-left">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="我的音频片段">
            <div class="tab-content">
              <div class="filter-bar">
                <el-radio-group v-model="audioFilter" size="small">
                  <el-radio-button label="recent">最近使用</el-radio-button>
                  <el-radio-button label="favorites">收藏</el-radio-button>
                  <el-radio-button label="category">分类</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" icon="el-icon-upload" style="margin-left: auto;">上传音频</el-button>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in audioMaterials" :key="item.id">
                  <div class="material-info">
                    <i class="el-icon-microphone"></i>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <i class="el-icon-video-play"></i>
                    <i class="el-icon-star-off"></i>
                    <i class="el-icon-delete"></i>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="背景音乐库">
            <div class="tab-content">
              <div class="filter-bar">
                <el-select v-model="bgmStyle" size="small" placeholder="按风格筛选">
                  <el-option label="舒缓" value="relax"></el-option>
                  <el-option label="轻快" value="upbeat"></el-option>
                  <el-option label="氛围感" value="atmospheric"></el-option>
                  <el-option label="励志" value="inspirational"></el-option>
                </el-select>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in bgmMaterials" :key="item.id">
                  <div class="material-info">
                    <i class="el-icon-music"></i>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <i class="el-icon-video-play"></i>
                    <i class="el-icon-star-off"></i>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="音效素材">
            <div class="tab-content">
              <div class="filter-bar">
                <el-radio-group v-model="soundEffectFilter" size="small">
                  <el-radio-button label="recent">最近使用</el-radio-button>
                  <el-radio-button label="favorites">收藏</el-radio-button>
                  <el-radio-button label="category">分类</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" icon="el-icon-upload" style="margin-left: auto;">上传音效</el-button>
              </div>
              <div class="material-list">
                <div class="material-item" v-for="item in soundEffectMaterials" :key="item.id">
                  <div class="material-info">
                    <i class="el-icon-bell"></i>
                    <span>{{ item.name }}</span>
                    <span class="duration">{{ item.duration }}</span>
                  </div>
                  <div class="material-actions">
                    <i class="el-icon-video-play"></i>
                    <i class="el-icon-star-off"></i>
                    <i class="el-icon-delete"></i>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </aside>

      <!-- 中央创作编辑区 -->
      <section class="editor-area">
        <!-- 音频波形预览区 -->
        <div class="waveform-preview">
          <div class="waveform-container">
            <!-- 波形图将通过Web Audio API渲染 -->
            <canvas ref="waveformCanvas"></canvas>
          </div>
          <div class="waveform-controls">
            <el-button size="small" icon="el-icon-zoom-out"></el-button>
            <el-button size="small" icon="el-icon-zoom-in"></el-button>
            <el-button size="small" icon="el-icon-location"></el-button>
            <el-button size="small" icon="el-icon-plus">添加标记</el-button>
          </div>
        </div>

        <!-- 录制控件 -->
        <div class="recording-controls">
          <el-select v-model="microphone" size="small" placeholder="选择麦克风">
            <el-option label="麦克风1" value="mic1"></el-option>
            <el-option label="麦克风2" value="mic2"></el-option>
          </el-select>
          <el-switch v-model="noiseReduction" active-text="降噪开启" inactive-text="降噪关闭" size="small"></el-switch>
          <el-button type="danger" size="medium" icon="el-icon-video-camera">开始录制</el-button>
          <el-button size="medium" icon="el-icon-pause">暂停</el-button>
          <el-button size="medium" icon="el-icon-stop">停止</el-button>
        </div>

        <!-- 多轨道编辑区 -->
        <div class="track-editor">
          <div class="track" v-for="track in tracks" :key="track.id">
            <div class="track-header">
              <span>{{ track.name }}</span>
              <div class="track-controls">
                <el-slider v-model="track.volume" min="0" max="100" size="small" style="width: 100px;"></el-slider>
                <el-button size="mini" icon="el-icon-microphone"></el-button>
                <el-button size="mini" icon="el-icon-headset"></el-button>
              </div>
            </div>
            <div class="track-content">
              <!-- 轨道内容将通过拖拽和编辑生成 -->
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧发布设置面板 -->
      <aside class="sidebar-right">
        <div class="panel-header">
          <h3>发布设置</h3>
        </div>
        <div class="panel-content">
          <el-form label-width="80px">
            <el-form-item label="播客标题">
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
              <el-select v-model="podcastCategory" placeholder="请选择播客分类">
                <el-option label="音乐杂谈" value="music_talk"></el-option>
                <el-option label="翻唱解析" value="cover_analysis"></el-option>
                <el-option label="音乐人访谈" value="musician_interview"></el-option>
                <el-option label="音乐教学" value="music_teaching"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="评论">
              <el-switch v-model="allowComments" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item label="下载">
              <el-switch v-model="allowDownload" active-text="允许" inactive-text="禁止"></el-switch>
            </el-form-item>
            <el-form-item label="发布时间">
              <el-radio-group v-model="publishTime">
                <el-radio label="now">立即发布</el-radio>
                <el-radio label="schedule">定时发布</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="可见范围">
              <el-select v-model="visibility" placeholder="请选择可见范围">
                <el-option label="公开" value="public"></el-option>
                <el-option label="仅粉丝" value="fans_only"></el-option>
                <el-option label="私密" value="private"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="panel-actions">
            <el-button type="primary" size="medium" style="width: 100%;">发布播客</el-button>
          </div>
        </div>
      </aside>
    </main>
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
      activeTab: '0',
      audioFilter: 'recent',
      bgmStyle: '',
      soundEffectFilter: 'recent',
      audioMaterials: [
        { id: 'audio1', name: '我的录音1', duration: '0:05:30' },
        { id: 'audio2', name: '我的录音2', duration: '0:03:45' },
        { id: 'audio3', name: '我的录音3', duration: '0:08:15' },
      ],
      bgmMaterials: [
        { id: 'bgm1', name: '舒缓背景音乐1', duration: '0:02:00' },
        { id: 'bgm2', name: '轻快背景音乐1', duration: '0:03:30' },
        { id: 'bgm3', name: '氛围感背景音乐1', duration: '0:04:15' },
      ],
      soundEffectMaterials: [
        { id: 'se1', name: ' applause', duration: '0:00:10' },
        { id: 'se2', name: ' laughter', duration: '0:00:05' },
        { id: 'se3', name: ' drum roll', duration: '0:00:15' },
      ],
      // 中央编辑区
      microphone: 'mic1',
      noiseReduction: false,
      tracks: [
        { id: 'track1', name: '主音轨', volume: 80 },
        { id: 'track2', name: '背景音乐轨', volume: 50 },
        { id: 'track3', name: '音效轨', volume: 70 },
      ],
      // 右侧发布设置
      podcastTitle: '',
      podcastCover: '',
      podcastDescription: '',
      podcastCategory: '',
      allowComments: true,
      allowDownload: false,
      publishTime: 'now',
      visibility: 'public',
    }
  },
  mounted() {
    // 初始化波形图
    this.initWaveform()
  },
  methods: {
    initWaveform() {
      // 使用Web Audio API渲染波形图
      const canvas = this.$refs.waveformCanvas
      if (canvas) {
        const ctx = canvas.getContext('2d')
        canvas.width = canvas.offsetWidth
        canvas.height = 100
        
        // 绘制一个简单的波形示例
        ctx.fillStyle = '#ec4141'
        for (let i = 0; i < canvas.width; i += 2) {
          const height = Math.random() * 80 + 10
          ctx.fillRect(i, 50 - height / 2, 1, height)
        }
      }
    },
  },
}
</script>

<style scoped>
.podcast-creator {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin-left: 250px; /* 匹配侧边栏宽度 */
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.top-bar-left button {
  margin-right: 10px;
}

.top-bar-center span {
  color: #666;
}

.auto-save-tip {
  color: #1890ff;
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧素材库面板 */
.sidebar-left {
  width: 300px;
  background-color: #fafafa;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.tab-content {
  padding: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.material-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.material-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-info i {
  color: #ec4141;
}

.duration {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.material-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.material-item:hover .material-actions {
  opacity: 1;
}

.material-actions i {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.material-actions i:hover {
  color: #ec4141;
}

/* 中央创作编辑区 */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 16px;
  overflow-y: auto;
}

/* 波形预览区 */
.waveform-preview {
  margin-bottom: 16px;
}

.waveform-container {
  height: 120px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.waveform-controls {
  display: flex;
  gap: 8px;
}

/* 录制控件 */
.recording-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.recording-controls button:nth-child(3) {
  margin-left: auto;
}

/* 多轨道编辑区 */
.track-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.track {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.track-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.track-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-content {
  height: 80px;
  background-color: #fff;
  padding: 8px;
}

/* 右侧发布设置面板 */
.sidebar-right {
  width: 320px;
  background-color: #fafafa;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.panel-content {
  padding: 16px;
}

.panel-actions {
  margin-top: 24px;
}

/* 封面上传 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #ec4141;
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

/* 响应式设计 */
@media (max-width: 1600px) {
  .sidebar-right {
    display: none;
  }
}

@media (max-width: 1200px) {
  .sidebar-left {
    width: 80px;
  }
  
  .tab-content {
    padding: 8px;
  }
  
  .filter-bar {
    display: none;
  }
  
  .material-info span {
    display: none;
  }
  
  .duration {
    display: none;
  }
}

@media (max-width: 768px) {
  .podcast-creator {
    margin-left: 0;
  }
  
  .sidebar-left {
    display: none;
  }
  
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .top-bar-left button {
    margin-right: 8px;
  }
  
  .recording-controls {
    flex-wrap: wrap;
  }
  
  .recording-controls button:nth-child(3) {
    margin-left: 0;
  }
}
</style>