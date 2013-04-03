KISSY.add('tbc/layer',function(S,Node,Base,Point){
	function Layer(config){
		Layer.superclass.constructor.apply(this, arguments);
		this.R1 = 0;this.R2 = 0;this.C1 = 0;this.C2= 0;
	}
	Layer.ATTRS = {
		w:{
			value:256
		},
		h:{
			value:256
		}
	};
	S.extend(Layer,Base, {
		setMap:function(map){
			this.map = map;
		},
		getMap:function(){
			if(this.map){
				return this.map
			}
			throw "未将图层添加到地图";
		},
		//获取栅格图片数据z:级别，a,b:栅格号
		getFileName:function(z,a,b){
			
		},
		getMapPointFromAB:function(){
			var self = this,map =self.getMap(),w=self.get('w'),h=self.get('h')
			new Point(map.gradeWin2Map(i*w),map.gradeWin2Map(j*h));
		}
	});
	return Layer;
},{requires:['node','base','./point']});