<template>
    <div class="musicPlay">
        <audio ref="audio" :src="musicUrl" autoplay class="musicAudio" @timeupdate="durationUpdate"
            @ended="getNextSong"></audio>
        <div class="songDetail" v-show="musicDetail.al.picUrl !== ''">
            <!-- 封面 -->
            <el-image :src="musicDetail.al.picUrl" fit="fill"
                style="border-radius: 10%; height: 57px; width: 57px; cursor: pointer;" @click="toSongPage()"></el-image>
            <!-- 歌曲名 -->
            <div class="songName">
                <span style="color: #000000; cursor: pointer; margin-left: 10px; margin-right: 4px">{{
                    musicDetail.name
                }}</span>
                <span style="cursor: pointer">{{
                    !musicDetail.alia[0] ? "" : "(" + musicDetail.alia[0] + ")"
                }}</span>
            </div>
            <!-- 作者名 -->
            <div class="authorName">
                <span v-for="(item, index) in musicDetail.ar" :key="index" style="cursor: pointer; font-size: 5px">{{
                    index === 0 ? item.name : "/" + item.name }}</span>
            </div>

        </div>
        <div class="audioMain">
            <!-- 播放方式 -->
            <div @click="changeOrd">
                <el-tooltip class="ways" effect="light" content="顺序播放" placement="top" :open-delay="500">
                    <div class="playOrd" v-show="playOrd === 0">
                        <i class="iconfont icon-shunxubofang"></i>
                    </div>
                </el-tooltip>
                <el-tooltip class="ways" effect="light" content="列表循环" placement="top" :open-delay="500">
                    <div class="playOrd" v-show="playOrd === 1">
                        <i class="iconfont icon-liebiaoxunhuan"></i>
                    </div>
                </el-tooltip>
                <el-tooltip class="ways" effect="light" content="单曲循环" placement="top" :open-delay="500">
                    <div class="playOrd" v-show="playOrd === 2">
                        <i class="iconfont icon-danquxunhuan"></i>
                    </div>
                </el-tooltip>
                <el-tooltip class="ways" effect="light" content="随机播放" placement="top" :open-delay="500">
                    <div class="playOrd" v-show="playOrd === 3">
                        <i class="iconfont icon-suijibofang"></i>
                    </div>
                </el-tooltip>
            </div>
            <!-- 上一首 -->
            <div class="lastSong" @click="getBackSong">
                <i class="iconfont icon-shangyishoushangyige"></i>
            </div>
            <!-- 播放暂停 -->
            <div class="pause" v-if="isPlaying && songId !== ''" @click="pauseSong">
                <i class="iconfont icon-zanting"></i>
            </div>
            <div class="play" v-else @click="playSong">
                <i class="iconfont icon-bofang"></i>
            </div>
            <!-- 下一首 -->
            <div class="nextSong" @click="getNextSong">
                <i class="iconfont icon-xiayigexiayishou"></i>
            </div>
            <!-- 词 -->
            <div class="showCi">
                <span>词</span>
            </div>

        </div>
        <!-- 播放进度条 -->
        <span style="position: absolute; right: 72%; bottom: 12%; opacity: 0.7">{{
            this.musicDetail.name === "" ? 0 : this.musicDuration | timeFormat
        }}</span>
        <div id="playSlider">
            <el-slider v-model="musicDuration" :max="Math.floor(this.musicDetail.dt / 1000)" :show-tooltip="false"
                :marks="slider" @change="changeMusicDuration" @mousedown.native="isChange = true"
                @mouseleave.native="isChange = false" @mouseup.native="isChange = false"></el-slider>
        </div>
        <span style="position: absolute; left: 72%; bottom: 12%; opacity: 0.7">{{
            this.musicDetail.name === ""
            ? 0
            : this.musicDetail.dt | myFilter
        }}</span>
        <!-- 声音 -->
        <div class="volume">
            <i class="iconfont icon-laba" v-show="volumeVal !== 0" @click="muteVolume"
                style="font-size: 25px; cursor: pointer; left: 50px; position: absolute"></i>
            <i class="iconfont icon-jingyin" v-show="volumeVal === 0" @click="cancelMute"
                style="font-size: 29px;cursor: pointer;left: 50px;margin-top: -2px;position: absolute;"></i>
            <el-slider :max="100" :step="1" style="position: absolute; top: -7px; right: 0px; width: 100px"
                v-model="volumeVal" @change="changeVolume"></el-slider>
        </div>
        <!-- 打开播放列表 -->
        <el-tooltip class="ways" effect="light" content="打开播放列表" placement="top" :open-delay="500">
            <i class="iconfont icon-24gf-playlist2" @click="isShowSongList"
                style="position: absolute;right: 45px;top: 30px;font-size: 24px;cursor: pointer;"></i>
        </el-tooltip>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: 'musicPlay',
    data() {
        return {
            // 歌曲当前时长
            musicDuration: 0,
            //判断是否被拖动
            isChange: false,
            //音量值
            volumeVal: 50,
            //当前音量
            nowVolume: 50,
        }
    },
    watch: {
        musicUrl() {
            this.$store.dispatch("saveIsPlaying", true);
        }
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
            // 历史播放列表
            "hisMusicList"
        ])
    },
    methods: {
        //变化播放模式
        changeOrd() {
            if (this.playOrd === 3) return this.$store.dispatch("savePlayOrd", 0);
            this.$store.dispatch("savePlayOrd", this.playOrd + 1);
        },
        //更新当前时长
        durationUpdate() {
            if (this.isChange === true) return;
            this.musicDuration = this.$refs.audio.currentTime + this.playDur[0];
            this.$store.dispatch("saveNowDuration", this.musicDuration);
            // this.musicDuration++;
        },
        //清除时长
        cleanDur() {
            this.musicDuration = 0;
            setTimeout(() => {
                this.$store.dispatch("deleteAllList");
            }, 20);
        },
        //展示当前播放歌单
        isShowSongList() {
            this.$emit("isShowSongList");
        },
        //鼠标拖拽松开时
        changeMusicDuration() {
            if (this.musicAllDuration === 0) {
                const h = this.$createElement;
                this.$message.error({
                    message: h("p", null, [
                        h("span", null, "列表中没有要播放的歌曲"),
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
            this.$refs.audio.currentTime = this.musicDuration - this.playDur[0];
            this.isChange = false;
        },
        //音量改变时
        changeVolume() {
            this.nowVolume = this.volumeVal;
            this.$refs.audio.volume = this.volumeVal / 100;
        },
        //静音
        muteVolume() {
            this.volumeVal = 0;
            this.$refs.audio.volume = this.volumeVal / 100;
        },
        // 恢复静音
        cancelMute() {
            this.volumeVal = this.nowVolume;
            this.$refs.audio.volume = this.volumeVal / 100;
        },
        // 播放音乐
        playSong() {
            if (!this.musicUrl) {
                const h = this.$createElement;
                this.$message.error({
                    message: h("p", null, [
                        h("span", null, "列表中没有可播放的歌曲"),
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
            this.$store.dispatch("saveIsPlaying", true);
            this.$refs.audio.play();
        },
        // 暂停音乐
        pauseSong() {
            this.$store.dispatch("saveIsPlaying", false);
            this.$refs.audio.pause();
        },
        //获取下一首歌曲
        getNextSong() {
            switch (this.playOrd) {
                case 0:
                    this.ordPlay();
                    break;
                case 1:
                    this.cirPlay();
                    break;
                case 2:
                    this.rePlaySong();
                    break;
                case 3:
                    this.randomPlay();
                    break;
            }
        },
        //获取上一首歌曲
        getBackSong() {
            switch (this.playOrd) {
                case 0:
                    this.reOrdPlay();
                    break;
                case 1:
                    this.reCirPlay();
                    break;
                case 2:
                    this.reCirPlay();
                    break;
                case 3:
                    this.randomPlay();
                    break;
            }
        },
        //顺序播放
        ordPlay() {
            let index = 0;
            for (let i = 0; i < this.playList.length; i++) {
                if (this.songId === this.playList[i].id) {
                    index = i;
                    break;
                }
            }
            if (index === this.playList.length - 1) {
                const h = this.$createElement;
                this.$message.error({
                    message: h("p", null, [
                        h("span", null, "已经是列表最后一首歌曲"),
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
            this.startSong(this.playList[index + 1]);
        },
        //顺序播放的上一首歌曲
        reOrdPlay() {
            let index = 0;
            for (let i = 0; i < this.playList.length; i++) {
                if (this.songId === this.playList[i].id) {
                    index = i;
                    break;
                }
            }
            if (index === 0) {
                const h = this.$createElement;
                this.$message.error({
                    message: h("p", null, [
                        h("span", null, "已经是列表第一首歌曲"),
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
            this.startSong(this.playList[index - 1]);
        },
        // 列表循环
        cirPlay() {
            let index = 0;
            for (let i = 0; i < this.playList.length; i++) {
                if (this.songId === this.playList[i].id) {
                    index = i;
                    break;
                }
            }
            if (index === this.playList.length - 1) {
                this.startSong(this.playList[0]);
                return;
            }
            this.startSong(this.playList[index + 1]);
        },
        //列表循环的上一首歌曲
        reCirPlay() {
            let index = 0;
            for (let i = 0; i < this.playList.length; i++) {
                if (this.songId === this.playList[i].id) {
                    index = i;
                    break;
                }
            }
            if (index === 0) {
                this.startSong(this.playList[this.playList.length - 1]);
                return;
            }
            this.startSong(this.playList[index - 1]);
        },
        //重复播放音乐
        rePlaySong() {
            this.$store.dispatch("saveIsPlaying", true);
            this.$refs.audio.load();
        },
        //随机播放
        randomPlay() {
            //接受子组件传来的数据
            if (this.hasPlayList.length === 1) {
                this.$store.dispatch("sameHasAndPlay");
            }
            // 在已经播放过的列表中删除歌曲防止重复播放
            this.$store.dispatch("deleteHasListSong", this.songId);
            // 获取随机
            const index = this.getRandom(0, this.hasPlayList.length - 1);
            //放入历史播放
            this.$store.dispatch("deleteHisListSong", this.hasPlayList[index].id);
            this.$store.dispatch("unshiftHisMusicList", this.hasPlayList[index]);
            //获取随机歌曲url并保存
            this.getMusicUrl(this.hasPlayList[index].id);
            //保存到当前播放歌曲详情
            this.$store.dispatch("saveMusicDetail", this.hasPlayList[index]);
            //保存当前歌曲id
            this.$store.dispatch("saveSongId", this.hasPlayList[index].id);
        },
        //随机数
        getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        // 开始播放
        startSong(musicDetail) {
            if (musicDetail.id === this.songId) return; 
            // 获得音乐url
            this.getMusicUrl(musicDetail.id); 
            // 保存到当前播放歌曲详情
            this.$store.dispatch("saveMusicDetail", musicDetail);
            // 保存到当前播放歌曲id
            this.$store.dispatch("saveSongId", musicDetail.id);
            // 放入历史歌单
            this.$store.dispatch("deleteHisListSong", musicDetail.id);
            this.$store.dispatch("unshiftHisMusicList", musicDetail);
            // 放入已经播放过的歌单
            this.$store.dispatch("deleteHasListSong", musicDetail.id);
            this.$store.dispatch("pushHasPlayList", musicDetail);
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
        toSongPage() {
            this.$router.push('/home/songPage')
        }
    },
    mounted() {
        // 若有歌曲变为已播放
        if (this.musicUrl == "") return;
        this.$store.dispatch("saveIsPlaying", true);
    },
}
</script>

<style>
.musicPlay {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 80px;
    background-color: #f6f6f8;
    z-index: 3000;
}

.play,
.pause {
    cursor: pointer;
    background: #ebebed;
    border-radius: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
}

.play:hover,
.pause:hover {
    background: #ddddde;
}

.playOrd,
.lastSong,
.nextSong {
    cursor: pointer;
    border-radius: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
}

.playOrd,
.lastSong,
.nextSong,
.showCi {
    color: #ed6566;
}

.showCi {
    cursor: pointer;
    border-radius: 100%;
    height: 40px;
    line-height: 36px;
    text-align: center;
}

#playSlider {
    position: absolute;
    width: 43%;
    bottom: 1%;
    left: 50%;
    transform: translateX(-50%);
}

.audioMain {
    display: grid;
    width: 280px;
    grid-template-columns: repeat(5, 1fr);
    column-gap: 20px;
    margin-top: 1%;
    margin-left: 50%;
    transform: translateX(-50%);
}

.playSlider {
    position: absolute;
    width: 43%;
    bottom: 1%;
    left: 50%;
    transform: translateX(-50%);
}

.songDetail {
    position: absolute;
    top: 13px;
    left: 30px;
}

.songName {
    position: absolute;
    width: 160px;
    top: 4px;
    left: 60px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;

}

.authorName {
    position: absolute;
    width: 160px;
    bottom: 7px;
    left: 68px;
    opacity: 0.8;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    color: #949495;
    font-size: 12px;
}

.volume {
    position: absolute;
    width: 200px;
    height: 20px;
    right: 105px;
    top: 30px;
}
</style>