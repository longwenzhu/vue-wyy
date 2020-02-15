<template>
  <div>
    <top-search :disInner="disInner"/>
    <div class="video" v-show="disList" style="height:1000px">
      <div class="v-title" @click="getVideo">推荐视频</div>
      <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
        <div class="video-content">
          <ul>
            {{this.test}}
            <li v-for="(item,index) in videoData" :key="item.data.vid">
              <template v-if="item.data.creator">
                <div class="v-r" @click="handleControl(index,'panel')">
                  <van-loading type="spinner" v-if=" setVideo[index].load == 'loading'"/>

                  <transition name="fade">
                    <div
                      class="play-pause"
                      v-show="setVideo[index].load=='beforeLoad'||setVideo[index].showControl"
                    >
                      <van-icon
                        name="play-circle"
                        v-show=" !setVideo[index].isPlay"
                        @click.stop="play(index, item.data.vid)"
                      />
                      <van-icon
                        name="pause-circle"
                        v-show="setVideo[index].isPlay"
                        @click.stop="play(index)"
                      />
                    </div>
                  </transition>
                  <video
                    :ref="'video'+index"
                    :poster="item.data.coverUrl"
                    x5-playsinline
                    src
                    preload="none"
                    playsinline
                    webkit-playsinline
                  ></video>
                  <div v-if="setVideo[index].load=='beforeLoad'" class="duration">
                    <span>{{handleTime(item.data.durationms)}}</span>
                  </div>
                  <div class="progress" v-if="setVideo[index].load == 'loaded'">
                    <transition name="fade">
                      <div class="time" v-show="setVideo[index].showControl">
                        <span class="nowTime">{{index == videoIndex ?currentTime : '00:00'}}</span>/
                        <span class="duration-time">{{handleTime(item.data.durationms)}}</span>
                      </div>
                    </transition>
                    <div
                      class="total"
                      ref="prg"
                      v-show="index == videoIndex"
                      @touchstart.stop="playStart($event, index)"
                    >
                      <div class="load-p" :style="{width: buffer}"></div>
                      <div class="play-p" :style="{width: progressValue}">
                        <transition name="fade">
                          <div
                            ref="ball"
                            class="ball"
                            v-show="setVideo[index].showControl"
                            @touchstart="start($event, index)"
                            @touchmove="move($event, index)"
                            @touchend="end($event, index)"
                          ></div>
                        </transition>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="b-title">{{item.data.title}}</div>
                <div class="user">
                  <div class="nickname">
                    <img :src="item.data.creator.avatarUrl" alt>
                    <div>{{item.data.creator.nickname}}</div>
                  </div>
                  <div class="praised">
                    <div>{{item.data.praisedCount}}</div>
                    <van-icon name="good-job-o"/>
                  </div>
                  <div class="comment">
                    <div>{{item.data.commentCount}}</div>
                    <van-icon name="comment-o"/>
                  </div>
                  <van-icon name="ellipsis"/>
                </div>
                <div class="bg-full"></div>
              </template>
            </li>
          </ul>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import TopSearch from "../components/discover/TopSearch";
import { PullRefresh, Icon, Loading } from "vant";

export default {
  components: {
    TopSearch,
    [PullRefresh.name]: PullRefresh,
    [Icon.name]: Icon,
    [Loading.name]: Loading
  },
  data() {
    return {
      disList: true,
      isLoading: false,
      id: null,
      videoData: [],
      setVideo: [],
      timer: null,
      playTimer: null,
      progressValue: 0,
      currentTime: 0,
      buffer: 0,
      currentSecond: 0,
      videoIndex: 0,
      prevVideo: null,
      progressW: 0,
      test: ""
    };
  },
  methods: {
    disInner(dis) {
      this.disList = dis;
    },
    onRefresh() {
      this.isLoading = true;
      this.videoData = [];
      clearInterval(this.playTimer);
      this.getVideo("pull-down");
    },
    getVideo(pullDown) {
      this.axios.get("/video/group?id=" + this.id).then(
        res => {
          if (pullDown) {
            this.videoData = res.data.datas;
            this.isLoading = false;
            this.setVideo = this.createArr(this.videoData.length);
          } else {
            this.videoData = this.videoData.concat(res.data.datas);
            this.setVideo = this.setVideo.concat(
              this.createArr(this.videoData.length)
            );
          }
        },
        rej => {
          this.test = rej;
        }
      );
    },
    play(index, id) {
      if (this.prevVideo && this.videoIndex != index) {
        clearInterval(this.playTimer);
        // this.setVideo.splice(this.videoIndex, 1, {
        //   isPlay: false,
        //   load: "beforeLoad",
        //   showControl: false
        // });
        this.$set(this.setVideo[this.videoIndex], "isPlay", false);
        this.$set(this.setVideo[this.videoIndex], 'showControl', true);
        this.prevVideo.pause();
      }
      this.videoIndex = index;

      const video = this.$refs["video" + index][0];
      this.progressW = video.clientWidth;
      if (!video.getAttribute("init")) {
        this.$set(this.setVideo[index], "load", "loading");
        this.axios.get("/video/url?id=" + id).then(res => {
          video.src = res.data.urls[0].url;
          video.setAttribute("init", "y");
          video.play();
          video.onloadeddata = () => {
            this.$set(this.setVideo[index], "load", "loaded");
            this.$set(this.setVideo[index], "isPlay", true);
            this.progress(video, index);
          };
        });
      } else {
        if (id) {
          video.play();
          this.$set(this.setVideo[index], "isPlay", true);
          this.handleControl(index, "play");
        } else {
          video.pause();
          clearTimeout(this.timer);

          this.$set(this.setVideo[index], "isPlay", false);
        }
        this.progress(video, index);
      }
      this.prevVideo = video;
    },
    handleTime(time) {
      let minute = Math.floor(time / 1000 / 60);
      let secound = Math.round((time / 1000 / 60 - minute) * 60);
      if (minute < 1) {
        minute = "00";
      } else if (minute < 10) {
        minute = "0" + minute;
      }
      if (secound < 1) {
        secound = "00";
      } else if (secound < 10) {
        secound = "0" + secound;
      }

      return minute + ":" + secound;
    },
    handleControl(index, from) {
      const video = this.$refs["video" + index][0];

      if (video.getAttribute("init")) {
        if (!video.paused) {
          if (from == "play") {
            this.delay(index, true);
            return;
          }
          if (this.setVideo[index].showControl) {
            this.delay(index);
          } else {
            this.delay(index);
            this.delay(index, true);
          }
        } else {
          if (from == "panel") {
            this.delay(index);
          }
        }
      }
    },
    createArr(len) {
      const arr = [];
      for (var i = 0; i < len; i++) {
        arr[i] = {
          isPlay: false,
          load: "beforeLoad",
          showControl: false
        };
      }
      return arr;
    },
    progress(v, index) {
      if (v.paused) {
        clearInterval(this.playTimer);
      } else {
        setTimeout(() => {
          temp.call(this);
        });
        this.playTimer = setInterval(() => {
          temp.call(this);
          console.log('ff')
        }, 1000);
        function temp() {
          this.currentTime = this.handleTime(v.currentTime * 1000);
          this.progressValue =
            (v.currentTime / v.duration) *
              (this.progressW - 16) +
            16 +
            "px";
          this.buffer =
            (v.buffered.end(v.buffered.length - 1) / v.duration) *
              this.progressW +
            "px";
          if (v.currentTime >= v.duration) {
            this.play(index);
            this.delay(index);
          }
        }
      }
    },
    delay(index, delay) {
      clearTimeout(this.timer);
      if (delay == "manule") {
        this.$set(this.setVideo[index], "showControl", true);
        setTimeout(() => {
 this.$set(this.setVideo[index], "showControl", false);
        } ,2000)
       
      } else {
        if (delay) {
          this.timer = setTimeout(() => {
            // this.setVideo[index].showControl = !this.setVideo[index].showControl;
            this.$set(
              this.setVideo[index],
              "showControl",
              false
            );
          }, 2000);
        } else {
          // this.setVideo[index].showControl = !this.setVideo[index].showControl;
          this.$set(
            this.setVideo[index],
            "showControl",
            !this.setVideo[index].showControl
          );
        }
      }

      console.log(33);
    },
    start(e, index) {
      this.play(index);
    },
    move(e, index) {
      clearInterval(this.playTimer);
      const video = this.$refs["video" + index][0];

      const offset =
        e.targetTouches[0].pageX - video.getBoundingClientRect().left;
      const ration = offset / (this.progressW - 16);
      if (ration >= 0 && ration <= 1) {
        this.progressValue =
          ration * (this.progressW - 16) + 16 + "px";
        this.currentTime = this.handleTime(ration * video.duration * 1000);
        this.currentSecond = ration * video.duration;
      }
    },
    end(e, index) {
      const video = this.$refs["video" + index][0];
      this.play(index, this.id);
    this.delay(index, "manual");
      video.currentTime = this.currentSecond;
    },
    playStart(e, index) {
      this.move(e, index);
      this.end(e, index);
    
    }
  },
  computed: {},
  watch: {},
  created() {
    this.axios.get("/video/group/list").then(res => {
      this.id = res.data.data[0].id;
      this.getVideo("pull-down");
    });
  },
  activated() {
    //  this.axios.get('/video/group?id=58100').then(res => {
    //   console.log(res.data)
    // })
  }
};
</script>

<style lang='scss'>
.video {
  margin-top: 90px;
  .v-title {
    background-color: #d23023;

    position: fixed;
    top: 39px;
    width: 100%;
    text-align: center;
    color: #fff;
    font-size: 16px;
    padding: 10px 0;
    font-weight: bold;
    z-index: 1;
  }
  .video-content {
    margin: 0 6px 50px;
    li {
      .v-r {
        // overflow: hidden;
        border-radius: 6px;
        height: 100%;
        height: 200px;
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: flex-end;
        color: #fff;
        video {
          top: 0;
          position: absolute;
          height: 100%;
          width: 100%;
          z-index: -1;
          background: #000;
          border-radius: 6px;
        }
        .t-title {
          width: 100%;
        }
        .play-pause {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
          i {
            font-size: 50px;
            color: #ddd;
            opacity: 0.5;
          }
        }
        .progress {
          width: 100%;
          position: absolute;
          bottom: 0;
          .time {
            margin: 0 0 8px 8px;
            font-size: 14px;
            color: rgba($color: #fff, $alpha: 0.8);
          }
          .total {
            width: 100%;
            height: 4px;
            position: relative;
            border-radius: 0 0 6px 6px;
            background: rgba($color: #aaa, $alpha: 0.7);
            * {
              position: absolute;
              height: inherit;
              border-bottom-left-radius: 6px;
            }
            .load-p {
              opacity: 0.7;
              width: 100px;
              background: #fff;
            }
            .play-p {
              width: 16px;
              background: #d23023;
              .ball {
                height: 16px;
                border-radius: 50%;
                position: absolute;
                right: 0px;
                width: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: inherit;
              }
            }
          }
        }
        .duration {
          position: absolute;
          bottom: 0;
          right: 2px;
        }
        .van-loading {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
        }
      }
      .b-title {
        font-weight: bold;
        padding: 14px 0;
        font-size: 15px;
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .user {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 0.5px solid #ccc;
        padding: 10px 0;
        // margin-top: 10px;
        .van-icon {
          font-size: 20px;
        }
        .nickname {
          display: flex;
          align-items: center;
          font-size: 13px;
          img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 4px;
          }
        }
        .praised,
        .comment {
          font-size: 13px;
          display: flex;
          align-items: center;
          flex-direction: column;
        }
      }
      .bg-full {
        height: 10px;
        background: #eee;
        width: 100vw;
        transform: translateX(-6px);
        margin-bottom: 10px;
      }
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>