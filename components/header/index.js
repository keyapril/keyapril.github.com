KISSY.add("components/header/index", function(S, Brick, users, setting, localStorage, JSON) {
    var TMPL = '@TEMPLATE|'+Brix.absoluteFilePath(this,'index.html')+'|TEMPLATE@';
    return Brick.extend({},{
        ATTRS : {
            tmpl:{
                value:TMPL
            },
            data: {
                value: setting
            }
        },
        EVENTS : {
        '.btn': {
            click: function(e) {
                var self = this;
                var target = S.one(e.currentTarget);
                if(!self.isChouJiang && !target.hasClass('btn-disabled')) {
                    var Luck = self.pagelet.getBrick('balls');
                    var index = target.attr('id').match(/\d+/)[0];
                    var config;
                    var defaultConfig = setting.defaultConfig;
                    S.each(setting.config, function(o) {
                        if(o.index == index) {
                            config = o;
                            return false;
                        }
                    })
                    //必须抽没有抽完的奖项
                    var step = config.step - defaultConfig.luckyUsers.length;
                    S.all('#lucky-balls').empty();
                    setting.index = config.index;
                    setting.name = config.name;
                    self.isChouJiang = true;
                    var i = 0;
                    Luck.start();
                    S.later(function() {
                        i++;
                        config.num = config.num - 1;
                        if(!config.num) {
                            config.num = false;
                        }
                        self.setChunkData('config', setting.config);
                        Luck.stop();
                        config.luckyUsers.unshift(Luck.luckyUser.options);

                        localStorage.setItem('luckyUsers' + config.index, JSON.stringify(config.luckyUsers));

                        defaultConfig.luckyUsers.unshift(Luck.luckyUser.options);

                        localStorage.setItem('luckyUsers', JSON.stringify(defaultConfig.luckyUsers));
                        var callee = arguments.callee; //获取调用函数句柄
                        S.later(function() {
                            Luck.moveLucky();
                            if(i < step && config.num) {
                                Luck.start();
                                S.later(callee, config.lottery_Interval * 1000);
                            } else {
                                defaultConfig.luckyUsers = [];
                                localStorage.setItem('luckyUsers', JSON.stringify(defaultConfig.luckyUsers));
                                self.isChouJiang = false;
                            }
                        }, config.show_Interval * 1000);
                    }, config.lottery_Interval * 1000);
                }
            }
        }
    }
    },'Header');

}, {
    requires: ["brix/core/brick", "components/users/index", "components/setting/index", "gallery/local-storage/1.0/", "json"]
});