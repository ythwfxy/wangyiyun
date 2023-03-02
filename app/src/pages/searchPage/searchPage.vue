<template>
    <div class="searchPage">
        <div class="headTable">
            <el-menu :default-active="this.$route.path" class="el-menu-demo" mode="horizontal" :router="true">
                <el-menu-item index="/home/searchPage/searchBySong">单曲</el-menu-item>
                <el-menu-item index="/home/searchPage/searchBySinger">歌手</el-menu-item>
                <el-menu-item index="/home/searchPage/searchByVideo">视频</el-menu-item>
                <el-menu-item index="/home/searchPage/searchBySongList">歌单</el-menu-item>
            </el-menu>
        </div>
        <div>
            <router-view id="secondRoute" ref="songPage" :songAll="songAll" @getSongPage="getSongPage"> </router-view>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: "searchPage",
    props: {
        //搜索栏内容
        searchData: String,
    },
    data() {
        return {
            //歌曲总数及歌曲
            songAll: {
                //歌曲总数
                songCount: 0,
                //歌曲列表
                songList: [],
                //歌手总数
                singerCount: 0,
                //歌手列表
                singerList: [],
                //视频总数
                videoCount: 0,
                //视频列表
                videoList: [],
                //歌单总数
                songListCount: 0,
                //歌单列表
                songLists: [],
            },
        };
    },
    computed: {
        ...mapState({
            searchInfo: state => state.searchInfo,
        }),
    },
    methods: {
        //请求数据
        getSongPage(offset, type) {
            // 数据清空
            this.songAll.songList = [];
            this.songAll.singerList = [];
            this.songAll.songLists = [];
            this.songAll.videoList = [];
            console.log(type)
            switch (type) {
                //请求单曲数据
                case "Song":
                    this.$http
                        .get("/cloudsearch", {
                            params: {
                                keywords: this.searchInfo.trim(),
                                type: 1,
                                limit: 50,
                                offset: offset * 50,
                            },
                        })
                        .then((res) => {
                            console.log(res.data.result);
                            this.songAll.songCount = res.data.result.songCount;
                            this.songAll.songList = res.data.result.songs;
                        });
                    break;
                //请求歌手数据
                case "Singer":
                    this.$http
                        .get("/cloudsearch", {
                            params: {
                                keywords: this.searchInfo.trim(),
                                type: 100,
                                limit: 20,
                                offset: offset * 20,
                            },
                        })
                        .then((res) => {
                            console.log(res.data.result);
                            this.songAll.singerCount = res.data.result.artistCount;
                            this.songAll.singerList = res.data.result.artists;
                        });
                    break;
                //请求视频数据
                case "Video":
                    this.$http
                        .get("/cloudsearch", {
                            params: {
                                keywords: this.searchInfo.trim(),
                                type: 1014,
                                limit: 24,
                                offset: offset * 24,
                            },
                        })
                        .then((res) => {
                            console.log(res.data.result);
                            this.songAll.videoCount = res.data.result.videoCount;
                            this.songAll.videoList = res.data.result.videos;
                        });
                    break;
                // 请求歌单数据
                case "SongList":
                    this.$http
                        .get("/cloudsearch", {
                            params: {
                                keywords: this.searchInfo.trim(),
                                type: 1000,
                                limit: 20,
                                offset: offset * 20,
                            },
                        })
                        .then((res) => {
                            console.log(res.data.result);
                            this.songAll.songListCount = res.data.result.playlistCount;
                            this.songAll.songList = res.data.result.playlists;
                        });
                    break;
            }
        },
        backNumOne() {
            this.$refs.songPage.backNumOne();
        },
    },
}
</script>

<style scoped>
.headTable {
    display: grid;
    align-content: center;
    justify-content: center;
}

#secondRoute:hover {
    overflow-y: overlay;
}

#secondRoute {
    padding-right: 17px;
    padding-left: 3px;
    height: 90vh;
    width: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
}

.el-menu-item.is-active {
    border-color: #ec4141;
    font-size: 20px;
    font-weight: 400;
}

/* 整体的下划线进行隐藏 */

.el-menu.el-menu--horizontal {
    border-bottom: none;
}
</style>