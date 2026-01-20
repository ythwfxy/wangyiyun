<template>
  <div class="musicList">
    <!-- 行筛选样式的标题行 -->
    <div class="songRowHeader">
      <!-- 选择列 -->
      <div class="headerSelect"></div>
      <!-- 歌曲名列 -->
      <div class="headerTitle">
        <h3 style="margin: 0; font-size: 15px; font-weight: normal; color: #888888;">音乐标题</h3>
      </div>
      <!-- 歌手列 -->
      <div class="headerArtist">
        <h3 style="margin: 0; font-size: 15px; font-weight: normal; color: #888888;">歌手</h3>
      </div>
      <!-- 专辑列 -->
      <div class="headerAlbum">
        <h3 style="margin: 0; font-size: 15px; font-weight: normal; color: #888888;">专辑</h3>
      </div>
      <!-- 时长列 -->
      <div class="headerDuration">
        <h3 style="margin: 0; font-size: 15px; font-weight: normal; color: #888888;">时长</h3>
      </div>
    </div>
    
    <div :class="{ songMesSin: index % 2 !== 0, songMesDou: index % 2 === 0 }" v-for="(item, index) in songsDetail.songs"
      :key="index" background="#f9f9f9" @dblclick="startSong(item, index)" @mouseenter="currentIndex = index"
      @mouseleave="currentIndex = -1">
      <!-- 是否可mv或试听等 -->
      <div class="songRoot">
        <i class="iconfont icon-MV" style="color: #ec4141; cursor: pointer" v-show="item.mv != 0"
          @click="toVideoPage(item.mv)"></i>
        <i class="iconfont icon-vip-l" style="color: #ec4141; margin-left: 10px"
          v-show="songsDetail.privileges[index].chargeInfoList[0].chargeType !== 0"></i>
      </div>
      <!-- 播放或暂停音乐动画表情 -->
      <div style="font-size: 10px; position: absolute; top: 20px; left: 45px; color: #ec4141"
        v-if="item.id === songId && isPlaying">
        <playAni />
      </div>
      <i class="iconfont icon-zanting" style="font-size: 10px; position: absolute; top: 2px; left: 45px; color: #ec4141"
        v-else-if="item.id === songId && !isPlaying"></i>
      <!-- 歌曲序号 -->
      <span style="
              font-size: 15px !important;
              position: absolute;
              top: 2px;
              left: 42px;
              color: #373737;
            " v-else>{{ index >= 9 ? index + 1 : "0" + (index + 1) }}</span>
      <!-- 歌曲名 -->
      <div :class="{
        pauseSongName: item.id !== songId,
        startSongName: item.id === songId,
        noSongName: songsDetail.privileges[index].st == -200,
      }" style="cursor: default;margin: 0;">
        <span :title="item.name + (!item.alia[0] ? '' : '(' + item.alia[0] + ')')">{{
          item.name
        }}</span>
        <span style="color: #949495" :title="item.name + (!item.alia[0] ? '' : '(' + item.alia[0] + ')')">{{ !item.alia[0]
          ? "" : "(" + item.alia[0] + ")" }}</span>
      </div>
      <!-- 歌曲功能 -->
      <div class="songFunc" v-show="index === currentIndex">
        <i class="iconfont icon-aixin" title="添加到我的喜欢" style="opacity: 0.9; cursor: pointer" @click="addLove(item)"></i>
        <i class="iconfont icon-tianjia" style="opacity: 0.9; cursor: pointer; margin-left: 10px" title="添加到播放列表"
          @click="addList(item, index)"></i>
        <i class="iconfont icon-7" style="opacity: 0.9; cursor: pointer; margin-left: 10px" title="分享"></i>
      </div>
      <!-- 作者名 -->
      <div class="startSongAurtor" style="position: absolute; left: 45%">
        <div style="
                width: 160px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;
              ">
          <span style="cursor: pointer" v-for="(item, index) in item.ar" :key="index" @click="toArtistPage(item.id)">{{
            index === 0 ? item.name : "/" + item.name }}</span>
        </div>
      </div>
      <!-- 专辑 -->
      <div class="albumName" @click="toAlbumPage(item.al.id)">
        {{ item.al.name }}
      </div>
      <!-- 时长 -->
      <span class="duration">{{
        Math.floor(item.dt / 1000) | timeFormat
      }}</span>
    </div>
    <br />
    <br /><br /><br />
  </div>
</template>
  
<script>
import { mapState } from "vuex";
import playAni from "@/components/playAnimation/playAnimation";
export default {
  name: "musicList",
  props: {
    // 歌曲搜索信息
    songsDetail: Object,
  },
  computed: {
    ...mapState([
      //当前播放列表
      "playList",
      //当前播放歌曲id 
      "songId",
      //是否在播放
      "isPlaying",
      //可播放区域
      "slider",
    ]),
  },
  components: {
    //播放动画
    playAni,
  },
  data() {
    return {
      // 鼠标移入的index
      currentIndex: -1,
    };
  },
  methods: {
    // 生成模拟歌曲数据
    generateMockSongs() {
      // 检查localStorage中是否已有数据
      if (!localStorage.getItem('mockSongs')) {
        const mockSongs = {
          songs: [],
          privileges: []
        };
        
        // 生成50条模拟数据
        for (let i = 1; i <= 50; i++) {
          const song = {
            id: i,
            name: `模拟歌曲${i}`,
            alia: [`别名${i}`],
            ar: [{ id: i * 100, name: `模拟歌手${i}` }],
            al: { id: i * 1000, name: `模拟专辑${i}` },
            dt: Math.floor(Math.random() * 600000) + 120000, // 2-10分钟
            mv: Math.random() > 0.7 ? i * 10000 : 0
          };
          
          const privilege = {
            id: i,
            chargeInfoList: [{ chargeType: Math.random() > 0.8 ? 1 : 0 }],
            st: Math.random() > 0.9 ? -200 : 0
          };
          
          mockSongs.songs.push(song);
          mockSongs.privileges.push(privilege);
        }
        
        // 存储到localStorage
        localStorage.setItem('mockSongs', JSON.stringify(mockSongs));
      }
    },
    // 添加到喜欢列表
    addLove(song) {
      // 二次确认
      if (confirm(`确定要将歌曲《${song.name}》添加到喜欢列表吗？`)) {
        this.$http({
          url: '/like',
          methods: 'post',
          params: {
            id: song.id
          },
          data: {
            cookie: localStorage.getItem('cookie')
          }
        }).then(res => {
          
          if(res.data.code==200){
            alert("成功添加到喜欢列表")
          }else if(res.data.code==302){
            alert("请先登录")
          }else{
            alert("添加失败")
          }

        })
      }
    },
    // 双击切换到当前播放
    startSong(musicDetail, index) {
      if (musicDetail.id === this.songId) return;
      if (this.songsDetail.privileges[index].st == -200) {
        const h = this.$createElement;
        this.$message.error({
          message: h("p", null, [
            h("span", null, "因版权问题，该歌曲已下架"),
            h(
              "i",
              {
                style: "color: red",
              },
              ""
            ),
          ]),
          offset: 280,
          center: true,
          showClose: true,
        });
        return;
      }
      // 获得音乐url并保存到当前播放url
      this.getMusicUrl(musicDetail.id);
      // 保存到当前播放歌曲详情
      this.$store.dispatch("saveMusicDetail", musicDetail);
      // 保存到当前播放歌曲id
      this.$store.dispatch("saveSongId", musicDetail.id);
      // 放入历史歌单
      this.$store.dispatch("deleteHisListSong", musicDetail.id);
      this.$store.dispatch("unshiftHisMusicList", musicDetail);
      this.addList(musicDetail, index);
    },
    //加入歌单
    addList(musicDetail, index) {
      if (this.songsDetail.privileges[index].st == -200) {
        const h = this.$createElement;
        this.$message.error({
          message: h("p", null, [
            h("span", null, "因版权问题，该歌曲已下架"),
            h(
              "i",
              {
                style: "color: red",
              },
              ""
            ),
          ]),
          offset: 280,
          center: true,
          showClose: true,
        });
        return;
      }
      // 放入已经播放过的歌单
      this.$store.dispatch("deleteHasListSong", musicDetail.id);
      this.$store.dispatch("pushHasPlayList", musicDetail);
      // 放入当前播放歌单
      for (let song of this.playList) {
        if (song.id === musicDetail.id) {
          const h = this.$createElement;
          this.$message.error({
            message: h("p", null, [
              h("span", null, "列表中已存在该歌曲"),
              h(
                "i",
                {
                  style: "color: red",
                },
                ""
              ),
            ]),
            offset: 280,
            center: true,
            showClose: true,
          });
          return;
        }
      }
      this.$store.dispatch("pushPlayList", musicDetail);
    },
    //根据id获取音乐url
    async getMusicUrl(musicId) {
      await this.$http
        .get("song/url", {
          params: {
            id: musicId,
          },
        })
        .then((res) => {
          if (res.data.data[0].freeTrialInfo) {
            this.$store.dispatch("saveAur", [
              res.data.data[0].freeTrialInfo.start,
              res.data.data[0].freeTrialInfo.end,
            ]);
          } else {
            this.$store.dispatch("saveAur", [0, 0]);
          }
          this.$store.dispatch("saveMusicUrl", res.data.data[0].url);
        });
    },
    //获取指定页数歌曲
    getSongPage(offset, type) {
      this.$emit("getSongPage", offset, type);
    },
    //点击专辑跳转界面
    toAlbumPage(id) {
      this.$router.push("/home/albumPage/" + id);
    },
    //返回第一页
    backNumOne() {
      this.$refs.pagination.backNumOne();
    },
    //点击视频跳转界面
    toVideoPage(id) {
      this.$router.push("/home/videoPage/" + id);
    },
    //点击歌手跳转界面
    toArtistPage(id) {
      this.$router.push("/home/artistPage/" + id);
    }
  },
  created() {
    // 生成模拟歌曲数据
    this.generateMockSongs();
    this.getSongPage(0, "Song");
  },
};
</script>
  
<style scoped>
/* 标题 */

#songSearchHead {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #363636;
  opacity: 0.8;
}

/* 每行歌曲样式 */

.songMesSin {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #363636;
  opacity: 0.8;
  text-align: left;
  border: none;
  box-shadow: none;
}

.songMesDou {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #363636;
  opacity: 0.8;
  background: #f9f9f9;
  text-align: left;
  border: none;
  box-shadow: none;
}

.songMesSin:hover,
.songMesDou:hover {
  background: #f4f4f4;
  border: none;
  box-shadow: none;
}

/* 判断是否正在播放 */

.pauseSongName {
  position: absolute;
  width: 25%;
  left: 10%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #000000;
}

.startSongName {
  position: absolute;
  width: 25%;
  left: 10%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #ec4141 !important;
}

.noSongName {
  position: absolute;
  width: 25%;
  left: 10%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  color: #bababa !important;
}

.startSongAurtor {
  color: #507daf;
  width: 15%;
  left: 38%;
}

/* 歌曲操作 */

.songFunc {
  position: absolute;
  left: 30%;
}

/* 专辑 */
.albumName {
  position: absolute;
  width: 20%;
  left: 55%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;
  font-weight: 300;
}

/* 时长 */
.duration {
  position: absolute;
  left: 80%;
}

/* 行筛选标题行样式 */
.songRowHeader {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 5px;
}

.headerSelect {
  width: 5%;
  padding: 0 10px;
}

.headerTitle {
  width: 35%;
  padding: 0 10px;
}

.headerArtist {
  width: 20%;
  padding: 0 10px;
}

.headerAlbum {
  width: 25%;
  padding: 0 10px;
}

.headerDuration {
  width: 15%;
  padding: 0 10px;
}

/* 调整歌曲列表行的列宽 */
.pauseSongName, .startSongName, .noSongName {
  position: absolute;
  width: 30%;
  left: 8%;
  opacity: 0.9;
  /* 超出省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}

.startSongAurtor {
  color: #507daf;
  width: 20%;
  left: 38%;
}

.albumName {
  position: absolute;
  width: 25%;
  left: 58%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;
  font-weight: 300;
}

.duration {
  position: absolute;
  left: 83%;
}

/* 歌曲权限 */
.songRoot {
  position: absolute;
  left: 20px;
}
</style>
  