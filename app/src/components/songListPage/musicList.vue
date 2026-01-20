<template>
  <div class="musicList">
    <div id="songSearchHead">
      <h3 style="position: absolute; left: 15%; color: #888888; font-size: 15px; margin: 0; font-weight: normal;">音乐标题</h3>
      <h3 style="position: absolute; left: 45%; color: #888888; font-size: 15px; margin: 0; font-weight: normal;">歌手</h3>
      <h3 style="position: absolute; left: 65%; color: #888888; font-size: 15px; margin: 0; font-weight: normal;">
        专辑
      </h3>
      <h3 style="position: absolute; left: 85%; color: #888888; font-size: 15px; margin: 0; font-weight: normal;">时长</h3>
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
      <div style="font-size: 10px; position: absolute; top: 20px; left: 28px; color: #ec4141"
        v-if="item.id === songId && isPlaying">
        <playAni />
      </div>
      <i class="iconfont icon-zanting" style="font-size: 10px; position: absolute; top: 2px; left: 28px; color: #ec4141"
        v-else-if="item.id === songId && !isPlaying"></i>
      <!-- 歌曲序号 -->
      <span style="
              font-size: 15px !important;
              position: absolute;
              top: 2px;
              left: 25px;
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
      <div style="
              width: 15%;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              word-break: break-all;
              position: absolute;
              left: 65%;
              cursor: pointer;
              font-weight: 300;
            " @click="toAlbumPage(item.al.id)">
        {{ item.al.name }}
      </div>
      <!-- 时长 -->
      <span style="position: absolute; right: 15%;">{{
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
    // 添加到喜欢列表
    addLove(song) {
      // 二次确认
      if (confirm(`确定要将歌曲 "${song.name}" 添加到喜欢列表吗？`)) {
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
    },
    // 生成模拟歌曲数据
    generateMockData() {
      // 检查localStorage中是否已有数据
      if (!localStorage.getItem('mockSongsData')) {
        const mockSongs = [];
        const songNames = ['歌曲1', '歌曲2', '歌曲3', '歌曲4', '歌曲5', '歌曲6', '歌曲7', '歌曲8', '歌曲9', '歌曲10'];
        const artistNames = ['歌手A', '歌手B', '歌手C', '歌手D', '歌手E'];
        const albumNames = ['专辑1', '专辑2', '专辑3', '专辑4', '专辑5'];
        
        // 生成50条模拟歌曲数据
        for (let i = 1; i <= 50; i++) {
          const song = {
            id: 10000000 + i,
            name: `${songNames[Math.floor(Math.random() * songNames.length)]}${i}`,
            ar: [
              {
                id: 10000 + Math.floor(Math.random() * 5),
                name: artistNames[Math.floor(Math.random() * artistNames.length)]
              }
            ],
            al: {
              id: 20000 + Math.floor(Math.random() * 5),
              name: albumNames[Math.floor(Math.random() * albumNames.length)]
            },
            dt: 180000 + Math.floor(Math.random() * 180000), // 3-6分钟
            mv: Math.random() > 0.5 ? 1000 + i : 0,
            privileges: [
              {
                chargeInfoList: [
                  {
                    chargeType: Math.random() > 0.5 ? 0 : 1
                  }
                ],
                st: 0
              }
            ]
          };
          mockSongs.push(song);
        }
        
        // 存储到localStorage
        localStorage.setItem('mockSongsData', JSON.stringify(mockSongs));
        console.log('模拟歌曲数据已生成并存储到localStorage');
      } else {
        console.log('localStorage中已有模拟歌曲数据');
      }
    },
  },
  created() {
    this.getSongPage(0, "Song");
    // 生成并存储模拟歌曲数据到localStorage
    this.generateMockData();
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  box-sizing: border-box;
  background: #fafafa;
  border-bottom: 2px solid #f0f0f0;
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
  border-bottom: 1px solid #f0f0f0;
}

.songMesDou {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: #363636;
  opacity: 0.8;
  background: #ffffff;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.songMesSin:hover,
.songMesDou:hover {
  background: #f8f8f8;
}

/* 判断是否正在播放 */

.pauseSongName {
  position: absolute;
  width: 25%;
  left: 15%;
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
  left: 15%;
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
  left: 15%;
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
  position: absolute;
  left: 45%;
  width: 15%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}

/* 歌曲操作 */

.songFunc {
  position: absolute;
  right: 10%;
}

/* 歌曲权限 */
.songRoot {
  position: absolute;
  left: 10%;
}
</style>
  