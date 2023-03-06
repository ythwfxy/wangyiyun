<template>
    <div class="similar">
        <div class="simiList">
            <div class="listTable">包含这首歌的歌单</div>
            <div class="listItem" v-for="(item, index) in simiList" :key="index">
                <img :src="item.coverImgUrl" alt="" class="listItemImg">
                <span style="display: inline-block;">{{ item.name }}</span>
            </div>
        </div>
        <div class="simiSong">
            <div class="listTable">喜欢这首歌的人也听</div>
            <div class="listItem" v-for="(item, index) in simiSong" :key="index">
                <img :src="item.album.picUrl" alt="" class="listItemImg">
                <span style="display: inline-block;">{{ item.name }}-{{item.album.artists[0].name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        simiList: Array,
        simiSong: Array
    }
}
</script>

<style>
.similar {
    display: flex;
    flex-direction: column;
}

.simiList,
.simiSong {
    flex-basis: calc(2/3 - 10px);
    margin-top: 20px;
}

.listTable {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.listItem {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
}

.listItemImg {
    width: 70px;
    height: 70px;
    border-radius: 10px;
    margin-right: 10px;
}

.listItemName {
    font-size: 16px;
}
</style>