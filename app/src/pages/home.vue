<template>
    <div @click="closeSuggest">
        <!-- 固定主页部分 -->
        <el-container>
            <!-- 头部 -->
            <el-header>
                <img src="@/assets/logo.jpg" alt="" id="logo">
                <span>网易云音乐</span>
                <div class="back">
                    <i class="el-icon-arrow-left"></i>
                </div>
                <div class="search" @mouseenter="isClose = false" @mouseleave="isClose = true">
                    <el-input v-model="input" style="opacity: 0.5" placeholder="请输入内容" @keyup.enter.native="search"
                        @focus="showSuggest = true"></el-input>
                    <i class="el-icon-search search-icon" @click="search"></i>
                    <div class="searchAbout" v-show="showSuggest && searchHistory.length > 0">
                        <div style="opacity: 0.6; font-size: 18px">
                            搜索历史
                            <i class="iconfont icon-lajitong" style="cursor: pointer"
                                @click="deleteAllSearchHistory()"></i>
                        </div>
                        <!-- 历史标签 -->
                        <div>
                            <div class="historyTag" v-for="(item, index) in searchHistory" :key="index">
                                <span style="color: #000; font-size: 15px" @click="toSearch(item)">{{
                                    item
                                }}</span>
                                <i class="el-icon-close" @click="deleteSearchHistory(item)"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="login">
                    <el-avatar icon="el-icon-user-solid" class="userHead"></el-avatar>
                    <span>未登录</span>
                </div>
                <div class="login-success">

                </div>

                <div class="infom">
                    <i class="el-icon-s-opportunity" style="cursor: pointer;"></i>
                    <i class="el-icon-message" style="cursor: pointer;"></i>
                </div>
            </el-header>
            <el-container>
                <!-- 左侧导航栏 -->
                <el-aside>
                    <leftNav></leftNav>
                </el-aside>
                <!-- 主要内容部分 -->
                <el-main>
                    <router-view ref="child" />
                </el-main>
            </el-container>
        </el-container>
        <musicPlay ref="musicPlay" @isShowSongList="isShowSongList"></musicPlay>
        <musicTable v-show="showSongList" @getNextSong="getNextSong" @cleanDur="cleanDur"></musicTable>
    </div>
</template>

<script>
import leftNav from '@/components/leftNav/leftNav'
import musicPlay from '@/components/musicPlay/musicPlay'
import musicTable from '@/components/musicPlay/musicTable'
import { mapState } from 'vuex'
export default {
    name: 'home',
    components: { leftNav, musicPlay, musicTable },
    data() {
        return {
            input: '',
            showSuggest: false,
            isClose: true,
            //是否显示歌单
            showSongList: false,
        }
    },
    computed: {
        ...mapState(['searchHistory'])
    },
    methods: {
        //是否展示歌单
        isShowSongList() {
            this.showSongList = !this.showSongList;
        },
        //关闭搜索建议
        closeSuggest() {
            if (!this.isClose) return;
            this.showSuggest = false;
        },
        //搜索并跳转到搜索界面
        search() {
            //判断为空不进行搜索
            if (this.input.trim() === "") return;
            // 关闭搜索建议
            this.showSuggest = false;
            //保存当前搜索数据到vuex
            this.$store.dispatch("saveSearchInfo", this.input);
            this.$store.dispatch("saveSearchHistory", this.input);
            //跳转到搜索界面
            if (this.$route.path !== "/home/searchPage/searchBySong") {
                this.$router.push({
                    name: "searchPage",
                });
            }
            //调用搜索页获取数据
            this.$refs.child.getSongPage(0, "Song");
            this.$refs.child.backNumOne();
        },
        // 选取历史记录搜索
        toSearch(item) {
            this.searchData = item;
            this.search();
        },
        //删除全部搜索记录
        deleteAllSearchHistory() {
            this.$store.dispatch("deleteAllSearchHistory");
        },
        //删除单个搜索记录
        deleteSearchHistory(item) {
            this.$store.dispatch("deleteSearchHistory", item);
        },
        //清空播放栏的歌曲时长
        cleanDur() {
            this.$refs.musicPlay.cleanDur();
        },
    }
}
</script>

<style>
.el-header {
    display: flex;
    position: relative;
    background-color: #c62f2f;
    padding-top: 5px;
}

.search {
    display: flex;
    margin-left: 50px;
    margin-top: 10px;
    width: 300px;
    position: relative;
}

#logo {
    width: 40px;
    height: 40px;
    margin-top: 5px;
    margin-left: 20px;
}

.el-header span {
    width: 100px;
    margin-left: 10px;
    margin-top: 15px;
    font-weight: 500;
    font-size: 20px;
    color: #ffffff;
}

.back {
    width: 25px;
    height: 25px;
    text-align: center;
    line-height: 25px;
    margin-top: 13px;
    margin-left: 30px;
    color: #ffffff;
    background: rgba(77, 71, 71, 0.1);
    border-radius: 50%;
    cursor: pointer;
}

.search-icon {
    cursor: pointer;

    color: white;
    position: relative;
    top: 7px;
    left: -24px;
}

.login {
    display: flex;
    position: absolute;
    right: 20%;
    cursor: pointer;
}

.login span {
    font-size: 16px;
}

.login .userHead {
    width: 40px !important;
    height: 40px;
    margin-top: 5px;
}

.infom {
    display: flex;
    font-size: 24px;
    text-align: center;
    margin-top: 13px;
    color: #ffffff;
    width: 100px;
    justify-content: space-between;
    position: absolute;
    right: 120px;
}

.searchAbout {
    position: absolute;
    top: 30px;
    left: 0;
    width: 120%;
    padding: 20px 15px;
    height: 400px;
    z-index: 100;
    overflow-y: overlay;
    overflow-y: auto;
    border-radius: 2%;
    box-shadow: #f0f0f0 0px 0px 1px 1px;
    background: #fff;
}

.historyTag {
    display: inline-block;
    margin-top: 20px;
    margin-right: 10px;
    border-radius: 20px;
    border: 1px solid #d8d8d8;
    padding: 5px 10px;
    opacity: 0.7;
    cursor: pointer;
}
</style>