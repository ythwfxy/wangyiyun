<template>
  <div class="music-memo-container">
    <div class="memo-header">
      <h1>音乐备忘录</h1>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        新建备忘录
      </el-button>
    </div>

    <div class="memo-filters">
      <el-select v-model="selectedFilter" placeholder="筛选方式" @change="filterMemos">
        <el-option label="全部" value="all"></el-option>
        <el-option label="按时间排序" value="time"></el-option>
      </el-select>
      <el-select v-model="selectedTag" placeholder="按标签筛选" @change="filterMemos">
        <el-option label="全部标签" value="all"></el-option>
        <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag"></el-option>
      </el-select>
    </div>

    <div class="memo-grid">
      <div v-for="memo in filteredMemos" :key="memo.id" class="memo-card">
        <div class="memo-header-card">
          <span class="memo-date">{{ memo.date }}</span>
          <div class="memo-actions">
            <el-button type="text" icon="el-icon-edit" @click="editMemo(memo)"></el-button>
            <el-button type="text" icon="el-icon-delete" @click="deleteMemo(memo.id)"></el-button>
          </div>
        </div>
        <div class="memo-content">{{ memo.content }}</div>
        <div class="memo-tags">
          <el-tag v-for="tag in memo.tags" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="editingMemo ? '编辑备忘录' : '新建备忘录'"
      :visible.sync="showAddDialog"
      width="500px"
    >
      <el-form ref="memoForm" :model="currentMemo" label-width="80px">
        <el-form-item label="感悟内容">
          <el-input
            type="textarea"
            v-model="currentMemo.content"
            placeholder="记录你的听歌感悟..."
            rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="情绪标签">
          <el-select
            v-model="currentMemo.tags"
            multiple
            placeholder="选择或输入标签"
            filterable
            allow-create
          >
            <el-option
              v-for="tag in predefinedTags"
              :key="tag"
              :label="tag"
              :value="tag"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
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
      showAddDialog: false,
      memos: [],
      selectedFilter: 'all',
      selectedTag: 'all',
      currentMemo: {
        id: null,
        content: '',
        tags: [],
        date: ''
      },
      editingMemo: null,
      predefinedTags: ['开心', '悲伤', '感动', '兴奋', '平静', '怀旧', '励志', '治愈']
    }
  },
  computed: {
    filteredMemos() {
      let result = [...this.memos]

      // 按标签筛选
      if (this.selectedTag !== 'all') {
        result = result.filter(memo => memo.tags.includes(this.selectedTag))
      }

      // 按时间排序
      if (this.selectedFilter === 'time') {
        result.sort((a, b) => new Date(b.date) - new Date(a.date))
      }

      return result
    },
    allTags() {
      const tags = new Set()
      this.memos.forEach(memo => {
        memo.tags.forEach(tag => tags.add(tag))
      })
      return Array.from(tags)
    }
  },
  mounted() {
    this.loadMemos()
  },
  methods: {
    loadMemos() {
      const savedMemos = localStorage.getItem('musicMemos')
      this.memos = savedMemos ? JSON.parse(savedMemos) : []
    },
    saveMemos() {
      localStorage.setItem('musicMemos', JSON.stringify(this.memos))
    },
    saveMemo() {
      if (!this.currentMemo.content.trim()) {
        this.$message.warning('请输入感悟内容')
        return
      }

      const now = new Date()
      const dateStr = now.toLocaleString('zh-CN')

      if (this.editingMemo) {
        // 编辑现有备忘录
        const index = this.memos.findIndex(memo => memo.id === this.editingMemo.id)
        if (index !== -1) {
          // 直接更新原始数组
          this.memos.splice(index, 1, {
            ...this.currentMemo,
            date: dateStr
          })
        }
      } else {
        // 新增备忘录
        const newMemo = {
          id: Date.now(),
          content: this.currentMemo.content,
          tags: this.currentMemo.tags,
          date: dateStr
        }
        this.memos.push(newMemo)
      }

      this.saveMemos()
      this.showAddDialog = false
      this.resetForm()
      this.$message.success('保存成功')
    },
    editMemo(memo) {
      this.editingMemo = memo
      this.currentMemo = {
        id: memo.id,
        content: memo.content,
        tags: [...memo.tags],
        date: memo.date
      }
      this.showAddDialog = true
    },
    deleteMemo(id) {
      this.$confirm('确定要删除这条备忘录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.memos = this.memos.filter(memo => memo.id !== id)
        this.saveMemos()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    resetForm() {
      this.currentMemo = {
        id: null,
        content: '',
        tags: [],
        date: ''
      }
      this.editingMemo = null
    },
    filterMemos() {
      // 筛选逻辑已在 computed 中处理
    }
  }
}
</script>

<style scoped>
.music-memo-container {
  padding: 20px;
  min-height: 100vh;
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.memo-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.memo-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.memo-filters .el-select {
  min-width: 150px;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.memo-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.memo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.memo-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.memo-date {
  font-size: 12px;
  color: #999;
}

.memo-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
  min-height: 60px;
}

.memo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

@media (max-width: 768px) {
  .music-memo-container {
    padding: 10px;
  }

  .memo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .memo-grid {
    grid-template-columns: 1fr;
  }
}
</style>