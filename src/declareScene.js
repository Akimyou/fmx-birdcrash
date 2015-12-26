var SettingLayer = cc.Layer.extend({
    buttonbegin:null,
    ctor:function(){
        this._super();
        //加载Setting界面的JSON资源分析，并获取settingScene对象。
        settingScene = ccs.load(res.declare_json).node;
        //将settingScene对象加入到layer中。
        this.addChild(settingScene);
        //从settingScene中获取控件并注册监听事件。
        this.dealWidgets();
       /* buttonbegin = ccui.helper.seekWidgetByName(settingScene, "button");
       // musicSlider.addCCSEventListener(this.sliderStateChange);
        //buttonbegin.addTouchEventListener(this.buttonTouchEvent);
        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ALL_AT_ONCE,

            //开始触控的时候时候会读取其中一次的触控情况，
            *//*
             * event 可以表明表明
             1.当前用户点击了那个object  (event:getCurrentTarget())
             2.当前是press/move/release的那个状态 (event:getEventCode())
             *
             * *//*
            buttonTouchEvent:function(touches,event){
                cc.director.pushScene(new PlayScene());

            }
        },this);
        //cc.console("chulai!");*/

        return true;
    },
    dealWidgets:function(){
        buttonbegin = ccui.helper.seekWidgetByName(settingScene, "Button");
        buttonbegin.addTouchEventListener(this.buttonTouchEvent);

    },
    buttonTouchEvent:function(touches,event){
        cc.director.pushScene(new PlayScene());

    }


   /* buttonTouchEvent:function(){
      //  cc.director.pushScene(new PlayScene());

    }*/

});

var SettingScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new SettingLayer();
        this.addChild(layer);
    }
});