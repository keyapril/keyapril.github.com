KISSY.add('tbc/map',function(S,Node,Event,UA,Base,Point){
	var $ = Node.all;
	function Map(){
		Map.superclass.constructor.apply(this, arguments);
        this._init();
	}
	Map.ATTRS = {
        /**
         * 地图容器
         * @type Node
         */
        container:{
            setter:function(v) {
				var c = $(v);
				if (!c.attr('id')) {
					c.attr('id', S.guid('tbc_Map'));
				}
                return c;
            }
        },
		centerPoint:{
			setter:function(v){
				if(!v){
					new Point(0,0);
				}
			},
			value:new Point(5000,5000)
		},
		mapPoint:{
			setter:function(v){
				if(!v){
					new Point(0,0);
				}
			},
			value:new Point(0,0)
		},
		boxPoint:{
			setter:function(v){
				if(!v){
					new Point(0,0);
				}
			},
			value:new Point(0,0)
		},
		transitionPoint:{
			setter:function(v){
				if(!v){
					new Point(0,0);
				}
			},
			value:new Point(0,0)
		},
        height:{
            value:300
        },
        width:{
            value:500
        },
        zoom:{
            value:0
        },
		zoomPer:{
			value:[1,1/2,1/4,1/8]
		}
    };
	S.extend(Map, Base, {
		_init:function(){
			var self = this,container = self.get('container');
			container.css({width:self.get('width')+'px',
			height:self.get('height')+'px',
			position:'relative',
			overflow:'hidden'});
			self.topLayer = self.newMapLayer(S.guid('tbc_Map_TopLayer'),360,false,container);
			self.bottomLayer = self.newMapLayer(S.guid('tbc_Map_BottomLayer'),250,false,container);
			self.transitionLayer = self.newMapLayer(S.guid('tbc_Map_TransitionLayer'),0,false,container);
			
			var transitionScale = {key:'msTransform',value:'scale({$value})'};
			
			if(UA.ie){
				if(UA.ie<9){
					transitionScale.key = 'zoom';
					transitionScale.value = '{$value}';
				}
			}
			else if(UA.chrome||UA.safari){
				transitionScale.key = '-webkit-transform';
			}
			else if(UA.firefox){
				transitionScale.key = '-moz-transform';
			}
			else if(UA.opera){
				transitionScale.key = '-o-transform';
			}
			self.transitionScale = transitionScale;
			
			//当前地图的状态
			self.mapState = {moving:false,zooming:false};
			
			self.__wheelZoom = self.get('zoom');
			self.__tempZoom = self.get('zoom');
			
			self.bindEvent();
		},
		buffer:function (fn, ms, context) {
            ms = ms || 150;
            if (ms === -1) {
                return (function () {
                    fn.apply(context || this, arguments);
                });
            }
            var bufferTimer = null;
            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, false, context || this,arguments);
            }
            f.stop = function () {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };
            return f;
        },
		bindEvent:function(){
			var self = this,container = self.get('container');
			self.__dragMap_MouseMoveFn = S.throttle(self._dragMap_MouseMove,20,self);
			container.on('mousedown',function(e){
				self.fire('mapmousedown',{originalEvent:e});
			}).on('mouseup',function(e){
				self.fire('mapmouseup',{originalEvent:e});
				//判断地图是否是移动状态
				if(!self.mapState.moving){
					self.fire('mapclick',{originalEvent:e});
				}
			}).on('mouseenter',function(e){
				self.fire('mapmouseenter',{originalEvent:e});
			}).on('mouseleave',function(e){
				self.fire('mapmouseleave',{originalEvent:e});
			}).on('mousemove',function(e){
				self.fire('mapmousemove',{originalEvent:e});
			}).on('dblclick',function(e){
				self.fire('mapdblclick',{originalEvent:e});
			}).on('mousewheel',function(e){
				e.halt();
				}).on('mousewheel',self.buffer(function(e){
				var mapPoint = self.getMapPoint(e);
				var centerPoint = self.get('centerPoint');
				var x = (centerPoint.x - mapPoint.x);
                var y = (centerPoint.y - mapPoint.y);
				if(e.deltaY>0){
					self.__wheelZoom--;
				}
				else{
					self.__wheelZoom++;
				}
				self.zoom(self.__wheelZoom,true,x,y,e);
				self.fire('mapmousewheel',{originalEvent:e});
				
			},30,self));
			
			container.on('mousedown',function(e){
				self._dragMap_MouseDown(e);
			},self);
		},
		//新建图层
		newMapLayer:function(id,z,canTouch, parentLayer){
			var self = this;
			id = id || S.guid('tbc_Map_Layer');
			var layer = new Node('<div>');
			layer.attr('id',id);
			layer.css({position:'absolute',zIndex:z});
			if(!parentLayer){
				if (canTouch == undefined || canTouch) {
					this.topLayer.append(layer);
				}
				else {
					this.bottomLayer.append(layer);
				}
			}
			else{
				self.get('container').append(layer);
			}
			return layer;
		},
		//获取设置中心点坐标
		center:function(point){
			var self = this,centerPoint=self.get('centerPoint');
			if(point instanceof Point&&!self.mapState.moving&&!self.mapState.zooming){
				self.mapState.moving = true;
				var dx = self.gradeMap2Win(centerPoint.x-point.x);
				var dy = self.gradeMap2Win(centerPoint.y-point.y);
				var w=self.get('width')*2,
					h=self.get('height')*2;
				if(Math.abs(dx)>w||Math.abs(dy)>h){
					var steps = 1;
				}
				else{
					var steps = 16;
				}
				var step = steps,sx=0,sy=0;
				
				//t现在步数，c距离，d总步数
				function df(t,c,d){
					var t1 = t-1;
					//return Math.round(c*(t/=d)*t*t*t - c*(t1/=d)*t1*t1*t1);
					
					return Math.round(-c * (Math.sqrt(1 - (t/=d)*t) - 1) + c * (Math.sqrt(1 - (t1/=d)*t1) - 1))
					//return Math.round(c*((t=t/d-1)*t*t*t*t + 1)  - c*((t1=t1/d-1)*t1*t1*t1*t1 + 1));
					return Math.round(c*(t/=d)-c*(t1/=d));
				}
				
				self.__moveTimer = S.later(function(){
					if(step>0){
						sx = df(step,dx,steps) ;
						sy = df(step,dy,steps) ;
						if(step==1){
							sx = self.gradeMap2Win(centerPoint.x-point.x);
							sy = self.gradeMap2Win(centerPoint.y-point.y);
						}
						self._changeBoxPos(sx,sy);
						centerPoint.x -= self.gradeWin2Map(sx);
						centerPoint.y -= self.gradeWin2Map(sy);
						self.fire('mapmoving');
						step--;
					}else{
						centerPoint.x=point.x;
						centerPoint.y=point.y;
						self.__moveTimer.cancel();
						self.mapState.moving = false;
						self.fire('mapmoveend');
					}
				},40,true);
			}
			else{
				return centerPoint;
			}
		},
		
		//获取设置级别
		zoom:function(z,flg,x,y,e){
			var self = this,oldZoom=self.get('zoom'),zoomPer=self.get('zoomPer');
			if(typeof z == 'number'&&!self.mapState.moving){
				if(z<0){
					z = 0;
					self.__wheelZoom = z;
				}
				if(z>=zoomPer.length){
					z = zoomPer.length-1;
					self.__wheelZoom = z;
				}
				if(self.__tempZoom==z){
					return;
				}
				self.__tempZoom = z;
				if(self.mapState.zooming){
					if(self.__zoomTimer){
						self.__zoomTimer.cancel();
						self.__zoomTimer = null;
					}
				}
				x = x || 0;
				y = y || 0;
				self.__zoomStep = self.__zoomStep || 1;
				var centerPoint = self.get('centerPoint'),
					boxPoint = self.get('boxPoint'),
					transitionPoint = self.get('transitionPoint'),
					steps = 5,
					step = self.__zoomStep,
					per = zoomPer[z] / zoomPer[oldZoom],
					perd = (per - 1) / steps,
					boxleft = boxPoint.x,
					boxtop = boxPoint.y,
					diffleft = x * zoomPer[oldZoom],
					difftop = y * zoomPer[oldZoom],
					w=self.get('width')/ 2,
					h=self.get('height')/ 2;
				
				if(!self.mapState.zooming){
					self.deleteTransitionLayer();
					var layCssObj = self._stylelayerScale(1,w,h, boxleft, boxtop, diffleft, difftop);
					self.transitionLayer.css(layCssObj);
				}
				self.fire('beforemapzoom',{oldZoom:oldZoom,newZoom:z,step:step,originalEvent:e});
				self.mapState.zooming = true;
				self.__zoomTimer = S.later(function(){
					if(step<=steps){
						layCssObj = self._stylelayerScale(1 + perd * step,w,h, boxleft, boxtop, diffleft, difftop);
						self.topLayer.css(layCssObj); 
						self.bottomLayer.css(layCssObj);
						self.transitionLayer.css(layCssObj);
						self.fire('mapzooming',{oldZoom:oldZoom,newZoom:z,step:step,originalEvent:e});
						step++;
						self.__zoomStep++;
					}else{
						self.__zoomTimer.cancel();
						centerPoint.x+=x * (1 / per - 1);
						centerPoint.y+=y * (1 / per - 1);
						boxPoint.x+=x;
						boxPoint.y+=y;
						var layCssObj = self._stylelayerScale(1,w,h, boxPoint.x, boxPoint.y, diffleft, difftop);
						self.topLayer.css(layCssObj); 
						self.bottomLayer.css(layCssObj);
						
						//记录过度层的位置
						transitionPoint.x = boxleft + (boxleft - w + diffleft) * (per - 1);
						transitionPoint.y = boxtop + (boxtop - h + difftop) * (per - 1);
						self.mapState.zooming = false;
						self.__zoomStep=1;
						self.set('zoom',z);
						self.__wheelZoom = z;
						self.fire('mapzoom',{oldZoom:oldZoom,newZoom:z,originalEvent:e});
					}
				},1,true);
			}
			else{
				return self.get('zoom');
			}
		},
		resize:function(w,h){
			var self = this;
			if(self.mapState.zooming || self.mapState.moving){
				S.later(arguments.callee,150,false,self,[w,h]);
				return;
			}
			var container = self.get('container'),
				ow=self.get('width'),
				oh=self.get('height');
					
			var x = Math.round((w - ow) / 2);
			var y = Math.round((h - oh) / 2);		
			container.css({width:w+'px',height:h+'px'});
			self.set('width',w);
			self.set('height',h);
			self._changeBoxPos(x,y);
			self.fire('mapresize');
		},
		//创建级别缩放缓存
		createTransitionLayer: function(layer) {
			this.transitionLayer.append(layer.children());
		},
		deleteTransitionLayer:function(){
			this.transitionLayer.all('img').removeAttr('src');
			this.transitionLayer.empty();
		},
		_stylelayerScale: function(v,w,h, boxleft, boxtop, diffleft, difftop) {
			var self = this,ts=self.transitionScale;
			var x = Math.round(boxleft + (boxleft - w + diffleft) * (v - 1));
			var y = Math.round(boxtop + (boxtop - h + difftop) * (v - 1));
			var layCssObj = {left:x+'px',top:y+'px'};
			layCssObj[ts.key] = ts.value.replace('{$value}',v);
			return layCssObj;
		},
		_dragMap_Speed:function(){
			var self = this;
			if(self.mapState.moving){
				self.__smoothXY.push({x:self.__endX - self.__startX,y:self.__endY - self.__startY});
				self.__smoothXY.shift();
				self.__speedX=self.__speedY=0;
				for(var i=0;i<self.__smoothXY.length;i++){
					self.__speedX+=self.__smoothXY[i].x;
					self.__speedY+=self.__smoothXY[i].y;
				}
				self.__speedX=self.__speedX*2.8%1000;
				self.__speedY=self.__speedY*2.8%1000;
				self.__endX = self.__startX;
				self.__endY = self.__startY;
			}
		},
		
		_dragMap_MouseDown: function(e) {
			var self = this;
			if(self.mapState.zooming){
				return;
			}
			if(self.mapState.moving){
				if(self.__moveTimer){
					self.__moveTimer.cancel();
					self.__moveTimer = null;
				}
				self.mapState.moving = false;
			}
			self.__startX = e.pageX;
			self.__startY = e.pageY;
			self.__endX = self.__startX;
			self.__endY = self.__startY;
			self.__speedX=0;
			self.__speedY=0;
			self.__smoothXY=[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
			self.__speedTimer = S.later(self._dragMap_Speed,10,true,self);
			
			if (document.body.setCapture) {
				document.body.setCapture();
			}
			else if (window.captureEvents) {
				window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
			}
			//var d = S.throttle(self._dragMap_MouseMove,20,self);
			$(document).on("mousemove", self.__dragMap_MouseMoveFn,self);
			$(document).on("mouseup", self._dragMap_MouseUp,self);
		},
		_dragMap_MouseMove: function(e) {
			var self = this;
			self.__diffX = e.pageX - self.__startX;
			self.__diffY = e.pageY - self.__startY;
			if (Math.abs(self.__diffX) < 2 && Math.abs(self.__diffY) < 2) return false;
			self.mapState.moving = true;
			self.__startX = e.pageX;
			self.__startY = e.pageY;
			self._changeBoxPos(self.__diffX,self.__diffY);
			var centerPoint = self.get('centerPoint');
			centerPoint.x -= self.gradeWin2Map(self.__diffX);
			centerPoint.y -= self.gradeWin2Map(self.__diffY);
			self.fire('mapmoving');
		},
		_dragMap_MouseUp: function(e) {
			var self = this;
			if (document.body.releaseCapture) {
				document.body.releaseCapture();
			}
			else if (window.releaseEvents) {
				window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
			}
			$(document).detach("mousemove", self.__dragMap_MouseMoveFn,self);
			$(document).detach("mouseup", self._dragMap_MouseUp,self);
			
			self.__speedTimer.cancel();
			if(self.mapState.moving){
				if (Math.round(self.__speedX)!=0||Math.round(self.__speedY)!=0){
					self.mapState.moving = false;	
					var centerPoint = self.get('centerPoint');
					var point = new Point(Math.round(centerPoint.x + self.gradeWin2Map(self.__speedX)),Math.round(centerPoint.y + self.gradeWin2Map(self.__speedY)));
					self.center(point);
					return ;
				}
				self.fire('mapmoveend');
				self.mapState.moving = false;
			}
		},
		_changeBoxPos: function(x, y) {
			var self  = this,boxPoint = self.get('boxPoint'),transitionPoint = self.get('transitionPoint');
			boxPoint.x += x;
			boxPoint.y += y;
			
			transitionPoint.x += x;
			transitionPoint.y += y;
			var cssobj = {left:boxPoint.x+'px',top:boxPoint.y+'px'};
			self.topLayer.css(cssobj);
			self.bottomLayer.css(cssobj);
			self.transitionLayer.css({left:transitionPoint.x+'px',top:transitionPoint.y+'px'});
		},
		addLayer:function(layer){
			var self = this;
			layer.setMap(self);
			layer.init();
		},
		gradeMap2Win: function(v) {
			return Math.round(v * this.get('zoomPer')[this.get('zoom')]);
		},

		gradeWin2Map: function(v) {
			return Math.round(v / this.get('zoomPer')[this.get('zoom')]);
		},

		getContainerPoint:function(){
			var offset = this.get('container').offset();
			return new Point(offset.left,offset.top);
		},
		//鼠标相对于地图的窗体坐标
		getWinPoint:function(e){
			var p1 = this.getContainerPoint();
			return new Point(e.pageX-p1.x,e.pageY-p1.y);
		},
		//鼠标相对地图的地图坐标
		getMapPoint:function(e){
			return this.getMapPointFromWin(this.getWinPoint(e));
		},
		//窗体坐标转换成地图坐标
		getMapPointFromWin:function(p){
			var cp = this.get('centerPoint'),w=this.get('width')/ 2,h=this.get('height')/ 2;
			return new Point(this.gradeWin2Map(p.x - w) + cp.x,this.gradeWin2Map(p.y - h)  + cp.y);
		},
		getWinPointFromMap:function(p){
			var cp = this.get('centerPoint'),w=Math.round(this.get('width')/ 2),h= Math.round(this.get('height')/ 2);
			return new Point(this.gradeMap2Win(p.x-cp.x)+w ,this.gradeMap2Win(p.y-cp.y)+h );
		},
		getBoxPointFromMap:function(p){
			var wp = this.getWinPointFromMap(p);
			var bp = this.get('boxPoint');
			return new Point(wp.x - bp.x, wp.y - bp.y);
		},
		getBoxPointFromWin:function(p){
			var bp = this.get('boxPoint');
			return new Point(p.x - bp.x, p.y - bp.y);
		},
		//返回地图的左上和右下的地图坐标点
		getMapRegion:function(){
			var cp = this.get('centerPoint'),w=this.get('width')/ 2,h=this.get('height')/ 2;
			return [new Point(cp.x-this.gradeWin2Map(w),cp.y-this.gradeWin2Map(h)),new Point(cp.x+this.gradeWin2Map(w),cp.y+this.gradeWin2Map(h))];
		}
	});
	return Map;
	

},{
    requires:['node','event','ua','base','./point']
});