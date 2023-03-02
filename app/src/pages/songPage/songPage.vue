<template>
    <div class="singAll">
        <div class="singUp">
            <div class="singUpLeft">
                <img src="@/assets/imgs/disc.png" alt="">
                <img :src="musicDetail.al.picUrl" alt="">
            </div>
            <div class="singUpright">
                <div class="singInfo">
                    <div class="singName">歌名</div>
                    <div class="singOther">
                        <div class="singer">歌手:名字啊</div>
                        <div class="album">专辑:专辑的名字</div>
                        <div class="froms">来源:搜索</div>
                    </div>
                    <div class="lyric">
                        <!--歌词-->
                        <div class="showLyric" ref="lyricScroll">
                            <ul ref="lyric" v-if="lrcObject.length > 1">
                                <li v-for="(item, index) in lrcObject" :key="index"
                                    :style="{ color: lyricIndex === index ? 'red' : 'black' }"
                                    :ref="[lyricIndex === index ? 'lyricRef' : '']">
                                    {{ item.c }}
                                </li>
                            </ul>
                            <div v-else>未找到歌词</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="singDown">
                <div class="comment"></div>
                <div class="intro"></div>
            </div>

        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            // 歌词
            lyrics: "",
            // 存放歌词数组
            lrcObject: [],
            lyricIndex: 0,
            timerId: 0,
            // 相似信息
            simiInfo: [],
            //歌曲评论
            comment: {},
        };
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
                    console.log(res.data);
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
    },
    mounted() {
        this.getSongLyric(this.songId)
    }
}
</script>

<style scoped>
/*滚动条样式*/
::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
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
    transform: translate(50px,170px);
}

.singUpLeft img:first-child {
    width: 350px;
    height: 350px;
}

.singUpLeft img:last-child {
    position: relative;
    top: -77px;
    left: -270px;
    width: 195px;
    height: 195px;
    border-radius: 50%;
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
.album,
.froms {
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
}
.showLyric:hover {
    /* 鼠标悬停时显示滚动条 */
    overflow-y: overlay;
}


</style>