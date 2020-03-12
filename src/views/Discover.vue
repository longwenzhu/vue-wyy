<template>
  <div class="home">
    <top-search :disInner="disInner" />

    <div v-show="disList">
      <div class="inner">
        <div id="my-tab">
          <div class="head-wrap">
            <div class="head">
              <div class="title">个性推荐</div>
              <div class="title">主播电台</div>
            </div>
          </div>

          <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
            <div class="body">
              <div class="content">
                <div class="banner-wrap" :style="{height: bannerHeight+'px'}">
                  <swiper :options="swiperOption" class="swipe">
                    <!-- slides -->
                    <swiper-slide v-for="item in banners" :key="item.bannerId" class="item">
                      <a :href="item.url">
                        <img :src="item.pic" alt />
                        <span :style="{backgroundColor: item.titleColor}">{{item.typeTitle}}</span>
                      </a>
                    </swiper-slide>
                  </swiper>
                </div>
                <div class="mock-logo">
                  <ul>
                    <li v-for="(imgs,index) in mockLogo" :key="imgs">
                      <img :src="`${publicPath}static/${index+1}.jpg`" alt />
                      <span>{{imgs}}</span>
                    </li>
                  </ul>
                </div>
                <song-template :songData="recommendSongData" title="推荐歌单" />
                <song-template :songData="newsSongData" title="最新音乐" />
              </div>
              <div class="content">content2</div>
            </div>
          </van-pull-refresh>
        </div>
      </div>
    </div>

    <transition name="tips">
      <div class="tips" v-show="tips">已为你推荐新的个性化内容</div>
    </transition>
  </div>
</template>

<script>
import { Button, PullRefresh } from "vant";
import TopSearch from "../components/discover/TopSearch";
import tabJs from "../js/tab.js";
import SongTemplate from "../components/discover/SongTemplate";
import $ from "zepto";
import { mapState, mapMutations } from "vuex";
//  swiper-group
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";
export default {
  data() {
    return {
      active: 2,
      isLoading: "",
      disList: true,
      banners: [],
      publicPath: process.env.BASE_URL,
      mockLogo: ["私人FM", "每日推荐", "歌单", "排行榜"],
      recommendSongData: null,
      newsSongData: null,
      tips: false,
      bannerHeight: 0,
      swiperOption: {
        loop: true,
        autoplay: {
          delay: 3000
        },
        pagination: {
          el: ".swiper-pagination",
          type: "bullets"
        }
      }
    };
  },
  name: "home",
  components: {
    TopSearch,
    SongTemplate,
    [Button.name]: Button,
    [PullRefresh.name]: PullRefresh,
    swiper,
    swiperSlide
  },
  mounted() {
    tabJs($);
  },
  created() {
    this.axios.get("/banner?type=2").then(res => {
      this.banners = res.data.banners;
      this.$nextTick(() => {
        this.bannerHeight = document.getElementsByClassName(
          "swipe"
        )[0].offsetHeight;
      });
    });
    this.getData();
  },

  methods: {
    onRefresh() {
      this.getData();
    },
    getData() {
      this.axios.get("/personalized?limit=60").then(res => {
        this.isLoading = false;
        this.recommendSongData = res.data.result
          .sort(() => {
            return Math.random() - 0.5;
          })
          .splice(0, 6);
        this.tips = true;
        setTimeout(() => {
          this.tips = false;
        }, 3000);
      });

      this.axios.get("/personalized/newsong").then(res => {
        let data = res.data.result;
        let len = data.length - (data.length % 3);
        data = data.splice(0, len);
        this.newsSongData = data;
      });
    },
    disInner(dis) {
      this.disList = dis;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="scss">
@import url(../js/tab.css);
.home {
  height: 400px;
  .inner {
    width: 100%;
    box-sizing: border-box;
    padding: 0 2px;
    padding-bottom: 400px;
    .van-pull-refresh {
      position: relative;
      top: 79px;
      .banner-wrap {
        height: 145px;
        position: relative;
        .swipe {
          width: 100%;
          position: absolute;
          z-index: 0;
          top: 0;

          .item {
            // width: 100vw !important;
            // height: 200px;
            a {
              width: 100%;
              position: relative;
              display: inline-block;
              overflow: hidden;
              border-radius: 10px;
              img {
                width: 100%;
              }
              span {
                position: absolute;
                right: 0;
                bottom: 4px;
                border-top-left-radius: 6px;
                padding: 2px 6px;
              }
            }
          }
        }
      }
    }

    .mock-logo {
      ul {
        display: flex;
        justify-content: space-around;
        height: 110px;
        align-items: center;
        border-bottom: 1px solid #eee;
        li {
          height: 100px;
          display: flex;
          width: 16%;
          flex-wrap: wrap;
          justify-content: center;
          text-align: center;

          img {
            width: 50px;
            height: 50px;
          }
          span {
            font-weight: normal;
          }
        }
      }
    }
  }
  .tips {
    width: 200px;
    border-radius: 10px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    color: #fff;
    background-color: rgba($color: #000000, $alpha: 0.5);
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    top: 50px;
    &.tips-enter-active {
      animation: tips 3s;
    }
  }
}

@keyframes tips {
  0% {
    top: 50px;
    opacity: 0;
  }
  20% {
    top: 110px;
    opacity: 1;
  }
  80% {
    top: 110px;
    opacity: 1;
  }
  100% {
    top: 50px;
    opacity: 0;
  }
}
</style>

