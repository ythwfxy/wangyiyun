<template>
    <div class="recomSong">
        <div id="recomSongDiv">
            <!-- 推荐歌单 -->
            <div id="recomItem" v-for="(item, index) in recomSongList" :key="index" style="margin-bottom: 30px">
                <div id="playDetail" @mouseover="addPlay(index)" @mouseleave="reducePlay"
                    @click="toSongListPage(item.id)">
                    <!-- 歌单封面 -->
                    <el-image :src="item.picUrl" fit="fill"
                        style="border-radius: 10px; box-shadow: grey 0px 0px 2px 2px"></el-image>
                    <!-- 播放量 -->
                    <div style="
              color: white; 
              position: absolute;
              top: 2%;
              right: 3%;
              text-shadow: 0px 0px 2px #000000;
            ">
                        <i class="el-icon-headset"></i>
                        {{
                            item.playCount >= 10000
                                ? (item.playCount / 10000).toFixed(0) + "万"
                                : item.playCount
                        }}
                    </div>
                    <!-- 鼠标停靠出现播放键 -->
                    <div :class="{
                        playAppear: currentIndex === index,
                        playNone: currentIndex !== index,
                    }">
                        <img src="@/assets/imgs/play_1.svg" alt="" id="playImg" />
                    </div>
                </div>
                <!-- 歌单介绍 -->
                <div class="playListIntro">
                    <p id="playIntro" @click="toSongListPage(item.id)">{{ item.name }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "recomSong",
    components: {},
    props: {
        recomSongList: Array,
    },
    data() {
        return {
            //鼠标悬停的判断
            currentIndex: -1,
        };
    },
    methods: {
        // 鼠标移入
        addPlay(index) {
            this.currentIndex = index;
        },
        // 鼠标移出
        reducePlay() {
            this.currentIndex = -1;
        },
        //点击歌单跳转界面
        toSongListPage(id) {
            this.$router.push("/home/songList/" + id);
        },
    },
}
</script>

<style>
#recomSongDiv {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 40px;
}
.playListIntro {
  height: 50px;
  overflow: hidden;
}

#playIntro {
  font-size: 15px;
  cursor: pointer;
  color: #373737;
  opacity: 0.9;
}

#playIntro:hover {
  opacity: 1;
  color: #000000;
}
/* 歌单封面 */

#playDetail {
  display: inline-block;
  width: 100%;
  position: relative;
  cursor: pointer;
}

#playImg {
  display: inline-block;
  width: 35px;
  height: 35px;
  border-radius: 100%;
  background: #f2f3f4;
}
/* 播放键出现 */

.playAppear {
  display: block;
  position: absolute;
  bottom: 5%;
  right: 5%;
  animation-name: play;
  animation-duration: 0.8s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}
/* 播放动画 */

@keyframes play {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.playNone {
  display: none;
}
</style>