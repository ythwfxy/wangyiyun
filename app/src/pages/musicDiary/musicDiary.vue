<template>
  <div class="music-diary">
    <!-- 顶部日期选择器和月度心情统计 -->
    <div class="top-section">
      <div class="date-picker-container">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          @change="onDateChange"
        ></el-date-picker>
      </div>
      <div class="mood-stats-container">
        <h3>月度心情统计</h3>
        <div id="moodStatsChart" style="width: 300px; height: 300px;"></div>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="main-content">
      <!-- 左侧心情时间轴 -->
      <div class="timeline-section">
        <h3>心情时间轴</h3>
        <div class="timeline-container">
          <div
            v-for="(diary, index) in visibleDiaries"
            :key="diary.id"
            class="timeline-item"
            @click="openDiary(diary)"
          >
            <div class="timeline-date">
              {{ diary.date }}
            </div>
            <div class="timeline-content">
              <div class="mood-icon">
                {{ getMoodIcon(diary.mood) }}
              </div>
              <div class="diary-preview">
                <div class="song-cover">
                  <el-image
                    :src="diary.song.cover"
                    :lazy="true"
                    class="cover-image"
                  ></el-image>
                </div>
                <div class="diary-info">
                  <div class="diary-title">{{ diary.title }}</div>
                  <div class="diary-description">{{ diary.description }}</div>
                </div>
              </div>
              <div class="timeline-actions">
                <el-button size="mini" @click.stop="editDiary(diary)">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button size="mini" type="danger" @click.stop="deleteDiary(diary)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 加载更多 -->
        <div v-if="loadingMore" class="loading-more">
          <el-loading-spinner></el-loading-spinner>
          <span>加载更多...</span>
        </div>
        <div v-else-if="!hasMoreDiaries" class="no-more-data">
          <span>没有更多日记了</span>
        </div>
      </div>

      <!-- 右侧日记编辑区 -->
      <div class="editor-section">
        <h3>{{ currentDiary ? '编辑日记' : '写心情日记' }}</h3>
        <div class="editor-container">
          <!-- 心情选择器 -->
          <div class="mood-selector">
            <label>选择心情：</label>
            <div class="mood-icons">
              <div
                v-for="mood in moods"
                :key="mood.value"
                class="mood-item"
                :class="{ active: currentDiary?.mood === mood.value }"
                @click="selectMood(mood.value)"
              >
                <span class="mood-emoji">{{ mood.icon }}</span>
                <span class="mood-name">{{ mood.name }}</span>
              </div>
            </div>
          </div>

          <!-- 音乐搭配区 -->
          <div class="music-section">
            <label>选择音乐：</label>
            <div class="music-selector">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索歌曲"
                @input="onSearchInput"
              >
                <el-button slot="append" icon="el-icon-search" @click="searchSongs"></el-button>
              </el-input>
              <div v-if="searchResults.length > 0" class="search-results">
                <div
                  v-for="song in searchResults"
                  :key="song.id"
                  class="search-result-item"
                  @click="selectSong(song)"
                >
                  <el-image
                    :src="song.cover"
                    :lazy="true"
                    class="song-cover-small"
                  ></el-image>
                  <div class="song-info">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="song-artist">{{ song.artist }}</div>
                  </div>
                  <el-button size="mini" @click.stop="playSong(song)">
                    <i class="el-icon-video-play"></i>
                  </el-button>
                </div>
              </div>
              <div v-else-if="searchKeyword" class="no-search-results">
                <span>没有找到相关歌曲</span>
              </div>
              <div v-else class="recommended-songs">
                <h4>推荐歌曲：</h4>
                <div
                  v-for="song in recommendedSongs"
                  :key="song.id"
                  class="recommended-song-item"
                  @click="selectSong(song)"
                >
                  <el-image
                    :src="song.cover"
                    :lazy="true"
                    class="song-cover-small"
                  ></el-image>
                  <div class="song-info">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="song-artist">{{ song.artist }}</div>
                  </div>
                  <el-button size="mini" @click.stop="playSong(song)">
                    <i class="el-icon-video-play"></i>
                  </el-button>
                </div>
              </div>
            </div>
            <div v-if="currentDiary?.song" class="selected-song">
              <el-image
                :src="currentDiary.song.cover"
                :lazy="true"
                class="selected-song-cover"
              ></el-image>
              <div class="selected-song-info">
                <div class="selected-song-name">{{ currentDiary.song.name }}</div>
                <div class="selected-song-artist">{{ currentDiary.song.artist }}</div>
              </div>
              <el-button size="mini" @click="playSong(currentDiary.song)">
                <i class="el-icon-video-play"></i>
              </el-button>
            </div>
          </div>

          <!-- 日记内容区 -->
          <div class="content-section">
            <label>日记标题：</label>
            <el-input
              v-model="currentDiary.title"
              placeholder="请输入日记标题"
              class="title-input"
            ></el-input>

            <label>日记内容：</label>
            <el-input
              v-model="currentDiary.content"
              type="textarea"
              :rows="5"
              placeholder="请输入日记内容"
              class="content-textarea"
            ></el-input>

            <label>上传图片（最多3张）：</label>
            <div class="image-upload-section">
              <el-upload
                class="image-uploader"
                :action="''"
                :before-upload="beforeUpload"
                :on-success="onImageUploadSuccess"
                :auto-upload="false"
                list-type="picture-card"
                :limit="3"
                :on-exceed="handleExceed"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-dialog
                v-for="(image, index) in currentDiary.images"
                :key="index"
                :visible.sync="image.previewVisible"
                width="800px"
                append-to-body
              >
                <img
                  :src="image.url"
                  :alt="image.name"
                  style="width: 100%"
                >
              </el-dialog>
            </div>

            <label>添加标签（最多5个）：</label>
            <div class="tag-section">
              <el-tag
                v-for="(tag, index) in currentDiary.tags"
                :key="index"
                closable
                @close="removeTag(index)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-model="newTag"
                placeholder="输入标签"
                size="small"
                @keyup.enter.native="addTag"
                class="tag-input"
              ></el-input>
            </div>
          </div>

          <!-- 保存/取消按钮 -->
          <div class="button-section">
            <el-button @click="saveDiary" type="primary">保存日记</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog
      title="删除日记"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <p>确定要删除这篇日记吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>

    <!-- 网络恢复提示弹窗 -->
    <el-dialog
      title="网络恢复"
      :visible.sync="networkRecoveryDialogVisible"
      width="30%"
    >
      <p>网络已恢复，是否同步本地日记到服务器？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="networkRecoveryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="syncDiaries">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { debounce } from '@/utils/debounce'

export default {
  name: 'MusicDiary',
  data() {
    return {
      // 选择的日期
      selectedDate: null,
      // 所有日记数据
      diaries: [],
      // 可见的日记（虚拟滚动或分页）
      visibleDiaries: [],
      // 当前编辑的日记
      currentDiary: null,
      // 心情列表
      moods: [
        { value: 'happy', name: '开心', icon: '😊' },
        { value: 'sad', name: '难过', icon: '😢' },
        { value: 'calm', name: '平静', icon: '😌' },
        { value: 'excited', name: '兴奋', icon: '🎉' },
        { value: 'angry', name: '愤怒', icon: '😠' },
        { value: 'lonely', name: '孤独', icon: '😔' },
        { value: 'tired', name: '疲惫', icon: '😴' },
        { value: 'surprised', name: '惊讶', icon: '😮' }
      ],
      // 搜索关键词
      searchKeyword: '',
      // 搜索结果
      searchResults: [],
      // 推荐歌曲
      recommendedSongs: [],
      // 新标签
      newTag: '',
      // 删除弹窗状态
      deleteDialogVisible: false,
      // 要删除的日记
      diaryToDelete: null,
      // 网络恢复弹窗状态
      networkRecoveryDialogVisible: false,
      // 加载更多状态
      loadingMore: false,
      // 是否有更多日记
      hasMoreDiaries: true,
      // 当前加载的页码
      currentPage: 1,
      // 每页显示的日记数量
      pageSize: 20,
      // 图表实例
      moodStatsChart: null
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
    // 初始化当前日期
    this.selectedDate = this.formatDate(new Date())
    // 初始化当前日记
    this.initCurrentDiary()
    // 初始化图表
    this.initCharts()
    // 监听滚动事件
    this.$nextTick(() => {
      window.addEventListener('scroll', this.handleScroll)
    })
    // 监听网络状态
    this.initNetworkListener()
  },
  beforeDestroy() {
    // 移除滚动事件监听
    window.removeEventListener('scroll', this.handleScroll)
    // 销毁图表
    if (this.moodStatsChart) {
      this.moodStatsChart.dispose()
    }
  },
  methods: {
    // 初始化数据
    initData() {
      // 从localStorage加载日记数据
      const savedDiaries = localStorage.getItem('musicDiaries')
      if (savedDiaries) {
        this.diaries = JSON.parse(savedDiaries)
      } else {
        // 模拟一些初始数据
        this.diaries = Array.from({ length: 50 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const moods = ['happy', 'sad', 'calm', 'excited', 'angry', 'lonely', 'tired', 'surprised']
          const mood = moods[Math.floor(Math.random() * moods.length)]
          return {
            id: i + 1,
            date: this.formatDate(date),
            title: `心情日记${i + 1}`,
            description: `这是我在${this.formatDate(date)}记录的心情日记`,
            mood: mood,
            song: this.getRecommendedSongByMood(mood),
            content: `今天的心情是${this.getMoodName(mood)}，我听了${this.getRecommendedSongByMood(mood).name}这首歌。`,
            images: [],
            tags: ['心情', '音乐', '日记'],
            createTime: date.toISOString()
          }
        })
        // 保存到localStorage
        this.saveDiariesToLocal()
      }
      // 按日期倒序排列
      this.diaries.sort((a, b) => new Date(b.date) - new Date(a.date))
      // 初始化可见日记
      this.loadVisibleDiaries()
    },
    // 初始化当前日记
    initCurrentDiary() {
      this.currentDiary = {
        id: null,
        date: this.selectedDate,
        title: '',
        description: '',
        mood: null,
        song: null,
        content: '',
        images: [],
        tags: [],
        createTime: new Date().toISOString()
      }
    },
    // 初始化图表
    initCharts() {
      // 月度心情统计环形图
      this.moodStatsChart = echarts.init(document.getElementById('moodStatsChart'))
      this.updateMoodStatsChart()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.moodStatsChart.resize()
      })
    },
    // 更新月度心情统计图表
    updateMoodStatsChart() {
      // 获取当月的日记
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyDiaries = this.diaries.filter(diary => {
        const diaryDate = new Date(diary.date)
        return diaryDate.getMonth() === currentMonth && diaryDate.getFullYear() === currentYear
      })

      // 统计不同心情的数量
      const moodCounts = {
        happy: 0,
        sad: 0,
        calm: 0,
        excited: 0,
        angry: 0,
        lonely: 0,
        tired: 0,
        surprised: 0
      }

      monthlyDiaries.forEach(diary => {
        if (moodCounts[diary.mood] !== undefined) {
          moodCounts[diary.mood]++
        }
      })

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: Object.keys(moodCounts).map(key => this.getMoodName(key))
        },
        series: [
          {
            name: '心情统计',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: Object.entries(moodCounts).map(([key, value]) => ({
              value: value,
              name: this.getMoodName(key)
            }))
          }
        ]
      }

      this.moodStatsChart.setOption(option)
    },
    // 加载可见日记
    loadVisibleDiaries() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.visibleDiaries = this.diaries.slice(start, end)
      // 检查是否有更多日记
      this.hasMoreDiaries = end < this.diaries.length
    },
    // 日期变化
    onDateChange(date) {
      // 查找当天的日记
      const diary = this.diaries.find(d => d.date === date)
      if (diary) {
        this.openDiary(diary)
      } else {
        // 创建新日记
        this.initCurrentDiary()
        this.currentDiary.date = date
      }
    },
    // 打开日记
    openDiary(diary) {
      this.currentDiary = JSON.parse(JSON.stringify(diary))
    },
    // 编辑日记
    editDiary(diary) {
      this.openDiary(diary)
    },
    // 删除日记
    deleteDiary(diary) {
      this.diaryToDelete = diary
      this.deleteDialogVisible = true
    },
    // 确认删除
    confirmDelete() {
      this.deleteDialogVisible = false
      // 从数组中删除日记
      const index = this.diaries.findIndex(d => d.id === this.diaryToDelete.id)
      if (index !== -1) {
        this.diaries.splice(index, 1)
        // 保存到localStorage
        this.saveDiariesToLocal()
        // 更新可见日记
        this.loadVisibleDiaries()
        // 更新图表
        this.updateMoodStatsChart()
        // 如果删除的是当前编辑的日记，创建新日记
        if (this.currentDiary && this.currentDiary.id === this.diaryToDelete.id) {
          this.initCurrentDiary()
        }
        this.$message.success('日记删除成功')
      }
    },
    // 选择心情
    selectMood(mood) {
      this.currentDiary.mood = mood
      // 根据心情推荐歌曲
      this.recommendedSongs = this.getRecommendedSongsByMood(mood)
    },
    // 搜索输入
    onSearchInput: debounce(function() {
      if (this.searchKeyword.trim()) {
        this.searchSongs()
      } else {
        this.searchResults = []
        // 根据当前心情推荐歌曲
        if (this.currentDiary.mood) {
          this.recommendedSongs = this.getRecommendedSongsByMood(this.currentDiary.mood)
        }
      }
    }, 300),
    // 搜索歌曲
    searchSongs() {
      // 模拟搜索结果
      const allSongs = [
        { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
        { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' },
        { id: 3, name: '青花瓷', artist: '周杰伦', cover: 'https://picsum.photos/seed/song3/100/100' },
        { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
        { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' },
        { id: 6, name: '稻香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song6/100/100' },
        { id: 7, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
        { id: 8, name: '龙卷风', artist: '周杰伦', cover: 'https://picsum.photos/seed/song8/100/100' },
        { id: 9, name: '简单爱', artist: '周杰伦', cover: 'https://picsum.photos/seed/song9/100/100' },
        { id: 10, name: '爱在西元前', artist: '周杰伦', cover: 'https://picsum.photos/seed/song10/100/100' }
      ]
      this.searchResults = allSongs.filter(song => 
        song.name.includes(this.searchKeyword) || song.artist.includes(this.searchKeyword)
      )
    },
    // 选择歌曲
    selectSong(song) {
      this.currentDiary.song = song
      this.searchResults = []
      this.searchKeyword = ''
    },
    // 播放歌曲
    playSong(song) {
      this.$message.success(`开始播放歌曲 "${song.name}"`) 
    },
    // 上传图片前的处理
    beforeUpload(file) {
      // 限制图片大小
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
        return false
      }
      // 限制图片格式
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('请上传图片文件!')
        return false
      }
      // 压缩图片
      return new Promise((resolve) => {
        this.compressImage(file).then(compressedFile => {
          resolve(compressedFile)
        })
      })
    },
    // 压缩图片
    compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          const img = new Image()
          img.src = e.target.result
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            // 设置压缩后的图片大小
            const maxWidth = 800
            const maxHeight = 800
            let width = img.width
            let height = img.height
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width))
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = Math.round(width * (maxHeight / height))
                height = maxHeight
              }
            }
            canvas.width = width
            canvas.height = height
            // 绘制图片
            ctx.drawImage(img, 0, 0, width, height)
            // 将canvas转换为blob
            canvas.toBlob((blob) => {
              // 创建新的文件对象
              const compressedFile = new File([blob], file.name, { type: file.type })
              resolve(compressedFile)
            }, file.type, 0.8)
          }
        }
      })
    },
    // 图片上传成功
    onImageUploadSuccess(response, file) {
      // 模拟上传成功，将图片添加到当前日记
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        this.currentDiary.images.push({
          url: e.target.result,
          name: file.name,
          previewVisible: false
        })
      }
    },
    // 处理图片上传超过限制
    handleExceed(files, fileList) {
      this.$message.error('最多只能上传3张图片!')
    },
    // 添加标签
    addTag() {
      if (this.newTag.trim() && this.currentDiary.tags.length < 5) {
        this.currentDiary.tags.push(this.newTag.trim())
        this.newTag = ''
      } else if (this.currentDiary.tags.length >= 5) {
        this.$message.error('最多只能添加5个标签!')
      }
    },
    // 移除标签
    removeTag(index) {
      this.currentDiary.tags.splice(index, 1)
    },
    // 保存日记
    saveDiary() {
      // 验证日记内容
      if (!this.currentDiary.title.trim()) {
        this.$message.error('请输入日记标题!')
        return
      }
      if (!this.currentDiary.mood) {
        this.$message.error('请选择心情!')
        return
      }
      if (!this.currentDiary.song) {
        this.$message.error('请选择音乐!')
        return
      }
      if (!this.currentDiary.content.trim()) {
        this.$message.error('请输入日记内容!')
        return
      }

      // 生成简短描述
      this.currentDiary.description = this.currentDiary.content.substring(0, 50) + (this.currentDiary.content.length > 50 ? '...' : '')

      if (this.currentDiary.id) {
        // 编辑现有日记
        const index = this.diaries.findIndex(d => d.id === this.currentDiary.id)
        if (index !== -1) {
          this.diaries[index] = this.currentDiary
        }
      } else {
        // 创建新日记
        this.currentDiary.id = Date.now()
        this.currentDiary.createTime = new Date().toISOString()
        this.diaries.unshift(this.currentDiary)
      }

      // 保存到localStorage
      this.saveDiariesToLocal()
      // 更新可见日记
      this.loadVisibleDiaries()
      // 更新图表
      this.updateMoodStatsChart()
      // 添加到心情歌单
      this.addToMoodPlaylist(this.currentDiary.song)
      // 提示保存成功
      this.$message.success('日记保存成功')
    },
    // 取消编辑
    cancelEdit() {
      this.initCurrentDiary()
    },
    // 保存日记到localStorage
    saveDiariesToLocal() {
      localStorage.setItem('musicDiaries', JSON.stringify(this.diaries))
    },
    // 添加到心情歌单
    addToMoodPlaylist(song) {
      // 模拟添加到歌单
      this.$message.success(`歌曲 "${song.name}" 已添加到我的心情歌单`)
    },
    // 获取心情图标
    getMoodIcon(mood) {
      const moodObj = this.moods.find(m => m.value === mood)
      return moodObj ? moodObj.icon : '😊'
    },
    // 获取心情名称
    getMoodName(mood) {
      const moodObj = this.moods.find(m => m.value === mood)
      return moodObj ? moodObj.name : '未知'
    },
    // 根据心情获取推荐歌曲
    getRecommendedSongByMood(mood) {
      const songsByMood = {
        happy: [
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' },
          { id: 3, name: '稻香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song6/100/100' }
        ],
        sad: [
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' },
          { id: 6, name: '龙卷风', artist: '周杰伦', cover: 'https://picsum.photos/seed/song8/100/100' }
        ],
        calm: [
          { id: 7, name: '青花瓷', artist: '周杰伦', cover: 'https://picsum.photos/seed/song3/100/100' },
          { id: 8, name: '简单爱', artist: '周杰伦', cover: 'https://picsum.photos/seed/song9/100/100' },
          { id: 9, name: '爱在西元前', artist: '周杰伦', cover: 'https://picsum.photos/seed/song10/100/100' }
        ],
        excited: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' }
        ],
        angry: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' }
        ],
        lonely: [
          { id: 6, name: '龙卷风', artist: '周杰伦', cover: 'https://picsum.photos/seed/song8/100/100' },
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' }
        ],
        tired: [
          { id: 7, name: '青花瓷', artist: '周杰伦', cover: 'https://picsum.photos/seed/song3/100/100' },
          { id: 8, name: '简单爱', artist: '周杰伦', cover: 'https://picsum.photos/seed/song9/100/100' },
          { id: 9, name: '爱在西元前', artist: '周杰伦', cover: 'https://picsum.photos/seed/song10/100/100' }
        ],
        surprised: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' }
        ]
      }
      const songs = songsByMood[mood] || songsByMood.happy
      return songs[Math.floor(Math.random() * songs.length)]
    },
    // 根据心情获取推荐歌曲列表
    getRecommendedSongsByMood(mood) {
      const songsByMood = {
        happy: [
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' },
          { id: 3, name: '稻香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song6/100/100' }
        ],
        sad: [
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' },
          { id: 6, name: '龙卷风', artist: '周杰伦', cover: 'https://picsum.photos/seed/song8/100/100' }
        ],
        calm: [
          { id: 7, name: '青花瓷', artist: '周杰伦', cover: 'https://picsum.photos/seed/song3/100/100' },
          { id: 8, name: '简单爱', artist: '周杰伦', cover: 'https://picsum.photos/seed/song9/100/100' },
          { id: 9, name: '爱在西元前', artist: '周杰伦', cover: 'https://picsum.photos/seed/song10/100/100' }
        ],
        excited: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' }
        ],
        angry: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' }
        ],
        lonely: [
          { id: 6, name: '龙卷风', artist: '周杰伦', cover: 'https://picsum.photos/seed/song8/100/100' },
          { id: 4, name: '以父之名', artist: '周杰伦', cover: 'https://picsum.photos/seed/song4/100/100' },
          { id: 5, name: '夜曲', artist: '周杰伦', cover: 'https://picsum.photos/seed/song5/100/100' }
        ],
        tired: [
          { id: 7, name: '青花瓷', artist: '周杰伦', cover: 'https://picsum.photos/seed/song3/100/100' },
          { id: 8, name: '简单爱', artist: '周杰伦', cover: 'https://picsum.photos/seed/song9/100/100' },
          { id: 9, name: '爱在西元前', artist: '周杰伦', cover: 'https://picsum.photos/seed/song10/100/100' }
        ],
        surprised: [
          { id: 10, name: '双截棍', artist: '周杰伦', cover: 'https://picsum.photos/seed/song7/100/100' },
          { id: 1, name: '晴天', artist: '周杰伦', cover: 'https://picsum.photos/seed/song1/100/100' },
          { id: 2, name: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/seed/song2/100/100' }
        ]
      }
      return songsByMood[mood] || songsByMood.happy
    },
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 滚动事件处理
    handleScroll() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = document.documentElement.clientHeight || window.innerHeight

      // 触底加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && !this.loadingMore && this.hasMoreDiaries) {
        this.loadMoreDiaries()
      }
    },
    // 加载更多日记
    loadMoreDiaries() {
      this.loadingMore = true
      // 模拟加载延迟
      setTimeout(() => {
        this.currentPage++
        this.loadVisibleDiaries()
        this.loadingMore = false
      }, 1000)
    },
    // 初始化网络监听
    initNetworkListener() {
      window.addEventListener('online', this.handleNetworkOnline)
      window.addEventListener('offline', this.handleNetworkOffline)
    },
    // 网络恢复
    handleNetworkOnline() {
      this.networkRecoveryDialogVisible = true
    },
    // 网络断开
    handleNetworkOffline() {
      this.$message.warning('网络已断开，日记将保存到本地')
    },
    // 同步日记到服务器
    syncDiaries() {
      this.networkRecoveryDialogVisible = false
      // 模拟同步到服务器
      this.$message.success('日记已同步到服务器')
    }
  }
}
</script>

<style scoped>
.music-diary {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.date-picker-container {
  flex: 1;
  margin-right: 20px;
}

.mood-stats-container {
  width: 350px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow-y: auto;
}

.timeline-section {
  width: 400px;
  flex-shrink: 0;
}

.timeline-container {
  border-left: 2px solid #e6e7ea;
  padding-left: 20px;
}

.timeline-item {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 8px;
}

.timeline-item:hover {
  background-color: #f5f7fa;
}

.timeline-item:hover .timeline-actions {
  opacity: 1;
}

.timeline-date {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.diary-preview {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.song-cover {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.diary-info {
  flex: 1;
  min-width: 0;
}

.diary-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-description {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.editor-section {
  flex: 1;
  min-width: 0;
}

.editor-container {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.mood-selector {
  margin-bottom: 20px;
}

.mood-icons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mood-item:hover {
  background-color: #e6e7ea;
}

.mood-item.active {
  background-color: #e6e7ea;
  border-color: #409eff;
}

.mood-emoji {
  font-size: 24px;
}

.mood-name {
  font-size: 12px;
}

.music-section {
  margin-bottom: 20px;
}

.music-selector {
  margin-top: 10px;
}

.search-results,
.recommended-songs {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e6e7ea;
  border-top: none;
  background-color: #fff;
  padding: 10px;
}

.search-result-item,
.recommended-song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.search-result-item:hover,
.recommended-song-item:hover {
  background-color: #f5f7fa;
}

.song-cover-small {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-search-results {
  padding: 10px;
  text-align: center;
  color: #999;
  border: 1px solid #e6e7ea;
  border-top: none;
  background-color: #fff;
}

.recommended-songs h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}

.selected-song {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #e6e7ea;
  border-radius: 4px;
  margin-top: 10px;
}

.selected-song-cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.selected-song-info {
  flex: 1;
  min-width: 0;
}

.selected-song-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-song-artist {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-section {
  margin-bottom: 20px;
}

.content-section label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 600;
}

.title-input {
  margin-bottom: 15px;
}

.content-textarea {
  margin-bottom: 15px;
}

.image-upload-section {
  margin-bottom: 15px;
}

.image-uploader {
  margin-bottom: 10px;
}

.tag-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag-input {
  width: 150px;
}

.button-section {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-more span {
  margin-left: 10px;
}

.no-more-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .timeline-section {
    width: 100%;
    margin-bottom: 20px;
  }

  .timeline-container {
    display: flex;
    gap: 15px;
    overflow-x: auto;
    border-left: none;
    padding-left: 0;
    padding-bottom: 10px;
  }

  .timeline-item {
    min-width: 250px;
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .music-diary {
    padding: 10px;
  }

  .top-section {
    flex-direction: column;
    gap: 20px;
  }

  .mood-stats-container {
    width: 100%;
  }

  .timeline-container {
    gap: 10px;
  }

  .timeline-item {
    min-width: 200px;
  }

  .editor-container {
    padding: 15px;
  }

  .mood-icons {
    gap: 10px;
  }

  .mood-item {
    padding: 8px;
  }

  .mood-emoji {
    font-size: 20px;
  }

  .mood-name {
    font-size: 11px;
  }
}
</style>