<template>
  <div class="mi">
    <div class="mi-title" v-if="setObj"><span>我的音乐</span></div>
    <div v-if="!songData" class="sign-out">未登录</div>
    <div class="mi-content" v-else>
        <ul>
          <li >
            <van-icon name="underway-o" />
            <div @click="test">最近播放{{obj.name}}</div>
          </li>
          <li v-for="(item,index) in songData" :key="item.id"
           @click="getId(item.id, index)">
            <img :src="item.coverImgUrl" alt>
            <div>{{item.name}}</div>
          </li>
        </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { Icon } from 'vant';
export default {
  data() {
    return {
      songData: null,
      obj: {
        name: 'zz'
      },
    };
  },
  components: {
      [Icon.name]: Icon

  },
  computed: {
    ...mapState(["updataLogin"]),
    audio(){
     
      return new Audio();
    },
    setObj(){
       console.log(33)
      return this.obj.name
    }
  },
  methods: {
    getId(id, index){
      this.$router.push({
        name: 'songlist',
        params: {
          id: id,
        },
        query: {
          name: this.songData[index].name,
          picUrl: this.songData[index].coverImgUrl,
          id: id,
          title: '我收藏的歌单'
        }
      })
    },
    test(){
      this.obj.name  = 'hu'
    }
  },

  watch: {
    updataLogin: {
      immediate: true,
      handler() {
        if (window.localStorage.isLogin == "yes") {
          this.axios
            .get(
              "/user/playlist?uid=" +
                JSON.parse(localStorage.user).bindings[0].userId
            )
            .then(res => {
              this.songData = res.data.playlist;
            });
        } else {
          this.songData = null;
        }
      }
    }
  },
  updated(){
  },
  created(){
    
  }
};
</script>

<style lang="scss">
.mi {
  .mi-title{
    height: 50px;
    background: #d23023;
    text-align: center;
    line-height: 50px;
    color: #fff;
    font-size: 18px;
  }
  .sogn-out {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%,-50%,0)
  }
  .mi-content{
  margin: 0 10px;

    li:first-child{
      i{
        width: 50px;
        text-align: center;
        line-height: 50px;
        font-size: 30px;
        color: #d23023;
        height: 50px;
      }
    }
    li{
      display: flex;
      align-items: center;
      margin: 10px 0px;
      div{
        margin-left: 10px;
        border-bottom: 1px solid #ccc;
        flex-grow: 1;
        padding: 16px 0;
      }
      img{
        width: 50px;
        height: 50px;
        border-radius: 10px;
      }
    }
  }
}
</style>