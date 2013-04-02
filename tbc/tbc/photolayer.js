KISSY.add('tbc/photolayer',function(S,Node,Layer,Point){
	function PhotoLayer(){
		PhotoLayer.superclass.constructor.apply(this, arguments);
	}
	PhotoLayer.ATTRS = {
		z:{
			value:50
		}
	};
	S.extend(PhotoLayer,Layer, {
		init:function(){
			var self = this, map = self.map;
			self.ID = S.guid('tbc_Map_PicLayer');
			self.layer = map.newMapLayer(self.ID,self.get('z'),false);
			
			self.layer.delegate('mouseenter','.list-item',function(e){
				S.one(e.currentTarget).addClass('list-item-hover');
			
			});
			self.layer.delegate('mouseleave','.list-item',function(e){
				S.one(e.currentTarget).removeClass('list-item-hover');
			});
			self.haltEvent = false;
			map.on('mapmoving',function(){
				self.layer.css('cursor','move');
				self.haltEvent = true;
			});
			map.on('mapmoveend',function(){
				S.later(function(){
					self.haltEvent = false;
				},100,false);
			});
			self.layer.delegate('click','a',function(e){
				if(self.haltEvent){
					e.halt();
				}
				self.haltEvent = false;
			});
			
			self.picObjects ={};
			
			self.imageList = ['http://img04.taobaocdn.com/bao/uploaded/i4/T1.Q9KXk0jXXc2mzcV_020916.jpg_160x160.jpg','http://img01.taobaocdn.com/bao/uploaded/i1/T1xgGAXjxnXXaz7VHa_120036.jpg_160x160.jpg','http://img01.taobaocdn.com/bao/uploaded/i5/T1qvuEXb0mXXX1GeZ9_072950.jpg_160x160.jpg','http://img02.taobaocdn.com/bao/uploaded/i2/188653804/T2An1hXaXbXXXXXXXX_!!188653804.jpg_160x160.jpg','http://img02.taobaocdn.com/bao/uploaded/i2/T1s4uKXm8aXXXuw8c3_050730.jpg_160x160.jpg','http://img01.taobaocdn.com/bao/uploaded/i1/T1TaKxXoXZXXagLKc._111734.jpg_160x160.jpg'];
			self.loadCells();
			//加入事件监听
			map.on('mapresize',map.buffer(self.loadCells,40,self));
			map.on('mapmoving',map.buffer(self.loadCells,20,self));
			map.on('beforemapzoom',function(){
				map.createTransitionLayer(self.layer);
				self.picObjects ={};
			});
			map.on('mapzoom',function(){map.deleteTransitionLayer()});
			map.on('mapzoom',self.loadCells,self);
			map.on('mapmoveend',map.buffer(self.removeCells,80,self));
			
		},
		loadCells:function(){
			var self = this, map = self.map,z=map.zoom(),w=self.get('w'),h=self.get('h');
			var region = map.getMapRegion();
			self.R1 = Math.floor(map.gradeMap2Win(region[0].x)/w);
			self.R2 = Math.floor(map.gradeMap2Win(region[1].x)/w);
			self.C1 = Math.floor(map.gradeMap2Win(region[0].y)/h);
			self.C2 = Math.floor(map.gradeMap2Win(region[1].y)/h);
			
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
				var src = self.getFileName(z,i,j);//获取图片地址
				var node = new Node(['<div class="list-item">',
							'<div class="wrap">',
							'<h3 class="summary">',
								'<a href="http://click.simba.taobao.com/cc_im?p=%C5%AE%D7%B0&amp;s=847242954&amp;k=313&amp;e=ED6wACW2ns%2BnPoSU8kE9RQe%2FN4AY2pA5QWCjO1Os4S%2Bw7KgzCXaKVUt5PyqTzVdu84kgSNU65QANvOtH04a%2F1tIfdLEu1Vw8o1%2Bov2%2F7nTr7zRJ2XABljijMm0VS2L0AoqxkocmJat3U98nB9Il%2BX1MuNeEaoJRRnj6Gl%2Ba6FL4U6jNs5S2Vq%2BqHsLn9WlRoKCxPajt%2Bn8q67NCyE7zeY7dCPXY0ZIwhYUnWFMbuJcdrUG9vZ6W0vP1sHWa9ZbNGI39q6BYSvmOSz%2B6OPKLecyyifoAgeWyQ8At8Mj5U6x%2F3hKtlvoNOTw%3D%3D" target="_blank" title="独家！！超大奢华毛领！女中长款 修身羽绒">独家！！超大奢华毛领！女中长款 修身羽绒</a>',
								'<span class="ww-light ww-small" data-encode="true" data-nick="%E6%9A%B4%E9%9B%AA%E6%9C%8D%E9%A5%B0%E6%97%97%E8%88%B0%E5%BA%97" data-display="inline" data-item="13192070374" data-icon="small"><a href="http://www.taobao.com/webww/?ver=1&amp;&amp;touid=cntaobao%E6%9A%B4%E9%9B%AA%E6%9C%8D%E9%A5%B0%E6%97%97%E8%88%B0%E5%BA%97&amp;siteid=cntaobao&amp;status=2&amp;portalId=&amp;gid=13192070374&amp;itemsId=" target="_blank" class="ww-inline ww-online" title="点此可以直接和卖家交流选好的宝贝，或相互交流网购体验，还支持语音视频噢。"><span>旺旺在线</span></a></span>',
							'</h3>',
								'<div class="photo">',
									'<a href="http://click.simba.taobao.com/cc_im?p=%C5%AE%D7%B0&amp;s=847242954&amp;k=313&amp;e=ED6wACW2ns%2BnPoSU8kE9RQe%2FN4AY2pA5QWCjO1Os4S%2Bw7KgzCXaKVUt5PyqTzVdu84kgSNU65QANvOtH04a%2F1tIfdLEu1Vw8o1%2Bov2%2F7nTr7zRJ2XABljijMm0VS2L0AoqxkocmJat3U98nB9Il%2BX1MuNeEaoJRRnj6Gl%2Ba6FL4U6jNs5S2Vq%2BqHsLn9WlRoKCxPajt%2Bn8q67NCyE7zeY7dCPXY0ZIwhYUnWFMbuJcdrUG9vZ6W0vP1sHWa9ZbNGI39q6BYSvmOSz%2B6OPKLecyyifoAgeWyQ8At8Mj5U6x%2F3hKtlvoNOTw%3D%3D" target="_blank"><img src="'+self.imageList[S.now()%6]+'"></a>',
								'</div>',
								'<ul class="attribute">',
									'<li class="price"><em>1380.00</em> <span>最近成交8530笔</span></li>',
									'<li class="empty-summary"></li>',
									'<li class="shipment"><em>运费:12.00</em> <span>广东 广州</span></li>',
									'<li class="toplegend">',
										'<div class="legend">',
										'<a target="_blank" title="商城" class="xb-mall-icon" href="http://www.tmall.com/"><span>商城</span></a><a target="_blank" title="卖家承诺消费者保障服务" class="xb-as-fact" href="http://www.taobao.com/go/act/315/xfzbz_rsms.php"><span>消费者保障</span></a><a target="_blank" title="卖家承诺7天无理由退换货" class="xb-sevenday-return" href="http://www.taobao.com/go/act/315/xbqt090304.php"><span>七天退换</span></a><a target="_blank" title="卖家承诺正品保障" class="xb-quality_item" href="http://www.taobao.com/go/act/315/xfzbz_zpbz.php"><span>正品保障</span></a>',
										'</div>',
									'</li>',
								'</ul>',
							'</div>',
						'</div>'].join(''));
				node.css({opacity:0,position:'absolute',width:w+'px',height:h+'px',left:bp.x+'px',top:bp.y+'px','-moz-user-select':'none','-webkit-user-select':'none'});
				
				node.attr({id:id,unselectable:'on'});
				//禁止拖拽
				node.on('dragstart',function(e){
					e.preventDefault();
					return false;
				});
				node.animate({
					opacity:1
				}, {
					duration:0.5,
					easing:'fadeIn',
					complete:function() {
						node.css("opacity", "");
					}
				});
				
				self.domfrag.appendChild(node[0]);
			}
		}
	});
	return PhotoLayer;
},{requires:['node','./layer','./point']});