<template>
  <div class="music-memo-container">
    <div class="header">
      <h1>音乐备忘录</h1>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        新建备忘录
      </el-button>
    </div>

    <div class="filters">
      <el-select v-model="selectedTag" placeholder="按标签筛选" style="width: 150px; margin-right: 15px">
        <el-option label="全部标签" value="" />
        <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
      </el-select>
      <el-select v-model="sortBy" placeholder="按时间排序" style="width: 150px">
        <el-option label="最新在前" value="desc" />
        <el-option label="最早在前" value="asc" />
      </el-select>
    </div>

    <div class="memo-grid">
      <div v-for="(memo, index) in filteredMemos" :key="memo.id" class="memo-card">
        <div class="memo-header">
          <span class="memo-date">{{ formatDate(memo.date) }}</span>
          <div class="memo-actions">
            <i class="el-icon-edit" @click="editMemo(memo)"></i>
            <i class="el-icon-delete" @click="deleteMemo(memo.id)"></i>
          </div>
        </div>
        <div class="memo-content">{{ memo.content }}</div>
        <div class="memo-tags">
          <el-tag v-for="tag in memo.tags" :key="tag" size="mini">{{ tag }}</el-tag>
        </div>
      </div>
    </div>

    <el-dialog :title="editingMemo ? '编辑备忘录' : '新建备忘录'" :visible.sync="showAddDialog" width="500px">
      <el-form ref="memoForm" :model="currentMemo" label-width="80px">
        <el-form-item label="内容">
          <el-input type="textarea" v-model="currentMemo.content" rows="5" placeholder="记录你的听歌感悟..." />
        </el-form-item>
        <el-form-item label="情绪标签">
          <el-select v-model="currentMemo.tags" multiple placeholder="选择或输入标签">
            <el-option label="开心" value="开心" />
            <el-option label="难过" value="难过" />
            <el-option label="平静" value="平静" />
            <el-option label="兴奋" value="兴奋" />
            <el-option label="怀旧" value="怀旧" />
            <el-option label="治愈" value="治愈" />
            <el-option label="孤独" value="孤独" />
            <el-option label="励志" value="励志" />
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
      memos: [],
      showAddDialog: false,
      currentMemo: {
        id: null,
        content: '',
        tags: [],
        date: null
      },
      editingMemo: null,
      selectedTag: '',
      sortBy: 'desc'
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
      let result = this.memos

      if (this.selectedTag) {
        result = result.filter(memo => memo.tags.includes(this.selectedTag))
      }

      result = [...result].sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return this.sortBy === 'desc' ? dateB - dateA : dateA - dateB
      })

      return result
    }
  },
  mounted() {
    this.loadMemos()
  },
  methods: {
    loadMemos() {
      const saved = localStorage.getItem('musicMemos')
      this.memos = saved ? JSON.parse(saved) : []
    },
    saveMemos() {
      localStorage.setItem('musicMemos', JSON.stringify(this.memos))
    },
    saveMemo() {
      if (!this.currentMemo.content.trim()) {
        this.$message.warning('请输入备忘录内容')
        return
      }

      if (this.editingMemo) {
        const index = this.memos.findIndex(m => m.id === this.editingMemo.id)
        this.memos[index] = { ...this.currentMemo }
        this.$message.success('备忘录已更新')
      } else {
        const newMemo = {
          ...this.currentMemo,
          id: Date.now(),
          date: new Date().toISOString()
        }
        this.memos.push(newMemo)
        this.$message.success('备忘录已保存')
      }

      this.saveMemos()
      this.showAddDialog = false
      this.resetForm()
    },
    editMemo(memo) {
      this.editingMemo = memo
      this.currentMemo = { ...memo }
      this.showAddDialog = true
    },
    deleteMemo(id) {
      this.$confirm('确定要删除这条备忘录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.memos = this.memos.filter(m => m.id !== id)
        this.saveMemos()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    resetForm() {
      this.currentMemo = {
        id: null,
        content: '',
        tags: [],
        date: null
      }
      this.editingMemo = null
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return '今天'
      if (diffDays === 2) return '昨天'
      if (diffDays <= 7) return `${diffDays - 1}天前`

      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.music-memo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.memo-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #409EFF;
}

.memo-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.memo-actions i {
  margin-left: 10px;
  cursor: pointer;
  transition: color 0.3s;
}

.memo-actions i:hover {
  color: #409EFF;
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

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .memo-grid {
    grid-template-columns: 1fr;
  }
}
</style>