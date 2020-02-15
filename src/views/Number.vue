<template>
  <div class="number">
     <div class="title">账号</div>
    <div class="login-content" v-if="loginData" >
      
      <div class="user-info">
        <img :src="loginData.profile.avatarUrl" alt="">
        <span> {{loginData.profile.nickname}} </span>
      </div>
      <div class="user-state">
        <div class="item">
          <div class="text">动态</div>
          <div class="count">0</div>
        </div>
        <div class="item">
          <div class="text">关注</div>
          <div class="count">0</div>
        </div>
        <div class="item">
          <div class="text">粉丝</div>
          <div class="count">0</div>
        </div>

      </div>
      <div class="sign-out" @click="signOut">
        退出登录
      </div>
    </div>
    <div class="sign-out-content" v-else>
      
    <div>登录网易云音乐</div>
    <div>手机电脑多端同步，尽享海量高品质音乐</div>
    <div class="button" @click="login">
      立即登录
    </div>
    </div>
    {{updataLogin}}
  </div>  
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data(){
    return{
      loginData: null
    }
  },
  computed: {
    ...mapState(['updataLogin'])
  },
  methods: {
    login(){
      this.$router.push('/login');
    },
    signOut(){
      if(confirm('确定要退出吗')){
        this.$store.commit('signOutLogin');
      }
    }
  },
  activated(){
  },
  created(){
  },
  watch: {
    updataLogin:{
     immediate: true,
     handler(){
       if(localStorage.isLogin == 'yes'){
         console.log(this.loginData)
         this.loginData = JSON.parse(localStorage.user)
       }else{
         this.loginData = null;
       }
     }
    }
  }
}
</script>

<style lang="scss">
.number{

  .title{
    color: #fff;
    font-size: 18px;
    height: 50px;
    width: 100%;
    background-color: #d23023;
    text-align: center;
    line-height: 50px;
    margin-top: -2px;
  }
  .login-content{
    margin:  15px ;
    .user-info{
      display: flex;
      align-items: center;
      img{
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }
      span{
        font-size: 16px;
        margin-left: 10px;
      }
    }
    .user-state{
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin-top: 20px;
      .text{
        color: gray;
      }
    }
    .sign-out{
      width: 100%;
      color: #fff;
      margin: 30px 0;
      text-align: center;
      background: sandybrown;
      height: 50px;
      line-height: 50px;
      border-radius: 30px;
      font-size: 20px;
    }
  }
  .sign-out-content{
    margin: 15px;
    display: flex;
   align-items: center;
    font-size: 16px;
    flex-direction: column;
    .button{
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      font-size: 17px;
      border: 1px solid gray;
      border-radius: 30px;
      margin: 20px 0;
    }
  }

}
</style>