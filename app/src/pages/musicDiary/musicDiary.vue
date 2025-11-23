<template>
  <div class="music-diary">
    <!-- 顶部日期选择器 -->
    <div class="date-picker-container">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        @change="onDateChange"
      >
      </el-date-picker>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧心情时间轴 -->
      <div class="timeline-container">
        <h3>心情时间轴</h3>
        <div class="timeline">
          <div
            v-for="(diary, index) in diaryList"
            :key="diary.id"
            class="timeline-item"
            :class="{ active: diary.id === currentDiaryId }"
            @click="selectDiary(diary)"
          >
            <div class="timeline-date">{{ diary.date }}</div>
            <div class="timeline-content">
              <div class="mood-icon">{{ getMoodIcon(diary.mood) }}</div>
              <div class="song-info">
                <img :src="diary.song.coverUrl" alt="歌曲封面" class="song-cover" />
                <div class="song-details">
                  <div class="song-name">{{ diary.song.name }}</div>
                  <div class="singer-name">{{ diary.song.singer }}</div>
                </div>
              </div>
              <div class="diary-preview">{{ diary.content }}</div>
            </div>
            <div class="timeline-actions">
              <el-button
                size="mini"
                icon="el-icon-edit"
                @click.stop="editDiary(diary)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                icon="el-icon-delete"
                type="danger"
                @click.stop="deleteDiary(diary.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧日记编辑区 -->
      <div class="editor-container">
        <h3>{{ currentDiaryId ? '编辑日记' : '写心情' }}</h3>
        <div class="editor-content">
          <!-- 心情选择器 -->
          <div class="mood-selector">
            <h4>选择心情</h4>
            <div class="mood-options">
              <div
                v-for="mood in moods"
                :key="mood.value"
                class="mood-option"
                :class="{ active: currentDiary.mood === mood.value }"
                @click="selectMood(mood.value)"
              >
                <span class="mood-icon">{{ mood.icon }}</span>
                <span class="mood-name">{{ mood.name }}</span>
              </div>
            </div>
          </div>

          <!-- 音乐搭配区 -->
          <div class="music-section">
            <h4>音乐搭配</h4>
            <div class="music-search">
              <el-input
                v-model="songSearchQuery"
                placeholder="搜索歌曲"
                @input="onSongSearch"
              >
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
              <div class="search-results" v-if="songSearchResults.length > 0">
                <div
                  v-for="song in songSearchResults"
                  :key="song.id"
                  class="search-result-item"
                  @click="selectSong(song)"
                >
                  <img :src="song.coverUrl" alt="歌曲封面" class="song-cover" />
                  <div class="song-details">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="singer-name">{{ song.singer }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="selected-song" v-if="currentDiary.song.id">
              <img :src="currentDiary.song.coverUrl" alt="歌曲封面" class="song-cover" />
              <div class="song-details">
                <div class="song-name">{{ currentDiary.song.name }}</div>
                <div class="singer-name">{{ currentDiary.song.singer }}</div>
              </div>
              <el-button icon="el-icon-delete" @click="removeSong"></el-button>
            </div>
          </div>

          <!-- 日记内容区 -->
          <div class="content-section">
            <h4>日记内容</h4>
            <el-input
              v-model="currentDiary.content"
              type="textarea"
              :rows="6"
              placeholder="写下你的心情..."
            ></el-input>
          </div>

          <!-- 图片上传区 -->
          <div class="image-upload-section">
            <h4>上传图片</h4>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleImageChange"
              list-type="picture-card"
              :limit="3"
              :file-list="imageFileList"
            >
              <i slot="default" class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="imageDialogVisible" width="800px">
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>
          </div>

          <!-- 标签添加区 -->
          <div class="tag-section">
            <h4>添加标签</h4>
            <el-input
              v-model="tagInput"
              placeholder="输入标签，按回车键添加"
              @keyup.enter.native="addTag"
            ></el-input>
            <div class="tag-list">
              <el-tag
                v-for="tag in currentDiary.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
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

    <!-- 月度心情统计 -->
    <div class="monthly-stats">
      <h3>月度心情统计</h3>
      <div class="stats-chart">
        <!-- 这里可以使用图表库来实现环形图 -->
        <div class="chart-placeholder">环形图占位符</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicDiary',
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      currentDiaryId: null,
      diaryList: [],
      currentDiary: {
        id: null,
        date: new Date().toISOString().split('T')[0],
        mood: '',
        song: {
          id: '',
          name: '',
          singer: '',
          coverUrl: '',
          url: ''
        },
        content: '',
        images: [],
        tags: []
      },
      moods: [
        { value: 'happy', name: '开心', icon: '😊' },
        { value: 'sad', name: '难过', icon: '😢' },
        { value: 'calm', name: '平静', icon: '😌' },
        { value: 'excited', name: '兴奋', icon: '🎉' },
        { value: 'angry', name: '愤怒', icon: '😠' },
        { value: 'lonely', name: '孤独', icon: '😔' },
        { value: 'love', name: '爱意', icon: '❤️' },
        { value: 'surprised', name: '惊讶', icon: '😮' }
      ],
      songSearchQuery: '',
      songSearchResults: [],
      imageFileList: [],
      imageDialogVisible: false,
      dialogImageUrl: '',
      tagInput: ''
    };
  },
  created() {
    this.loadDiaries();
  },
  methods: {
    loadDiaries() {
      // 从localStorage加载日记数据
      const diaries = localStorage.getItem('musicDiaries');
      if (diaries) {
        this.diaryList = JSON.parse(diaries);
        // 按日期倒序排列
        this.diaryList.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    },
    saveDiaries() {
      // 保存日记数据到localStorage
      localStorage.setItem('musicDiaries', JSON.stringify(this.diaryList));
    },
    onDateChange(date) {
      // 根据选择的日期查找对应的日记
      const diary = this.diaryList.find(d => d.date === date);
      if (diary) {
        this.selectDiary(diary);
      } else {
        this.createNewDiary(date);
      }
    },
    selectDiary(diary) {
      this.currentDiaryId = diary.id;
      this.currentDiary = JSON.parse(JSON.stringify(diary));
      this.selectedDate = diary.date;
      // 初始化图片文件列表
      this.imageFileList = this.currentDiary.images.map((image, index) => ({
        uid: -index - 1,
        name: `image-${index}`,
        status: 'success',
        url: image
      }));
    },
    createNewDiary(date) {
      this.currentDiaryId = null;
      this.currentDiary = {
        id: null,
        date: date || new Date().toISOString().split('T')[0],
        mood: '',
        song: {
          id: '',
          name: '',
          singer: '',
          coverUrl: '',
          url: ''
        },
        content: '',
        images: [],
        tags: []
      };
      this.imageFileList = [];
      this.selectedDate = date || new Date().toISOString().split('T')[0];
    },
    editDiary(diary) {
      this.selectDiary(diary);
    },
    deleteDiary(diaryId) {
      this.$confirm('确定要删除这篇日记吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.diaryList = this.diaryList.filter(d => d.id !== diaryId);
        this.saveDiaries();
        if (this.currentDiaryId === diaryId) {
          this.createNewDiary();
        }
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    getMoodIcon(mood) {
      const moodInfo = this.moods.find(m => m.value === mood);
      return moodInfo ? moodInfo.icon : '😐';
    },
    selectMood(mood) {
      this.currentDiary.mood = mood;
      // 根据心情推荐歌曲
      this.recommendSongsByMood(mood);
    },
    recommendSongsByMood(mood) {
      // 这里可以根据心情调用API推荐歌曲
      // 现在先使用模拟数据
      const moodSongs = {
        happy: [
          { id: '1', name: '快乐崇拜', singer: '潘玮柏', coverUrl: 'https://picsum.photos/seed/happy1/100/100' },
          { id: '2', name: '小幸运', singer: '田馥甄', coverUrl: 'https://picsum.photos/seed/happy2/100/100' },
          { id: '3', name: '告白气球', singer: '周杰伦', coverUrl: 'https://picsum.photos/seed/happy3/100/100' }
        ],
        sad: [
          { id: '4', name: '体面', singer: '于文文', coverUrl: 'https://picsum.photos/seed/sad1/100/100' },
          { id: '5', name: '后来', singer: '刘若英', coverUrl: 'https://picsum.photos/seed/sad2/100/100' },
          { id: '6', name: '成全', singer: '林宥嘉', coverUrl: 'https://picsum.photos/seed/sad3/100/100' }
        ],
        calm: [
          { id: '7', name: '千与千寻', singer: '久石让', coverUrl: 'https://picsum.photos/seed/calm1/100/100' },
          { id: '8', name: 'River Flows in You', singer: 'Yiruma', coverUrl: 'https://picsum.photos/seed/calm2/100/100' },
          { id: '9', name: '天空之城', singer: '久石让', coverUrl: 'https://picsum.photos/seed/calm3/100/100' }
        ],
        excited: [
          { id: '10', name: '逆战', singer: '张杰', coverUrl: 'https://picsum.photos/seed/excited1/100/100' },
          { id: '11', name: '怒放的生命', singer: '汪峰', coverUrl: 'https://picsum.photos/seed/excited2/100/100' },
          { id: '12', name: '我相信', singer: '杨培安', coverUrl: 'https://picsum.photos/seed/excited3/100/100' }
        ]
      };
      this.songSearchResults = moodSongs[mood] || [];
    },
    onSongSearch(query) {
      // 防抖处理，300ms后执行搜索
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSongSearch(query);
      }, 300);
    },
    performSongSearch(query) {
      if (!query) {
        this.songSearchResults = [];
        return;
      }
      // 这里可以调用API搜索歌曲
      // 现在先使用模拟数据
      const mockSongs = [
        { id: '1', name: '快乐崇拜', singer: '潘玮柏', coverUrl: 'https://picsum.photos/seed/song1/100/100' },
        { id: '2', name: '小幸运', singer: '田馥甄', coverUrl: 'https://picsum.photos/seed/song2/100/100' },
        { id: '3', name: '告白气球', singer: '周杰伦', coverUrl: 'https://picsum.photos/seed/song3/100/100' },
        { id: '4', name: '体面', singer: '于文文', coverUrl: 'https://picsum.photos/seed/song4/100/100' },
        { id: '5', name: '后来', singer: '刘若英', coverUrl: 'https://picsum.photos/seed/song5/100/100' }
      ];
      this.songSearchResults = mockSongs.filter(song => 
        song.name.includes(query) || song.singer.includes(query)
      );
    },
    selectSong(song) {
      this.currentDiary.song = {
        ...song,
        url: `https://example.com/song/${song.id}.mp3` // 模拟歌曲URL
      };
      this.songSearchQuery = '';
      this.songSearchResults = [];
    },
    removeSong() {
      this.currentDiary.song = {
        id: '',
        name: '',
        singer: '',
        coverUrl: '',
        url: ''
      };
    },
    handleImageChange(file, fileList) {
      this.imageFileList = fileList;
      // 压缩图片并转换为base64
      this.compressImages(fileList);
    },
    compressImages(fileList) {
      // 这里可以实现图片压缩逻辑
      // 现在先简单转换为base64
      this.currentDiary.images = fileList.map(file => file.url);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.imageDialogVisible = true;
    },
    addTag() {
      if (this.tagInput && this.currentDiary.tags.length < 5 && !this.currentDiary.tags.includes(this.tagInput)) {
        this.currentDiary.tags.push(this.tagInput.trim());
        this.tagInput = '';
      }
    },
    removeTag(tag) {
      this.currentDiary.tags = this.currentDiary.tags.filter(t => t !== tag);
    },
    saveDiary() {
      if (!this.currentDiary.mood) {
        this.$message.warning('请选择心情');
        return;
      }
      if (!this.currentDiary.content) {
        this.$message.warning('请写下你的心情');
        return;
      }

      if (this.currentDiaryId) {
        // 编辑现有日记
        const index = this.diaryList.findIndex(d => d.id === this.currentDiaryId);
        if (index !== -1) {
          this.diaryList[index] = this.currentDiary;
        }
      } else {
        // 创建新日记
        this.currentDiary.id = Date.now().toString();
        this.diaryList.unshift(this.currentDiary);
      }

      this.saveDiaries();
      this.$message.success('保存成功');
      // 添加歌曲到我的心情歌单
      this.addToMoodPlaylist(this.currentDiary.song);
    },
    cancelEdit() {
      if (this.currentDiaryId) {
        this.selectDiary(this.diaryList.find(d => d.id === this.currentDiaryId));
      } else {
        this.createNewDiary();
      }
    },
    addToMoodPlaylist(song) {
      if (!song.id) return;
      // 这里可以调用API添加歌曲到歌单
      // 现在先使用模拟逻辑
      const moodPlaylist = JSON.parse(localStorage.getItem('moodPlaylist') || '[]');
      if (!moodPlaylist.find(s => s.id === song.id)) {
        moodPlaylist.push(song);
        localStorage.setItem('moodPlaylist', JSON.stringify(moodPlaylist));
      }
    }
  }
};
</script>

<style scoped>
.music-diary {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.date-picker-container {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.timeline-container {
  width: 350px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.timeline-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 15px;
}

.timeline-item:hover {
  background-color: #f5f5f5;
}

.timeline-item.active {
  background-color: #ffebee;
  border-left: 4px solid #ff2a2a;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: 2px solid white;
  z-index: 1;
}

.timeline-item.active::before {
  background-color: #ff2a2a;
}

.timeline-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-icon {
  font-size: 24px;
}

.song-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.singer-name {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diary-preview {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.timeline-actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .timeline-actions {
  opacity: 1;
}

.editor-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mood-selector h4,
.music-section h4,
.content-section h4,
.image-upload-section h4,
.tag-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.mood-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mood-option:hover {
  border-color: #ff2a2a;
  background-color: #ffebee;
}

.mood-option.active {
  border-color: #ff2a2a;
  background-color: #ffebee;
}

.mood-option .mood-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.mood-option .mood-name {
  font-size: 14px;
  color: #333;
}

.music-search {
  position: relative;
  margin-bottom: 15px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-items: center;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.search-result-item .song-cover {
  width: 40px;
  height: 40px;
}

.selected-song {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  align-items: center;
}

.selected-song .song-cover {
  width: 60px;
  height: 60px;
}

.content-section textarea {
  width: 100%;
  resize: vertical;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.tag-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button-section {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.monthly-stats {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.monthly-stats h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.stats-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.chart-placeholder {
  font-size: 16px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .timeline-container {
    width: 100%;
    max-height: 300px;
  }
  
  .timeline {
    display: flex;
    flex-direction: row;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .timeline::before {
    display: none;
  }
  
  .timeline-item {
    width: 250px;
    flex-shrink: 0;
    padding-left: 15px;
    margin-bottom: 0;
  }
  
  .timeline-item::before {
    display: none;
  }
}

@media (max-width: 768px) {
  .music-diary {
    padding: 10px;
  }
  
  .mood-options {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .mood-option .mood-icon {
    font-size: 24px;
  }
  
  .mood-option .mood-name {
    font-size: 12px;
  }
}
</style>