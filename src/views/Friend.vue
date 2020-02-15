<template>
  <div>
   
    <swiper :options="swiperOption" ref="mySwiper" >
    <!-- slides -->
    <swiper-slide v-for="num in 6" :key="num">I'm Slide {{num}}</swiper-slide>
    
    <!-- Optional controls -->
    <div class="swiper-pagination"  slot="pagination"></div>
    <div class="swiper-button-prev" slot="button-prev"></div>
    <div class="swiper-button-next" slot="button-next"></div>
    <div class="swiper-scrollbar"   slot="scrollbar"></div>
  </swiper>
  </div>

</template>

<script>
import 'swiper/dist/css/swiper.css';
import { swiper, swiperSlide } from 'vue-awesome-swiper'
export default {
  data(){
    return {
      test: false,
         swiperOption: {
         loop: true,
        autoplay: {
          delay: 1000
        },
       pagination: {
          el: '.swiper-pagination',
         type: 'bullets'
       }
      }
    
    }
    
  },
  components: {
    swiper,
    swiperSlide
  },
  created(){
  
  },
 
  methods: {
  
  },
  mounted(){
  
   
  },
  computed: {
    
  },
  watch:{
   
  }

}
</script>

<style lang="scss">

// .box1,.box2{
//   width: 200px;
//   height: 200px;
//   background: red;
// }
// .box1{
//   background: black;
// }
</style>