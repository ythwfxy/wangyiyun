<template>
  <div class="ftp">
    <div class="filter-area">
      <el-input v-model="filterName" placeholder="请输入名称" style="width: 200px; margin-right: 20px;"></el-input>
      <el-input v-model="filterEncoding" placeholder="请输入编码" style="width: 200px; margin-right: 20px;"></el-input>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    <div class="table-area">
      <el-table :data="fileList" stripe style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="200"></el-table-column>
        <el-table-column prop="encoding" label="编码" min-width="150"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ftp',
  data() {
    return {
      filterName: '',
      filterEncoding: '',
      fileList: [
        { name: '文件1.txt', encoding: 'UTF-8' },
        { name: '文件2.jpg', encoding: 'Binary' },
        { name: '文件3.pdf', encoding: 'UTF-8' },
        { name: '文件4.mp3', encoding: 'Binary' },
        { name: '文件5.docx', encoding: 'UTF-8' },
      ]
    };
  },
  methods: {
    handleFilter() {
      // 这里应该添加实际的筛选逻辑，比如调用API获取数据
      console.log('筛选条件：', this.filterName, this.filterEncoding);
    },
    handleReset() {
      this.filterName = '';
      this.filterEncoding = '';
    }
  }
};
</script>

<style scoped>
.ftp {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.filter-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.table-area {
  flex: 1;
  overflow-y: auto;
}
</style>