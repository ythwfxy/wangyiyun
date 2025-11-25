import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'hash',
    routes: [{
        path: '',
        redirect: '/home/findMusic',
    }, {
        path: '/home',
        name: 'home',
        component: () =>
            import('@/pages/home'),
        children: [
            {
                path: '/home/findMusic',
                name: 'findMusic',
                redirect: '/home/findMusic/personRecom',
                component: () =>
                    import('@/pages/findMusic/findMusic'),
                children: [
                    {
                        path: '/home/findMusic/personRecom',
                        name: 'personRecom',
                        component: () =>
                            import('@/pages/findMusic/personRecom/personRecom')
                    },
                    {
                        path: '/home/findMusic/songList',
                        name: 'songList',
                        component: () =>
                            import('@/pages/findMusic/songList/songList')
                    },
                    {
                        path: '/home/findMusic/playList',
                        name: 'playList',
                        component: () =>
                            import('@/pages/findMusic/playList/playList')
                    },
                    {
                        path: '/home/findMusic/singerList',
                        name: 'singerList',
                        component: () =>
                            import('@/pages/findMusic/singerList/singerList')
                    }
                ]
            },

            {
                path: '/home/searchPage',
                name: 'searchPage',
                redirect: '/home/searchPage/searchBySong',
                component: () =>
                    import('@/pages/searchPage/searchPage'),
                children: [
                    // 歌曲
                    {
                        path: '/home/searchPage/searchBySong',
                        name: 'searchBySong',
                        component: () =>
                            import('@/components/searchPage/searchBySong')
                    },
                    // 歌手
                    {
                        path: '/home/searchPage/searchBySinger',
                        name: 'searchBySinger',
                        component: () =>
                            import('@/components/searchPage/searchBySinger')
                    },
                    // 视频
                    {
                        path: '/home/searchPage/searchByVideo',
                        name: 'searchByVideo',
                        component: () =>
                            import('@/components/searchPage/searchByVideo')
                    },
                    // 歌单
                    {
                        path: '/home/searchPage/searchBySongList',
                        name: 'searchBySongList',
                        component: () =>
                            import('@/components/searchPage/searchBySongList')
                    },
                ]
            },
            // 歌单页面
            {
                path: '/home/songList/:id',
                component: () =>
                    import('@/pages/songListPage/songListPage'),
            },
            // 歌手页面
            {
                path:'/home/artistPage/:id',
                component:()=>
                    import('@/pages/artistPage/artistPage')
            },
            // 歌曲详情界面
            {
                path:'/home/songPage',
                component:()=>
                    import('@/pages/songPage/songPage')
            },
            // 私人FM
            {
                path:'/home/myFM',
                component:()=>
                    import('@/pages/myFM/myFM')
            },
            // 音乐故事板
            {
                path:'/home/music-storyboard',
                component:()=>
                    import('@/pages/musicStoryboard/musicStoryboard')
            }
        ]
    }]
})

export default router