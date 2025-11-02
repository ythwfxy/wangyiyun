<template>
  <div class="ftp-container">
    <h2 class="page-title">FTP文件管理</h2>
    
    <!-- 筛选区 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="文件名">
          <el-input
            v-model="filterForm.fileName"
            placeholder="请输入文件名"
            clearable
            @input="handleFilterChange"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="文件类型">
          <el-select
            v-model="filterForm.fileType"
            placeholder="请选择文件类型"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="音频" value="audio"></el-option>
            <el-option label="视频" value="video"></el-option>
            <el-option label="文档" value="document"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilterChange"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">筛选</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 文件列表区 -->
    <div class="file-list-section">
      <el-table
        :data="paginatedFiles"
        style="width: 100%"
        :default-sort="{prop: 'uploadTime', order: 'descending'}"
        @sort-change="handleSortChange"
         row-height="30"
      >
        <el-table-column
          prop="fileName"
          label="文件名"
          sortable
          min-width="200"
        >
          <template slot-scope="scope">
            <span class="file-name">{{ scope.row.fileName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="fileType"
          label="文件类型"
          sortable
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="getFileTypeTagType(scope.row.fileType)">
              {{ getFileTypeLabel(scope.row.fileType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="fileSize"
          label="文件大小"
          sortable
          width="120"
        >
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        
        <el-table-column
          prop="uploadTime"
          label="上传时间"
          sortable
          width="180"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.uploadTime) }}
          </template>
        </el-table-column>
        
        <el-table-column
          prop="uploader"
          label="上传人"
          sortable
          width="120"
        ></el-table-column>
        
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <a href="javascript:void(0)" @click="handleDownload(scope.row)" class="operation-btn download">下载</a>
            <a href="javascript:void(0)" @click="handlePreview(scope.row)" class="operation-btn preview">预览</a>
            <a href="javascript:void(0)" @click="handleDelete(scope.row)" class="operation-btn delete">删除</a>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredFiles.length"
        >
        </el-pagination>
      </div>
    </div>
    
    <!-- 预览对话框 -->
    <el-dialog
      :title="previewTitle"
      :visible.sync="previewVisible"
      width="80%"
      :before-close="handlePreviewClose"
    >
      <div v-if="previewFile" class="preview-content">
        <div v-if="previewFile.fileType === 'audio'" class="preview-audio">
          <audio :src="previewFile.url" controls style="width: 100%">
            您的浏览器不支持音频播放
          </audio>
        </div>
        <div v-else-if="previewFile.fileType === 'video'" class="preview-video">
          <video :src="previewFile.url" controls style="width: 100%; height: 500px">
            您的浏览器不支持视频播放
          </video>
        </div>
        <div v-else-if="previewFile.fileType === 'document'" class="preview-document">
          <iframe :src="previewFile.url" style="width: 100%; height: 600px; border: none;"></iframe>
        </div>
        <div v-else class="preview-other">
          <p>该文件类型不支持预览，请下载查看</p>
          <el-button type="primary" @click="handleDownload(previewFile)">立即下载</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mockFiles } from './mockData.js'

export default {
  name: 'ftpPage',
  data() {
    return {
      files: [],
      filterForm: {
        fileName: '',
        fileType: '',
        dateRange: []
      },
      sortProp: 'uploadTime',
      sortOrder: 'descending',
      currentPage: 1,
      pageSize: 10,
      previewVisible: false,
      previewFile: null,
      previewTitle: ''
    }
  },
  computed: {
    filteredFiles() {
      let filtered = [...this.files]
      
      // 文件名筛选
      if (this.filterForm.fileName) {
        const keyword = this.filterForm.fileName.toLowerCase()
        filtered = filtered.filter(file => file.fileName.toLowerCase().includes(keyword))
      }
      
      // 文件类型筛选
      if (this.filterForm.fileType) {
        filtered = filtered.filter(file => file.fileType === this.filterForm.fileType)
      }
      
      // 日期范围筛选
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        const startDate = this.filterForm.dateRange[0]
        const endDate = this.filterForm.dateRange[1]
        filtered = filtered.filter(file => {
          const uploadTime = new Date(file.uploadTime)
          return uploadTime >= startDate && uploadTime <= endDate
        })
      }
      
      // 排序
      if (this.sortProp && this.sortOrder) {
        filtered.sort((a, b) => {
          if (this.sortOrder === 'ascending') {
            return a[this.sortProp] > b[this.sortProp] ? 1 : -1
          } else {
            return a[this.sortProp] < b[this.sortProp] ? 1 : -1
          }
        })
      }
      
      return filtered
    },
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredFiles.slice(start, end)
    }
  },
  created() {
    this.initData()
    this.loadFilterFromUrl()
  },
  methods: {
    initData() {
      this.files = mockFiles
    },
    loadFilterFromUrl() {
      const query = this.$route.query
      if (query.fileName) this.filterForm.fileName = query.fileName
      if (query.fileType) this.filterForm.fileType = query.fileType
      if (query.startDate && query.endDate) {
        this.filterForm.dateRange = [
          new Date(query.startDate),
          new Date(query.endDate)
        ]
      }
      if (query.page) this.currentPage = parseInt(query.page)
      if (query.pageSize) this.pageSize = parseInt(query.pageSize)
    },
    updateUrlParams() {
      const params = {}
      if (this.filterForm.fileName) params.fileName = this.filterForm.fileName
      if (this.filterForm.fileType) params.fileType = this.filterForm.fileType
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        params.startDate = this.formatDate(this.filterForm.dateRange[0], 'yyyy-MM-dd')
        params.endDate = this.formatDate(this.filterForm.dateRange[1], 'yyyy-MM-dd')
      }
      params.page = this.currentPage
      params.pageSize = this.pageSize
      
      this.$router.push({ query: params })
    },
    handleFilterChange() {
      this.currentPage = 1
      this.updateUrlParams()
    },
    handleSearch() {
      this.updateUrlParams()
    },
    handleReset() {
      this.filterForm = {
        fileName: '',
        fileType: '',
        dateRange: []
      }
      this.currentPage = 1
      this.pageSize = 10
      this.updateUrlParams()
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order
      this.currentPage = 1
      this.updateUrlParams()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.updateUrlParams()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.updateUrlParams()
    },
    handleDownload(file) {
      this.$message.success(`正在下载文件: ${file.fileName}`)
      // 实际下载逻辑可以在这里实现
    },
    handlePreview(file) {
      this.previewFile = file
      this.previewTitle = file.fileName
      this.previewVisible = true
    },
    handlePreviewClose() {
      this.previewVisible = false
      this.previewFile = null
      this.previewTitle = ''
    },
    handleDelete(file) {
      this.$confirm(`确定要删除文件: ${file.fileName}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.files = this.files.filter(item => item.id !== file.id)
        this.$message.success('文件删除成功')
        this.updateUrlParams()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    getFileTypeLabel(type) {
      const typeMap = {
        audio: '音频',
        video: '视频',
        document: '文档',
        other: '其他'
      }
      return typeMap[type] || '未知'
    },
    getFileTypeTagType(type) {
      const typeMap = {
        audio: 'success',
        video: 'warning',
        document: 'info',
        other: 'default'
      }
      return typeMap[type] || 'default'
    },
    formatFileSize(size) {
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
      if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    },
    formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
      if (!date) return ''
      if (typeof date === 'string') date = new Date(date)
      if (!(date instanceof Date) || isNaN(date.getTime())) return ''
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return format
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
    }
  }
}
</script>

<style scoped>
.ftp-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.filter-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-list-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-name {
  font-weight: 500;
  color: #333;
}

.operation-btn {
  margin-right: 15px;
  text-decoration: none;
  cursor: pointer;
}

.operation-btn.download {
  color: #67c23a;
}

.operation-btn.preview {
  color: #409eff;
}

.operation-btn.delete {
  color: #f56c6c;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.preview-content {
  padding: 20px 0;
}

.preview-audio, .preview-video, .preview-document {
  margin-bottom: 20px;
}

.preview-other {
  text-align: center;
  padding: 100px 0;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ftp-container {
    padding: 10px;
  }
  
  .filter-section {
    padding: 10px;
  }
  
  .el-form--inline .el-form-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  
  .file-list-section {
    padding: 10px;
  }
  
  .el-table__fixed-right {
    height: calc(100% - 30px) !important;
  }
}
</style>