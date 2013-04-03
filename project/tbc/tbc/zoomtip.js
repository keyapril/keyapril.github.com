KISSY.add('tbc/zoomtip',function(S,Node){
	function ZoomTip(map,cls){
		S.all("<style>.zoomTip{position:absolute;z-index:99999999;display:none}.zoomTip div{width:6px;height:4px;position: absolute;font-size:0px;}.zoomTip .lefttopborder{border-top: 2px solid #ff0000; border-left: 2px solid #ff0000;}.zoomTip .leftbottomborder{border-left: 2px solid #ff0000;border-bottom: 2px solid #ff0000;}.zoomTip .righttopborder{border-right: 2px solid #ff0000;border-top: 2px solid #ff0000;}.zoomTip .rightbottomborder{border-right: 2px solid #ff0000;border-bottom: 2px solid #ff0000;}</style>").appendTo("head");
		
		var maxW = 110,MaxH=90,minW=60,minH=40;
		var containerNode = new Node('<div class="zoomTip">');
		var lefttopNode = new Node('<div style="left:0;top:0"></div>');
		var righttopNode = new Node('<div style="right:0;top:0"></div>');
		var leftbottomNode = new Node('<div style="left:0;bottom:0"></div>');
		var rightbottomNode = new Node('<div style="right:0;bottom:0"></div>');
		containerNode.append(lefttopNode).append(righttopNode).append(leftbottomNode).append(rightbottomNode);
		containerNode.addClass(cls);
		
		map.get('container').append(containerNode);
		
		var p;
		map.on('beforemapzoom',function(e){
			if(!e.originalEvent||S.isEmptyObject(e.originalEvent)){
				p = map.getWinPointFromMap(map.get('centerPoint'));
			}
			else{
				p = map.getWinPoint(e.originalEvent);
			}
			var w, h,step = e.step;
			if (e.oldZoom>e.newZoom) {
				lefttopNode[0].className = 'lefttopborder';
				righttopNode[0].className = 'righttopborder';
				leftbottomNode[0].className = 'leftbottomborder';
				rightbottomNode[0].className = 'rightbottomborder';
				w = minW + step * 10;
				h = minH + step * 10;
			}
			else {
				lefttopNode[0].className = 'rightbottomborder';
				righttopNode[0].className = 'leftbottomborder';
				leftbottomNode[0].className = 'righttopborder';
				rightbottomNode[0].className = 'lefttopborder';
				w = maxW - step * 10;
				h = MaxH - step * 10;
			}
			
			containerNode.css({width:w+'px',height:h+'px',left:(p.x-w/2)+'px',top:(p.y-h/2)+'px',display:'block'});
		});
		
		map.on('mapzooming',function(e){
			var w, h,step = e.step;
			if (e.oldZoom>e.newZoom) {
				w = minW + step * 10;
				h = minH + step * 10;
			}
			else {
				w = maxW - step * 10;
				h = MaxH - step * 10;

			}
			containerNode.css({width:w+'px',height:h+'px',left:(p.x-w/2)+'px',top:(p.y-h/2)+'px'});
		});
		map.on('mapzoom',function(e){
			containerNode.css({display:'none'});
		});
	}
	return ZoomTip;
},{requires:['node']});