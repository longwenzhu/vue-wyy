export default tab;

function tab($){
    const tab = $('#my-tab');
    const head = tab.find('.head');
    const body = tab.find('.body');
    const title = head.find('.title');
    let bar;
  
    
   initCss();
   
   computedPosition(title.eq(0),'init');


   function initCss(){
   
    body.find('.content').eq(0).addClass('active');
    head.find('.title').eq(0).addClass('active');
    bar = $('<div class="tab-active">').appendTo(head);
    head.on('click', '.title', e => {
        const index = $(e.target).index();
        computedPosition(title.eq(index))
        $('.active').removeClass('active');
        $(e.target).addClass('active');
        body.find('.content').eq(index).addClass('active');
    })
   }

   function computedPosition($dom){
       const offset = $dom.offset().left;
       const screenW = $(document).width() / 2;
       const $domW = $dom.width();
       let scrollX = head.scrollLeft();

       let timer;
        let temp;
       let target = offset - screenW + $domW / 2 + scrollX;
       let speeed = target > head.scrollLeft() ? 3 : -3;
       bar.css('left', offset + ($domW - bar.width()) / 2 + scrollX)
        
        
        timer = setInterval(function() {
            if(offset + $domW / 2  <= screenW && speeed > 0){
                clearInterval(timer)
            }
            head.scrollLeft(head.scrollLeft() + speeed);
            if(temp == head.scrollLeft()){
                 
                head.scrollLeft(target);
                clearInterval(timer)
            }else{
                if(head.scrollLeft() >= target && speeed > 0){
                
                    head.scrollLeft(target);
                    clearInterval(timer)
                }else if(head.scrollLeft() <= target && speeed < 0){
                    head.scrollLeft(target);
                    clearInterval(timer)
                }
            }
            
            temp = head.scrollLeft();
        },)
       
    
    
   }
}

/**
 * html结构
 *  <div id="my-tab">
    <div class="head">
      <div class="title">title1</div>
      <div class="title">title2</div>
      <div class="title">title1</div>
      <div class="title">title2</div>
      <div class="title">title1</div>
      <div class="title">title2</div>
    </div>
    <div class="body">
      <div class="content">content1</div>
      <div class="content">content2</div>
      <div class="content">content3</div>
      <div class="content">content4</div>
    </div>
  </div>
 * 
 */