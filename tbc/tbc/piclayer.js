KISSY.add('tbc/piclayer',function(S,Node,Layer,Point){
	function PicLayer(){
		PicLayer.superclass.constructor.apply(this, arguments);
	}
	PicLayer.ATTRS = {
		z:{
			value:50
		}
	};
	S.extend(PicLayer,Layer, {
		init:function(){
			var self = this, map = self.map;
			self.ID = S.guid('tbc_Map_PicLayer');
			self.layer = map.newMapLayer(self.ID,self.get('z'),false);
			self.picObjects ={};
			self.loadCells();
			//加入事件监听
			map.on('mapresize',map.buffer(self.loadCells,40,self));
			map.on('mapmoving',map.buffer(self.loadCells,20,self));
			map.on('beforemapzoom',function(){
				map.createTransitionLayer(self.layer);
				self.picObjects ={};
			});
			map.on('mapzoom',self.loadCells,self);
			map.on('mapmoveend',map.buffer(self.removeCells,80,self));
		},
		loadCells:function(){
			var self = this, map = self.map,z=map.zoom(),w=self.get('w'),h=self.get('h');
			var region = map.getMapRegion();
			self.R1 = Math.floor(map.gradeMap2Win(region[0].x)/w)-1;
			self.R2 = Math.floor(map.gradeMap2Win(region[1].x)/w)+1;
			self.C1 = Math.floor(map.gradeMap2Win(region[0].y)/h)-1;
			self.C2 = Math.floor(map.gradeMap2Win(region[1].y)/h)+1;
			
			self.domfrag = document.createDocumentFragment();
			for(var i=self.R1;i<=self.R2;i++){
				for(var j=self.C1;j<=self.C2;j++){
					self._loadCell(z,i,j,w,h);
				}
			}
			self.layer[0].appendChild(self.domfrag);
		},
		removeCells: function() {
			var self = this,picObjects = self.picObjects;
			for(k in picObjects){
				var obj=picObjects[k];
				if (obj.R < self.R1 || obj.R > self.R2 || obj.C < self.C1 || obj.C > self.C2) {
					delete picObjects[k];
					var node = self.layer.one('#'+k);
					node.removeAttr('src');
					node.detach();
					node[0].parentNode.removeChild(node[0]);
					node = null;
				}
			}
		},
		_loadCell:function(z,i,j,w,h){
			var self = this,map = self.map,id=self.ID+'_'+z+'_'+i+'_'+j;
			if(!self.picObjects[id]){
				self.picObjects[id] = {R:i,C:j};
				var mp = new Point(map.gradeWin2Map(i*w),map.gradeWin2Map(j*h));
				var bp = map.getBoxPointFromMap(mp);
				//console.log(bp.x+','+bp.y);
				var src = self.getFileName(z,i,j);//获取图片地址
				var node = new Node('<img />');
				node.css({position:'absolute',left:bp.x+'px',top:bp.y+'px','-moz-user-select':'none','-webkit-user-select':'none'});
				
				if (S.UA.firefox) {
					node.css('visibility','hidden');
					node.on('load',function(e){
						node.detach('load');
						node.css('visibility','visible');
					});
                }
				
				node.attr({id:id,border:0,src:src,width:w,height:h,unselectable:'on'});
				//禁止拖拽
				node.on('dragstart',function(e){
					e.preventDefault();
					return false;
				});
				//出错隐藏
				node.on('error' , function() {
					node.css('display' ,'none');
				});
				
				/*node.animate({
					opacity:1
				}, {
					duration:0.5,
					easing:'fadeIn',
					complete:function() {
						node.css("opacity", "");
					}
				});*/
				self.domfrag.appendChild(node[0]);
			}
		}
	});
	return PicLayer;
},{requires:['node','./layer','./point']});