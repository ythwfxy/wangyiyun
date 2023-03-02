<template>
  <div class="Intro">
    <div class="simple">
        <div class="table">{{artistDesc.briefDesc.slice(0,3)}}简介</div>
        <div class="hard">&nbsp;&nbsp;&nbsp;&nbsp;{{ artistDesc.briefDesc }}</div>
    </div>
    <div class="simple" v-for="item in artistDesc.introduction" :key="item">
        <div class="table">{{ item.ti }}</div>
        <div class="hard">&nbsp;&nbsp;&nbsp;&nbsp;{{ item.txt }}</div>
    </div>
  </div>
</template>

<script>
export default {
    props:{
        artistDesc:Object
    }
}
</script>

<style>
.simple {
    text-align: left;
    margin-top: 50px;
}
.table{
    font-weight: bold;
}
.hard{
    margin-top: 10px;
}
</style>