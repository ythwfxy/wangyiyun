<template>
    <div class="artistPage">
        <!-- 歌手详情 -->
        <artistDetail :artistDetails="artistDetails"></artistDetail>
        <!-- 导航页 -->
        <menuTab @changeActive="changeActive"></menuTab>
        <div>
            <!-- 专辑 -->
            <album v-show="activeIndex==1" :artistAlbum="artistAlbum"></album>
            <!-- 歌手详情 -->
            <artistIntro v-show="activeIndex==2" :artistDesc="artistDesc"></artistIntro>
            <!-- 相关歌手 -->
            <similarArtist v-show="activeIndex==3" :sameArtist="sameArtist"></similarArtist>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
    
</template>

<script>
import artistDetail from "@/components/artistPage/artistDetail.vue"
import menuTab from "@/components/artistPage/menuTab.vue"
import album from "@/components/artistPage/album.vue"
import artistIntro from "@/components/artistPage/artistIntro.vue"
import similarArtist from "@/components/artistPage/similarArtist.vue"
export default {
    data() {
        return {
            // 歌手id
            artistId: this.$route.params.id,
            // 歌手详情
            artistDetails: [],
            // 导航页面
            activeIndex:1,
            // 歌手专辑
            artistAlbum:[],
            // 歌手描述
            artistDesc:[],
            // 相关歌手
            sameArtist:[]
        }
    },
    components: { artistDetail, menuTab,album,artistIntro ,similarArtist},
    methods: {
        // 歌手介绍
        getArtistDetail() {
            this.$http.get("/artist/detail", {
                params: {
                    id: this.artistId
                }
            }).then((res) => {
                this.artistDetails = res.data.data
            })
        },
        // 获取专辑
        getAlbum(){
            this.$http.get("/artist/album", {
                params: {
                    id: this.artistId,
                    limit: 1000,
                }
            }).then((res) => {
                this.artistAlbum=res.data
            })
        },
        // 获取详细
        getDesc(){
            this.$http.get("/artist/desc", {
                params: {
                    id: this.artistId,
                }
            }).then((res) => {
                this.artistDesc=res.data
            })
        },
        // 获取相关歌手
        getSimilar(){
            this.$http.get("/simi/artist",{
                params:{id:this.artistId}
            }).then((res)=>{
                this.sameArtist=res.data
            })
        },
        // 改变导航栏
        changeActive(index) {
            this.activeIndex = index;
        },
    },
    created() {
        this.getArtistDetail()
        this.getAlbum(1)
        this.getDesc()
        this.getSimilar()
    }
}
</script>

<style>
.artistPage {
    width: 100%;
    height: 100vh;
}
</style>