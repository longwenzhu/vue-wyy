<template>
  <div class="login">
    <div class="login-box" :style="{transform:'translateX('+offsetX+'%)'}">
      <div class="login-option">
        <van-icon name="cross" size="24px" color="#ccc" @click="back"/>
        <div class="middle-inner">
          <span>登录</span>
          <div class="logo"></div>
          <div class="but" @click="goLogin(loginData.login)">手机号登录</div>
          <div class="but" @click="goLogin(loginData.logon)">注册</div>
        </div>
      </div>
      <div class="login-page" v-if="pageData">
        <div class="top-text">
          <van-icon name="arrow-left" @click="offsetX=0"/>

          <span>{{pageData.title}}</span>
        </div>
        <form action="#" @submit.prevent="submit">
          <input type="number" :placeholder="pageData.placeholder[0]" v-model="userName">

          <div class="validation" v-if="isLogon">
            <input type="number" placeholder="验证码" v-model="validation" ref="top">
            <div
              @click="getValidation"
              :style="{background: sendValidation ? '#f5b6b1' : '#d23023'}"
            >{{sendValidation ? `已发送${time}` : '发送验证码'}}</div>
          </div>
          <input type="text" name placeholder="昵称" v-if="isLogon" v-model="name">
          <input type="password" :placeholder="pageData.placeholder[1]" v-model="password">

          <input type="password" placeholder="确认密码" v-model="againPassword" v-if="isLogon">
          <button
            type="submit"
            :style="{backgroundColor: inner ? '#f5b6b1': '#d23023'}"
          >{{pageData.placeholder[2]}}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon, Toast } from "vant";
export default {
  data() {
    return {
      loginData: {
        login: {
          title: "手机号登录",
          placeholder: ["手机号", "密码", "登录"]
        },
        logon: {
          title: "注册",
          placeholder: ["输入手机号", "设置登录密码，密码不少于6位", "注册"]
        }
      },
      pageData: null,
      offsetX: 0,
      userName: "",
      password: "",
      againPassword: "",
      name: "",
      validation: "",
      sendValidation: false,
      time: 60,
      test: false
    };
  },
  components: {
    [Icon.name]: Icon
  },
  methods: {
    back() {
      history.back();
    },
    goLogin(val) {
      this.offsetX = -50;
      this.pageData = val;
    },
    submit() {
      if (this.inner) {
        return;
      }
      if (this.pageData.title == "手机号登录") {
        if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(this.userName)) {
          Toast("手机号格式有误");
          return;
        }
        this.axios
          .get("/login/cellphone", {
            params: {
              phone: this.userName,
              password: this.password
            }
          })
          .then(res => {
            if (res.data.code == 502) {
              console.log(res);
              Toast("密码或手机号错误");
            } else {
              history.back();
              this.$store.commit("successLogin", res.data);
              return res.data;
            }
          })
          // .then(res => {
          //   return this.axios
          //     .get("/user/playlist?uid=" + res.bindings[0].userId)
          //     .then(res => {
          //       this.songData = res.data.playlist;
          //       return res.data.playlist;
          //     });
          // })
          // .then(res => {
          //   console.log(res);
          // });
      } else {
        if (this.password != this.againPassword) {
          alert("两次输入的密码不一致");
        }
        this.axios
          .get("/captcha/verify", {
            params: {
              phone: this.userName,
              captcha: this.validation
            }
          })
          .then(
            res => {
              if (res.data.code == 200) {
                this.axios
                  .get("/register/cellphone", {
                    params: {
                      phone: this.userName,
                      password: this.password,
                      captcha: this.captcha,
                      nickname: this.name
                    }
                  })
                  .then(res => {
                    this.$store.commit("successLogin", res.data);
                    history.back();
                  });
              }
            },
            rej => {
              alert("验证码错误");
            }
          );
      }
    },
    getValidation() {
      if (this.sendValidation) {
        return;
      }
      if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(this.userName)) {
        alert("手机号格式有误");
        return;
      }
      this.axios
        .get("/cellphone/existence/check?phone=" + this.userName)
        .then(res => {
          if (res.data.hasPassword) {
            alert("该账号已注册");
          } else {
            this.axios.get("/captcha/sent?phone=" + this.userName).then(res => {
              console.log(res);
              this.sendValidation = true;
            });
          }
        });
    }
  },
  computed: {
    isLogon() {
      return this.pageData.title == "注册";
    },
    inner() {
      if (this.isLogon) {
        return (
          !this.userName ||
          !this.validation ||
          !this.name ||
          !this.validation ||
          !this.password ||
          !this.againPassword
        );
      } else {
        return !this.userName || !this.password;
      }
    }
  },
  watch: {
    sendValidation() {
      if (this.sendValidation) {
        const timer = setInterval(() => {
          this.time--;
          if (this.time == 0) {
            this.sendValidation = false;
            clearInterval(timer);
          }
        }, 1000);
      }
    }
  },
  activated() {
    this.offsetX = 0;
    this.userName = "";
    this.password = "";
  },
  mounted() {}
};
</script>

<style lang="scss">
.login {
  z-index: 21;
  overflow: hidden;
  .login-box {
    width: 200vw;
    height: 100%;

    box-sizing: border-box;
    background-color: #fff;
    display: flex;
    transition: transform 0.4s;
    .login-option {
      padding-top: 15px;
      box-sizing: border-box;
      width: 100vw;
      .van-icon {
        margin-left: 10px;
      }
      .middle-inner {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 500px;
        align-items: center;
        .logo {
          width: 140px;
          height: 140px;
          border-radius: 10px;
          background-image: url(../assets/picture/other/logo.jpg);
          background-size: 160%;
          background-position: -44px 5px;
          margin: 80px 0;
        }
        .but {
          width: 280px;
          height: 45px;
          margin: 10px 0;
          color: #f02a27;
          border: 1px solid #f02a27;
          text-align: center;
          line-height: 45px;
          border-radius: 30px;
          font-size: 18px;
        }
      }
    }
    .login-page {
      position: relative;

      width: 100vw;
      height: 100vh;
      box-sizing: border-box;
      .top-text {
        width: 100vw;
        height: 40px;
        padding-bottom: 10px;
        align-items: flex-end;
        display: flex;
        justify-content: center;
        position: relative;
        background-color: #d23023;
        color: #fff;
        font-size: 16px;
        i {
          position: absolute;
          left: 10px;
          font-size: 22px;
        }
      }
      form {
        margin: 20px 15px;
        display: flex;
        flex-direction: column;
        * {
          border: unset;
          height: 36px;
          box-sizing: unset;
          border-radius: 0;
          appearance: unset;
          font-size: 16px;
          padding: 0;
        }
        .validation {
          border-bottom: 0.5px solid #ccc;
          padding: 6px 0;
          position: relative;
          div {
            position: absolute;
            line-height: 25px;
            top: 50%;
            transform: translateY(-50%);
            height: initial;
            padding: 6px 10px;
            border-radius: 20px;
            right: 0;
            background: #d23023;
            color: #fff;
          }
          input {
            border: none;
            padding: 0;
          }
        }

        input {
          padding: 6px 0;
          border-bottom: 0.5px solid #ccc;
          width: 100%;
        }
        input:nth-child(3) {
          //  border-top: 0.5px solid #ccc;
        }

        button {
          border-radius: 20px;
          margin-top: 20px;
          height: 40px;
          font-size: 20px;
          background: #d23023;
          color: #fff;
        }
        // .vaildation{
        //    position: absolute;
        //     // padding: 6px 10px;
        //     line-height: 25px;
        //     top: 43px;
        //     border-radius: 20px;
        //     height: initial;
        //     right: 0;
        //     background: #d23023;
        //     color: #fff;
        //     border: 1px solid black;

        // }
      }
      .vaildation {
        position: absolute;
        // padding: 6px 10px;
        line-height: 25px;
        top: 260px;
        border-radius: 20px;
        height: initial;
        right: 0;
        background: #d23023;
        color: #fff;
        border: 1px solid black;
      }
    }
  }
}
</style>