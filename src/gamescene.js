var layers = {};

//首先创建一个firstScene的场景
   var firstScene = cc.Scene.extend({
       onEnter:function(){
               this._super();
           //创建场景精灵资源
                var bg = new cc.Sprite(res.bg);
           //设置精灵属性
             bg.attr({
                 //设置锚点，应该就是图片中心点
                 anchorX:0.5,
                 anchorY:0.5,
                 //设置----------------------
                 x : cc.winSize.width/2,
                 y : cc.winSize.height/2

             });
           //每创建完一个精灵之后要做的一定是把它添加到节点当中去，因为引擎的渲染是通过遍历节点来实现的
           //sprite->layer->scene

           //因为他整个游戏只创建了一个scene，然后切换的都是层，这种奇怪的写法你看下。要包括赢，失败，，开始
           //----------------------------这段代码不是很理解是什么意思
        /*  layers.game = new GameLayer();
           this.addChild(layers.game);*/

           layers.startUI = new StartUI();
           this.addChild(layers.startUI);

           /*layers.winUI = new ResultUI(true);
           layers.loseUI = new ResultUI(false);
*/

       }
   });

var StartUI = cc.Layer.extend({
    ctor:function(){
        this._super;
        var start = new cc.Sprite(res.begin_up);
        start.x = cc.winSize.width/2;
        start.y = cc.winSize.height/2;
        this.addChild(start);
    },
    //进入后操作的函数
      onEnter:function(){
          this._super;
          //添加监听事件 事件分发机制
          /*事件监听器统一由 cc.eventManager 来进行管理, 它是一个单例对象。它的工作需要三部分组成：
           *事件管理器 cc.eventManager
           *事件类型 cc.EventTouch, cc.EventKeyboard 等
           *事件监听器 cc.EventListenerTouch, cc.EventListenerKeyboard 等
           *监听器实现了各种触发后的逻辑，在适当时候由 事件管理器分发事件类型，然后调用相应类型的监听器。
          * */
           cc.eventManager.addListener(
               {

               }
           )
      }
})