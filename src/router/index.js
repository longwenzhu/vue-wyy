import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: (to) => {
      if(to.path == '/'){
        return '/discover'
      }else{
        return {name: 'notfind'}
      }
    }
  },
  {
    path: '/notfind.html',
    name: 'notfind',
    component: () => import('../views/Error')
  },
  {
    path: '/discover',
    name: 'discover',
    component: () => import('../views/Discover'),
    meta: {
      grade: 1
    }
  },
  {
    path: '/video',
    name: 'video',
   
    component: () => import( '../views/Video'),
    meta: {
      grade: 1
    }
  },
  {
    path: '/mi',
    name: 'mi',
   
    component: () => import( '../views/Mi'),
    meta: {
      grade: 1
    }
  },
  {
    path: '/number',
    name: 'number',
   
    component: () => import( '../views/Number'),
    meta: {
      grade: 1
    }
  },
  {
    path: '/panel',
    name: 'panel',
    component: () =>import('../views/PlayPanel'),
    meta: {
      grade: 10
    }

  },
  {
    path: '/songlist/:id',
    name: 'songlist',
    component: () => import('../views/SongList'),
    meta: {
      grade: 2,
    }

  },
  {
    path: '/comment',
    name: 'comment',
    component: () => import('../views/Comment'),
    meta: {
      grade: 5,
    }

  },
  {
    path: '/song-c',
    name: 'song-c',
    component: () => import('../views/Comment'),
    meta: {
      grade: 12,
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login'),
    meta: {
      grade: 13,
    }

  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
