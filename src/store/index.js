import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isDisMusicBut: true,
    updataLogin: false,
    playActiveId: 0,
    songGroup: [],
    zIndex:false
    
  },
  mutations: {
   disMusicBut(state){
     state.isDisMusicBut = false;
      
   },
   showMusicBut(state){
    state.isDisMusicBut = true;
   },
   successLogin(state, data){
    state.isLogin = true;
    window.localStorage.isLogin = 'yes';
    state.updataLogin = !state.updataLogin;
    window.localStorage.user = JSON.stringify(data);
    
    console.log('success')

   },
   signOutLogin(state){
    state.isLogin = false;
    this._vm.axios.get('/logout').then(res => {
      console.log(res,'退出')
      window.localStorage.user = ''
    window.localStorage.isLogin = 'no';
    state.updataLogin = !state.updataLogin;

    })
   },
   changePlayId(state, id){
     state.playActiveId = id;
   },
   setSongGroup(state, val){
     state.songGroup = val;
   },
   setZindex(state, val){
     state.zIndex = val;
     console.log(state.zIndex)
   }
  },
  actions: {
  },
  modules: {
  }
})
