<template>
  <div class="leftNav">
    <el-col>
      <el-menu :router="true" :default-active="
        '/' + this.$route.path.split('/')[1] + '/' + this.$route.path.split('/')[2]
      " class="el-menu-vertical-demo" active-text-color="#000000" text-color="#5c5c5c">
        <p class="leftNavFont">推荐</p>
        <div>
          <el-menu-item index="/home/findMusic">
            <span>发现音乐</span>
          </el-menu-item>
          <el-menu-item index="/home/recomVideo">
            <span>推荐视频</span>
          </el-menu-item>
        </div>
        <p class="leftNavFont">我的音乐</p>
        <div>
          <el-menu-item index="/home/myCloudMusic">
            <span>我的音乐云盘</span>
          </el-menu-item>
        </div>
        <p class="leftNavFont">创建的歌单</p>
        <div>
          <el-menu-item index="/home/123">
            <span>歌单1</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-col>
  </div>
</template>

<script>
export default {
  name: 'leftNav',
  mounted() {
    console.log(this.$route.path)
  }
}
</script>

<style scoped>
.leftNav {
  text-align: left;
}

.el-col {
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
}

.el-col:hover {
  overflow-y: overlay;
}

.leftNavFont {
  opacity: 0.8;
  font-weight: 50;
  font-size: 13px;
  margin-left: 10px;
}

.el-menu-item.is-active {
  background-color: #e6e7ea !important;
}

.el-menu-item:hover {
  background: #e6e7ea !important;
  color: #000000 !important;
}
</style>