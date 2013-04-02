KISSY.add('components/luck/index', function(S, Node,Brick,users,setting) {
    //初始化的图像坐标
    var POINTS = [{
        x: 100,
        y: 50
    }, {
        x: 100,
        y: 100
    }, {
        x: 100,
        y: 150
    }, {
        x: 100,
        y: 200
    }, {
        x: 100,
        y: 250
    }, {
        x: 125,
        y: 300
    }, {
        x: 175,
        y: 315
    }, {
        x: 225,
        y: 315
    }, {
        x: 275,
        y: 300
    }, {
        x: 300,
        y: 250
    }, {
        x: 300,
        y: 200
    }, {
        x: 300,
        y: 150
    }, {
        x: 300,
        y: 100
    }, {
        x: 300,
        y: 50
    }
    //大U
    ,
    {
        x: 50,
        y: 50
    }, {
        x: 50,
        y: 100
    }, {
        x: 50,
        y: 150
    }, {
        x: 50,
        y: 200
    }, {
        x: 50,
        y: 250
    }, {
        x: 60,
        y: 308
    }, {
        x: 100,
        y: 350
    }, {
        x: 150,
        y: 370
    }, {
        x: 200,
        y: 375
    }, {
        x: 250,
        y: 370
    }, {
        x: 300,
        y: 350
    }, {
        x: 340,
        y: 308
    }, {
        x: 350,
        y: 250
    }, {
        x: 350,
        y: 200
    }, {
        x: 350,
        y: 150
    }, {
        x: 350,
        y: 100
    }, {
        x: 350,
        y: 50
    }
    //X的\
    ,
    {
        x: 450,
        y: 50
    }, {
        x: 500,
        y: 100
    }, {
        x: 550,
        y: 150
    }, {
        x: 600,
        y: 200
    }, {
        x: 650,
        y: 250
    }, {
        x: 700,
        y: 300
    }, {
        x: 750,
        y: 350
    }, {
        x: 500,
        y: 50
    }, {
        x: 550,
        y: 100
    }, {
        x: 600,
        y: 150
    }, {
        x: 650,
        y: 200
    }, {
        x: 700,
        y: 250
    }, {
        x: 750,
        y: 300
    }, {
        x: 800,
        y: 350
    }
    //X的/
    ,
    {
        x: 750,
        y: 50
    }, {
        x: 700,
        y: 100
    }, {
        x: 650,
        y: 150
    }, {
        x: 600,
        y: 200
    }, {
        x: 550,
        y: 250
    }, {
        x: 500,
        y: 300
    }, {
        x: 450,
        y: 350
    }, {
        x: 800,
        y: 50
    }, {
        x: 750,
        y: 100
    }, {
        x: 700,
        y: 150
    }, {
        x: 650,
        y: 200
    }, {
        x: 600,
        y: 250
    }, {
        x: 550,
        y: 300
    }, {
        x: 500,
        y: 350
    }];
    var $ = Node.all;
    var CANVAS_HEIGHT = 400;
    var CANVAS_WIDTH = 900;

    var BALL_WIDTH = 50;
    var BALL_HEIGHT = 50;
    var LUCKY_BALL_WIDTH = 306;
    var LUCKY_BALL_HEIGHT = 306;
    var MAX_ZINDEX = 3000;

    var DURATION_MIN = 100;
    var DURATION_MAX = 500;
    var ZOOM_DURATION = 0.5;
    var HIT_SPEED = 100;

    var RIGIDITY = 4; // 弹性系数：2 -钢球 4 - 橡胶球，越大越软，建议小于 10

    function User(el,options, i) {
        this.options = options;
        this.left = 430;
        this.top = -75;
        this.x = 0;
        this.y = 0;
        this.width = BALL_WIDTH;
        this.height = BALL_HEIGHT;
        this.moving = false;
        this.lucky = false;
        this.zooming = false;
        this.el = el;
        var p = POINTS[i];
        if(p) {
            this.left = p.x;
            this.top = p.y - 30; //数据问题，所以做了这个兼容处理
        }
        this.zIndex = r(0, MAX_ZINDEX);
        this.reflow();
    }

    User.prototype.move = function(callback) {
        this.left = r(0, CANVAS_WIDTH - BALL_WIDTH);
        this.top = r(0, CANVAS_HEIGHT - BALL_HEIGHT);
        this.zIndex = r(0, MAX_ZINDEX);
        this.reflow(callback);
    }

    User.prototype.reflow = function(callback, direct) {
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
        this.el.css('z-index', this.zIndex);
        this.el.animate({
            'left': this.left,
            'top': this.top
        }, r(DURATION_MIN, DURATION_MAX) / 1000, 'easeOutBack', callback);
    }

    User.prototype.start = function() {
        this.reset();
        this.moving = true;
        this.autoMove();
    }

    User.prototype.reset = function() {
        this.el.stop(true, true);
        this.zooming = false;
        this.lucky = false;

        this.el.removeClass('selected');
        this.el.css({
            width: BALL_WIDTH,
            height: BALL_HEIGHT
        });

        this._maxTop = CANVAS_HEIGHT - BALL_HEIGHT;
        this._maxLeft = CANVAS_WIDTH - BALL_WIDTH;
    }

    User.prototype.autoMove = function() {
        var that = this;
        if(this.moving) {
            this.move(function() {
                that.autoMove();
            });
        }
    }

    User.prototype.stop = function() {
        this.el.stop(true, true);
        this.moving = false;
    }

    User.prototype.bang = function() {
        var that = this;

        this.lucky = true;
        this.el.addClass('selected');
        this.el.one('h3').html(setting.name);
        this.left = (CANVAS_WIDTH - LUCKY_BALL_WIDTH) / 2;
        this.top = (CANVAS_HEIGHT - LUCKY_BALL_HEIGHT) / 2;
        this.width = LUCKY_BALL_WIDTH;
        this.height = LUCKY_BALL_HEIGHT;

        this.zooming = true
        this.el.animate({
            'left': this.left,
            'top': this.top,
            'width': LUCKY_BALL_WIDTH,
            'height': LUCKY_BALL_HEIGHT
        }, ZOOM_DURATION, function() {
            that.zooming = false;
        })
    }

    User.prototype.beginHit = function() {
        this._xMove = 0;
        this._yMove = 0;
    }

    User.prototype.hitMove = function() {
        this.left += this._xMove;
        this.top += this._yMove;
        this.top = this.top < 0 ? 0 : (this.top > this._maxTop ? this._maxTop : this.top);
        this.left = this.left < 0 ? 0 : (this.left > this._maxLeft ? this._maxLeft : this.left);
        this.reflow(null, false);
    }



    // Helpers

    function r(from, to) {
        from = from || 0;
        to = to || 1;
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function getOffset(a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    function isOverlap(a, b) {
        return getOffset(a, b) <= (a.width + b.width) / 2;
    }

    function hit(a, b) {
        var yOffset = b.y - a.y;
        var xOffset = b.x - a.x;

        var offset = getOffset(a, b);

        var power = Math.ceil(((a.width + b.width) / 2 - offset) / RIGIDITY);
        var yStep = yOffset > 0 ? Math.ceil(power * yOffset / offset) : Math.floor(power * yOffset / offset);
        var xStep = xOffset > 0 ? Math.ceil(power * xOffset / offset) : Math.floor(power * xOffset / offset);

        if(a.lucky) {
            b._xMove += xStep * 2;
            b._yMove += yStep * 2;
        } else if(b.lucky) {
            a._xMove += xStep * -2;
            a._yMove += yStep * -2;
        } else {
            a._yMove += -2 * yStep;
            b._yMove += yStep;

            a._xMove += -2 * xStep;
            b._xMove += xStep;
        }
    }

    function Luck() {
        Luck.superclass.constructor.apply(this, arguments);
    }
    Luck.ATTRS = {
        data:{
            value:{users:users}
        }
    };

    S.extend(Luck, Brick, {
        initialize: function() {
            var self = this;
            // if(self.users.length > 0) {
            //     self.stop();
            // }
            // $('.balls').empty();
            // $('.lucky-balls').empty();
            // self.users = [];
            self.luckyUser = null;
            var balls = $('.balls').all('li');
            var users = self.get('data').users;
            balls.each(function(el,i){
                S.later(function() {
                    self.users.push(new User(el,users[i], i));
                }, r(DURATION_MIN, DURATION_MAX));
            })
            S.each(self.get('users'), function(o, i) {
                S.later(function() {
                    self.users.push(new User(o, i));
                }, r(DURATION_MIN, DURATION_MAX));
            });
        },
        users: [],
        i:0,
        init: function(data) {
            
        },
        start: function() {
            this.timer && clearTimeout(this.timer);
            this.users.forEach(function(user) {
                user.start();
            })
            //this._start();
        },
        _start:function(){
            var self = this;
            var ul = $('.animate-balls').one('ul');
            ul.animate({
            'left': -306
            }, 0.2, 'easeNone', function(){
                //self.stop();
                ul.one('li').appendTo('.balls');
                ul.css({left:0});
                var el = self.users[self.i].el;
                el.attr('style','');
                el.appendTo(ul);
                self._start();
                if(self.i<self.users.length-1){
                    self.i+=1;
                }
                else{
                    self.i = 0;
                }
            });
        },
        stop: function() {
            var users = this.users;
            if(users.length < 1) {
                return;
            }
            var z = 0,
                lucky = users[0];

            users.forEach(function(user) {
                user.stop();
                if(z < user.zIndex) {
                    lucky = user;
                    z = user.zIndex;
                }
            });
            lucky.bang();
            this.hit();
            this.luckyUser = lucky;
        },
        removeItem: function(item) {
            for(var i = 0; i < this.users.length; i++) {
                var user = this.users[i];
                if(user === item) {
                    this.users.splice(i, 1);
                }
            }
        },
        moveLucky: function() {
            var luckyUser = this.luckyUser;
            if(luckyUser) {
                luckyUser.el.removeClass('selected');
                luckyUser.el.one('p').remove();
                luckyUser.el.one('h3').remove();
                luckyUser.el.prependTo('#lucky-balls,#lucky-balls' + setting.index);
                this.removeItem(luckyUser);
                this.luckyUser = null;
            }
        },
        hit: function() {
            var that = this;
            var hitCount = 0;
            var users = this.users;

            users.forEach(function(user) {
                user.beginHit();
            })

            for(var i = 0; i < users.length; i++) {
                for(var j = i + 1; j < users.length; j++) {
                    if(isOverlap(users[i], users[j])) {
                        hit(users[i], users[j]);
                        hitCount++;
                    }
                }
            }

            users.forEach(function(user) {
                user.hitMove();
            })

            if(hitCount > 0) {
                this.timer = setTimeout(function() {
                    that.hit();
                }, 500)
            }
        }
    });
    return Luck;
}, {
    requires: ['node',"brix/core/brick","components/users/index","components/setting/index"]
});