<template>
  <div id="app">
    <router-link :to="{name: 'panel'}" class="panel-but" v-show="isDisMusicBut"  ref="album">
      <van-icon name="music-o" size="30px" color="#fff" @click="disMusicBut" />
    </router-link>
    <transition :name="silde" :css="css" :mode="mode"
    >
      <keep-alive>
        <router-view class="router-view" ref="dom" />
      </keep-alive>
    </transition>
    <nav-bar  v-show="vanShow"/>
  </div>
</template>
<script>
import TopSearch from "./components/discover/TopSearch";
import NavBar from "./components/otherPage/Nav";
import { mapState, mapMutations } from "vuex";
import { Icon } from "vant";
export default {
  data() {
    return {
      disTopSearch: true,
      silde: "",
      css: true,
      mode: '',
      vanShow: true,
    };
  },
  components: {
    TopSearch,
    NavBar,
    [Icon.name]: Icon
  },
  computed: {
    ...mapState(["isDisMusicBut"])
  },
  methods: {
    ...mapMutations(["disMusicBut"])

  },
  created() {},
  mounted() {},
  watch: {
    $route(to, from) {
       this.css = true;
       this.mode = ''
      if (from.meta.grade < to.meta.grade) {
       
        if (to.name == "login" || to.name == 'song-c') {
          this.silde = "top";
          this.mode = 'in-out'

        } else {
          this.silde = "forward";
          setTimeout(() => {
            this.vanShow = false;
          },400);
        }
        
      } else if (from.meta.grade > to.meta.grade) {
        this.vanShow = true;
        if (from.name == "login" || from.name == 'song-c') {
          this.silde = "bottom";
        } else {
          this.silde = "back";
        }
      } else {
        this.css = false;
      }
        
    }
  }
};
</script>
<style lang="scss" scoped>
.router-view {
  position: absolute;
  height: 100%;
  overflow-y: auto;
  width: 100vw;
  left: 0;
}
#app {
  width: 100vw;
  bottom: 0;
  // height: 100vh;
  .panel-but {
    position: fixed;
    right: 16px;
    top: 10px;
    z-index: 20;
  }
}
</style>
