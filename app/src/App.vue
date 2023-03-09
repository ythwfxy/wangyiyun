<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  methods: {
    // 存入数据防止刷新清空
    saveState() {
      if (this.musicUrl !== undefined) {
        sessionStorage.setItem("musicUrl", JSON.stringify(this.musicUrl));
      }
      if (this.musicDetail !== undefined) {
        sessionStorage.setItem("musicDetail", JSON.stringify(this.musicDetail));
      }
      if (this.songId !== undefined) {
        sessionStorage.setItem("songId", JSON.stringify(this.songId));
      }
      if (this.playList !== undefined) {
        sessionStorage.setItem("playList", JSON.stringify(this.playList));
      }
      if (this.hisMusicList !== undefined) {
        sessionStorage.setItem("hisMusicList", JSON.stringify(this.hisMusicList));
      }
      if (this.hasPlayList !== undefined) {
        sessionStorage.setItem("hasPlayList", JSON.stringify(this.hasPlayList));
      }
      if (this.playOrd !== undefined) {
        sessionStorage.setItem("playOrd", JSON.stringify(this.playOrd));
      }
      if (this.searchInfo !== undefined) {
        sessionStorage.setItem("searchInfo", JSON.stringify(this.searchInfo));
      }
      if (this.slider !== undefined) {
        sessionStorage.setItem("slider", JSON.stringify(this.slider));
      }
      if (this.playDur !== undefined) {
        sessionStorage.setItem("playDur", JSON.stringify(this.playDur));
      }
      if (this.searchHistory !== undefined) {
        sessionStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
      }
      if (this.userInfo !== undefined) {
        sessionStorage.setItem("userInfo", JSON.stringify(this.userInfo));
      }
      if (this.personalList !== undefined) {
        sessionStorage.setItem("personalList", JSON.stringify(this.personalList));
      }
    },
  },
  mounted() {
    window.addEventListener("unload", this.saveState);
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
