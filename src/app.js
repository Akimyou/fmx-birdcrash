var HelloWorldLayer = cc.Layer.extend({

        ctor:function () {

        this._super();
        var size = cc.director.getWinSize();

        var bg = new cc.Sprite(res.background_png);
        bg.x = size.width/2;
        bg.y = size.height/2;
        this.addChild(bg);
        //logo
       /* var logo = new cc.Sprite(res.logo_png);
        logo.x = size.width/2;
        logo.y = size.height-150;
        this.addChild(logo);
           */
        // 开始精灵,这边是要建立一个菜单
        var startSpriteNormal = new cc.Sprite(res.begin_up_png);
        var startSpriteSelected = new cc.Sprite(res.begin_down_png);
        var startMenuItem = new cc.MenuItemSprite(
                startSpriteNormal,
                startSpriteSelected,
                function () {
                //cc.log("Menu is clicked!");
                    // 将一个新场景推入场景栈中，并替换运行场景为这个新场景
//                var scene = cc.director.pushScene(PlayScene);
//                cc.director.pushScene();
                     cc.director.pushScene(new PlayScene());
                    //console.log("nihao");
            }, this);
        startMenuItem.x = 170;
        startMenuItem.y = size.height - 310;

        // 设置图片菜单
        var settingMenuItem = new cc.MenuItemImage(
                res.declare_up_png,
                res.declare_down_png,
                function () {
                     cc.director.pushScene(new SettingScene());
            }, this);
        settingMenuItem.x = 170;
        settingMenuItem.y = size.height - 400;


        // 帮助图片菜单
        var helpMenuItem = new cc.MenuItemImage(
                res.help_up_png,
                res.help_down_png,
                this.menuItemHelpCallback, this);
                helpMenuItem.x = 250;
                helpMenuItem.y = size.height - 630;

        var mu = new cc.Menu(startMenuItem, settingMenuItem, helpMenuItem);
        mu.x = 0;
        mu.y = 0;
        this.addChild(mu);                                                
    },
    menuItemStartCallback:function (sender) {
        cc.log("menuItemStartCallback!");
    },
    menuItemSettingCallback:function (sender) {
        cc.log("menuItemSettingCallback!");
    },
    menuItemHelpCallback:function (sender) {
        cc.log("menuItemHelpCallback!");
    }
});



    var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);	//把HelloWorldLayer层放到HelloWorldScene场景中
    }
});
