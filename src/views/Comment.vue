<template>
  <div class="comment" @scroll="scroll" ref="dom" :style="{zIndex: zIndex}">
    <div ref="inner">
      <div style="height:50px">
        <div class="top-comment" v-if="commentTitle">
          <van-icon name="arrow-left" color="#fff" @click="back"/>
          <div class="count">评论({{commentData ? commentData.total : 0}})</div>
        </div>
      </div>
      <div class="song-title" v-if="commentTitle">
        <img :src="commentTitle.picUrl" alt>
        <span>{{commentTitle.name}}</span>
      </div>
      <div class="comment-list" @click="like" v-if="commentData">
        <div class="hot" v-if=" commentData.hotComments.length">
          <div class="hot-comment">精彩评论</div>
          <ul>
            <li v-for="item in commentData.hotComments" :key="item.commentId">
              <div class="user">
                <div class="user-info">
                  <img :src="item.user.avatarUrl" alt>
                  <div class="name-time">
                    <div class="name">{{ item.user.nickname }}</div>
                    <div class="time">{{ new Date(item.time).toLocaleString()}}</div>
                  </div>
                </div>
                <div class="like">
                  <span>{{item.likedCount}}</span>
                  <van-icon name="good-job-o" color="#bbb"/>
                </div>
               
              </div>
              <div class="text">{{item.content}}</div>
               <div class="reply" v-if="item.beReplied.length">
                {{item.beReplied[0].user.nickname
                +': ' + item.beReplied[0].content 
                }}
              </div>
            </li>
          </ul>
        </div>
        <div class="news">
          <div class="hot-comment news-comment">最新评论</div>
          <ul>
            <li v-for="item in comments" :key="item.commentId">
              <div class="user">
                <div class="user-info">
                  <img :src="item.user.avatarUrl" alt>
                  <div class="name-time">
                    <div class="name">{{ item.user.nickname }}</div>
                    <div class="time">{{ new Date(item.time).toLocaleString() }}</div>
                  </div>
                </div>
                <div class="like">
                  <span>{{item.likedCount}}</span>
                  <van-icon name="good-job-o" color="#bbb"/>
                </div>
              </div>
              <div class="text">{{item.content}}</div>
              <div class="reply" v-if="item.beReplied.length">
                {{item.beReplied[0].user.nickname
                +': ' + item.beReplied[0].content 
                }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <van-loading v-if="loading" :class="scrollB" size="24px">加载中...</van-loading>
  </div>
</template>

<script>
import { Icon, Loading } from "vant";

export default {
  data() {
    return {
      commentTitle: null,
      commentData: null,
      comments: [],
      loading: true,
      offset: 0,
      scrollB: "",
      get: false,
      transitionend: false,
      onlyForward: false,
      zIndex: 0
    };
  },
  computed: {},
  components: {
    [Icon.name]: Icon,
    [Loading.name]: Loading
  },
  methods: {
    back() {
      history.back();
    },
    scroll() {
      if (
      Math.ceil( innerHeight + this.$refs.dom.scrollTop) >=
       this.$refs.inner.offsetHeight
      ) {
        this.scrollB = "scroll-b";
        this.getData();
        console.log("到底了");
      }
    },
    getData() {
      if(this.get){
        return;
      }
      this.get = true;
      setTimeout(() => {
        this.get = false;
      },2000)
      this.loading = true;
      const url = this.commentTitle.httpUrl ?  this.commentTitle.httpUrl : '/comment/playlist'
      this.axios
        .get(url, {
          params: {
            id: this.commentTitle.id,
            offset: this.offset * 20
          }
        })
        .then(res => {
          this.commentData = this.offset ? this.commentData : res.data;
          this.offset++;
          this.comments = this.comments.concat(res.data.comments);
          console.log(this.comments)
          this.loading = false;
          this.scrollB = "";
        });
    },
    like(e){
      const target  = e.target.parentElement;
     if(target.classList.contains('like')){
        const dom = target.getElementsByTagName('span')[0];
      
    
      if(target.classList.contains('liked')){
          dom.innerHTML = +dom.innerHTML - 1
      }else{
         dom.innerHTML = +dom.innerHTML + 1;
      }
        target.classList.toggle('liked');
     }
    }
  },
  activated() {
    this.commentTitle = this.$route.query;
    this.offset = 0;
   if(this.onlyForward){
     console.log(423423)
      this.comments = [];
      this.commentData = null;
   }
    
    this.transitionend = false;
    setTimeout(() => {
      this.transitionend = true;
    }, 400);
    this.zIndex = this.$route.meta.grade;
  },
  watch:{
    transitionend(val){
      if(val && this.onlyForward){

         this.getData();
      }
    },
     $route(to, from) {
      if (to.meta.grade > from.meta.grade) {
        this.onlyForward = true;
      } else {
        this.onlyForward = false;
      }
    },
  }
};
</script>

<style lang="scss">
.comment {
  background-color: #fff;

  z-index: 5;
  .top-comment {
    color: #fff;
    font-size: 18px;
    background-color: #d23023;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 2;
    i {
      position: absolute;
      left: 15px;
      font-size: 26px;
    }
  }
  .song-title {
    margin: 10px;
    img {
      width: 80px;
      height: 80px;
      border-radius: 10px;
      vertical-align: middle;
    }
    span {
      font-size: 15px;
      vertical-align: middle;
    }
  }
  .comment-list {
    padding-bottom: 20px;
    .hot,
    .news {
      .hot-comment {
        position: sticky;
        background: #eee;
        color: #575353;
        padding: 6px 10px;
        top: 50px;
        z-index: 1;
        margin-bottom: 10px;
      }
      ul {
        margin: 0 10px;
        li {
          .user {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #575353;
            .user-info {
              display: flex;
              align-items: center;
              img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
              }
              .name-time {
                height: 30px;
                .name {
                  font-size: 12px;
                }
                .time {
                  font-size: 11px;
                  color: #828282;
                }
              }
            }
            .like {
              * {
                vertical-align: middle;
              }
              span {
                font-size: 13px;
                padding-right: 4px;
                color: #aaa;
              }
              i {
                font-size: 20px;
                vertical-align: -5px;
              }
              &.liked{
               span{
                  color: #d23023;
               }
               i{
                 color: #d23023 !important;
                 animation: liked .5s;
               }
              }
            }
          }
          .text {
            margin: 10px 0 10px 50px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
            line-height: 23px

          }
          .reply{
            margin-left: 50px;
            border: 0.5px solid #828282;
            color: #828282;
            padding: 10px;
            line-height: 23px;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
  .van-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    &.scroll-b {
    position: fixed;

      bottom: 4px;
      top: initial;
      transform: translate3d(-50%, 0, 0);
    }
  }
}
@keyframes liked{
  20%{
    transform: scale(1.5);
  }
  40%{
    transform: scale(0.7);
  }
  60%{
    transform: scale(1.3);
  }
  80%{
    transform: scale(0.9);
  }
  100%{
    transform: scale(1);
  }
}
</style>