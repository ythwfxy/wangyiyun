<template>
    <div class="singUp" v-if="FMList[count]">
        <div class="singUpLeft">
            <img :src="musicDetail.al.picUrl" alt="">
            <div class="tools">
                <!-- 一个圆形里面有个爱心的按钮 -->
                <div class="love" @click="addLove()" ref="love">
                    <div class="loveBtn">
                        <i class="iconfont icon-aixin"></i>
                    </div>
                </div>
                <!-- 一个圆形里面有个垃圾桶的按钮 -->
                <div class="delete">
                    <div class="deleteBtn">
                        <i class="iconfont icon-lajitong"></i>
                    </div>
                </div>
                <!-- 一个圆形里面有个下一首的按钮 -->
                <div class="next" @click="nextSong()">
                    <div class="nextBtn">
                        <i class="iconfont icon-xiayigexiayishou"></i>
                    </div>
                </div>
                <!-- 一个圆形里面有个播放按钮 -->
                <div class="play" @click="startSong(musicDetail)">
                    <div class="playBtn">
                        <i class="iconfont icon-bofang"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="singUpright">
            <div class="singInfo">
                <div class="singName">{{ FMList[count].name }}</div>
                <div class="singOther">
                    <div class="singer">歌手:{{ FMList[count].artists[0].name }}</div>
                    <div class="album">专辑:{{ FMList[count].album.name }}</div>
                </div>
                <div class="lyric">
                    <!--歌词-->
                    <div class="showLyric" ref="lyricScroll">
                        <ul ref="lyric" v-if="lrcObject.length > 1">
                            <li v-for="(item, index) in lrcObject" :key="index"
                                :style="{ color: lyricIndex === index ? 'red' : 'black', fontSize: lyricIndex === index ? '24px' : '20px' }">
                                {{ item.c }}
                            </li>
                        </ul>
                        <div v-else>未找到歌词</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            FMList: [],
            // 歌词
            lyrics: "",
            // 存放歌词数组
            lrcObject: [],
            // 计数
            count: 0,
            lyricIndex: 0,
            // 是否喜欢
            love: false,

        }
    },
    watch: {
        //切换了歌曲时
        songId() {
            this.lyricIndex = 0;
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
            //当前播放列表
            "playList",
            //当前播放歌曲id
            "songId",
            //是否在播放
            "isPlaying",
            //可播放区域
            "slider",
            // 当前进度条
            "nowDuration"
        ])
    },
    methods: {
        // 下一首
        async nextSong() {
            if (this.count === this.FMList.length - 1) {
                
                await this.getFM(false)
                this.count = 0
                
            }
            else {

                Promise.all([
                    this.getSongLyric(this.FMList[this.count + 1].id),
                    this.getSongDetail(this.FMList[this.count + 1].id),
                ]).then(() => {
                    this.startSong(this.musicDetail)
                    this.count++
                })
            }

        },
        // 获取私人FM
        async getFM(change) {
            const timestamp = new Date().getTime();
            await this.$http.post(`/personal_fm?timestamp=${timestamp}`, {
                cookie: localStorage.getItem('cookie'),
            }, ).then((res) => {
                console.log("FM", res)
                this.FMList = res.data.data
                if (change) {
                    for (let i = 0; i < this.FMList.length; i++) {
                        if (this.FMList[i].id == this.songId) {
                            this.count = i
                            this.getSongLyric(this.songId)
                            this.getSongDetail(this.songId)
                            return
                        }
                    }
                }

                Promise.all([
                    this.getSongLyric(this.FMList[0].id),
                    this.getSongDetail(this.FMList[0].id),
                ]).then(() => {
                    this.startSong(this.musicDetail)
                })

            })
        },
        //获取歌词
        async getSongLyric(id) {
            await this.$http
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
        // 切换到当前播放
        startSong(musicDetail) {
            if (musicDetail.id === this.songId) return;
            // 获得音乐url并保存到当前播放url
            this.getMusicUrl(musicDetail.id);
            // 保存到当前播放歌曲详情
            this.$store.dispatch("saveMusicDetail", musicDetail);
            // 保存到当前播放歌曲id
            this.$store.dispatch("saveSongId", musicDetail.id);
            // 放入历史歌单
            this.$store.dispatch("deleteHisListSong", musicDetail.id);
            this.$store.dispatch("unshiftHisMusicList", musicDetail);
            // 更改播放状态
            this.$store.dispatch("saveIsPlaying", true);
            this.addList(musicDetail);
        },
        //加入歌单
        addList(musicDetail) {
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
        async getMusicUrl(songId) {
            await this.$http
                .get("/song/url", {
                    params: {
                        id: songId
                    },
                })
                .then((res) => {
                    console.log("123", res)
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
        // 获取歌曲详细
        async getSongDetail(songId) {
            await this.$http.get("/song/detail", {
                params: {
                    ids: songId
                }
            }).then(res => {
                this.$store.dispatch("saveMusicDetail", res.data.songs[0]);
            })
        },
        // 添加到喜欢
        addLove() {
            this.love = !this.love
            this.$http({
                url: '/like',
                methods: 'post',
                params: {
                    id: this.FMList[this.count].id,
                },
                data: {
                    cookie: localStorage.getItem('cookie')
                }
            }).then(res => {
                // 改变爱心的颜色 喜欢状态为红色
                if (res.data.code == 200) {
                    if (this.love) {
                        this.$refs.love.style.color = 'red'
                    } else {
                        this.$refs.love.style.color = 'black'
                    }
                }
                else {
                    this.love = !this.love
                }

            })
        },
    },
    created() {

        this.getFM(true)
    }
}
</script> 

<style scoped>
li {
    list-style: none;
    margin-top: 15px;
}

.singUp {
    display: flex;
    overflow: hidden;
    height: 100%;
}

.singUpLeft {
    width: 50%;
    transform: translate(50px, 170px);
}

.singUpLeft img {
    width: 350px;
    height: 350px;
    border-radius: 2%;
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
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
    ;
}

.showLyric:hover {
    /* 鼠标悬停时显示滚动条 */
    overflow-y: overlay;
}

/* 将tools里面三个按钮横向排列 tools在图片下方 */
.tools {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    width: 350px;
    transform: translateX(230px);
}

/* 爱心按钮 */
.love {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #E9E9E9;
    cursor: pointer;
}

/* 垃圾桶按钮 */
.delete {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #E9E9E9;
    cursor: pointer;
}

/* 将图标居中并设置大小 */
i {
    font-size: 23px;
    position: relative;
    transform: translateY(30%);
    display: inline-block;
}

/* 下一首 */
.next {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #E9E9E9;
    cursor: pointer;
}

/* 播放 */
.play {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #E9E9E9;
    cursor: pointer;
}

.play i {
    font-size: 23px;
    position: relative;
    transform: translateY(0%);
    display: inline-block;
}
</style>