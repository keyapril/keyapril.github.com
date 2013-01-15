KISSY.add('components/luck/index', function(S, Brick,Node) {
    var $ = Node.all;
    var CANVAS_HEIGHT = 400
    var CANVAS_WIDTH = 900

    var BALL_WIDTH = 50
    var BALL_HEIGHT = 50
    var LUCKY_BALL_WIDTH = 200
    var LUCKY_BALL_HEIGHT = 200
    var MAX_ZINDEX = 100

    var DURATION_MIN = 100
    var DURATION_MAX = 500
    var ZOOM_DURATION = 0.5
    var HIT_SPEED = 100

    var RIGIDITY = 4 // 弹性系数：2 -钢球 4 - 橡胶球，越大越软，建议小于 10

    function User(id, options) {
        this.id = id
        this.options = options || {}

        this.el = null
        this.width = 0
        this.height = 0
        this.left = 0
        this.top = 0
        this.x = 0
        this.y = 0

        this.moving = false
        this.lucky = false
        this.zooming = false

        this.createEl()
        this.move()
    }

    User.prototype.createEl = function() {
        this.el = $('<li title="'+this.id+'"><img src="'+this.options.profile_image_url+'" /><p>'+this.options.name+'</p></li>').appendTo('#balls')
        this.width = this.el.width()
        this.height = this.el.height()
    }

    User.prototype.move = function(callback) {
        this.left = r(0, CANVAS_WIDTH - this.width)
        this.top = r(0, CANVAS_HEIGHT - this.height)
        this.zIndex = r(0, MAX_ZINDEX)

        this.reflow(callback)
    }

    User.prototype.reflow = function(callback, direct) {
        this.x = this.left + this.width / 2
        this.y = this.top + this.height / 2
        this.el[0].style.zIndex = this.zIndex

        if(direct) {
            this.el[0].style.left = this.left
            this.el[0].style.top = this.top
        } else {
            this.el.animate({
                'left': this.left,
                'top': this.top
            }, r(DURATION_MIN, DURATION_MAX)/1000, 'easeOutBack', callback)

        }
    }

    User.prototype.start = function() {
        this.reset()
        this.moving = true
        this.autoMove()
    }

    User.prototype.reset = function() {
        this.el.stop(true, true)
        this.zooming = false
        this.lucky = false

        this.el[0].className = ''
        this.el[0].style.width = BALL_WIDTH + 'px'
        this.el[0].style.height = BALL_HEIGHT + 'px'
        this.width = this.el.width()
        this.height = this.el.height()

        this._maxTop = CANVAS_HEIGHT - this.height
        this._maxLeft = CANVAS_WIDTH - this.width
    }

    User.prototype.autoMove = function() {
        var that = this

        if(this.moving) {
            this.move(function() {
                that.autoMove()
            })
        }
    }

    User.prototype.stop = function() {
        this.el.stop(true, true)
        this.moving = false
    }

    User.prototype.bang = function() {
        var that = this

        this.lucky = true
        this.el[0].className = 'selected'
        this.width = LUCKY_BALL_WIDTH
        this.height = LUCKY_BALL_HEIGHT
        this.left = (CANVAS_WIDTH - this.width) / 2
        this.top = (CANVAS_HEIGHT - this.height) / 2

        this.zooming = true
        this.el.animate({
            'left': this.left,
            'top': this.top,
            'width': this.width,
            'height': this.height
        }, ZOOM_DURATION, function() {
            that.zooming = false
        })
    }

    User.prototype.beginHit = function() {
        this._xMove = 0
        this._yMove = 0
    }

    User.prototype.hitMove = function() {
        this.left += this._xMove
        this.top += this._yMove

        this.top = this.top < 0 ? 0 : (this.top > this._maxTop ? this._maxTop : this.top)
        this.left = this.left < 0 ? 0 : (this.left > this._maxLeft ? this._maxLeft : this.left)

        this.reflow(null, false)
    }



    // Helpers

    function r(from, to) {
        from = from || 0
        to = to || 1
        return Math.floor(Math.random() * (to - from + 1) + from)
    }

    function getOffset(a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    function isOverlap(a, b) {
        return getOffset(a, b) <= (a.width + b.width) / 2
    }

    function hit(a, b) {
        var yOffset = b.y - a.y
        var xOffset = b.x - a.x

        var offset = getOffset(a, b)

        var power = Math.ceil(((a.width + b.width) / 2 - offset) / RIGIDITY)
        var yStep = yOffset > 0 ? Math.ceil(power * yOffset / offset) : Math.floor(power * yOffset / offset)
        var xStep = xOffset > 0 ? Math.ceil(power * xOffset / offset) : Math.floor(power * xOffset / offset)

        if(a.lucky) {
            b._xMove += xStep * 2
            b._yMove += yStep * 2
        } else if(b.lucky) {
            a._xMove += xStep * -2
            a._yMove += yStep * -2
        } else {
            a._yMove += -1 * yStep
            b._yMove += yStep

            a._xMove += -1 * xStep
            b._xMove += xStep
        }
    }

    return {
        users: [],
        init: function(data) {
            var self = this;
            if(self.users.length>0){
                self.stop();
            }
            self.trigger = $('#go');

            self._resetUI();
            $('#balls').empty();
            $('#lucky-balls').empty();
            self.users = [];
            self.luckyUser = null;
            S.each(data,function(o,id){
                self.users.push(new User(id,o));
            });
            this._bindUI();
        },
        _resetUI:function(){
            var self = this,trigger = self.trigger;
            trigger.attr('data-action', 'start')
            trigger.html(trigger.attr('data-text-start'))
            $(document).detach('keydown',self._bindKeyDown,self);
        },

        _bindUI: function() {
            var self = this;
            $(document).on('keydown',self._bindKeyDown,self);
        },
        _bindKeyDown:function(e){
            var self = this,trigger = self.trigger;
            if(ev.keyCode == '32') {
                if(trigger.attr('data-action') === 'start') {
                    trigger.attr('data-action', 'stop')
                    trigger.html( trigger.attr('data-text-stop'))
                    self.start()
                } else {
                    trigger.attr('data-action', 'start')
                    trigger.html(trigger.attr('data-text-start'))
                    self.stop()
                }
            } 
        },
        start: function() {
            this.timer && clearTimeout(this.timer)
            this.moveLucky()

            this.users.forEach(function(user) {
                user.start()
            })
        },

        stop: function() {
            var users = this.users
            var z = 0,
                lucky = users[0]

                users.forEach(function(user) {
                    user.stop()
                    if(z < user.zIndex) {
                        lucky = user
                        z = user.zIndex
                    }
                })
                lucky.bang()
                this.hit()
                this.luckyUser = lucky
        },

        removeItem: function(item) {
            for(var i = 0; i < this.users.length; i++) {
                var user = this.users[i]
                if(user === item) {
                    this.users.splice(i, 1)
                }
            }
        },

        addItem: function(name) {
            this.users.push(new User(name))
        },

        moveLucky: function() {
            var luckyUser = this.luckyUser
            if(luckyUser) {
                luckyUser.el[0].style.cssText = ''
                luckyUser.el.prependTo('#lucky-balls')
                this.removeItem(luckyUser)
                this.luckyUser = null
            }
        },

        setLucky: function(item) {
            this.users.forEach(function(user) {
                user.stop()
            })
            this.luckyUser = item
            item.bang()
            this.hit()
        },

        hit: function() {
            var that = this
            var hitCount = 0
            var users = this.users

            users.forEach(function(user) {
                user.beginHit()
            })

            for(var i = 0; i < users.length; i++) {
                for(var j = i + 1; j < users.length; j++) {
                    if(isOverlap(users[i], users[j])) {
                        hit(users[i], users[j])
                        hitCount++
                    }
                }
            }

            users.forEach(function(user) {
                user.hitMove()
            })

            if(hitCount > 0) {
                this.timer = setTimeout(function() {
                    that.hit()
                }, HIT_SPEED)
            }
        }
    }


}, {
    requires: ["brix/core/brick",'node']
});