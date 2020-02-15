<template>
  <div class="song-template">
    <div class="song-title">
      <p>{{title}}</p>
      <van-icon name="arrow" />
    </div>
    <ul>
        <li v-for="items in songData" :key="items.id" 
      @click="routerLink(items.id, items.name, items.picUrl,handlePlayCount(items.playCount))"
      >
        <div class="play-count" v-if="items.playCount">
          <van-icon name="service-o" color="#fff"/>
          <span>{{handlePlayCount(items.playCount)}}</span>
        </div>
        <img :src="items.picUrl" alt />
        <div class="van-multi-ellipsis--l2 description">{{items.name}}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import { Icon } from "vant";

export default {
  data() {
    return {};
  },
  components: {
    [Icon.name]: Icon,
  },
  props: ["songData", "title"],
  created() {
  },
  methods: {
    handlePlayCount(val) {
      val = typeof val == "string" ? val : val + "";
      const len = val.length;
      if (len < 6) {
        return val;
      } else {
        const temp = (len % 5) + 1;
        if (temp < 5 && temp != 1) {
          return (
            val
              .split("")
              .splice(0, temp)
              .join("") + "万"
          );
        } else if (temp == 5) {
          return val[0] + "." + val[1] + "亿";
        } else {
          return val[0] + val[1] + "." + val[2] + "亿";
        }
      }
    },
    routerLink(id, name, picUrl, playCount){
      if(this.title == '推荐歌单'){
         this.$router.push({
        name: 'songlist',
        params: {id: id},
        query: {
          id: id,
          title: this.title,
          name: name,
          picUrl: picUrl,
          playCount: playCount
          }
      })
      }else{
        this.$store.commit('changePlayId', id)
        this.$router.push({
          name: 'panel',
          query: {
            id: id
          }
        })
      }
     
    }
  },
};
</script>

<style lang="scss">
.song-template{
  margin-top: 10px;
  .song-title{
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 !important;
    
   p{
      font-size: 15px;
      font-weight: bold;
   }
    .van-icon-arrow{
      margin: 0 4px;
    }
  }
  ul{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    
    align-content: space-between;
    li{
     
      width: 32.5%;
      height: 165px;
      position: relative;
       .play-count{
         position: absolute;
         right: 4px;
         top: 1px;
         font-size: 13px;
         color: rgb(231, 225, 225);
      }
      img{
        width: 100%;
        border-radius: 6px;
      }
      .description{
        font-size: 13px;
      }
    }
  }
}

</style>