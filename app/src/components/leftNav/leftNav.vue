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
          <el-menu-item index="/home/myFM">
            <span>私人FM</span>
          </el-menu-item>
        </div>
        <p class="leftNavFont">我的音乐</p>
        <div v-if="this.personalList.length">
          <el-menu-item :index='"/home/songList/" + personalList[0].id'>
            <span>我喜欢的音乐</span>
          </el-menu-item>
        </div>
        <div v-else>
          <el-menu-item>
            <span>请先登录后查看</span>
          </el-menu-item>
        </div>
        <!-- 本地音乐可视化 -->
        <el-menu-item index="/home/local-music-visual">
          <i class="el-icon-music"></i>
          <span>本地可视化</span>
        </el-menu-item>
        <p class="leftNavFont">创建的歌单</p>
        <div v-if="this.personalList.length">
          <el-menu-item v-for="(item, index2) in personalList.slice(1)" :key="index2" :index='"/home/songList/" + item.id'>
            <span>{{ item.name }}</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-col>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'leftNav',
  computed: {
    ...mapState(['personalList'])
  }
}
</script>

<style scoped>
body{
  font-size: 14px;
}
.leftNav {
  text-align: left;
  /* 加入滚动条 */
  overflow-y: auto;
  overflow-x: hidden;
  height: 84vh;
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
  font-size: 14px;
}

.el-menu-item:hover {
  background: #e6e7ea !important;
  color: #000000 !important;
}
</style>