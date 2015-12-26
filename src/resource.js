//在resource.js文件中定义资源对应的变量
var res = {                                                            
    HelloWorld_png : "res/HelloWorld.png",
    begin_up_png : "res/begin_up.png",
    begin_down_png : "res/begin_down.png",
    help_up_png : "res/help_up.png",
    help_down_png : "res/help_down.png",
    declare_up_png : "res/declare_up.png",
    declare_down_png : "res/declare_down.png",
    background_png:"res/background.png",
    logo_png:"res/logo.png",
    playing_output_png:"res/playing_output.png",
    bird1_png:"res/bird1.png",
    declare_bg_png:"res/declare_bg.png",
    left_up_png:"res/left_up.png",
    //bg : "res/background.jpg",
    block : "res/block.png",
    player:"res/player.png",
    declare:"res/declare.png",
    win:"res/win.png",
    failed:"res/failed.png",
    rebegin:"res/rebegin.png",
    fause:"res/fause.png",
    declare_json:"res/MainScene.json",
    bgm:"res/bgm.mp3"
};
   
   
var g_resources = [];                                              
for (var i in res) {  
    g_resources.push(res[i]);                                         
}