<template>
    <div class="singAll">
        <div class="singUp">
            <div class="singUpLeft">
                <img :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" src="@/assets/imgs/disc.png" alt="">
                <img :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" :src="musicDetail.al.picUrl" alt="">
            </div>
            <div class="singUpright">
                <div class="singInfo">
                    <div class="singName">{{ musicDetail.name || musicDetail.al.name }}</div>
                    <div class="singOther">
                        <div class="singer">歌手:{{ musicDetail.ar[0].name }}</div>
                        <div class="album">专辑:{{ musicDetail.alia[0] || musicDetail.al.name }}</div>
                    </div>
                    <div class="lyric">
                        <!--歌词-->
                        <div class="showLyric" ref="lyricScroll">
                            <ul ref="lyric" v-if="lrcObject.length > 1">
                                <li v-for="(item, index) in lrcObject" :key="index"
                                    :style="{ color: lyricIndex === index ? 'red' : 'black' }">
                                    {{ item.c }}
                                </li>
                            </ul>
                            <div v-else>未找到歌词</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="singDown">
            <commentInf :comment="comment" @getCommentPage="getCommentPage" class="comment"></commentInf>
            <loveSong class="infor" :simiList="simiList" :simiSong="simiSong"></loveSong>
        </div>
        <div class="commit" @click="showCommit = true">
            快点来说点什么吧
        </div>
        <div class="commit-wrapper" v-if="showCommit">
            <div class="commit-input-wrapper">
                <textarea v-model="myComment" type="text" class="commit-input" placeholder="请输入评论" />
                <button class="commit-button" @click="commitComment">提交</button>
                <span class="close-button" @click="showCommit = false">×</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import commentInf from '@/components/songPage/comment.vue';
import loveSong from '@/components/songPage/loveSong.vue';
export default {
    data() {
        return {
            // 歌词
            lyrics: "",
            // 存放歌词数组
            lrcObject: [],
            lyricIndex: 0,
            timerId: 0,
            // 相似歌单
            simiList: [],
            //歌曲评论
            comment: {},
            // 相似歌曲
            simiSong: [],
            // 评论界面显示
            showCommit: false,
            // 提交评论
            myComment: ''
        };
    },
    components: {
        commentInf,
        loveSong
    },
    watch: {
        //切换了歌曲时
        songId() {
            this.lyricIndex = 0;
            this.getSongLyric(this.songId);
            this.getSongComment(0);
            this.getSongSimi(this.songId);
            this.$refs.comment.backNumOne();
        },
        //歌曲进度条变化
        nowDuration() {
            //对每次进来的进度条进行判断
            // 跟下一句台词时长是否匹配,如果匹配则当前高亮的索引值+1
            //使用循环找到最接近当前播放时间的歌词
            for (let i = 0; i < this.lrcObject.length; i++) {
                //这里使用小于符号判断是为了 保证回退音乐进度事件的效果实现性
                if (this.nowDuration <= parseFloat(this.lrcObject[i].t)) {
                    if (this.lyricIndex === i - 1) {
                        break;
                    }
                    //找到比当前时间点 大一点的后一位的歌词的索引值
                    this.lyricIndex = i - 1;
                    //如果当前是最后一句歌词 代表歌曲要放送结束了 将我们的lyricIndex(当前歌词索引值还原成0便于下一曲使用)
                    if (this.lyricIndex === this.lrcObject.length - 1) {
                        this.lyricIndex = 0;
                    }
                    break;
                }
            }
        },
    },
    computed: {
        ...mapState([
            //当前播放歌曲url
            "musicUrl",
            //当前播放歌曲详情
            "musicDetail",
            //当前播放歌曲id
            "songId",
            //判断当前是否在播放 
            "isPlaying",
            //判断播放顺序模式
            "playOrd",
            //当前播放列表
            "playList",
            //已经播放过的列表
            "hasPlayList",
            //可播放范围
            "slider",
            //播放范围
            "playDur",
            //当前进度条
            "nowDuration",
        ]),
    },
    methods: {
        //获取歌词
        getSongLyric(id) {
            this.$http
                .get("/lyric", {
                    params: {
                        id: id,
                    },
                })
                .then((res) => {
                    this.lyrics = res.data.lrc.lyric;
                    this.createLrcObj(this.lyrics);
                });
        },
        //解析歌词
        createLrcObj(lrc) {
            var oLRC = {
                ms: [], //歌词数组{t:时间,c:歌词}
            };
            if (lrc.length == 0) return;
            var lrcs = lrc.split("\n"); //用回车拆分成数组 (每一句歌词都用换行隔开了)
            for (let i in lrcs) {
                //遍历歌词数组
                lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
                var arr = lrcs[i].match(/\[(\d+:.+?)\]/g); //提取时间字段，可能有多个
                var start = 0;
                for (let k in arr) {
                    start += arr[k].length; //计算歌词位置 长度叠加
                }
                var content = lrcs[i].substring(start); //获取歌词内容 相当于减去时间字符串的长度剩下的就是内容
                for (let k in arr) {
                    var t = arr[k].substring(1, arr[k].length - 1); //取[]间的内容
                    // var t = arr[k]
                    var s = t.split(":"); //分离:前后文字 便于计算成毫秒数
                    oLRC.ms.push({
                        //对象{t:时间,c:歌词}加入ms数组
                        // t: t,
                        t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
                        c: content === "" ? "\n" : content,
                    });
                }
            }
            oLRC.ms.sort(function (a, b) {
                //按时间顺序排序
                return a.t - b.t;
            });
            this.lrcObject = oLRC.ms;
        },
        // 获取歌曲评论
        getCommentPage(page) {
            console.log('songPage')
            this.$http
                .get("/comment/music", {
                    params: { id: this.songId, limit: 20, offset: page * 20 },
                })
                .then((res) => {
                    if (page == 0) {
                        this.comment = res.data;
                    } else {
                        this.comment.comments = res.data.comments;
                    }

                });
        },
        // 获取相似歌单
        getSimiList() {
            this.$http.get("/simi/playlist", {
                params: { id: this.songId }
            }).then((res) => {
                this.simiList = res.data.playlists
            })
        },
        // 获取相似音乐
        getSimiSong() {
            this.$http.get("/simi/song", {
                params: { id: this.songId }
            }).then((res) => {
                console.log(res)
                this.simiSong = res.data.songs
            })
        },
        // 提交评论
        commitComment() {
            if (!this.myComment) {
                alert("请输入内容")
                return
            }
            this.$http.get("/comment", {
                params: {
                    t: 1,
                    type: 0,
                    id: this.songId,
                    content: this.myComment,
                }
            }).then((res) => {
                console.log(res)
                if (res.data.status == 200) {
                    alert('提交成功')
                }
                else {
                    alert(res.data.msg)
                }
            })
        }
    },
    created() {
        this.getSongLyric(this.songId)
        this.getCommentPage(0)
        this.getSimiList()
        this.getSimiSong()
    }
}
</script>

<style scoped>
.singAll {
    position: fixed;
    height: 100vh;
    overflow-y: hidden;
    overflow-x: hidden;
    width: 1600px;
}

.singAll:hover {
    overflow-y: overlay;
}


li {
    list-style: none;
    margin-top: 15px;
}

.singUp {
    display: flex;
    overflow: hidden;
}

.singUpLeft {
    width: 50%;
    transform: translate(50px, 170px);
}

.singUpLeft img:first-child {
    width: 350px;
    height: 350px;
    animation-name: record;
    animation-duration: 20s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}
@keyframes record {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.singUpLeft img:last-child {
    position: relative;
    top: -77px;
    left: -270px;
    width: 195px;
    height: 195px;
    border-radius: 50%;
    animation-name: record;
    animation-duration: 20s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

.singInfo {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    /* 将内容对齐到 flex 容器的起始位置 */
    align-items: flex-start;
    height: 100%;
    margin-left: 30px;
}

.singName {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 10px;
}

.singOther {
    display: flex;
    align-items: center;
    font-size: 16px;
    margin-top: 10px;
}

.singer,
.album {
    margin-right: 20px;
}

.lyric {
    position: relative;
}

.showLyric {
    width: 350px;
    height: 385px;
    overflow: hidden;
    margin-top: 100px;
    transition: scrollTop 0.3s;
    padding-right: 20px;
    background-color: rgba(111, 147, 163, 0.3);
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3); ;
}

.showLyric:hover {
    /* 鼠标悬停时显示滚动条 */
    overflow-y: overlay;
}

.singDown {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.comment {
    width: 1200px;
}

.infor {
    width: 380px;
    flex: 1;
}

.commit {
    position: fixed;
    bottom: 15%;
    left: 50%;
    border-radius: 30px;
    background-color: #E9E9E9;
    padding: 15px 20px;
    cursor: pointer;
}

.commit-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    width: 300px;
    height: 300px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.commit-input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.commit-input {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 80%;
    font-size: 16px;
    height: 50%;
}


.commit-button {
    margin: 0 10px;
    padding: 10px;
    border-radius: 5px;
    color: #fff;
    background-color: #42b983;
    cursor: pointer;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
    display: inline-block;
}
</style>