import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const state = {
    saveMusicUrl: '',
    searchInfo: sessionStorage.getItem('searchInfo') ? JSON.parse(sessionStorage.getItem('searchInfo')) : '',
    searchHistory: sessionStorage.getItem('searchHistory') ? JSON.parse(sessionStorage.getItem('searchHistory')) : [],
    //当前播放歌曲详情
    musicDetail: sessionStorage.getItem('musicDetail') ? JSON.parse(sessionStorage.getItem('musicDetail')) : {
        al: {
            name: "",
            picUrl: "",
        },
        ar: [""],
        alia: {
            name: "",
        },
        name: "",
    },
    //当前歌曲id
    songId: sessionStorage.getItem('songId') ? JSON.parse(sessionStorage.getItem('songId')) : "",
    // 删除历史播放歌曲
    deleteHisListSong(state, songId) {
        for (let song of state.hisMusicList) {
            if (song.id === songId) {
                let index = state.hisMusicList.indexOf(song);
                if (index !== -1) {
                    state.hisMusicList.splice(index, 1);
                    break;
                }
            }
        }
    },
    //历史歌曲播放列表
    hisMusicList: sessionStorage.getItem('hisMusicList') ? JSON.parse(sessionStorage.getItem('hisMusicList')) : [],
    //播放过的歌曲歌单(避免上一首或者随机播放播放到重复的歌曲)
    hasPlayList: sessionStorage.getItem('hasPlayList') ? JSON.parse(sessionStorage.getItem('hasPlayList')) : [],
    // 播放列表
    playList: sessionStorage.getItem('playList') ? JSON.parse(sessionStorage.getItem('playList')) : [],
    // 试听片段开始和结束时间
    slider: sessionStorage.getItem('slider') ? JSON.parse(sessionStorage.getItem('slider')) : {},
    playDur: sessionStorage.getItem('playDur') ? JSON.parse(sessionStorage.getItem('playDur')) : {},
    //当前播放歌曲url
    musicUrl: sessionStorage.getItem('musicUrl') ? JSON.parse(sessionStorage.getItem('musicUrl')) : "",
    // 播放状态
    isPlaying: false,
    //判断播放顺序模式
    playOrd: sessionStorage.getItem('playOrd') ? JSON.parse(sessionStorage.getItem('playOrd')) : 0,
    //歌曲当前进度
    nowDuration: 0,
}
const mutations = {
    // 保存当前搜索信息
    saveSearchInfo(state, searchInfo) {
        state.searchInfo = searchInfo
    },
    // 保存搜索历史
    saveSearchHistory(state, searchHistory) {
        for (let searchHisInfo of state.searchHistory) {
            if (searchHisInfo === searchHistory) {
                let index = state.searchHistory.indexOf(searchHisInfo);
                if (index !== -1) {
                    state.searchHistory.splice(index, 1);
                    break;
                }
            }
        }
        state.searchHistory.unshift(searchHistory)
    },
    // 保存当前正在播放的音乐细节
    saveMusicDetail(state, musicDetail) {
        state.musicDetail = musicDetail
    },
    // 保存当前正在播放的歌曲id
    saveSongId(state, songId) {
        state.songId = songId
    },
    // 删除历史播放歌曲
    deleteHisListSong(state, songId) {
        for (let song of state.hisMusicList) {
            if (song.id === songId) {
                let index = state.hisMusicList.indexOf(song);
                if (index !== -1) {
                    state.hisMusicList.splice(index, 1);
                    break;
                }
            }
        }
    },
    // 添加历史记录播放列表
    unshiftHisMusicList(state, hisMusicList) {
        state.hisMusicList.unshift(hisMusicList);
    },
    // 删除已经播放歌曲
    deleteHasListSong(state, songId) {
        for (let song of state.hasPlayList) {
            if (song.id === songId) {
                let index = state.hasPlayList.indexOf(song);
                if (index !== -1) {
                    state.hasPlayList.splice(index, 1);
                    break;
                }
            }
        }
    },
    // 保存播放过的歌曲歌单(避免上一首或者随机播放播放到重复的歌曲)
    pushHasPlayList(state, hasPlayList) {
        state.hasPlayList.push(hasPlayList);
    },
    // 添加当前播放列表
    unshiftPlayList(state, playList) {
        state.playList.unshift(playList);
    },
    pushPlayList(state, playList) {
        state.playList.push(playList);
    },
    // 保存开始时间和结束时间
    saveAur(state, slider) {
        state.slider = {}
        state.slider[slider[0]] = ''
        state.slider[slider[1]] = ''
        state.playDur = []
        state.playDur = slider
    },
    // 保存当前正在播放的音乐路径
    saveMusicUrl(state, musicUrl) {
        state.musicUrl = musicUrl
    },
    // 删除所有搜索历史
    deleteAllSearchHistory(state) {
        state.searchHistory = [];
    },
    // 删除单个搜索历史标签
    deleteSearchHistory(state, searchHistory) {
        for (let searchHisInfo of state.searchHistory) {
            if (searchHisInfo === searchHistory) {
                let index = state.searchHistory.indexOf(searchHisInfo);
                if (index !== -1) {
                    state.searchHistory.splice(index, 1);
                    break;
                }
            }
        }
    },
    // 保存当前播放模式
    savePlayOrd(state, playOrd) {
        state.playOrd = playOrd;
    },
    // 保存播放状态
    saveIsPlaying(state, isPlaying) {
        state.isPlaying = isPlaying;
    },
    // 让播放过的歌曲等于当前歌单
    sameHasAndPlay(state) {
        state.hasPlayList = [...state.playList]
    },
    // 保存当前播放进度
    saveNowDuration(state, nowDuration) {
        state.nowDuration = nowDuration
    },
    // 清空歌单
    deleteAllList(state) {
        // 当前播放状态变成暂停
        state.isPlaying = false;
        // 当前播放歌曲id
        state.songId = "";
        // 当前播放列表
        state.playList = [];
        // 历史播放列表
        state.hisMusicList = [];
        // 已经播放列表
        state.hasPlayList = [];
        // 当前播放音乐url
        state.musicUrl = "";
        // 可播放音乐范围
        state.playDur = [];
        // 当前播放歌曲详情
        state.musicDetail = {
            al: {
                name: "",
                picUrl: "",
            },
            ar: [""],
            alia: {
                name: "",
            },
            name: "",
        };
    },
    // 删除当前播放歌曲
    deletePlayListSong(state, songId) {
        for (let song of state.playList) {
            if (song.id === songId) {
                let index = state.playList.indexOf(song);
                if (index !== -1) {
                    state.playList.splice(index, 1);
                    break;
                }
            }
        }
    },
}
const actions = {
    // 保存当前搜索信息
    saveSearchInfo({ commit }, payload) {
        commit('saveSearchInfo', payload)
    },
    // 保存搜索历史
    saveSearchHistory({ commit }, payload) {
        commit('saveSearchHistory', payload)
    },
    // 保存当前正在播放的音乐细节
    saveMusicDetail({ commit }, payload) {
        commit('saveMusicDetail', payload)
    },
    // 保存当前正在播放的歌曲id
    saveSongId({ commit }, payload) {
        commit('saveSongId', payload)
    },
    // 删除历史列表歌曲
    deleteHisListSong({ commit }, payload) {
        commit('deleteHisListSong', payload)
    },
    // 添加到历史记录播放列表
    unshiftHisMusicList({ commit }, payload) {
        commit('unshiftHisMusicList', payload)
    },
    // 删除已经播放列表歌曲
    deleteHasListSong({ commit }, payload) {
        commit('deleteHasListSong', payload)
    },
    // 添加到播放过的歌曲歌单(避免上一首或者随机播放播放到重复的歌曲)
    pushHasPlayList({ commit }, payload) {
        commit('pushHasPlayList', payload)
    },
    //添加到当前播放列表
    unshiftPlayList({ commit }, payload) {
        commit('unshiftPlayList', payload)
    },
    pushPlayList({ commit }, payload) {
        commit('pushPlayList', payload)
    },
    // 保存开始和结束时间
    saveAur({ commit }, payload) {
        commit('saveAur', payload)
    },
    // 保存当前正在播放的音乐路径
    saveMusicUrl({ commit }, payload) {
        commit('saveMusicUrl', payload)
    },
    // 删除所有历史标签
    deleteAllSearchHistory({ commit }) {
        commit('deleteAllSearchHistory')
    },
    // 删除单个历史标签
    deleteSearchHistory({ commit }, payload) {
        commit('deleteSearchHistory', payload)
    },
    // 保存当前播放模式
    savePlayOrd({ commit }, payload) {
        commit('savePlayOrd', payload)
    },
    // 保存播放状态
    saveIsPlaying({ commit }, payload) {
        commit('saveIsPlaying', payload);
    },
    // 让播放过的歌曲等于当前歌单
    sameHasAndPlay({ commit }) {
        commit('sameHasAndPlay')
    },
    // 保存进度条当前进度
    saveNowDuration({ commit }, payload) {
        commit('saveNowDuration', payload)
    },
    // 清空歌单
    deleteAllList({ commit }) {
        commit('deleteAllList')
    },
    // 删除当前列表歌曲
    deletePlayListSong({ commit }, payload) {
        commit('deletePlayListSong', payload)
    },
}
export default new Vuex.Store({
    state,
    mutations,
    actions,
})
