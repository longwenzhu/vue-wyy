<template>
  <div class="song-list" ref="root">
    <div class="bg-section" v-if="songData">
      <div class="top-title">
        <van-icon name="arrow-left" color="#fff" @click="back"/>
        <span>{{songData.title}}</span>
      </div>
      <div class="middle-section">
        <div class="pic">
          <img :src="songData.picUrl" alt>
          <span>
            <van-icon name="service-o" color="#fff"/>
            {{songData.playCount || 0}}
          </span>
        </div>
        <div class="text">
          <div class="song-name">{{songData.name}}</div>
          <div v-if="songData.title=='最新专辑'" class="detailed">发行时间 {{time}}</div>
        </div>
      </div>
      <div class="bottom-option">
        <router-link
          :to="{name: 'comment',
        query:{name:songData.name, picUrl:songData.picUrl, id: songData.id}
        }"
          class="discuss"
        >
          <van-icon name="comment-o"/>
          <div>{{commentCount}}</div>
        </router-link>
        <div class="option">
          <van-icon name="passed"/>
          <div @click="option">多选</div>
        </div>
      </div>
    </div>

    <div class="detailed">
      <van-loading size="24px" color="#eee" v-if="loading">加载中...</van-loading>
      <div v-else>
        <van-sticky :offset-top="48" v-if="songData" :z-index="1">
          <div class="song-head">
            <div class="left" :class="{option: isOption}" @click="allPlay">
              <van-icon name="play-circle-o" size="27px" v-if="!isOption"/>
              <van-checkbox
                v-model="checked"
                v-if="isOption"
                @click="handleCheck"
                checked-color="#d23023"
              >全选</van-checkbox>

              <span class="play" v-else>全部播放</span>
              <span class="total" v-if="!isOption">（共{{detailedList ? detailedList.length : ''}}首）</span>
            </div>
            <div class="resolve" v-if="isOption" @click="optionOver">完成</div>
            <div
              class="right"
              v-else-if="!isOption && songData.id != '2426522818'"
              :style="{background: isLike ? 'rgb(245, 182, 177)' : '#d23023' }"
            >
              <van-icon name="add-o" v-if="!isLike"/>
              <span
                class="collect"
                @click="collect"
              >{{isLike ? '已收藏' : '收藏' }}（{{subscribedCount}}）</span>
            </div>
          </div>
        </van-sticky>

        <ul class="list" @click="toPlay">
          <van-checkbox-group v-model="result" ref="checkboxGroup">
            <li
              class="song-item"
              v-for="(song,index) in detailedList"
              :key="index"
              :class="song.id == playActiveId ? 'play-active' : ''"
            >
              <van-checkbox
                v-if="leftFlag[index] =='checkbox' || isOption"
                :name="index"
                checked-color="#d23023"
              >
                <span v-if="leftFlag[index] == 'number' && !isOption" class="index">{{index+1}}</span>
                <van-icon
                  v-else-if="leftFlag[index] == 'volume' && !isOption"
                  name="volume-o"
                  class="index"
                  color="#d23023"
                />

                <div class="song-content">
                  <div class="name">{{song.name}}</div>
                  <div class="detailed-info">{{song.ar[0].name}} - {{song.al.name}}</div>
                </div>
              </van-checkbox>

              <template v-else>
                <span v-if="song.id != playActiveId" class="index">{{index+1}}</span>
                <van-icon
                  v-else
                  name="volume-o"
                  class="index"
                  color="#d23023"
                />

                <div class="song-content">
                  <div class="name">{{song.name}}</div>
                  <div class="detailed-info">{{song.ar[0].name}} - {{song.al.name}}</div>
                </div>
              </template>
            </li>
          </van-checkbox-group>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import blurImg from "../js/gaussBlur.js";
import $ from "zepto";
import { Icon, Sticky, Loading, Checkbox, CheckboxGroup } from "vant";
//item.ar[0].name 歌手名
//item.al.name 专辑
export default {
  data() {
    return {
      songData: null,
      img: new Image(),
      detailedList: null,
      loading: true,
      commentCount: 0,
      subscribedCount: 0,
      t: 2,
      leftFlag: [],
      result: [],
      isOption: false,
      checked: false,
      isAllChecked: false,
      onlyForward: true,
      prevActive: null,
      volumeIndex: null,
      likedSong: [],
      isLike: null,
      transitionend: false
     
    };
  },
  components: {
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Loading.name]: Loading,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup
  },
  methods: {
    back() {
      window.history.back();
    },
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
    option() {
      this.isOption = true;
      const timer = setInterval(() => {
        const top = this.$refs.root.scrollTop;
        this.$refs.root.scrollTop = top + 6;
        if (top >= 260) {
          clearInterval(timer);
        }
      });
    },
    optionOver() {
      this.isOption = false;
    },
    handleCheck() {
      this.$refs.checkboxGroup.toggleAll(true);
      if (this.isAllChecked) {
        this.$refs.checkboxGroup.toggleAll();
      } else {
        this.checked = false;
      }
    },
    collect() {
      
      if (window.localStorage.isLogin == "yes") {
        this.t = this.isLike ? 2 : 1;
        this.axios
          .get("/playlist/subscribe", {
            params: {
              id: this.songData.id,
              t: this.t
            }
          })
          .then(res => {
            this.isLike = !this.isLike;
          });
      } else {
        this.$router.push("/login");
      }
    },
    toPlay(e) {
      if(this.isOption){
        return;
      }
      let target = e.target.parentElement;
      let id = null;
      if (!target.classList.contains("song-item")) {
        target = target.parentElement;
      }
      target = target.getElementsByTagName("span")[0];
      if (target) {
        target = target.innerHTML - 1;
        id = this.detailedList[target].id;
        this.$store.commit('changePlayId', id);
        this.prevActive = target;
        this.volumeIndex = target;
      } 
      this.$router.push({
        name: 'panel',
        query: {
          id: id
        }
      });
    },
    getLikedSong(){
      this.isLike = this.likedSong.some(ele => {
                return ele.id == this.$route.params.id
              })
    },
    allPlay(){
      if(this.isOption){
        return;
      }
      this.$router.push({
        name: 'panel',
        query: {
          id: this.detailedList[0].id,
          play:true
        }
      });
       this.$store.commit('changePlayId', this.detailedList[0].id);
       this.$store.commit('setSongGroup', this.detailedList);
    }
  },
  created() {
    this.img.crossOrigin = "";
    blurImg();

    if(localStorage.isLogin == 'yes'){
       this.axios.get(
              "/user/playlist?uid=" +
                JSON.parse(localStorage.user).bindings[0].userId
            )
            .then(res => {
              // this.songData = res.data.playlist;
              this.likedSong = res.data.playlist.splice(1);
              this.getLikedSong();
            });
    }
  },
  activated() {
    if (!this.onlyForward) {
      return;
    }
    this.loading = true;
    this.songData = this.$route.query;
    this.transitionend = false;
    setTimeout(() => {
      this.transitionend = true;
    }, 400);
   
      // if(this.songData.title == '我收藏的歌单'){
      //   this.isLike = true;
      // }
      this.getLikedSong();
  },
  watch: {
    songData() {
      this.img.src = this.songData.picUrl;
      this.img.onload = () => {
        window.player.blurImg(this.img, $(".bg-section"));
        window.player.blurImg(this.img, $(".top-title"));
      };
    },
    detailedList() {
      for (let i = 0; i < this.detailedList.length; i++) {
        this.leftFlag.push("number");
      }
    },
    result() {
      this.checked = false;
      this.isAllChecked = this.result.length == this.detailedList.length;
      if (this.isAllChecked) {
        this.checked = true;
      }
    },
    $route(to, from) {
      if (to.meta.grade > from.meta.grade) {
        this.onlyForward = true;
      } else {
        this.onlyForward = false;
      }
    },
    transitionend(val){
      if(val){
         this.axios
      .get("/playlist/detail", {
        params: { id: this.$route.params.id }
      })
      .then(res => {
        this.commentCount = res.data.playlist.commentCount;
        this.subscribedCount = res.data.playlist.subscribedCount;
        this.detailedList = res.data.playlist.tracks;
        this.loading = false;
      });
      }
    }
  },
  computed: {
    ...mapState(["playActiveId"])
  }
};
</script>

<style lang='scss'>
.song-list {
  z-index: 2;
  background: #fff;
  .bg-section {
    color: #fff;
    height: 300px;
    background-size: 100%;
    padding: 4px 10px;

    .top-title {
      font-size: 16px;
      z-index: 10;
      top: 0;
      background-size: 100% 308px;

      position: fixed;
      width: 100vw;
      transform: translateX(-10px);
      color: #fff;
      height: 40px;
      .van-icon-arrow-left {
        font-size: 27px;
        vertical-align: middle;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 8px;
      }
      span {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate3d(-50%, -50%, 0);
      }
    }
    .middle-section {
      height: 150px;
      display: flex;
      align-items: center;
      margin-top: 75px;
      .pic {
        height: 150px;
        width: 150px;
        margin-right: 20px;
        position: relative;
        img {
          position: absolute;
          height: 100%;
          border-radius: 8px;
        }
        span {
          position: absolute;
          top: 2px;
          right: 2px;
          color: rgb(221, 221, 221);
          font-size: 13px;
        }
      }
      .text {
        font-size: 17px;
        width: 181px;
        div {
          padding: 10px 0;
        }
      }
    }
    .bottom-option {
      display: flex;
      justify-content: space-around;
      height: 70px;
      align-items: center;
      margin-top: 8px;
      i {
        font-size: 22px;
        font-weight: 100;
        vertical-align: -5px;
      }
      .discuss,
      .option {
        font-size: 15px;
        font-weight: 300;
        width: 60px;
        text-align: center;
        color: #fff;
      }
    }
  }
  .detailed {
    padding-bottom: 60px;
    width: 100%;
    box-sizing: border-box;
    min-height: 310px;
    background: #fff;
    position: relative;
    border-radius: 10px 10px 0 0;
    .van-loading {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);
    }
    .van-sticky {
      border-radius: 10px 10px 0 0;
      overflow: hidden;
      margin-top: -8px;
      background: #fff;
      width: 100%;
      left: initial;
      right: initial;
      .song-head {
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: space-between;
        .option {
          display: flex;
        }
        .left,
        .right {
          height: 100%;
          line-height: 60px;
          .van-icon-play-circle-o {
            vertical-align: -8px;
            margin-left: 10px;
          }
          .play {
            margin-left: 8px;
          }
          .total {
            font-size: 13px;
            color: #aaa;
          }
        }
        .right {
          background-color: #d23023;
          padding: 0 10px;
          color: #fff;
          font-size: 13px;
          .van-icon-add-o {
            vertical-align: -3px;
            font-size: 16px;
          }
        }
        .resolve {
          color: #d23023;
          line-height: 60px;
          padding: 0 10px;
          font-size: 17px;
        }
      }
    }
    .list {
      li {
        &.play-active .name {
          color: #d23023;
        }
        display: flex;
        height: 60px;
        align-items: center;
        .index {
          height: 100%;
          width: 46px;
          line-height: 60px;
          text-align: center;
          color: gray;
          font-size: 14px;
          &.checkbox {
            display: flex;
            justify-content: center;
          }
        }
        .song-content {
          border-bottom: 0.5px solid #ccc;
          height: 100%;
          flex-grow: 1;
          box-sizing: border-box;
          padding: 10px 0;
          // line-height: 60px;
          div {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            max-width: 320px;
          }
          .name {
            font-size: 16px;
          }
          .detailed-info {
            font-size: 12px;
            color: #aaa;
          }
        }
      }
    }
  }
}
.van-checkbox {
  width: 100%;
  .van-checkbox__icon {
    padding: 0 10px;
  }
  .van-checkbox__label {
    font-size: 17px;
    width: 100%;
  }
}
</style>