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
      // 获取歌单详情数据（含模拟数据）
      async getPlayListDetail() {
        // 先尝试从localStorage获取模拟的歌单数据
        const mockData = this.getMockPlaylistData(this.currentId);
        if (mockData) {
          this.playList = mockData.playlist;
          this.playList.trackIds.forEach((item) => {
            this.queryIds += item.id + ",";
          });
          this.getMockSongDetail();
          this.getMockCommentPage(0);
          return;
        }

        // 如果没有模拟数据，使用真实接口
        try {
          const res = await this.$http.get("playlist/detail", {
            params: {
              id: this.currentId,
            },
          });
          console.log(res.data);
          this.playList = res.data.playlist;
          this.playList.trackIds.forEach((item) => {
            this.queryIds += item.id + ",";
          });
          this.getSongDetail();
          this.getCommentPage(0);
        } catch (error) {
          console.error("获取歌单详情失败", error);
        }
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
      // 获取模拟歌单数据
      getMockPlaylistData(id) {
        const playlistId = parseInt(id);
        // 如果是歌单广场的模拟数据（id 1-50）
        if (playlistId >= 1 && playlistId <= 50) {
          const artists = ['周杰伦', '陈奕迅', '林俊杰', '邓紫棋', '薛之谦', '李荣浩', '毛不易', '张靓颖', '蔡徐坤', 'TFBOYS'];
          const songNames = ['晴天', '富士山下', '江南', '光年之外', '演员', '李白', '消愁', '画心', '情人', '青春修炼手册'];
          const albums = ['叶惠美', 'What\'s Going On...?', '第二天堂', '光年之外', '绅士', '模特', '平凡的一天', '画心', '情人', '青春修炼手册'];
          
          // 生成随机歌曲
          const trackCount = Math.floor(Math.random() * 200) + 10;
          const trackIds = [];
          const tracks = [];
          
          for (let i = 1; i <= trackCount; i++) {
            const artist = artists[Math.floor(Math.random() * artists.length)];
            trackIds.push({ id: 1000 + i });
            tracks.push({
              id: 1000 + i,
              name: `${songNames[Math.floor(Math.random() * songNames.length)]} ${i}`,
              ar: [{ id: i, name: artist }],
              al: {
                id: i,
                name: albums[Math.floor(Math.random() * albums.length)],
                picUrl: `https://picsum.photos/seed/album${i}/300/300.jpg`
              },
              dt: (Math.floor(Math.random() * 300) + 120) * 1000,
              alia: [],
              mv: 0
            });
          }
          
          return {
            playlist: {
              id: playlistId,
              name: `精选歌单 ${playlistId}`,
              coverImgUrl: `https://picsum.photos/seed/playlist${playlistId}/300/300.jpg`,
              playCount: Math.floor(Math.random() * 10000000) + 10000,
              trackCount: trackCount,
              trackIds: trackIds,
              tracks: tracks,
              creator: {
                nickname: '网易云音乐'
              },
              tags: ['华语', '流行', '摇滚', '民谣', '电子'][Math.floor(Math.random() * 5)],
              description: '这是一个精选歌单，包含了各种好听的歌曲。'
            }
          };
        }
        return null;
      },
      // 获取模拟歌曲详情
      getMockSongDetail() {
        const trackIds = this.playList.trackIds.map(item => item.id);
        const songs = this.playList.tracks;
        
        this.songsDetail = {
          songs: songs,
          privileges: trackIds.map(id => ({
            id: id,
            fee: 0,
            payed: 0,
            st: 0,
            pl: 320000,
            dl: 320000,
            sp: 7,
            cp: 1,
            subp: 1,
            cs: false,
            maxbr: 320000,
            fl: 320000,
            toast: false,
            flag: 0,
            preSell: false,
            playMaxbr: 320000,
            downloadMaxbr: 320000,
            freeTrialPrivilege: {},
            rightSource: 0,
            chargeInfoList: [{ chargeType: 0 }]
          }))
        };
      },
      
      // 获取模拟评论
      getMockCommentPage(page) {
        const comments = [];
        const userNames = ['音乐爱好者', '听歌达人', 'DJ小明', '网易云用户', '音乐发烧友', '歌单收藏家', '每日推荐', '发现好音乐', '私人FM', '乐评人'];
        
        for (let i = 1; i <= 20; i++) {
          comments.push({
            user: {
              userId: 1000 + i,
              nickname: userNames[Math.floor(Math.random() * userNames.length)],
              avatarUrl: `https://picsum.photos/seed/user${i}/100/100.jpg`
            },
            content: '这个歌单太好听了！推荐给大家~',
            time: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
            likedCount: Math.floor(Math.random() * 1000),
            beReplied: []
          });
        }
        
        if (page === 0) {
          this.comment = {
            comments: comments,
            hotComments: comments.slice(0, 5),
            total: 100,
            more: true
          };
        } else {
          this.comment.comments = comments;
        }
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
  