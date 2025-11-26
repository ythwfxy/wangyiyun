<template>
  <div class="music-diary">
    <h1>音乐心情日记</h1>
    <!-- 顶部日期选择器 -->
    <div class="date-picker">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        @change="onDateChange"
      ></el-date-picker>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧心情时间轴 -->
      <div class="timeline-container">
        <h2>心情时间轴</h2>
        <el-timeline>
          <el-timeline-item
            v-for="(diary, index) in diaryList"
            :key="index"
            :timestamp="diary.date"
          >
            <div class="diary-item" @click="onDiaryClick(diary)">
              <div class="mood-icon">{{ diary.mood }}</div>
              <div class="diary-content">
                <div class="song-info">
                  <img v-if="diary.song.cover" :src="diary.song.cover" alt="歌曲封面" class="song-cover">
                  <div class="song-details">
                    <div class="song-name">{{ diary.song.name }}</div>
                    <div class="song-artist">{{ diary.song.artist }}</div>
                  </div>
                </div>
                <div class="diary-description">{{ diary.description }}</div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 右侧日记编辑区 -->
      <div class="editor-container">
        <h2>{{ editingDiary ? '编辑日记' : '写新日记' }}</h2>
        
        <!-- 心情选择器 -->
        <div class="mood-selector">
          <label>选择心情：</label>
          <div class="mood-options">
            <span class="mood-option" @click="selectMood('😊')">😊 开心</span>
            <span class="mood-option" @click="selectMood('😢')">😢 难过</span>
            <span class="mood-option" @click="selectMood('😌')">😌 平静</span>
            <span class="mood-option" @click="selectMood('🎉')">🎉 兴奋</span>
            <span class="mood-option" @click="selectMood('😔')">😔 失落</span>
          </div>
        </div>
        
        <!-- 音乐搭配区 -->
        <div class="music-section">
          <label>选择音乐：</label>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索歌曲"
            @input="onSearchInput"
          ></el-input>
          <div class="song-list" v-if="searchResults.length">
            <div
              class="song-item"
              v-for="(song, index) in searchResults"
              :key="index"
              @click="selectSong(song)"
            >
              <img :src="song.cover" alt="歌曲封面" class="song-cover">
              <div class="song-details">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
            </div>
          </div>
          <div class="selected-song" v-if="editingDiary.song.name">
            <img :src="editingDiary.song.cover" alt="歌曲封面" class="song-cover">
            <div class="song-details">
              <div class="song-name">{{ editingDiary.song.name }}</div>
              <div class="song-artist">{{ editingDiary.song.artist }}</div>
            </div>
            <el-button type="text" @click="clearSong">清除</el-button>
          </div>
        </div>
        
        <!-- 日记内容区 -->
        <div class="content-section">
          <label>日记内容：</label>
          <el-input
            v-model="editingDiary.content"
            type="textarea"
            rows="5"
            placeholder="写下你的心情..."
          ></el-input>
        </div>
        
        <!-- 图片上传区 -->
        <div class="image-section">
          <label>上传图片（最多3张）：</label>
          <el-upload
            action=""
            :auto-upload="false"
            :on-change="handleImageChange"
            :file-list="imageList"
            :limit="3"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </div>
        
        <!-- 标签添加区 -->
        <div class="tag-section">
          <label>添加标签（最多5个）：</label>
          <el-input
            v-model="newTag"
            placeholder="输入标签"
            @keyup.enter.native="addTag"
          ></el-input>
          <div class="tag-list">
            <el-tag
              v-for="(tag, index) in editingDiary.tags"
              :key="index"
              closable
              @close="removeTag(index)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <!-- 保存/取消按钮 -->
        <div class="button-section">
          <el-button type="primary" @click="saveDiary">保存</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicDiary',
  data() {
    return {
      selectedDate: '',
      diaryList: [],
      editingDiary: {
        date: '',
        mood: '',
        song: {
          name: '',
          artist: '',
          cover: ''
        },
        description: '',
        content: '',
        images: [],
        tags: []
      },
      searchKeyword: '',
      searchResults: [],
      imageList: []
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
  },
  methods: {
    initData() {
      // 从localStorage加载日记数据
      const savedDiaries = localStorage.getItem('musicDiaries')
      if (savedDiaries) {
        this.diaryList = JSON.parse(savedDiaries)
      }
      
      // 设置当前日期为默认选择
      const today = new Date()
      this.selectedDate = today.toISOString().split('T')[0]
      this.editingDiary.date = this.selectedDate
    },
    onDateChange(date) {
      // 日期改变时的处理
      this.editingDiary.date = date
      // 查找该日期的日记
      const diary = this.diaryList.find(d => d.date === date)
      if (diary) {
        this.editingDiary = JSON.parse(JSON.stringify(diary))
      } else {
        this.resetEditingDiary()
        this.editingDiary.date = date
      }
    },
    onDiaryClick(diary) {
      // 点击时间轴条目时的处理
      this.editingDiary = JSON.parse(JSON.stringify(diary))
      this.selectedDate = diary.date
    },
    selectMood(mood) {
      // 选择心情
      this.editingDiary.mood = mood
    },
    onSearchInput() {
      // 搜索歌曲（防抖处理）
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },
    performSearch() {
      // 模拟搜索结果
      if (this.searchKeyword.trim() === '') {
        this.searchResults = []
        return
      }
      
      // 这里应该调用真实的API来搜索歌曲
      this.searchResults = [
        {
          name: '晴天',
          artist: '周杰伦',
          cover: 'https://picsum.photos/80/80?random=1'
        },
        {
          name: '七里香',
          artist: '周杰伦',
          cover: 'https://picsum.photos/80/80?random=2'
        },
        {
          name: '青花瓷',
          artist: '周杰伦',
          cover: 'https://picsum.photos/80/80?random=3'
        }
      ]
    },
    selectSong(song) {
      // 选择歌曲
      this.editingDiary.song = JSON.parse(JSON.stringify(song))
      this.searchResults = []
      this.searchKeyword = ''
    },
    clearSong() {
      // 清除选择的歌曲
      this.editingDiary.song = {
        name: '',
        artist: '',
        cover: ''
      }
    },
    handleImageChange(file, fileList) {
      // 处理图片上传
      this.imageList = fileList
      this.editingDiary.images = fileList.map(f => f.url)
    },
    addTag() {
      // 添加标签
      if (this.newTag.trim() === '') return
      if (this.editingDiary.tags.length >= 5) {
        this.$message.warning('最多只能添加5个标签')
        return
      }
      this.editingDiary.tags.push(this.newTag.trim())
      this.newTag = ''
    },
    removeTag(index) {
      // 移除标签
      this.editingDiary.tags.splice(index, 1)
    },
    saveDiary() {
      // 保存日记
      if (!this.editingDiary.mood) {
        this.$message.warning('请选择心情')
        return
      }
      if (!this.editingDiary.song.name) {
        this.$message.warning('请选择音乐')
        return
      }
      if (!this.editingDiary.content.trim()) {
        this.$message.warning('请写下日记内容')
        return
      }
      
      // 生成简短描述
      this.editingDiary.description = this.editingDiary.content.trim().substring(0, 50) + (this.editingDiary.content.length > 50 ? '...' : '')
      
      // 查找是否已存在该日期的日记
      const index = this.diaryList.findIndex(d => d.date === this.editingDiary.date)
      if (index !== -1) {
        // 更新现有日记
        this.diaryList[index] = JSON.parse(JSON.stringify(this.editingDiary))
      } else {
        // 添加新日记
        this.diaryList.push(JSON.parse(JSON.stringify(this.editingDiary)))
      }
      
      // 按日期倒序排列
      this.diaryList.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // 保存到localStorage
      localStorage.setItem('musicDiaries', JSON.stringify(this.diaryList))
      
      this.$message.success('日记保存成功')
    },
    cancelEdit() {
      // 取消编辑
      this.resetEditingDiary()
      this.editingDiary.date = this.selectedDate
    },
    resetEditingDiary() {
      // 重置编辑日记对象
      this.editingDiary = {
        date: '',
        mood: '',
        song: {
          name: '',
          artist: '',
          cover: ''
        },
        description: '',
        content: '',
        images: [],
        tags: []
      }
      this.imageList = []
      this.searchResults = []
      this.searchKeyword = ''
    }
  }
}
</script>

<style scoped>
.music-diary {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.date-picker {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 80px);
}

.timeline-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  padding: 20px;
}

.editor-container {
  flex: 2;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  padding: 20px;
  overflow-y: auto;
}

.diary-item {
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.diary-item:hover {
  background-color: #f5f7fa;
}

.mood-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.song-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
}

.song-details {
  flex: 1;
}

.song-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.diary-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.mood-selector {
  margin-bottom: 20px;
}

.mood-options {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.mood-option {
  cursor: pointer;
  padding: 5px 10px;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.mood-option:hover {
  background-color: #f5f7fa;
}

.music-section {
  margin-bottom: 20px;
}

.song-list {
  margin-top: 10px;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.song-item:hover {
  background-color: #f5f7fa;
}

.selected-song {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  margin-top: 10px;
}

.content-section {
  margin-bottom: 20px;
}

.image-section {
  margin-bottom: 20px;
}

.tag-section {
  margin-bottom: 20px;
}

.tag-list {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-section {
  display: flex;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .timeline-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .music-diary {
    padding: 10px;
  }
  
  .timeline-container {
    padding: 10px;
  }
  
  .editor-container {
    padding: 10px;
  }
}
</style>