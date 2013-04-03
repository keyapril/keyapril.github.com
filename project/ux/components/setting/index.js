KISSY.add('components/setting/index', function(S, users, localStorage, JSON) {
    var setting = {
        index: 1,
        name: '特等奖',
        defaultConfig: {
            name: '中奖区',
            luckyUsers: []
        },
        config: [{
            index: 5,
            count: 100,
            step: 20,
            num: 100,
            name: '幸运奖',
            lottery_Interval: 1,
            show_Interval: 1,
            luckyUsers: []
        }, {
            index: 4,
            count: 10,
            step: 2,
            num: 10,
            name: '三等奖',
            lottery_Interval: 3,
            show_Interval: 1,
            luckyUsers: []
        }, {
            index: 3,
            count: 5,
            step: 1,
            num: 5,
            name: '二等奖',
            lottery_Interval: 4,
            show_Interval: 2,
            luckyUsers: []
        }, {
            index: 2,
            count: 2,
            step: 1,
            num: 2,
            name: '一等奖',
            lottery_Interval: 5,
            show_Interval: 3,
            luckyUsers: []
        }, {
            index: 1,
            count: 1,
            step: 1,
            num: 1,
            name: '特等奖',
            lottery_Interval: 10,
            show_Interval: 4,
            luckyUsers: []
        }]
    };
    var defaultConfig = setting.defaultConfig;
    var luckyUsers = localStorage.getItem('luckyUsers');
    if (luckyUsers) {
        defaultConfig.luckyUsers = JSON.parse(luckyUsers);
    }


    S.each(setting.config, function(o) {
        luckyUsers = localStorage.getItem('luckyUsers' + o.index);
        if (luckyUsers) {
            o.luckyUsers = JSON.parse(luckyUsers);
        }
        S.each(o.luckyUsers, function(u1) {
            S.each(users, function(u2, i) {
                if (u2.name == u1.name) {
                    o.num -= 1;
                    if (o.num < 1) {
                        o.num = false;
                    }
                    users.splice(i, 1);
                    return false;
                }
            });
        });

    });
    return setting;

}, {
    requires: ["components/users/index", "gallery/local-storage/1.0/", "json"]
});