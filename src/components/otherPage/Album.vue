<template>
    <div>
      <div class="album-wrap">
          <div class="circle">
             <div class="bg" :style="{transform: `rotateZ(${angle}deg)`}">
                  <img :src="url" alt="">
             </div>
          </div>
          <div class="option" >
              <div class="like"  btn="btn" @click="liked = !liked">
                  <van-icon name="like-o" v-if="!liked"/>
                  <van-icon name="like" v-else color="red"/>
              </div>
              <router-link class="album-comment"  btn="btn"
              :to="{name:'song-c',query:{name:songName,picUrl:url,id:id,
              httpUrl: '/comment/music'}}"
              tag="div"
              >
                  <van-icon name="comment-o" />
                  <span>{{handleCount(comments.total)}}</span>
              </router-link>
          </div>
      </div>
    </div>
</template>
<script>
import { Icon } from 'vant';
export default {
    data(){
        return{
            liked: false,
            angle: 0,
           
        }
    },
    components: {
        [Icon.name]: Icon
    },
    props: ['url', 'comments','paused','toggleAlbum',
    'routeLeave','songName','id'

    ],
    created(){
        console.log(this.url, this.comments)
    },
    methods: {
        rotate(stop){
            const start = () => {
                
                if(this.stop){
                    return;
                }else{
                    console.log('rotate')
                    this.angle += 0.3;
                    this.angle = this.angle >= 360 ? 0 : this.angle;
                    requestAnimationFrame(start);
                }
            }
            requestAnimationFrame(start);

        },
        handleCount(count){
            return count / 10000 > 1 ? Math.floor(count / 10000) + 'w+' : count;
        }
    },
    watch:{
        stop(){
           this.rotate();
        }
    },
    computed:{
        stop(){
            return !this.toggleAlbum || this.paused || this.routeLeave
        }
    }
}
</script>
<style lang="scss">
    .album{
        border-top: 0.5px solid #eee;
        position: absolute;
       width: 100%;
       height: calc(100% - 15px);
       .album-wrap{
           height: inherit;
           .circle{
               height: calc(100% - 30px);
               position: relative;
               display: flex;
               justify-content: center;
               align-items: center;
               .bg{
                   width: 290px;
                   height: 290px;
                   background: url(../../assets/picture/other/singlecover.png);
                    background-size: 100%;
                   background-repeat: no-repeat;
                    display: flex;
               justify-content: center;
               align-items: center;
                   img{
                       width: 70%;
                       border-radius: 50%;
                   }
               }
           }
           .option{
               height: 30px;
               display: flex;
               justify-content: space-around;
               color: #eee;
               .like,.album-comment{
                   width: 40px;
                   display: flex;
                   flex-wrap: wrap;
                   justify-content: center;
                   align-content: center;
                   
               }
               .like{
                   height: initial;
                   i{
                       font-size: 25px;
                   }
                  
                   
               }
               .album-comment{
                   width: 30px;
                    i{
                       font-size: 20px;
                   }
                 span{
                     font-size: 10px;
                 }

               }
               
           }
           
       }
    }
</style>

