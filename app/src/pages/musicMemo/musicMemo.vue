<template>
  <div class="music-memo-container">
    <div class="header">
      <h1 class="title">音乐备忘录</h1>
      <el-button type="primary" @click="showCreateDialog = true" icon="el-icon-plus">新建备忘录</el-button>
    </div>

    <div class="filter-section">
      <el-select v-model="filterBy" placeholder="筛选方式" class="filter-select">
        <el-option label="按时间" value="time"></el-option>
        <el-option label="按标签" value="tag"></el-option>
      </el-select>
      
      <el-select 
        v-if="filterBy === 'tag'" 
        v-model="selectedTag" 
        placeholder="选择标签" 
        class="filter-select"
        clearable
      >
        <el-option 
          v-for="tag in allTags" 
          :key="tag" 
          :label="tag" 
          :value="tag"
        ></el-option>
      </el-select>
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索内容"
        class="search-input"
        prefix-icon="el-icon-search"
      ></el-input>
    </div>

    <div class="memo-list">
      <div 
        v-for="memo in filteredMemos" 
        :key="memo.id" 
        class="memo-card"
      >
        <div class="memo-header">
          <div class="song-info">
            <span class="song-name">{{ memo.songName }}</span>
            <span class="artist-name">{{ memo.artistName }}</span>
          </div>
          <div class="memo-actions">
            <el-button 
              type="text" 
              icon="el-icon-edit" 
              @click="editMemo(memo)"
            ></el-button>
            <el-button 
              type="text" 
              icon="el-icon-delete" 
              @click="deleteMemo(memo.id)"
            ></el-button>
          </div>
        </div>
        
        <div class="memo-content">
          <p>{{ memo.content }}</p>
        </div>
        
        <div class="memo-footer">
          <div class="tags">
            <el-tag 
              v-for="tag in memo.tags" 
              :key="tag" 
              size="small"
              type="success"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="time">
            <span>{{ formatTime(memo.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑备忘录对话框 -->
    <el-dialog 
      :title="editingMemo ? '编辑备忘录' : '新建备忘录'" 
      :visible.sync="showCreateDialog"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="歌曲名称">
          <el-input v-model="form.songName" placeholder="请输入歌曲名称"></el-input>
        </el-form-item>
        <el-form-item label="歌手名称">
          <el-input v-model="form.artistName" placeholder="请输入歌手名称"></el-input>
        </el-form-item>
        <el-form-item label="感悟内容">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            rows="4" 
            placeholder="请输入听歌感悟"
          ></el-input>
        </el-form-item>
        <el-form-item label="情绪标签">
          <el-select 
            v-model="form.tags" 
            multiple 
            placeholder="请选择情绪标签"
          >
            <el-option label="开心" value="开心"></el-option>
            <el-option label="悲伤" value="悲伤"></el-option>
            <el-option label="励志" value="励志"></el-option>
            <el-option label="治愈" value="治愈"></el-option>
            <el-option label="怀旧" value="怀旧"></el-option>
            <el-option label="感动" value="感动"></el-option>
            <el-option label="平静" value="平静"></el-option>
            <el-option label="兴奋" value="兴奋"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMemo">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MusicMemo',
  data() {
    return {
      showCreateDialog: false,
      editingMemo: null,
      form: {
        songName: '',
        artistName: '',
        content: '',
        tags: []
      },
      filterBy: 'time',
      selectedTag: '',
      searchKeyword: '',
      memos: []
    }
  },
  computed: {
    allTags() {
      const tags = new Set()
      this.memos.forEach(memo => {
        memo.tags.forEach(tag => tags.add(tag))
      })
      return Array.from(tags)
    },
    filteredMemos() {
      let result = [...this.memos]
      
      // 搜索过滤
      if (this.searchKeyword) {
        result = result.filter(memo => 
          memo.content.includes(this.searchKeyword) ||
          memo.songName.includes(this.searchKeyword) ||
          memo.artistName.includes(this.searchKeyword)
        )
      }
      
      // 按标签过滤
      if (this.filterBy === 'tag' && this.selectedTag) {
        result = result.filter(memo => memo.tags.includes(this.selectedTag))
      }
      
      // 按时间排序（默认降序）
      result.sort((a, b) => b.createTime - a.createTime)
      
      return result
    }
  },
  mounted() {
    this.loadMemos()
  },
  methods: {
    loadMemos() {
      const savedMemos = localStorage.getItem('musicMemos')
      if (savedMemos) {
        this.memos = JSON.parse(savedMemos)
      } else {
        // 初始mock数据
        this.memos = [
          {
            id: 1,
            songName: '稻香',
            artistName: '周杰伦',
            content: '听到这首歌，仿佛回到了童年的夏天，蝉鸣、稻田、微风，一切都是那么美好。',
            tags: ['怀旧', '治愈'],
            createTime: Date.now() - 86400000 * 3
          },
          {
            id: 2,
            songName: '阳光彩虹小白马',
            artistName: '大张伟',
            content: '超级欢快的一首歌，每次听都能让我心情变好！',
            tags: ['开心', '兴奋'],
            createTime: Date.now() - 86400000 * 2
          },
          {
            id: 3,
            songName: '海阔天空',
            artistName: 'Beyond',
            content: '经典中的经典，每次遇到困难时听这首歌，都能重新振作起来。',
            tags: ['励志', '感动'],
            createTime: Date.now() - 86400000
          },
          {
            id: 4,
            songName: '夜曲',
            artistName: '周杰伦',
            content: '完美的旋律和歌词，周杰伦的巅峰之作。',
            tags: ['怀旧', '感动'],
            createTime: Date.now() - 86400000 * 5
          },
          {
            id: 5,
            songName: '成都',
            artistName: '赵雷',
            content: '简单的吉他旋律，却能唤起很多人的回忆和共鸣。',
            tags: ['怀旧', '治愈'],
            createTime: Date.now() - 86400000 * 4
          }
        ]
        this.saveMemos()
      }
    },
    saveMemos() {
      localStorage.setItem('musicMemos', JSON.stringify(this.memos))
    },
    saveMemo() {
      if (this.editingMemo) {
        // 编辑模式 - 使用Vue友好的方式更新数组
        const index = this.memos.findIndex(memo => memo.id === this.editingMemo.id)
        if (index !== -1) {
          // 创建一个新的数组副本，确保Vue检测到变化
          this.memos = this.memos.map((memo, i) => {
            if (i === index) {
              return {
                ...memo,
                songName: this.form.songName,
                artistName: this.form.artistName,
                content: this.form.content,
                tags: this.form.tags
              }
            }
            return memo
          })
        }
      } else {
        // 新建模式
        const newMemo = {
          id: Date.now(),
          songName: this.form.songName,
          artistName: this.form.artistName,
          content: this.form.content,
          tags: this.form.tags,
          createTime: Date.now()
        }
        this.memos.push(newMemo)
      }
      
      this.saveMemos()
      this.showCreateDialog = false
      this.resetForm()
    },
    editMemo(memo) {
      // 创建一个新的对象副本，避免直接修改原始对象
      this.editingMemo = { ...memo }
      this.form = {
        songName: memo.songName,
        artistName: memo.artistName,
        content: memo.content,
        tags: [...memo.tags]
      }
      this.showCreateDialog = true
    },
    deleteMemo(id) {
      this.$confirm('确定要删除这条备忘录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.memos = this.memos.filter(memo => memo.id !== id)
        this.saveMemos()
        this.$message({
          type: 'success',
          message: '删除成功！'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    resetForm() {
      this.editingMemo = null
      this.form = {
        songName: '',
        artistName: '',
        content: '',
        tags: []
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.music-memo-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select {
  width: 150px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.memo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.memo-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.memo-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.song-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.artist-name {
  font-size: 14px;
  color: #999;
}

.memo-actions {
  display: flex;
  gap: 10px;
}

.memo-content {
  margin-bottom: 15px;
  min-height: 80px;
  color: #666;
  line-height: 1.6;
}

.memo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .music-memo-container {
    padding: 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
  }
  
  .memo-list {
    grid-template-columns: 1fr;
  }
}
</style>