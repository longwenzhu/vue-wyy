<template>
  <div class="search-list">
    <transition name="dis">
      <div class="cancel" @click="hideList">取消</div>
    </transition>
    <div @click="getKeyword($event)">
      <div class="keyword" v-if="value && !result">
        <p class="inner-text" :text="value">搜索 “{{value}}”</p>
        <ul>
          <li
            v-for="(text, index) in listSearch"
            :text="text.keyword"
            class="inner-text"
            :key="index"
          >
            <van-icon name="search"/>
            <span class="inner-text">{{text.keyword}}</span>
          </li>
        </ul>
      </div>
      <template v-else-if="!value && !result">
        <div class="hot-search">
          <div class="title">热门搜索</div>
          <ul class>
            <li
              v-for="(hot,index) in hotSearch"
              :key="index"
              @click="handleHot(hot.first)"
              :text="hot.first"
              class="inner-text"
            >{{hot.first}}</li>
          </ul>
        </div>
        <div class="history-search">
          <div class="title delete">
            <span>搜索历史</span>
            <van-icon name="delete" size="22px" v-if="historySearch.length" @click="clearHistory"/>
          </div>
          <ul>
            <li
              v-for="(text,index) in historySearch"
              :text="text"
              class="inner-text"
              :key="index"
            >{{text}}</li>
          </ul>
        </div>
      </template>
    </div>
    <search-result v-show="value && result" ref="sr"/>
  </div>
</template>

<script>
import SearchResult from "./SearchResult";
import { mapMutations } from "vuex";
import { Icon } from "vant";
export default {
  props: ["defaultKeyword"],

  data() {
    return {
      hide: "",
      disList: "disList",
      result: false,
      listSearch: [],
      hotSearch: [],
      historySearch: [],
      storageHistorySearch:[]
    };
  },
  components: {
    [Icon.name]: Icon,
    SearchResult
  },
  created() {},
  methods: {
    ...mapMutations(["showMusicBut"]),
    hideList() {
      this.showMusicBut();
      this.disList = "";
      this.$parent.value = "";
      this.$parent.disSearchList = false;
      this.result = false;
    },
    handleHot(text) {
      this.historySearch.unshift(text);
      this.historySearch = this.historySearch.filter((ele, index) => {
        if (index == 0 || text != ele) {
          return true;
        } else {
          return false;
        }
      });
      localStorage.storageHistorySearch = JSON.stringify(this.historySearch);
    },
    clearHistory() {
      if (confirm("确定要清空历史吗")) {
        localStorage.storageHistorySearch = JSON.stringify([]);
        this.historySearch = [];
      }
    },
    getKeyword(e, val) {
      let keyWord;
      if (val) {
        keyWord = val;

        this.handleHot(keyWord);
      } else {
        let target = e.target;
        if (!target.classList.contains("inner-text")) {
          return;
        }
        while (!target.getAttribute("text")) {
          target = target.parentElement;
        }
        keyWord = target.getAttribute("text");
      }
      this.handleHot(keyWord);
      this.$parent.value = keyWord;
      this.result = true;
      this.$refs.sr.result(keyWord, 'clear');

    }
  },
  computed: {
    value() {
      if (this.$parent.value) {
        this.axios
          .get("/search/suggest", {
            params: {
              keywords: this.$parent.value,
              type: "mobile"
            }
          })
          .then(res => {
            this.listSearch = res.data.result.allMatch;
          });
      }
      return this.$parent.value;
    }
  },
  created() {
    this.axios.get("/search/hot").then(res => {
      this.hotSearch = res.data.result.hots;
    });
    this.historySearch = JSON.parse(localStorage.storageHistorySearch);
  },
  watch: {
    
  }
};
</script>

<style lang="scss">
@keyframes dis {
  0% {
    right: -34px;
  }
  100% {
    right: 10px;
  }
}
.search-list {
  width: 100%;
  overflow: hidden;
  margin-top: 50px;
  .keyword {
    p {
      padding-bottom: 10px;
      font-size: 15px;
      color: #1d86cb;
      padding-left: 10px;
      border-bottom: 0.5px solid #ccc;
    }
    ul {
      margin: 0 10px;
      li {
        padding: 12px 0;
        border-bottom: 0.5px solid #ccc;
        * {
          vertical-align: middle;
        }
        i {
          font-size: 16px;
          color: #ccc;
        }
      }
    }
  }
  .cancel {
    position: fixed;
    right: 10px;
    top: 13px;
    z-index: 10;
    font-size: 16px;
    color: #fff;

    &.dis-enter {
      right: 32px;
    }
    &.dis-enter-active,
    .dis-leave-active {
      transition: all 0.2s;
    }
  }
  .hot-search,
  .history-search {
    margin: 0 10px;
    .title {
      font-size: 18px;
      font-weight: bold;
      &.delete {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    ul {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 20px;
      li {
        padding: 6px 10px;
        background: #f8e9e9;
        border-radius: 16px;
        margin: 8px 12px 8px 0;
      }
    }
  }
}
</style>