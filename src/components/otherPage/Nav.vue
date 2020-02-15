<template>
   <div class="nav">
       <div class="nav-wrap" v-show="true" >
        <ul>
          <router-link 
          v-for="(name) in linkName" :key="name"
          
          tag="li" :to="{name: name}"></router-link>
          
        </ul>
      </div>
       
   </div>

</template>

<script>
import { mapState, mapMutations } from "vuex";
import { Icon } from "vant";
export default {
  data(){
    return {
      linkName: ['discover', 'video', 'mi', 'number'],

    }
  },
    components:{
          [Icon.name]: Icon
    },
    computed: {
    
  },
  computed: {
    ...mapState(["isDisMusicBut", ])
  },
  methods: {
    ...mapMutations(["disMusicBut"]),
    
  },
  created(){
  }
}
</script>

<style lang="scss">

.nav{
   bottom: 0;
    position: fixed;
    transition: transform .4s;
    width: 100vw;
    height: 50px;
    z-index: 1;
   .nav-wrap {
     position: absolute;

    width: 100vw;
    height: 50px;
   
    background-color: #f3f3f3;
    transition: transform 2s;
    ul {
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      li {
        width: 24px;
        height: 42px;
        padding: 0 20px;
        background-origin: content-box;
        background-size: cover;
        background-repeat: no-repeat;
        &.router-link-exact-active {
          background-position-y: -42px;
          height: 44px;
        }
        &.manual{
           background-position-y: -42px;
          height: 44px;
        }
      }
      :nth-child(1) {
        background-image: url(../../assets/picture/router_link/discover.jpg);
      }
      :nth-child(2) {
        background-image: url(../../assets/picture/router_link/video.jpg);
      }
      :nth-child(3) {
        background-image: url(../../assets/picture/router_link/mi.jpg);
      }
      :nth-child(4) {
        background-image: url(../../assets/picture/router_link/friend.jpg);
      }
      :nth-child(5) {
        background-image: url(../../assets/picture/router_link/number.jpg);
      }
    }
  }
}
</style>