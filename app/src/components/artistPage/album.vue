<template>
  <div class="albumList">
    <div class="album" v-for="item in artistAlbum.hotAlbums" :key="item.id">
        <el-image fit="fill" :src="item.blurPicUrl"></el-image>
        <div class="name">{{ item.name }}</div>
        <div class="time">{{ item.publishTime | dateFormat1 }}</div>
    </div>
  </div>
</template>

<script>
export default {
    props:{
        artistAlbum:Object
    }
}
</script>

<style>
.albumList {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 20px;
}

.album {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.album .name {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
    text-align: center;
}

.album .time {
    font-size: 14px;
    color: #999;
    margin-top: 5px;
    text-align: center;
}
</style>