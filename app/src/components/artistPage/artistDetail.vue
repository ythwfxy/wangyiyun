<template>
    <div class="artistDetail">
        <el-image fit="fill" :src="artistDetails.artist.cover"
            style="border-radius: 10px; height: 100%; width: 37vh; float: left;"></el-image>
        <div class="name">{{ artistDetails.artist.name }}</div>
        <div class="englishName"><span v-for="alia in artistDetails.artist.alias" :key="alia">{{ alia }}</span></div>
        <div class="shoucang">
            收藏
        </div>
        <div class="intros">
            <span>单曲数:{{ artistDetails.artist.musicSize }} </span>
            <span>专辑数:{{ artistDetails.artist.albumSize }} </span>
            <span>MV数:{{ artistDetails.artist.mvSize }}</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    props: {
        artistDetails: Object
    }
}
</script>

<style scoped>
.artistDetail {
    position: relative;
    left: 0px;
    width: 100%;
    height: 35%;
    text-align: left;
}

.name {
    font-size: 25px;
    transform: translateX(10px);

}

.englishName {
    transform: translate(10px, 10px);
}
.shoucang {
    display: inline-block;
    margin-left: 10px;
    border-radius: 20px;
    border: 1px solid #d8d8d8;
    padding: 5px 15px;
    cursor: pointer;
    margin-top: 20px;
}

.shoucang:hover {
    background: #f2f2f2;
}

.intros {
    transform: translate(10px, 20px);
}</style>