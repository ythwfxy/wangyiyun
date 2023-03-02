<template>
    <div class="infinite-list-wrapper" style="overflow: auto">
      <singerTag
        @getSingerInfo="getSingerInfo"
        ref="singerTag"
        @cleanSingerInfo="cleanSingerInfo"
      />
      <div>
        <singerListInfo
          :singerList="singerList"
          v-infinite-scroll="load"
          class="infinite-list-item"
        />
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  </template>
  
  <script>
  import singerListInfo from "@/components/findMusic/singerList/singerListInfo";
  import singerTag from "@/components/findMusic/singerList/singerTag";
  export default {
    name: "singerList",
    components: {
      // 歌手信息
      singerListInfo,
      // 歌手标签
      singerTag,
    },
    data() {
      return {
        // 歌手数据
        singerList: [],
        // 是否有更多
        more: true,
        // 当前页数
        page: 0,
      };
    },
    methods: {
      // 请求歌手数据
      getSingerInfo(type, area, initial, page) {
        this.$http
          .get("/artist/list", {
            params: {
              type: type,
              area: area,
              initial: initial,
              limit: 12,
              offset: page * 12,
            },
          })
          .then((res) => {
            // console.log(res.data);
            this.singerList = this.singerList.concat(res.data.artists);
            this.more = res.data.more;
          });
      },
      // 清空歌手数据
      cleanSingerInfo() {
        this.singerList = [];
      },
      // 滚动到底继续请求数据
      load() {
        if (this.more === false) return;
        this.getSingerInfo(
          this.$refs.singerTag.languageTag,
          this.$refs.singerTag.genderTag,
          this.$refs.singerTag.firTag,
          this.page
        );
        this.page++;
      },
    },
    created() {},
  };
  </script>
  
  <style scoped></style>
  