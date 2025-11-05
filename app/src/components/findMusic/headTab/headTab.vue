<template>
    <div class="headTab">
    <el-menu
      :default-active="this.$route.path"
      class="el-menu-demo"
      mode="horizontal"
      :router="true"
    >
      <el-menu-item index="/home/findMusic/personRecom">个性推荐</el-menu-item>
      <el-menu-item index="/home/findMusic/songList">歌单</el-menu-item>
      <el-menu-item index="/home/findMusic/playList">排行榜</el-menu-item>
      <el-menu-item index="/home/findMusic/singerList">歌手</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
    name: "headTab",
}
</script>

<style>
.el-menu-item.is-active {
  border-color: #ec4141;
  font-size: 21px;
  font-weight: 400;
}
/* 整体的下划线进行隐藏 */

.el-menu.el-menu--horizontal {
  border-bottom: none;
}
</style>