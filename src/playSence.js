/*
*   我的思路是
 *       先建立好场景和图层
 *            先制作一个固定的砖块层
 *               再制作黄色的随机砖块层
 *                        在把player导入进去
 *                                      点击砖块并且激活                              接着我去创建了监听事件，来控制羊驼的移动
         *                                   http://www.ipastimes.com/post/19.html  <plist引入图片的说明与方法>
   *               在构造函数中创建，在初始化函数中去设置其属性
    *               *                        */

//数据初始化
var OFFSET_X = 4,
    OFFSET_Y = 32,
    ROW = COL = 9,
    BLOCK_W = 32,
    BLOCK_H = 36,
    BLOCK_XREGION = 33,
    BLOCK_YREGION = 28,
    OFFSET_ODD = 16,
    BLOCK1_RECT = cc.rect(0, 0, BLOCK_W, BLOCK_H),
    ///rect是用于创建矩形裁剪区域的，用于裁剪一整个精灵图上的一部分
    BLOCK2_RECT = cc.rect(BLOCK_W, 0, BLOCK_W, BLOCK_H),
    PLAYER_W = 66,
    PLAYER_H = 118,
    PLAYER_OX = 0,
    MOVING_OY = 118,
    TRAPPED_OY = 0,
    START_UI_SIZE = cc.size(256, 454),
    FAIL_UI_SIZE = cc.size(292, 277),
    WIN_UI_SIZE = cc.size(308, 276);


var deliver=0;
var layers = {};

//----------------用来定位羊腿的
var vert_passed = [], hori_passed = [];
for (var r = 0; r < ROW; r++) {
    vert_passed.push([]);
    hori_passed.push([]);
    for (var c = 0; c < COL; c++) {
        vert_passed[r][c] = false;
        hori_passed[r][c] = false;
    }
}
var reinit_passed = function(passed) {
    for (var r = 0; r < ROW; r++) {
        for (var c = 0; c < COL; c++) {
            passed[r][c] && (passed[r][c] = false);
        }
    }
};


var PlayLayer = cc.Layer.extend({
    //声明变量
    bgSprite:null,
    active_nodes : null,
    active_blocks : null,
    batch : null,
    block_tex:null,
    inited:false,
    moving_action : null,
    trapped_action : null,
    step: 0,

    ctor:function () {
        this._super();
        var size = cc.winSize;

        // add bg
        this.bgSprite = new cc.Sprite(res.playing_output_png);
        this.bgSprite.attr({
            x: size.width / 2,
            y: size.height / 2
            //scale: 0.5,
            //rotation: 180
        });
        this.addChild(this.bgSprite, 0);
        /*this.addbird();*/
        //定义一个锚点，从左上角开始
        this.anchorX = 0;
        this.anchorY = 0;
        //建立起定义砖块的数据结构,active_是橙色的小砖块
        this.active_nodes = [];
        this.active_blocks = [];

        //初始化数组
        for(var r= 0 ;r<ROW;r++){
            for (var c = 0; c < COL; c++) {
                this.active_blocks.push([]);
                this.active_blocks[r][c] = false;
            }

        }
        //开始新建图层，就是格子块底部的block图层
        this.blocks = new cc.Layer();
        //这些位置是之前计算好的格子需要从哪里开始摆放
        this.blocks.x = OFFSET_X;
        this.blocks.y = OFFSET_Y;
        //创建后一定要添加，this应该是知道是playlayer，添加到他的上面，这样以上的代码就好理解了
        this.addChild(this.blocks);
        //为他创建了一个图层之后，那就可以创建砖块的节点，然后摆放上去了
        /*
        *     下面要学习一下SpriteBatchNode
             *     priteBatchNode就是cocos2d-x为了降低渲染批次而建立的一个专门管理精灵的类。
             *      CCSpriteBatchNode的初始化只要一张图片，也就是那张大图。然后把所有用到那张大图里面的小图的sprite都加到
             *      CCSpriteBatchNode的child，绘制效率就会提高。
             *     * */

    //另一个参数是什么意思？？？？用block创建了81个节点
        this.batch = new cc.SpriteBatchNode(res.block, 81);
        this.block_tex = this.batch.texture;

        var ox = x = y = 0, odd = false, block, tex = this.batch.texture;
        //循环某行
        for (var r = 0; r < ROW; r++) {
            //Blcck_yregion指代的是每一块砖块的高度
            y = BLOCK_YREGION * r;
            //砖块的铺路是和奇偶数相关的，odd在这里虽然是个bool值但是他在乘法计算当中为0,1，合理间隔开了砖块
            ox = odd * OFFSET_ODD;
            //循环该行某列
            for (var c = 0; c < COL; c++) {
                //计算出x值
                x = ox + BLOCK_XREGION * c;
                //开始一块一块的创建砖块，采用tex图上的block2——rect部分
                block = new cc.Sprite(tex, BLOCK2_RECT);
                //设置这块砖块的属性
                block.attr({
                    anchorX : 0,
                    anchorY : 0,
                    x : x,
                    y : y,
                    width : BLOCK_W,
                    height : BLOCK_H
                });

                this.batch.addChild(block,0);
            }
            odd = !odd;
        }
        //层级关系是playlayer->blocks->batch
        this.blocks.addChild(this.batch,0);
        //由于这个底部图片是不会变化的，所以我们将其烘焙了一下
        /*在游戏开发的过程中，经常会遇到作为UI或者不怎么修改的背景的层(Layer)， 这些层内容并不怎么变动。
        而在游戏的渲染过程中，这些层往往又会消耗大量的渲染时间，特别是比较复杂的UI界面，
        比如：在Canvas渲染模式中，一个Button会调用9次绘图(drawImage)。在复杂一些的UI场景中，会出现UI的绘图次
        数远大于实际游戏的绘图次数的情况，这对于性能资源非常稀缺的手机浏览器来说，会带来灭顶之灾。
         对于上述情况，我们给cc.Layer加入了bake的接口， 调用了该接口的层，会将自身以及其子节点都备份（烘焙/bake)
         到一张画布(Canvas)上，只要自身或子节点不作修改，
         下次绘制时，将直接把画布上的内容绘制上去。这样，原来需要调用N次绘图的层，就只需要调用一次绘图了。
         当该层不需要bake时，可以调用unbake来取消该功能*/
        this.blocks.bake();
        //添加player
        /*textureCache 纹理缓存是将纹理缓存起来方便之后的绘制工作。每一个缓存的图像的大小，颜色和区域范围都是可以被修改的。
        这些信息都是存储在内存中的，不用在每一次绘制的时候都发送给GPU。*/
        tex = cc.textureCache.addImage(res.player);
        var frame,
            rect = cc.rect(0,0,PLAYER_W,PLAYER_H),
            moving_frames = [],trapped_frames = [];

        /*精灵类cc.Sprite类直接继承了cc.Node类，具有cc.Node基本特征。
        *创建精灵对象可以使用构造函数实现，它们接受相同的参数，这些参数非常灵活。归纳起来创建精灵对象有4种主要的方式：
         1. 根据图片资源路径创建
         //图片资源路径
         var sp1 = new cc.Sprite("res/background.png");
         //图片资源路径和裁剪的矩形区域
         var sp2 = new cc.Sprite("res/tree.png",cc.rect(604, 38, 302, 295))
         根据精灵帧创建
         我们可以通过精灵帧缓存中获得精灵帧对象，再从精灵帧对象中获得精灵对象。
         //精灵帧缓存
         var spriteFrame = cc.spriteFrameCache.getSpriteFrame("background.png");
         var sprite = new cc.Sprite(spriteFrame);
         根据纹理创建精灵
         var texture = cc.textureCache.addImage("background.png");
         //指定纹理创建精灵
         var sp1 = new cc.Sprite(texture);
         //指定纹理和裁剪的矩形区域来创建精灵
         var sp2 = new cc.Sprite(texture, cc.rect(0,0,480,320));
         //创建纹理对象
        * */

        //这里在做的是精灵动画帧，，如果要调整图动画效果就是要在这边调整和制作
        //这里制作的是被捕的精灵动画帧
        for(var i= 0;i<6;i++){
            rect.x =PLAYER_OX +  i*PLAYER_W;
             frame = new cc.SpriteFrame(tex,rect);
             trapped_frames.push(frame);
         }
        //这里是行走的动画帧
             rect.y =  MOVING_OY;
             for(var i = 0 ;i<4;i++){
                 rect.x=PLAYER_OX +i*PLAYER_W;
                 frame =new cc.SpriteFrame(tex,rect);
                 moving_frames.push(frame);
             }
        //帧制作完毕之后，就应该连成动画了，Animation创建动画设置每一帧的间隔
           var  moving_animation = new cc.Animation(moving_frames,0.2);
           this.moving_action = new cc.animate(moving_animation).repeatForever();
        //设置将动画循环播放
        var trapped_animation = new cc.Animation(trapped_frames, 0.2);
        this.trapped_action = cc.animate(trapped_animation).repeatForever();

         this.player = new cc.Sprite(moving_frames[0]);

        //添加player       但是这个10是------------------------------？

        /*
        *        事件的处理机制学习与整理  *
        *       http://blog.csdn.net/tonny_guan/article/details/44780191
        *      事件源：事件源是Cocos2d-JS中的精灵、层	、菜单等节点对象。
          *    事件处理者
                 Cocos2d-JS中的事件处理者是事件监听器类cc.EventListener ，它包括几种不同类型的监听器：
                 cc.EventListener.ACCELERATION。加速度事件监听器。
                 cc.EventListener.CUSTOM。自定义事件监听器。
                 cc.EventListener.KEYBOARD。键盘事件监听器。
                 cc.EventListener.MOUSE。鼠标事件监听器。
                 cc.EventListener.TOUCH_ALL_AT_ONCE。多点触摸事件监听器。
                 cc.EventListener.TOUCH_ONE_BY_ONE。单点触摸事件监听器。


                 事件管理器
                 从命名上可以看出事件监听器与事件具有对应关系，例如：键盘事件（cc.EventKeyboard）只能由键盘事件监听器（cc.EventListener.KEYBOARD）处理，它们之间需要在程序中建立关系，这种关系的建立过程被称为“注册监听器”。Cocos2d-JS提供一个事件管理器 cc.EventManager负责管理这种关系，具体说事件管理器负责：注册监听器、注销监听器和事件分发。
                 cc.EventManager类中添加事件监听器的函数如下：
                 addListener(listener, nodeOrPriority)
                 第一个参数listener是要添加的事件监听器对象，第二个参数nodeOrPriority，可以是是一个Node对象或是一个数值。如果传入的是Node对象，则按照精灵等Node对象的显示优先级作为事件优先级，如下图所示的实例精灵BoxC优先级是最高的，按照精灵显示的顺序BoxC在最前面。如果传入的是数值，则按照指定的级别作为事件优先级，事件优先级决定事件响应的优先级别，值越小优先级越高。

         当不在进行事件响应的时候，我们应该注销事件监听器，主要的注销函数如下：
         removeListener(listener)。注销指定的事件监听器。
         removeCustomListeners(customEventName)。注销自定义事件监听器。
         removeListeners(listenerType, recursive)。注销所有特点类型的事件监听器，recursive参数是否递归注销。
         removeAllEventListeners()。注销所有事件监听器，需要注意的是使用该函数之后，菜单也不能响应事件了，因为它也需要接受触摸事件。

         * */

       this.addChild(this.player,10);
        //cc.log("成功激活2");
        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ALL_AT_ONCE,

            //开始触控的时候时候会读取其中一次的触控情况，
            /*
            * event 可以表明表明
             1.当前用户点击了那个object  (event:getCurrentTarget())
             2.当前是press/move/release的那个状态 (event:getEventCode())
            *
            * */





             onTouchesBegan:function(touches,event){
                var touch = touches[0];

                //读取触控位置
                var pos = touch.getLocation();
                var target = event.getCurrentTarget();
                if(!target.inited)return;
                //开始确定并且激活的砖块数目
                /*这里要理解一下cocos的坐标系是以左下角为原点为坐标原点
                *      所以这里需要先减去底下多余顶立起来的部分才能算出来是在那个格子内进行了触碰
                            *      *
                * */
                pos.y -= OFFSET_Y;
                var r = Math.floor(pos.y / BLOCK_YREGION);
                //x轴还有考虑的问题是他有份奇数偶数，OFFSET_ODD，奇数偶数行距
                      pos.x -= OFFSET_X + (r%2==1) * OFFSET_ODD;
                var c = Math.floor(pos.x / BLOCK_XREGION);
                if (c >= 0 && r >= 0 && c < COL && r < ROW) {
                    if (target.activeBlocks(r, c)) {
                        target.step ++;
                        step=target.step;
                        deliver= step;
                       target.movePlayer();
                        cc.log("成功激活");
                        console.log(target.step );

                    }
                }
            },
            num:function(){
                return   step;
            },
        },this);

    },

    //cc.log(step);


          //初始化游戏开始，初始化的时候首先要对之前的数组做一个清理
    initGame:function(){
        //先判断是否有初始化过
        console.log(this.inited);
          if(this.inited){ cc.log("agia");
          return;}

        //这个属性是要设置将其放在哪个位置，在9*9的砖块环境下
          this.player_c = this.player_r = 4;
        this.step = 0;
        cc.log("agia222");
        //清理开始
           for(var i = 0,l=this.active_nodes.length;i<l;i++  ){
               //http://www.xuanyusong.com/archives/950   节点之间的关系很重要
               /*cocos的整个数据结构可以看成一棵树，在实际应用中，除了根节点外，
               每一个节点都有一个父节点，任何节点都可以存在N个子节点
               树是一个能够正确运行的体系，1一定是一个场景，2和3有可能是层，后面就是一系列的“演员”。*/
                      this.active_nodes[i].removeFromParent();

           }
            this.active_nodes = [];
        for( var r = 0; r<ROW;r++){
            for(var c = 0;c<COL;c++ ){
                    this.active_blocks[r][c] = false;
            }
        }
        this.randBlocks();

            this.player.attr({
                anchorX:0.5,
                anchorY:0,
                x : OFFSET_X + BLOCK_XREGION * this.player_c + BLOCK_W/2,
                y : OFFSET_Y + BLOCK_YREGION * this.player_r - 5

            });
        //为什么不动！！！！
        this.player.stopAllActions();
             //cc.log("dong");
        this.player.runAction(this.moving_action);
        cc.log("fuck");
        this.inited = true;



    },
    randBlocks:function(){
        //  Math.round    是四舍五入 cc.random0To1是返回一个0-1之间的随机数
        //nb呢    是要确定一下橙色方块的数量，就是大概的范围呢会在7-20个方块  random=0      则为7
         /*
          3、Math.ceil()：返回值：返回大于或等于x，并且与之最接近的整数。
          注：如果x是正数，则把小数“入”；如果x是负数，则把小数“舍”。

          4、Math.floor()：返回值：返回小于或等于x，并且与之最接近的整数。
          注：如果x是正数，则把小数“舍”；如果x是负数，则把小数“入”。
         * */
        var nb = Math.round(cc.random0To1()*13)+ 7, r,c;
            for(var i= 0;i<nb;i++){
                r = Math.floor(cc.random0To1()*9);
                c = Math.floor(cc.random0To1()*9);
                this.activeBlocks(r,c);
             }
    },
    movePlayer : function() {
        /*定义了player位置*/
        var r = this.player_r,
            c = this.player_c,
            result = -1,
            //temp用来接收player的坐标和最短路径
            temp;
        //算法采用的是最短路径和最大通路的思想，不管怎么样，开始的时候都是先给定一个方向往45度左上角位置跑
        temp = getDistance(r, c, l_choices, this.active_blocks, hori_passed, 0);
        //console.log(temp[2]);
        //这里的temp2是用来记录之前的值
        if (result == -1 || (temp != -1 && temp[2] < result[2]))
            result = temp;
        temp = getDistance(r, c, t_choices, this.active_blocks, vert_passed, 0);
        //console.log(temp[2]);
        if (result == -1 || (temp != -1 && temp[2] < result[2]))
            result = temp;
        temp = getDistance(r, c, b_choices, this.active_blocks, vert_passed, 0);
        //console.log(temp[2]);
        if (result == -1 || (temp != -1 && temp[2] < result[2]))
            result = temp;
        temp = getDistance(r, c, r_choices, this.active_blocks, hori_passed, 0);
        //console.log(temp[2]);
        if (result == -1 || (temp != -1 && temp[2] < result[2]))
            result = temp;
        reinit_passed(hori_passed);
        reinit_passed(vert_passed);

        if (result == -1) {
            if (!this.trapped) {
                this.trapped = true;
                this.player.stopAction(this.moving_action);
                this.player.runAction(this.trapped_action);
            }

            if (!this.active_blocks[r][c-1])
                this.player_c = c-1;
            else if (!this.active_blocks[r][c+1])
                this.player_c = c+1;
            else {
                var odd = (r % 2 == 1);
                var dr = r - 1, tr = r + 1, nc = c + (odd ? 0 : -1);

                if (!this.active_blocks[dr][nc]) {
                    this.player_r = dr;
                    this.player_c = nc;
                }
                else if (!this.active_blocks[dr][nc+1]) {
                    this.player_r = dr;
                    this.player_c = nc+1;
                }
                else if (!this.active_blocks[tr][nc]) {
                    this.player_r = tr;
                    this.player_c = nc;
                }
                else if (!this.active_blocks[tr][nc+1]) {
                    this.player_r = tr;
                    this.player_c = nc+1;
                }
                // WIN
                else {
                    cc.log("win");
                    this.addChild(layers.winUI,100);
                    this.inited = false;
                }
            }
        }
        // LOST
        else if (result[2] == 0) {
            cc.log("lose");
            this.addChild(layers.loseUI,102);
            this.inited = false;
        }
        else {
            this.player_r = result[0];
            this.player_c = result[1];
        }
        this.player.attr({
            anchorX : 0.5,
            anchorY : 0,
            x : OFFSET_X + (this.player_r%2==1) * OFFSET_ODD + BLOCK_XREGION * this.player_c + BLOCK_W/2,
            y : OFFSET_Y + BLOCK_YREGION * this.player_r - 5
        });
        console.log(result);
    },

    activeBlocks : function(r,c){
        if (!this.active_blocks[r][c]) {
            var block = new cc.Sprite(this.block_tex, BLOCK1_RECT);
            block.attr({
                anchorX : 0,
                anchorY : 0,
                x : OFFSET_X + (r%2==1) * OFFSET_ODD + BLOCK_XREGION * c,
                y : OFFSET_Y + BLOCK_YREGION * r,
                width : BLOCK_W,
                height : BLOCK_H
            });
            this.active_nodes.push(block);
            this.addChild(block, 5);
            this.active_blocks[r][c] = true;
            return true;
        }

        return false;


    }


});



/*result ui*/



var ResultUI = cc.Layer.extend({
    activate : false,
    win : false,
    winPanel : null,
    losePanel : null,
    rebegin:null,
    fause:null,
    ctor : function (win) {
        this._super();

        this.win = win;
        if (win) {

            this.winPanel = new cc.Sprite(res.win);
            this.winPanel.x = cc.winSize.width/2;
            this.rebegin = new cc.Sprite(res.rebegin);
            this.fause = new cc.Sprite(res.fause);

            this.rebegin.y=cc.winSize.height/2-110;
            this.rebegin.x = cc.winSize.width/2-50;
            this.fause.y=cc.winSize.height/2-110;
            this.fause.x = cc.winSize.width/2+100;
            this.winPanel.y = cc.winSize.height/2;
            this.addChild(this.winPanel,109);
             this.addChild(this.rebegin,119);
            this.addChild(this.fause,119);
            var listener1 = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                onTouchBegan: function (touch, event) {     //实现 onTouchBegan 事件处理回调函数
                    cc.log("bbb");
                }
            });

       /*     var rebegin = new cc.Sprite(res.rebegin);
            var fause = new cc.Sprite(res.fause);
            var startMenuItem = new cc.MenuItemSprite(
                rebegin,
               // startSpriteSelected,
                function () {
                    cc.log("233");
                   // cc.director.pushScene(new PlayScene());

                }, this);
            //this.rebegin = new cc.Sprite(res.rebegin);
            //this.fause = new cc.Sprite(res.fause);

            this.rebegin.y=cc.winSize.height/2-110;
            this.rebegin.x = cc.winSize.width/2-50;
            this.fause.y=cc.winSize.height/2-110;
            this.fause.x = cc.winSize.width/2+100;
            //this.winPanel.anchorY = 0.2;
            this.winPanel.y = cc.winSize.height/2;
            this.addChild(this.winPanel,109);
           // this.addChild(this.rebegin,119);
           // this.addChild(this.fause,119);
            var muu = new cc.Menu(startMenuItem);
            muu.x = 0;
            muu.y = 0;
            this.addChild(muu);*/
        }
        else {
            this.losePanel = new cc.Sprite(res.failed);
            this.losePanel.x = cc.winSize.width/2;
            this.rebegin = new cc.Sprite(res.rebegin);
            this.fause = new cc.Sprite(res.fause);

            this.rebegin.y=cc.winSize.height/2-110;
            this.rebegin.x = cc.winSize.width/2-50;
            this.fause.y=cc.winSize.height/2-110;
            this.fause.x = cc.winSize.width/2+100;
            //this.losePanel.anchorY = 0.2;
            this.losePanel.y = cc.winSize.height/2;
            this.addChild(this.losePanel,106);
            this.addChild(this.rebegin,119);
            this.addChild(this.fause,119);
        }
       // this.restart();
        //this.rebegin.addTouchEventListener(this.rebeginTouchEvent);



    },
/*    restart:function(){
       // rebegin.addTouchEventListener(this.rebeginTouchEvent);


    },
    rebeginTouchEvent:function(){
        PlayLayer.initGame();

    },*/
    onEnter : function () {
        this._super();
        var miny = cc.winSize.height/2 - FAIL_UI_SIZE.height / 2;

        var step = layers.game.step;


        if (this.win) {
            this.winPanel.removeAllChildren();

            var w = this.winPanel.width, h = this.winPanel.height;
            var label = new cc.LabelTTF("真棒！\n"+deliver+"步抓住鸟鸟\n", "微软雅黑", 20);
            label.x = w/2;
            label.y = h/2;
            label.textAlign = cc.LabelTTF.TEXT_ALIGNMENT_CENTER;
            //label.boundingWidth = w;
            label.width = w;
            label.color = cc.color(0, 0, 0);
            this.winPanel.addChild(label,109);
        }
        else {
            this.losePanel.removeAllChildren();
            var w = this.losePanel.width, h = this.losePanel.height;
            label = new cc.LabelTTF("直觉告诉我！\n你的智商！不够！\n承认mx智商比你高了吧\n哈哈哈哈哈哈哈！！！", "微软雅黑", 20);
            label.x = w/2;
            label.y = h/2;
            label.textAlign = cc.LabelTTF.TEXT_ALIGNMENT_CENTER;
            //label.boundingWidth = w;
            label.width = w;
            label.color = cc.color(0, 0, 0);
            this.losePanel.addChild(label, 111);
        }

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
             var target = event.getCurrentTarget();
                if (!target.activate) return;

                var pos = touch.getLocation();
                if (pos.y > miny-20 && pos.y < miny + 100) {
                    cc.director.pause();
                    cc.director.resume();
                    cc.director.runScene(new PlayScene());
                    target.win ? layers.winUI.removeFromParent() : layers.loseUI.removeFromParent();

                }
            }
        }, this);

        this.activate = true;
    },
    onExit : function () {
        this._super();
        this.activate = false;
    }
});


var PlayScene = cc.Scene.extend({
    onEnter:function () {
        layers.game = new PlayLayer();
        this.addChild(layers.game);
        layers.winUI = new ResultUI(true);
        layers.loseUI = new ResultUI(false);
        this._super();
        var layer = new PlayLayer();
        this.addChild(layer,6);
        layer.initGame();


    }
});