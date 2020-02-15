<template>
  <div class="play-panel" >
    <div
      class="play-main"
      :style="{backgroundColor: isShowHis ? 'rgba(0,0,0,0.6)': 'rgba(0,0,0,0.4)'}"
    >
      <div class="title">
        <van-icon name="arrow-left" @click="back"/>
        <template v-if="songData">
          <div class="song-name">
            <div class="name">{{songData.name}}</div>
            <div class="singer">{{songData.ar[0].name}}</div>
          </div>
        </template>
      </div>
      <div class="content" ref="content" @click="handleToggleAlbum($event.target)">
        <transition name="toggle">
          <div class="volume" ref="volume" v-show="!toggleAlbum">
          <van-icon name="volume-o"/>
          <div class="bar" ref="vBar">
            <div class="prg" :style="{width: vRatio}">
              <div class="ball" @touchmove="vMove"></div>
            </div>
          </div>
        </div>
        </transition>
       <transition name="toggle" >
          <div
          class="lyric"
          ref="lrc"
          @touchmove="manualMove"
          @wheel="manualMove"
          :style="{borderTop: `${lrcBorder}px solid transparent`,
        borderBottom: `${lrcBorder}px solid transparent`
        }"
        v-show="!toggleAlbum"
        >
          <div class="middle-line" v-show="lrcLine" :style="{top: lineH+'px'}">
            <div class="but"></div>
            <div class="line"></div>
            <span class="time">{{handleTime(scrollTime)}}</span>
          </div>
          <van-icon
            v-show="lrcLine"
            :style="{top: lineH+'px'}"
            class="but"
            @click="lrcPlay"
            name="play-circle-o"
            btn="btn"
          />

          <ul ref="ul" v-if="setLrc.length" :style="{padding: lrcW + 'px 0'}">
            <li
              v-for="(item,index) of setLrc"
              :key="index"
              :style="[index == nowLrcIndex - 1 ? {color: '#fcff72'} : '',
              index == setLrcBlur.top1.index ? setLrcBlur.top1.style : '',
              index <= setLrcBlur.top2.index ? setLrcBlur.top2.style : '',
              index == setLrcBlur.bottom1.index ? setLrcBlur.bottom1.style : '',
              index >= setLrcBlur.bottom2.index ? setLrcBlur.bottom2.style : '',
              ]"
            >{{item.lrc}}</li>
          </ul>
          <span class="loading-lrc" v-else-if="setLrc.length == 0">正在获取歌词...</span>
           <span class="loading-lrc" v-else>暂无歌词</span>
          <div class="option">
            <div class="commint"></div>
          </div>
        </div>
       </transition>

        <transition name="toggle">
          <album class="album" v-show="toggleAlbum"
          :url="picUrl"
          :comments="comments"
          :paused="paused"
          :toggleAlbum="toggleAlbum"
          :routeLeave="routeLeave"
          :songName="songName"
          :id="id"
         
          />
        </transition>
      </div>
      <div class="control">
        <div class="progress">
          <div class="now-time">{{handleTime(nowTime)}}</div>
          <div class="bar" ref="prgBar">
            <div class="buffer" :style="{width: buffer}"></div>
            <div class="now-prog" :style="{width: progress}">
              <div
                class="ball"
                @click="console.log(12)"
                @touchmove="bMove($event)"
                @touchend="bEnd($event)"
              ></div>
            </div>
          </div>
          <div class="duration">{{duration}}</div>
        </div>
        <div class="control-but" @click="handleControl($event.target)">
          <div index="1" :style="setPlayMode[playModeIndex].pos"></div>
          <div index="2"></div>
          <div index="3" :style="{backgroundPosition:paused ? '' : '-28px 0'}"></div>
          <div index="4"></div>
          <div index="5"></div>
        </div>
      </div>
    </div>
    <transition name="slide">
      <play-history v-show="isShowHis" ref="playHistory"
      :request="request"
      :playHistory="playHistory"
      :playMode="setPlayMode[playModeIndex].name"
      />
    </transition>
  </div>
</template>

<script>
import playHistory from "../components/otherPage/PlayHistory";
import { Icon, Toast } from "vant";
import { mapState, mapMutations } from "vuex";
import $ from "zepto";
import blurImg from "@/js/gaussBlur.js";
import Album from "../components/otherPage/Album";

export default {
  data() {
    return {
      img: new Image(),
      audio: new Audio(),
      id: undefined,
      songData: null,
      singerName:'',
      picUrl:null,
      comments: [],
      setLrc: [],
      songName: '',
      lrcW: 0,
      setPlayMode: [
        {
          name: "列表循环",
          pos: { backgroundPosition: "0 -204px" }
        },
        {
          name: "单曲循环",
          pos: { backgroundPosition: "0 -230px" }
        },
        {
          name: "随机播放",
          pos: { backgroundPosition: "0 -72px" }
        }
      ],
      playModeIndex: 0,
      paused: "",
      isShowHis: false,
      nowTime: "0",
      duration: "00:00",
      progress: "",
      buffer: "",
      vRatio: 0,
      prgRatio: 0,
      nowLrcIndex: 0,
      routeLeave: false,
      lrcLine: false,
      lineH: 0,
      scrollTime: "00:00",
      lrcBorder: 0,
      blurIndex: 0,
      setLrcBlur: {
        top1: {
          index: null,
          style: { opacity: 0.6 }
        },
        top2: {
          index: null,
          style: { opacity: 0.2 }
        },
        bottom1: {
          index: null,
          style: { opacity: 0.6 }
        },
        bottom2: {
          index: null,
          style: { opacity: 0.2 }
        }
      },
      lrcBorderOver: true,
      transitionend: false,
      requestend: false,
      toggleAlbum: false,
      test: 0
    };
  },
  components: {
    playHistory,
    Album,
    [Icon.name]: Icon
  },
  methods: {
    back() {
      history.back();
      this.showMusicBut();
    },
    request(id) {
        if(id){
          this.id = id;
        }
      const getData = path => {
        return this.axios.get(path + this.id);
      };
      const d = d => {
        this.songData = d;
        this.img.src = this.picUrl = this.songData.al.picUrl;
          this.songName = d.name;
        this.singerName = d.ar[0].name
        this.$refs.playHistory.pushSong({
          song: this.songName,
          singer: this.singerName,
          id: this.id
        });
       if(this.$route.query.play){
          this.$refs.playHistory.songGroup();
       }
        this.img.onload = () => {
          window.player.blurImg(this.img, $(".play-panel"));
        };
      };
      const u = u => {
        if (u) {
          this.audio.src = u;
          this.audio.onloadeddata = () => {
            this.duration = this.handleTime(this.audio.duration);
            this.progTime("play");
            this.vRatio = this.audio.volume * 100 + "%";
          };
          this.audio.play();
          this.paused = false;
        }
      };
      const l = l => {
        const arr = [];

        const temp = l.match(/\[\d{2}:\d{2}\.\d{1,3}\][^\[]+?(\n|$)/g);
        temp.forEach((ele, index) => {
          arr[index] = {
            time: hTime(ele),
            lrc: hLrc(ele)
          };
        });
        this.setLrc = arr;
        this.scrollMove();

        function hTime(ele) {
          const timeReg = /\[[\w\W]+?\]/g;
          const temp = timeReg.exec(ele);
          if (temp) {
            let time = temp[0].replace(/(\[|\])/g, "");
            time = time.split(":")[0] * 60 + time.split(":")[1] * 1;
            return time;
          } else {
            return "";
          }
        }
        function hLrc(ele) {
          const lrcReg = /\][\w\W]+?(\n|$)/g;
          const temp = lrcReg.exec(ele);
          if (temp) {
            return temp[0].replace("]", "");
          } else {
            return "";
          }
        }
      };
      //start request
      this.axios
        .all([
          getData("/song/detail?ids="),
          getData("/song/url?id="),
          getData("/lyric?id="),
          getData("/comment/music?id=")
        ])
        .then(
          this.axios.spread((detail, url, lyric, comment) => {
            this.requestend = true;
            d(detail.data.songs[0]);
            u(url.data.data[0].url);
           if(lyric.data.lrc){
              l(lyric.data.lrc.lyric);
           }else{
             this.setLrc = false;
           }
            this.comments = comment.data;
        
          })
        );
      this.setLrc = [];
    },
    handleControl(e) {3   
      switch (+e.getAttribute("index")) {
        case 1:
          this.playMode();
          break;
        case 2:
          this.prev();
          break;
        case 3:
          this.playAndPause();
          break;
        case 4:
          this.next();
          break;
        case 5:
          this.playHistory();
      }
    },
    playMode() {
      this.playModeIndex = ++this.playModeIndex % 3;
      Toast(this.setPlayMode[this.playModeIndex].name);
    },
    prev() {
      this.$refs.playHistory.toggleSong(-1);
    },
    playAndPause() {
      const a = this.audio;

      if (a.paused) {
        a.play();
        this.progTime("play");
        this.scrollMove();
      } else {
        a.pause();
        this.progTime("pause");
        clearTimeout(a.scrollTimer);
      }
      this.paused = a.paused;
    },
    next() {
      this.$refs.playHistory.toggleSong(1);
    },
    playHistory(order = "show") {
      if (order == "show") {
        this.isShowHis = true;
      } else if (order == "none") {
        this.isShowHis = false;
      }
    },
    handleTime(t) {
      let minute = Math.floor(t / 60);
      let scound = Math.round((t / 60 - minute) * 60);
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (scound < 10) {
        scound = "0" + scound;
      }
      return minute + ":" + scound;
    },
    progTime(order) {
      const a = this.audio;
      clearInterval(a.timer);
      const temp = () => {
        this.nowTime = a.currentTime;
        this.buffer =
          (a.buffered.end(a.buffered.length - 1) / a.duration) * 100 + "%";

        this.progress = (a.currentTime / a.duration) * 100 + "%";
        if( this.progress == '100%'){
           if(this.playModeIndex  == 1){
             this.audio.play();
             this.scrollMove('','','loop');
           }else{
             this.$refs.playHistory.toggleSong(1);
           }
        }
      };
      if (order == "play") {
        temp();
        a.timer = setInterval(() => {
          temp();
        }, 1000);
      } else if (order == "pause") {
        clearInterval(a.timer);
      }
    },
    vMove(e) {
      const bar = this.$refs.vBar;
      let x = e.touches[0].clientX;
      const ratio = (x - bar.getBoundingClientRect().left) / bar.clientWidth;
      if (ratio >= 0 && ratio <= 1) {
        this.audio.volume = ratio;
        this.vRatio = ratio * 100 + "%";
      }
    },
    bMove(e) {
      clearInterval(this.audio.timer);
      const bar = this.$refs.prgBar;
      let x = e.touches[0].clientX;
      this.prgRatio = (x - bar.getBoundingClientRect().left) / bar.clientWidth;

      if (this.prgRatio >= 0 && this.prgRatio <= 1) {
        this.nowTime = this.prgRatio * this.audio.duration;
        this.progress = x - bar.getBoundingClientRect().left + "px";
      }
    },
    bEnd(e) {
      if (this.prgRatio < 0) {
        this.prgRatio = 0;
      }
      if (this.prgRatio > 1) {
        this.prgRatio = 1;
      }
      this.audio.currentTime = this.prgRatio * this.audio.duration;
      this.progTime("play");
      this.scrollMove();
      if (this.paused) {
        this.audio.play();

        this.paused = false;
      }
    },
    scrollMove(enter, over, loop) {
      const a = this.audio;
      clearTimeout(a.scrollTimer);
      cancelAnimationFrame(a.animation);
       this.getLrcIndex();
      if (this.routeLeave || this.toggleAlbum) {
        return;
      }
      
      const lrc = this.$refs.lrc || document.createElement("div");
      if(loop){
       lrc.scrollTop = 0; 
      }
      let target;
      let current;
      let result;
     
      let timeOut;
      if (this.setLrc[this.nowLrcIndex]) {
        timeOut = this.setLrc[this.nowLrcIndex].time - a.currentTime;
      } else {
        timeOut = 0;
      }
      a.scrollTimer = setTimeout(() => {
        if (over) {
          return;
        }
        if (timeOut == 0) {
          this.scrollMove("", true);
        } else {
          this.scrollMove();
        }
      }, timeOut * 1000);
       
      if (this.nowLrcIndex > 1) {
        target = (this.nowLrcIndex - 1) * 40;
      } else {
        target = 0;
      }
      if (enter) {
       current = target;
      }else{
        current = lrc.scrollTop;
      }
     
      result = target - current;
    
      const move = () => {
        console.log("move");
        current += result * 0.06;
        if (
          (current >= target && result >= 0) ||
          (current <= target && result <= 0)
        ) {
          current = target;
          cancelAnimationFrame(a.animation);
        } else {
          a.animation = requestAnimationFrame(move);
        }
        lrc.scrollTop = current;
        this.lrcBlur(Math.round(current / 40));
      };
      a.animation = requestAnimationFrame(move);
    },
    getLrcIndex() {
      this.setLrc.some((ele, index) => {
        if (ele.time > this.audio.currentTime || 0) {
          this.nowLrcIndex = index;
          return true;
        } else {
          this.nowLrcIndex = index + 1;
        }
      });
    },
    ...mapMutations(["showMusicBut"]),
    lrcPlay() {
      this.audio.currentTime = this.scrollTime + 0.1;
      this.nowTime = this.audio.currentTime;
      this.audio.lrc.removeEventListener("scroll", this.audio.fun);
      this.audio.fun("", 0);
    },
    manualMove() {
      if (!this.lrcLine) {
        this.lrcLine = true;
        this.audio.lrc = this.$refs.lrc;

        this.audio.fun = (e, time = 3000) => {
          clearTimeout(this.audio.lrcLineTimer);
          const index = Math.round(this.audio.lrc.scrollTop / 40);
          this.scrollTime = this.setLrc[index].time;
          clearTimeout(this.audio.scrollTimer);
          cancelAnimationFrame(this.audio.animation);
          this.lrcBlur(index);

          this.audio.lrcLineTimer = setTimeout(() => {
            this.audio.lrc.removeEventListener("scroll", this.audio.fun);
            this.lrcLine = false;
            this.scrollMove();
          }, time);
        };

        this.audio.lrc.addEventListener("scroll", this.audio.fun);
      }
    },
    lrcBlur(index) {
      this.setLrcBlur.top1.index = index - this.blurIndex + 1;
      this.setLrcBlur.top2.index = index - this.blurIndex;
      this.setLrcBlur.bottom1.index = index + this.blurIndex - 1;
      this.setLrcBlur.bottom2.index = index + this.blurIndex;
    },
    handleToggleAlbum(target){
      const temp = target.getAttribute('btn') ||
       target.parentElement.getAttribute('btn');
       
      if(temp){
        return;
      }
      if(this.isShowHis){
        this.isShowHis = false;
        return;
      }
      this.toggleAlbum = !this.toggleAlbum;
    }
  },
  computed: {
    ...mapState(['zIndex'])
  },
  activated() {
    this.$store.commit("disMusicBut");
  
    this.transitionend = false;
    setTimeout(() => {
      this.transitionend = true;
    }, 400);

    this.routeLeave = false;
    if (this.setLrc.length) {
        this.scrollMove("enter");
    }
  },
  mounted() {
    const temp = this.$refs.lrc;
    this.lrcW = temp.clientHeight / 2 - 20;
    this.lrcBorder = this.lrcW % 40;
    this.lineH = temp.getBoundingClientRect().top + this.lrcW + 20-50;
  },
  updated() {
    if (this.lrcBorder != 0 && this.lrcBorderOver) {
      this.lrcW = this.$refs.lrc.clientHeight / 2 - 20;
      this.lrcBorderOver = false;
      this.blurIndex = Math.round(this.lrcW / 40);
      this.lrcBlur(0);
    }
  },
  created() {
    this.audio.preload = "auto";
    this.img.crossOrigin = "";
    blurImg($);
  },
  beforeRouteLeave(to, from, next) {
    this.routeLeave = true;
    next();
  },

  watch: {
    transitionend(val) {
      const temp = this.$store.state.playActiveId
      if (this.id != temp && val ) {
        this.id = temp;
        this.request();
      }
    },
    toggleAlbum(val){
      if(!val){
        this.scrollMove('enter')
      }
    },
  
  }
};
</script>

<style  lang="scss" >
.play-panel {
  width: 100%;
  z-index: 6;
  background-size: cover;
  overflow: hidden;
  .play-main {
    height: 100%;
    display: flex;
    flex-direction: column;

    .title {
      display: flex;
      height: 50px;
      align-items: center;
      color: #fff;
      i {
        font-size: 30px;
        margin: 0 10px;
      }
      .name {
        font-size: 15px;
      }
      .singer {
        font-size: 13px;
      }
    }
    .content {
      flex-grow: 1;
      padding-bottom: 14px;
      display: flex;
      flex-direction: column;
      position: relative;
      .volume {
        margin: 0 23px 0 15px;
        display: flex;
        height: 40px;
        align-items: center;
        justify-content: space-between;

        i {
          width: 30px;
          text-align: center;
          font-size: 20px;
          color: rgb(224, 221, 221);
        }
        .bar {
          position: relative;
          flex-grow: 0.98;
          height: 2px;
          background: rgb(224, 221, 221);
          .prg {
            position: absolute;
            height: 2px;
            width: 0;
            background: #d23023;
            .ball {
              position: absolute;
              height: 16px;
              width: 16px;
              background: #fff;
              right: -8px;
              top: 50%;
              border-radius: 50%;
              transform: translateY(-50%);
            }
          }
        }
      }
      .lyric {
        color: #fff;
        flex-grow: 1;
        flex-basis: 0;
        overflow: auto;
        text-align: center;
        box-sizing: border-box;
        .but {
          position: absolute;
          transform: translateY(-50%);
          top: 50%;
          left: 2px;
          font-size: 20px;
        }
        .middle-line {
          position: absolute;
          height: 0.5px;

          width: 100vw;
          z-index: -1;
          * {
            position: absolute;
          }
          .but {
            width: 20px;
          }
          .line {
            background: #eee;
            width: calc(100% - 54px);
            height: 0.5px;
            left: 20px;
          }
          .time {
            right: 0;
            font-size: 12px;
            top: 50%;
            transform: translateY(-50%);
          }
        }
        .loading-lrc {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
        }

        li {
          height: 40px;
          font-size: 16px;
          line-height: 40px;
        }
      }
    }
    .control {
      margin: 0 15px;
      .progress {
        margin-top: 10px;
        color: #e0dddd;
        display: flex;
        align-items: center;

        .bar {
          flex-grow: 1;
          height: 2px;
          background: rgba(170, 170, 170, 0.7);
          position: relative;
          margin: 0 14px;
          border-radius: 2px;
          * {
            height: 2px;
            position: absolute;
            border-radius: 2px;
          }
          .buffer {
            background: #fff;
            opacity: 0.7;
          }
          .now-prog {
            background: #d23023;

            .ball {
              height: 16px;
              width: 16px;
              border-radius: 50%;
              background: #fff;
              right: -8px;
              top: 50%;
              transform: translateY(-50%);
            }
          }
        }
      }
      .control-but {
        padding: 10px 0;
        justify-content: space-between;
        display: flex;
        height: 64px;
        align-items: center;
        div {
          background-image: url(../assets/picture/btn.png);
          width: 30px;
          height: 30px;
          background-size: 130px;
        }
        :nth-child(1) {
          background-position: 0px -205px;
          height: 21px;
        }
        :nth-child(3) {
          height: 28px;
          width: 28px;
        }
        :nth-child(2) {
          background-position: 0px -31px;
          height: 19px;
        }
        :nth-child(4) {
          background-position: 0px -52px;
          height: 19px;
        }
        :nth-child(5) {
          height: 19px;
          background-position: 0px -257px;
        }
      }
    }
  }
}

.slide-enter,
.slide-leave-to {
  transform: translateY(100%);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}
.toggle-enter,
.toggle-leave-to{
  opacity: 0;
}
.toggle-enter-active,.toggle-leave-active{
  transition: opacity .5s;
}
</style>