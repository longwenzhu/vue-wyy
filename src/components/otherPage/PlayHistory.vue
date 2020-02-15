<template>
  <div class="play-history">
    <div class="play-history-wrap">
      <div class="info">
        <div class="mode">{{playMode}}({{songList.length}})</div>
        <van-icon name="delete" class="btn remove-all" @click="removeAll"/>
      </div>

        <transition-group tag="ul" id="ul" @click.native="play"
        name="group"
        >
        <li
          v-for="(item,index) in songList"
          :key="item.id"
          :index="index"
          :class="playActiveId == item.id ? 'play-active' : ''"
        >
          <div class="text">
            <van-icon name="volume-o" class="btn" v-if="playActiveId == item.id"/>
            <span class="song">{{item.song}}</span>
            <span class="singer">- {{item.singer}}</span>
          </div>
          <van-icon class="remove btn" name="cross" @click.stop="remove"/>
        </li>
      </transition-group>

      <div class="close" @click="playHistory('none')">关闭</div>
    </div>
  </div>
</template>


<script>
import { Icon } from "vant";
import {mapState} from 'vuex';
export default {
  props: ["request", "playHistory", "playMode",],
  data() {
    return {
      songList: [],
    };
  },
  components: {
    [Icon.name]: Icon
  },
  created() {
    if (localStorage.songList) {
      this.songList = JSON.parse(localStorage.songList);
    }
  },
  methods: {
    pushSong(data) {
      if (this.songList.some((ele,index) => {
        return data.id == ele.id;
      }))
       {
        return;
      }
      this.songList.unshift(data);
    },
    removeAll(){
      if(confirm('确定要清空播放列表')){
       
        this.songList = this.songList.filter(ele => {
          return ele.id == this.currentVal.id;
        })
      }
    },
    play(e){
     const id = this.songList[this.getActiveIndex(e)].id;

    if(id != this.playActiveId){
       this.request(id);
    }
     this.$store.commit('changePlayId',id);

    },
    songGroup(){
     const arr = [];
      this.$store.state.songGroup.map((ele,index) => {
          arr[index] = {
          song: ele.name,
          singer: ele.ar[0].name,
          id: ele.id
        }
      });
      this.songList = arr.concat(this.songList);
      const map = new Map();
      this.songList = this.songList.filter(ele => {
        return !map.has(ele.id) && map.set(ele.id,'a');
      })
     
      
    },
    remove(e){
       const index = this.getActiveIndex(e); 
      //  console.log(this.songList[index],this.currentVal.id, index)
      if(this.songList.length != 1 ){
        
        if(this.songList[index].id == this.currentVal.id){
           this.toggleSong(1, '列表循环');
        }
         this.songList.splice(index, 1);

      }
    },
    getActiveIndex(e){
      let target = e.target;
      if(target.getAttribute('id') == 'ul'){
        return;
      }
      while(!target.getAttribute('index')){
        target = target.parentElement;
      }
      return target.getAttribute('index');
    },
    toggleSong(order, mode=this.playMode){ 
      let num;
      let len = this.songList.length;
     switch (this.playMode){
       case '随机播放':
        num = Math.floor(Math.random() * len);
       this.request(this.songList[num].id);
       break;
       case '列表循环': 
       num = (this.currentVal.index + order + len) % len;
       this.request(this.songList[num].id);
       break;
       case  '单曲循环' :return;
     }
     this.$store.commit('changePlayId',this.songList[num].id);
    },
    
  },
  activated(){
  },
  computed:{
    ...mapState(['playActiveId']),
      currentVal(){
        console.log('fsd')
        let temp ;
          this.songList.some((ele, index) => {
          if(ele.id == this.playActiveId){
             temp = {id: ele.id, index: index}
             return;
          }
        });
        return temp;
      }

  },
  watch: {
    songList(val){
      
      localStorage.songList = JSON.stringify(val);
    }
  }
};
</script>

<style lang="scss">
.play-history {
  position: absolute;
  width: 100%;
  bottom: 0;
  height: 70%;
  background: #fff;
  border-top: {
    left-radius: 10px;
    right-radius: 10px;
  }
  background: #e8f7e8;
  .btn {
    font-size: 20px;
    color: #bcb9b8;
  }
  .play-history-wrap {
    margin: 0 10px;
    height: 100%;
    .info {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }
    ul {
      height: calc(100% - 100px);
      overflow-y: auto;
      li {
        border-top: 0.5px solid #bcb9b8;
        height: 44px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 16px;
        transition: all .4s;
        .text {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          .singer {
            font-size: 14px;
            color: #525151;
          }
          i {
            color: #d23023;
            vertical-align: text-bottom;
            margin-right: 7px;
          }
          
        }
        &.play-active {
            color: #d23023;
            .singer{
              color: #d23023;
            }
          }
      }
      li:last-child {
        border-bottom: 0.5px solid #bcb9b8;
      }
    }
    ul::-webkit-scrollbar {display:none}
    .close {
      border-top: 0.5px solid #bcb9b8;
      position: absolute;
      bottom: 0px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      font-size: 18px;
      width: 100%;
      box-sizing: border-box;
      font-weight: bold;
    }
  }
}
.group-leave-to{
  opacity: 0;
  height: 0 !important;
}

</style>