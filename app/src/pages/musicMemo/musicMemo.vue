<template>
  <div class="music-memo-container">
    <!-- 标题 -->
    <div class="memo-header">
      <h1>音乐备忘录</h1>
      <p class="subtitle">记录你的听歌感悟</p>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="filter-bar">
      <el-select v-model="filterType" @change="filterMemos" placeholder="筛选方式">
        <el-option label="全部" value="all"></el-option>
        <el-option label="按时间" value="time"></el-option>
        <el-option label="按标签" value="tag"></el-option>
      </el-select>

      <el-select v-model="selectedTag" @change="filterMemos" placeholder="选择标签" v-if="filterType === 'tag'">
        <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag"></el-option>
      </el-select>

      <el-button type="primary" @click="showAddModal = true">
        <i class="el-icon-plus"></i> 新建备忘录
      </el-button>
    </div>

    <!-- 备忘录列表 -->
    <div class="memo-list">
      <div v-for="(memo, index) in filteredMemos" :key="memo.id" class="memo-item">
        <div class="memo-header-info">
          <div class="memo-title">{{ memo.title }}</div>
          <div class="memo-meta">
            <span class="memo-time">{{ memo.time }}</span>
            <span class="memo-song">{{ memo.song }}</span>
          </div>
        </div>

        <div class="memo-content">{{ memo.content }}</div>

        <div class="memo-tags">
          <el-tag v-for="tag in memo.tags" :key="tag" type="info" size="small">
            {{ tag }}
          </el-tag>
        </div>

        <div class="memo-actions">
          <el-button type="text" @click="editMemo(index)">编辑</el-button>
          <el-button type="text" @click="deleteMemo(index)" style="color: #f56c6c;">删除</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredMemos.length === 0">
        <i class="el-icon-notebook-2"></i>
        <p>还没有备忘录，点击右上角新建</p>
      </div>
    </div>

    <!-- 新建/编辑备忘录弹窗 -->
    <el-dialog :title="currentMemo.id ? '编辑备忘录' : '新建备忘录'" :visible.sync="showAddModal" width="600px">
      <el-form :model="currentMemo" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="currentMemo.title" placeholder="输入标题"></el-input>
        </el-form-item>

        <el-form-item label="歌曲">
          <el-input v-model="currentMemo.song" placeholder="输入歌曲名"></el-input>
        </el-form-item>

        <el-form-item label="内容">
          <el-input type="textarea" v-model="currentMemo.content" placeholder="输入听歌感悟" :rows="5"></el-input>
        </el-form-item>

        <el-form-item label="标签">
          <el-select v-model="currentMemo.tags" multiple placeholder="选择或输入标签">
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveMemo">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'musicMemo',
  data() {
    return {
      filterType: 'all',
      selectedTag: '',
      showAddModal: false,
      currentMemo: {
        id: null,
        title: '',
        song: '',
        content: '',
        tags: [],
        time: ''
      },
      memos: [],
      allTags: ['开心', '感动', '回忆', '治愈', '励志', '伤感', '放松', '思考']
    }
  },
  computed: {
    filteredMemos() {
      if (this.filterType === 'all') {
        return this.memos
      } else if (this.filterType === 'tag' && this.selectedTag) {
        return this.memos.filter(memo => memo.tags.includes(this.selectedTag))
      } else if (this.filterType === 'time') {
        return [...this.memos].sort((a, b) => new Date(b.time) - new Date(a.time))
      }
      return this.memos
    }
  },
  mounted() {
    this.loadMemos()
    this.generateMockData()
  },
  methods: {
    // 从localStorage加载备忘录
    loadMemos() {
      const savedMemos = localStorage.getItem('musicMemos')
      if (savedMemos) {
        this.memos = JSON.parse(savedMemos)
      }
    },
    // 保存备忘录到localStorage
    saveMemos() {
      localStorage.setItem('musicMemos', JSON.stringify(this.memos))
    },
    // 筛选备忘录
    filterMemos() {
      // 筛选逻辑在computed中处理
    },
    // 新建/编辑备忘录
    editMemo(index) {
      this.currentMemo = { ...this.memos[index] }
      this.showAddModal = true
    },
    // 删除备忘录
    deleteMemo(index) {
      this.$confirm('确定要删除这条备忘录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.memos.splice(index, 1)
        this.saveMemos()
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 保存备忘录
    saveMemo() {
      if (!this.currentMemo.title || !this.currentMemo.content) {
        this.$message.warning('标题和内容不能为空')
        return
      }

      if (this.currentMemo.id) {
        // 编辑模式
        const index = this.memos.findIndex(m => m.id === this.currentMemo.id)
        if (index !== -1) {
          this.memos[index] = { ...this.currentMemo }
          this.$message.success('编辑成功')
        }
      } else {
        // 新建模式
        this.currentMemo.id = Date.now()
        this.currentMemo.time = new Date().toLocaleString()
        this.memos.unshift({ ...this.currentMemo })
        this.$message.success('新建成功')
      }

      this.saveMemos()
      this.showAddModal = false
      this.currentMemo = { id: null, title: '', song: '', content: '', tags: [], time: '' }
    },
    // 生成模拟数据
    generateMockData() {
      if (this.memos.length === 0) {
        const mockData = [
          {
            id: 1,
            title: '第一次听《晴天》',
            song: '晴天 - 周杰伦',
            content: '每次听到这首歌都会想起高中的时光，那些无忧无虑的日子，和同桌一起分享耳机的瞬间。',
            tags: ['回忆', '伤感'],
            time: '2024-01-15 14:30:00'
          },
          {
            id: 2,
            title: '《海阔天空》的力量',
            song: '海阔天空 - Beyond',
            content: '在人生低谷的时候，这首歌给了我很大的力量，让我相信只要坚持就能看到希望。',
            tags: ['励志', '感动'],
            time: '2024-01-12 19:45:00'
          },
          {
            id: 3,
            title: '治愈系音乐',
            song: 'Lemon - 米津玄师',
            content: '深夜听这首歌真的很治愈，旋律和歌词都能让人平静下来。',
            tags: ['治愈', '放松'],
            time: '2024-01-10 22:15:00'
          }
        ]
        this.memos = mockData
        this.saveMemos()
      }
    }
  }
}
</script>

<style scoped>
.music-memo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.memo-header {
  text-align: center;
  margin-bottom: 30px;
}

.memo-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.memo-header .subtitle {
  color: #666;
  font-size: 16px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.memo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.memo-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.memo-item:hover {
  transform: translateY(-2px);
}

.memo-header-info {
  margin-bottom: 15px;
}

.memo-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.memo-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.memo-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
  min-height: 80px;
}

.memo-tags {
  margin-bottom: 15px;
}

.memo-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #ddd;
}

@media (max-width: 768px) {
  .music-memo-container {
    padding: 10px;
  }

  .memo-header h1 {
    font-size: 28px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .memo-list {
    grid-template-columns: 1fr;
  }
}
</style>