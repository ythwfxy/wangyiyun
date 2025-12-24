<template>
  <div class="listening-footprint-container">
    <h1 class="title">我的听歌足迹</h1>
    <div class="content">
      <el-empty description="暂无听歌足迹"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListeningFootprint'
}
</script>

<style scoped>
.listening-footprint-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.content {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>