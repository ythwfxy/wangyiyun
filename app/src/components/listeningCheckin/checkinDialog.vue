<template>
  <el-dialog
    :title="isEdit ? '编辑打卡' : '今日打卡'"
    :visible.sync="visibleSync"
    width="600px"
    :close-on-click-modal="false"
    custom-class="checkin-dialog"
  >
    <div class="dialog-content">
      <!-- 日期选择 -->
      <div class="form-item">
        <label class="form-label">
          <i class="el-icon-date"></i>
          打卡日期
        </label>
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          :disabled="isEdit"
          style="width: 100%"
        ></el-date-picker>
      </div>

      <!-- 心情选择 -->
      <div class="form-item">
        <label class="form-label">
          <i class="el-icon-sunny"></i>
          今日心情
        </label>
        <div class="mood-selector">
          <div
            v-for="mood in moodOptions"
            :key="mood.value"
            class="mood-option"
            :class="{ active: form.mood === mood.value }"
            @click="form.mood = mood.value"
          >
            <span class="mood-icon">{{ mood.icon }}</span>
            <span class="mood-text">{{ mood.label }}</span>
          </div>
        </div>
      </div>

      <!-- 心情笔记 -->
      <div class="form-item">
        <label class="form-label">
          <i class="el-icon-edit"></i>
          心情笔记
        </label>
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="4"
          placeholder="记录下今天听歌的心情..."
          maxlength="500"
          show-word-limit
        ></el-input>
      </div>

      <!-- 关联歌曲 -->
      <div class="form-item">
        <label class="form-label">
          <i class="el-icon-music"></i>
          关联歌曲
          <span class="label-tip">({{ form.songs.length }}首)</span>
        </label>
        
        <!-- 已选歌曲列表 -->
        <div v-if="form.songs.length > 0" class="selected-songs">
          <div
            v-for="(song, index) in form.songs"
            :key="index"
            class="selected-song-item"
          >
            <img :src="song.cover || defaultCover" alt="cover" class="song-cover">
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <i class="el-icon-close remove-btn" @click="removeSong(index)"></i>
          </div>
        </div>

        <!-- 添加歌曲按钮 -->
        <el-button 
          type="primary" 
          plain 
          icon="el-icon-plus" 
          size="small"
          @click="showAddSong = true"
          :disabled="form.songs.length >= 10"
        >
          添加歌曲
        </el-button>
        <span v-if="form.songs.length >= 10" class="limit-tip">最多添加10首歌曲</span>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" @click="saveRecord" :loading="saving">
        {{ isEdit ? '保存修改' : '确认打卡' }}
      </el-button>
    </div>

    <!-- 添加歌曲弹窗 -->
    <el-dialog
      title="添加歌曲"
      :visible.sync="showAddSong"
      width="500px"
      append-to-body
      custom-class="add-song-dialog"
    >
      <div class="add-song-content">
        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索歌曲、歌手"
          prefix-icon="el-icon-search"
          clearable
          @keyup.enter.native="searchSongs"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchSongs"></el-button>
        </el-input>

        <!-- 搜索结果 -->
        <div v-if="searchLoading" class="search-loading">
          <i class="el-icon-loading"></i>
          <span>搜索中...</span>
        </div>

        <div v-else-if="searchResults.length > 0" class="search-results">
          <div
            v-for="song in searchResults"
            :key="song.id"
            class="search-song-item"
            @click="selectSong(song)"
          >
            <img :src="song.cover || defaultCover" alt="cover" class="song-cover">
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <i class="el-icon-circle-plus add-icon"></i>
          </div>
        </div>

        <div v-else-if="hasSearched" class="search-empty">
          <i class="el-icon-search"></i>
          <p>未找到相关歌曲</p>
        </div>

        <div v-else class="search-hint">
          <i class="el-icon-headset"></i>
          <p>输入关键词搜索歌曲</p>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { searchSong } from '@/api/music.js'

export default {
  name: 'CheckinDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        id: null,
        date: new Date(),
        mood: 'happy',
        note: '',
        songs: [],
        time: ''
      },
      moodOptions: [
        { value: 'happy', label: '开心', icon: '😊' },
        { value: 'calm', label: '平静', icon: '😌' },
        { value: 'excited', label: '兴奋', icon: '🤩' },
        { value: 'sad', label: '难过', icon: '😢' },
        { value: 'tired', label: '疲惫', icon: '😴' },
        { value: 'romantic', label: '浪漫', icon: '🥰' }
      ],
      defaultCover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
      saving: false,
      showAddSong: false,
      searchKeyword: '',
      searchResults: [],
      searchLoading: false,
      hasSearched: false
    }
  },
  computed: {
    visibleSync: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    isEdit() {
      return !!this.editData
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
    showAddSong(val) {
      if (!val) {
        this.searchKeyword = ''
        this.searchResults = []
        this.hasSearched = false
      }
    }
  },
  methods: {
    initForm() {
      if (this.editData) {
        this.form = {
          ...this.editData,
          date: new Date(this.editData.date)
        }
      } else {
        this.form = {
          id: null,
          date: new Date(),
          mood: 'happy',
          note: '',
          songs: [],
          time: this.formatTime(new Date())
        }
      }
    },
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async searchSongs() {
      if (!this.searchKeyword.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }

      this.searchLoading = true
      this.hasSearched = true

      try {
        // 调用搜索API
        const res = await searchSong(this.searchKeyword)
        if (res.data && res.data.songs) {
          this.searchResults = res.data.songs.map(song => ({
            id: song.id,
            name: song.name,
            artist: song.artists.map(a => a.name).join(' / '),
            cover: song.album?.picUrl || this.defaultCover,
            duration: song.duration
          }))
        } else {
          this.searchResults = []
        }
      } catch (error) {
        // 如果API调用失败，使用模拟数据
        this.searchResults = this.getMockSearchResults()
      } finally {
        this.searchLoading = false
      }
    },
    getMockSearchResults() {
      // 模拟搜索结果
      const mockSongs = [
        { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 3, name: '稻香', artist: '周杰伦', cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 4, name: '夜曲', artist: '周杰伦', cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
        { id: 5, name: '告白气球', artist: '周杰伦', cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' }
      ]
      return mockSongs.filter(s => 
        s.name.includes(this.searchKeyword) || 
        s.artist.includes(this.searchKeyword)
      )
    },
    selectSong(song) {
      // 检查是否已添加
      if (this.form.songs.some(s => s.id === song.id)) {
        this.$message.warning('该歌曲已添加')
        return
      }

      if (this.form.songs.length >= 10) {
        this.$message.warning('最多添加10首歌曲')
        return
      }

      this.form.songs.push(song)
      this.showAddSong = false
      this.$message.success('添加成功')
    },
    removeSong(index) {
      this.form.songs.splice(index, 1)
    },
    saveRecord() {
      if (!this.form.mood) {
        this.$message.warning('请选择今日心情')
        return
      }

      this.saving = true

      const record = {
        ...this.form,
        id: this.form.id || Date.now().toString(),
        date: this.formatDate(this.form.date),
        time: this.isEdit ? this.form.time : this.formatTime(new Date())
      }

      this.$emit('save', record)
      this.saving = false
      this.visibleSync = false
    }
  }
}
</script>

<style scoped>
.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.form-label i {
  color: #ec4141;
}

.label-tip {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 4px;
}

/* 心情选择器 */
.mood-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  border-radius: 12px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 70px;
}

.mood-option:hover {
  background: #e8e8e8;
}

.mood-option.active {
  background: #ec4141;
  color: #fff;
  transform: scale(1.05);
}

.mood-icon {
  font-size: 24px;
}

.mood-text {
  font-size: 12px;
}

/* 已选歌曲 */
.selected-songs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-song-item .song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.selected-song-item .song-info {
  flex: 1;
  min-width: 0;
}

.selected-song-item .song-name {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-song-item .song-artist {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.remove-btn:hover {
  color: #f56c6c;
}

.limit-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

/* 添加歌曲弹窗 */
.add-song-content {
  padding: 10px 0;
}

.search-loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.search-loading i {
  font-size: 32px;
  margin-bottom: 10px;
}

.search-results {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.search-song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-song-item:hover {
  background: #f5f5f5;
}

.search-song-item .song-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.search-song-item .song-info {
  flex: 1;
  min-width: 0;
}

.search-song-item .song-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-song-item .song-artist {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon {
  font-size: 24px;
  color: #ec4141;
}

.search-empty,
.search-hint {
  text-align: center;
  padding: 40px;
  color: #999;
}

.search-empty i,
.search-hint i {
  font-size: 48px;
  margin-bottom: 12px;
  color: #ddd;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
