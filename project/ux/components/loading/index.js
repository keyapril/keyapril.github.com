KISSY.add("components/loading/index", function(S, Brick) {
	return Brick.extend({
		bindUI:function(){
			var me = this;
			me.pagelet.ready(function(){
				me.get('el').css('display','none')
			});
		}
	},{},'Loading')
}, {
    requires: ['brix/core/brick']
});