<template>
    <div class="songListPage">
      <!-- 歌单细节 -->
      <listDetail :playList="playList" :songsDetail="songsDetail" />
      <!-- 导航栏 -->
      <menuTab ref="menuTab" @changeActive="changeActive" :commentCount="comment.total" />
      <!-- 歌曲列表 -->
      <div>
        <musicList v-show="activeIndex === '1'" :songsDetail="songsDetail" />
        <!-- 评论 -->
        <comment
          :comment="comment"
          v-show="activeIndex === '2'"
          @getCommentPage="getCommentPage"
          :currentId = "currentId"
        />
      </div>
      <br /><br /><br /><br /><br /><br />
    </div>
  </template>
  
  <script>
  import listDetail from "@/components/songListPage/listDetail";
  import menuTab from "@/components/songListPage/menuTab";
  import musicList from "@/components/songListPage/musicList";
  import comment from "@/components/songListPage/comment";
  export default {
    name: "songListPage",
    components: {
      listDetail,
      menuTab,
      musicList,
      comment,
    },
    watch: {
      $route: function (newVal, oldVal) {
        this.currentId = newVal.params.id; 
        if (newVal.params.id != oldVal.params.id) {
          this.queryIds = "";
          this.getPlayListDetail();
        }
      },
    },
    data() {
      return {
        // 传入的id
        currentId: this.$route.params.id,
        // 歌单数据
        playList: {},
        // 导航页面
        activeIndex: "1",
        // 请求的歌曲id
        queryIds: "",
        // 歌曲数据
        songsDetail: {},
        // 评论数据
        comment: {},
      };
    },
    methods: {
      // 获取歌单详情数据
      async getPlayListDetail() {
        // 如果是测试路由/home/songList/1，使用模拟数据
        if (this.currentId === '1') {
          // 从localStorage获取模拟歌曲数据
          let mockSongsData = localStorage.getItem('mockSongsData');
          
          // 如果localStorage中没有模拟数据，先生成数据
          if (!mockSongsData) {
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
            mockSongsData = JSON.stringify(mockSongs);
            localStorage.setItem('mockSongsData', mockSongsData);
            console.log('模拟歌曲数据已生成并存储到localStorage');
          }
          
          const mockSongs = JSON.parse(mockSongsData);
          // 模拟歌单详情数据
          this.playList = {
            id: 1,
            name: '测试歌单',
            trackIds: mockSongs.map(song => ({ id: song.id }))
          };
          // 模拟歌曲详情数据
          this.songsDetail = {
            songs: mockSongs,
            privileges: mockSongs.map(song => song.privileges[0])
          };
          console.log('使用模拟数据');
          this.getCommentPage(0);
          return;
        }
        
        // 正常请求接口
        await this.$http
          .get("playlist/detail", {
            params: {
              id: this.currentId,
            },
          })
          .then((res) => {
            console.log(res.data);
            this.playList = res.data.playlist;
            this.playList.trackIds.forEach((item) => {
              this.queryIds += item.id + ",";
            });
          });
        this.getSongDetail();
        this.getCommentPage(0);
      },
      // 获取歌曲数据
      getSongDetail() {
        this.$http
          .get("song/detail", {
            params: {
              ids: this.queryIds.substr(0, this.queryIds.length - 1),
            },
          })
          .then((res) => {
            console.log(res.data);
            this.songsDetail = res.data;
          });
      },
      // 获取评论数据
      getCommentPage(page) {
        this.$http
          .get("comment/playlist", {
            params: {
              id: this.currentId,
              limit: 20,
              offset: page * 20,
            },
          })
          .then((res) => {
            if (page == 0) {
              this.comment = res.data;
            } else {
              this.comment.comments = res.data.comments;
            }
            console.log(res.data);
          });
      },
      // 改变导航栏
      changeActive(index) {
        this.activeIndex = index;
      },
    },
    created() {
      this.getPlayListDetail();
    },
  };
  </script>
  
  <style scoped>
  .songListPage {
    height: 100vh;
    width: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    padding-right: 17px;
    padding-left: 3px;
  }
  .songListPage:hover {
    overflow-y: overlay;
  }
  </style>
  