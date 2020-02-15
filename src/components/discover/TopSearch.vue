<template>
  <div class="top-search">
    
    <div class="search-wrap">
      <div class="inp-wrap">
        <div class="center" :class="{disList: disSearchList}">
          <van-icon name="search" color="#e5b4af" :style="{left:icoLeft}" />
         <form action="#" @submit.prevent="submit">
            <input type="search" :placeholder="searchDefault" @focus="disList" v-model.trim="value"/>
         </form>
        </div>
      </div>
    </div>

    <search-list v-show="disSearchList" :defaultKeyword="searchDefault"
    ref="list"
    />
  </div>
</template>
<script>
import { Icon } from "vant";
import SearchList from "./SearchList.vue";
import {mapState, mapMutations} from 'vuex'
export default {
    name: 'topSearch',
    props: ['disInner'],
    data() {
    return {
      searchDefault: "",
      icoLeft: null,
      value: '',
      test: '',
      disSearchList: false,
    };
  },
  components: {
    SearchList,
    [Icon.name]: Icon
  },
  computed: {
    ...mapState(['topDistance'])
  },
  created() {
    this.axios.get("/search/default").then(res => {
      this.searchDefault = res.data.data.showKeyword;
      this.icoLeft = (210 - this.searchDefault.length * 13) / 2 - 14;
      if(this.icoLeft <= 0){
        this.icoLeft = '0px'
      }else{
        this.icoLeft += 'px'
      }
     
    });
   
  },
  methods: {
    ...mapMutations(['disMusicBut','showMusicBut']),
    disList(){
       this.$refs.list.result = false;
      this.disSearchList = true;
     
      this.disMusicBut();
    },
    submit(){
      const value = this.value ? this.value : this.searchDefault;
      this.$refs.list.getKeyword('', value)
    }
  },
  
  watch: {
    disSearchList(){
       this.disInner(!this.disSearchList);
    }
  },
  activated(){
    if(this.disSearchList){
      this.disMusicBut();
    }else{
      this.showMusicBut();
    }
  },
  mounted(){
   
  }
};
</script>
<style lang='scss'>

.search-wrap {
  

  .inp-wrap {
    background: #d23023;
    width: 100%;
    height: 40px;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 1;
    .center {
      position: absolute;
      width: 210px;
      height: 30px;
      bottom: 0px;
      transform: translate3d(-50%, 0, 0);
      transition: width 200ms;
      left: 50%;
      &.disList {
        width: 80%;
        left: 45%;
        .van-icon {
          left: 4px !important;
        }
        input {
          text-indent: 1.6em;
        }
        input::-webkit-input-placeholder {
          text-align: left;
        }
      }
      .van-icon {
        position: absolute;
        z-index: 1;
        top: 8px;

      }

      input {
        background: #d06b61;
        border: none;
        width: 100%;
        height: 30px;
        border-radius: 20px;
        position: absolute;
        caret-color: #d23023;
        color: #eee;
        box-sizing: border-box;
      }
      input::-webkit-input-placeholder {
        color: #e5b4af;
        font-size: 13px;
        text-align: center;
      }
    }
  }
}
</style>