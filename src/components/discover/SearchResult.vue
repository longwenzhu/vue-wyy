<template>
  <div class="search-result" @scroll="scroll">
    <van-loading size="24px" :class="offsetBottom" v-if="loading">加载中...</van-loading>
    <div class="result" v-if="songData.length" ref="ul">
      <div class="title">单曲</div>
      <ul @click="toPlay">
        <li
          v-for="song in songData"
          :key="song.id"
          :id="song.id"
          :class="song.id == playActiveId ? 'play-active' : ''"
        >
          <van-icon name="volume-o" v-if="song.id == playActiveId"/>
          <div class="song-info">
            <div class="name" v-html="replace(song.name)"></div>
            <div class="artists" v-html=" replace(song.artists[0].name + ' - ' + song.album.name)"></div>
          </div>
        </li>
        <div class="over" v-if="over">到底了</div>
      </ul>
    </div>
  </div>
</template>
<script>
import { Loading, Icon } from "vant";
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      loading: true,
      songData: [],
      wd: "",
      offsetBottom: "",
      offset: 0,
      interval: null,
      over: false,
      length: 0
    };
  },
  components: {
    [Loading.name]: Loading,
    [Icon.name]: Icon
  },
  computed: {
    ...mapState(["playActiveId"])
  },
  methods: {
    result(wd, clear) {
      if (clear) {
        this.songData = [];
        this.offset = 0;
        this.over = false;
      } else {
        this.offsetBottom = "b-t";
      }
      this.wd = wd;

      let i = this.offset * 30 > this.length ? "over" : this.offset * 30;
      if (i == "over") {
        this.loading = false;
        this.over = true;
        return;
      } else {
        this.loading = true;
      }

      this.axios
        .get("/search", {
          params: {
            keywords: wd,
            offset: i
          }
        })
        .then(res => {
          this.loading = false;
          this.songData = this.songData.concat(res.data.result.songs);
          this.length = res.data.result.songCount;
          this.offsetBottom = "";
        });
    },
    toPlay(e) {
      for (
        var target = e.target;
        !target.getAttribute("id");
        target = target.parentElement
      );
      const id = target.getAttribute("id");
      this.$store.commit("changePlayId", id);
      this.$router.push({
        name: "panel",
        query: {
          id: id
        }
      });
    },
    replace(val) {
      const str = `<span style="color:red">${this.wd}</span>`;
      return val.replace(this.wd, str);
    },
    scroll(e) {
      const dom = e.target || document.createElement("div");

      if (this.interval) {
        return;
      }

      if (
        Math.ceil(dom.scrollTop + dom.clientHeight) >=
        this.$refs.ul.clientHeight
      ) {
        console.log("daole");
        if (this.songData.length < 30) {
          this.over = true;
          return;
        }
        this.offset++;

        this.result(this.wd);
        this.interval = true;
        setTimeout(() => {
          this.interval = false;
        }, 2000);
      }
    }
  },
  watch: {},
  created() {
    // setTimeout(() => {
    //      const dom = document.getElementsByClassName('router-view')[0]
    //   dom.onscroll = () => {
    //       console.log(33)
    //   }
    // })
  },
  activated() {
    // console.log(this.keyword)
    // this.axios.get('/search', {
    //    params: {
    //         keywords: this.wd,
    //     type: this.type
    //    }
    // }).then(res => {
    //     console.log(res.data)
    // })
    // this.axios.get('/related/allvideo?id=553310138').then(res => {
    //     console.log(res.data)
    // })
  }
};
</script>

<style lang="scss">
.search-result {
  box-sizing: border-box;
  height: calc(100vh - 105px);

  overflow-y: auto;
  .van-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.b-t {
      position: fixed;
      bottom: 46px;
      top: initial;
    }
  }
  .result {
    margin: 0 10px;
    padding-bottom: 30px;

    .title {
      font-size: 18px;
      padding: 10px 0;
      border-bottom: 0.5px solid #ddd;
      font-weight: bold;
    }
    li {
      display: flex;
      border-bottom: 0.5px solid #ddd;
      padding: 10px 0;
      align-items: center;
      .van-icon-volume-o {
        font-size: 20px;
        color: #d23023;
        margin-right: 10px;
      }
      .song-info {
        .name {
          font-size: 15px;
        }
        .artists {
          font-size: 13px;
          color: #aaa;
        }
      }
      &.play-active .name {
        color: #d23023;
      }
    }
    .over {
      text-align: center;
    }
  }
}
</style>
