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
                            <i class="iconfont icon-lajitong" style="cursor: pointer" @click="deleteAllSearchHistory()"></i>
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
                <!-- 未登录 -->
                <div class="login" @click="showLogin = true" v-show="!this.cookie">
                    <el-avatar icon="el-icon-user-solid" class="userHead"></el-avatar>
                    <span>未登录</span>
                </div>
                <!-- 登录后 -->
                <div class="login" v-show="this.cookie" @click="showUserInfo = !showUserInfo">
                    <el-avatar :src="userInfo.avatarUrl" class="userHead"></el-avatar>
                    <span>{{ userInfo.nickname }}</span>
                </div>

                <div class="infom">
                    <!-- 点击后更换页面皮肤风格 -->
                    <i class="el-icon-s-opportunity" style="cursor: pointer;" @click="changeStyle()"></i>
                    <!-- 点击后显示消息 -->
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
        <!-- 登陆界面 -->
        <div class="login-modal" v-show="showLogin || showQrCode" >
            <!-- 手机号登录  暂不可用 -->
            <div class="modal-content" v-show="!showQrCode">
                <span class="close-button" @click="showLogin = false">×</span>
                <div class="input-container">
                    <input type="text" placeholder="请输入手机号" v-model="this.phone">
                    <input type="password" placeholder="请输入密码" v-model="this.password">
                </div>
                <button class="login-button" @click="login()">登录</button>
                <button class="login-button" @click="tryQrCode()">二维码登录</button>
            </div>
            <!-- 二维码登录页面 -->
            <div class="modal-content" v-show="showQrCode">
                <span class="close-button" @click="showQrCode = false;stopPolling=true">×</span>
                <img :src="qrCode" style="width: 200px;height: 200px;margin-bottom: 20px;" />
                <button class="login-button" @click="showQrCode = false;stopPolling=true">返回手机号登录</button>
            </div>
        </div>
        <!-- 登录后的用户信息,点击后出现下拉菜单，有一个退出登录选项-->
        <div class="user-info" v-show="showUserInfo" @click="logout()">
            退出登录
        </div>

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
            // 显示登录界面
            showLogin: false,
            // 手机号
            phone: '',
            // 密码
            password: '',
            // 二维码登录界面
            showQrCode: false,
            // 二维码key
            qrKey: '',
            // 二维码 base64
            qrCode: '',
            // 用户ID
            accountId: '',
            // 用户信息
            userInfo: {
                avatarUrl: '',
                nickname: ''
            },
            // 显示登陆后的用户信息
            showUserInfo: false,
            // 控制二维码轮询信号
            stopPolling: false,
        }
    },
    computed: {
        ...mapState(['searchHistory', 'cookie'])
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
        //播放下一首歌曲
        getNextSong() {
            this.$refs.musicPlay.getNextSong();
        },
        //清空播放栏的歌曲时长
        cleanDur() {
            this.$refs.musicPlay.cleanDur();
        },
        // 手机号登录
        login() {
            alert('手机号登录暂不可用,请使用二维码')
            this.$http.get('login/cellphone', {
                params: {
                    phone: this.phone,
                    password: this.password
                }
            }).then(() => {

            })
        },
        // 二维码登录
        // 1.二维码 key 生成接口
        getQrKey() {
            this.$http.get('/login/qr/key').then((res) => {
                if (res.data.code == 200) {
                    this.qrKey = res.data.data.unikey
                    this.getQrCode()
                }
                else {
                    alert('请求二维码key失败')
                }
            })
        },
        // 2.生成二维码
        getQrCode() {
            this.$http.get('/login/qr/create', {
                params: {
                    key: this.qrKey,
                    qrimg: 1 // 获取二维码图片的 base64 编码
                }
            }).then(res => {
                if (res.data.code === 200) {
                    this.qrCode = res.data.data.qrimg
                    this.checkQrCode()
                } else {
                    // 错误处理
                    alert('生成二维码失败')
                }
            })
        },
        // 3.轮询二维码扫码状态
        checkQrCode() {
            if (this.stopPolling) return;  // 停止轮询
            this.$http.get('/login/qr/check', {
                params: {
                    key: this.qrKey
                }
            }).then(res => {
                console.log(res)

                if (res.data.code === 801) {
                    // 等待扫码，继续轮询
                    setTimeout(() => {
                        this.checkQrCode()
                    }, 1000)
                } else if (res.data.code === 802) {
                    // 已扫码，待确认，继续轮询
                    setTimeout(() => {
                        this.checkQrCode()
                    }, 1000)
                } else if (res.data.code === 803) {
                    // 授权登录成功
                    this.loginSuccess(res.data.cookie)
                } else {
                    // 错误处理
                    alert('扫码出错')
                }
            })
        },
        // 4.授权登录成功
        loginSuccess(cookie) {

            // 存储 cookie
            this.$store.dispatch('setCookie', cookie)
            // 刷新页面状态
            this.$router.go(0)
        },
        // 获取用户详细信息
        getAccountInfo() {
            this.$http.post('/user/account', {
                cookie: localStorage.getItem('cookie')
            }).then((res) => {
                this.accountId = res.data.account.id
                this.getIdInfo()
                this.getUserPlaylist()
            })
        },
        // 获取ID详细信息
        getIdInfo() {
            this.$http({
                url: '/user/detail',
                methods: 'post',
                params: {
                    uid: this.accountId
                },
                data: {
                    cookie: localStorage.getItem('cookie')
                }
            }).then((res) => {
                this.userInfo.avatarUrl = res.data.profile.avatarUrl
                this.userInfo.nickname = res.data.profile.nickname
            })
        },
        // 退出登录
        logout() {
            this.$store.dispatch('setCookie', '')
            this.$router.go(0)
        },
        // 获取二维码
        tryQrCode(){
            this.getQrKey()
            this.showQrCode = true
            this.stopPolling=false
        },
        // 获取用户歌单
        getUserPlaylist() {
            console.log(this.accountId)
            this.$http({
                url: '/user/playlist',
                methods: 'post',
                params: {
                    uid: this.accountId
                },
                data: {
                    cookie: localStorage.getItem('cookie')
                }
            }).then((res) => {
                console.log(res)
                this.$store.dispatch("savePersonalList", res.data.playlist);
            }).catch((err) => {
                console.log(err)
            })
        },
    },
    created() {
        if (localStorage.getItem('cookie')) {
            this.getAccountInfo()
            
        }
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

.login-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 3001;
}

.modal-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
    background-color: #fff;
    border-radius: 10px;
    position: relative;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
    display: inline-block;
}

.input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.input-container input {
    width: 100%;
    height: 40px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.login-button {
    width: 100%;
    height: 40px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
}

.user-info {
    width: 160px;
    height: 40px;
    position: absolute;
    right: 20%;
    top: 60px;
    box-shadow: 0 0 10px #ccc;
    z-index: 100;
    line-height: 40px;
    cursor: pointer;
}
</style>