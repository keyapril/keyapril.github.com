KISSY.add('components/side_navigation/index', function(S, Brick) {

    function SideNavigation() {
        SideNavigation.superclass.constructor.apply(this, arguments);
    }
    
    
    SideNavigation.EVENTS = {
        ".power_button":{
            click:function(e){
                var self = this;
                var delay = 80, delayTime;
                var node = S.one(e.currentTarget);
                var el = self.get('el');
                if(!node.hasClass('power_button_clicked')) {
                    node.addClass('power_button_clicked');
                    btns = el.one('nav').all('.outer_circle');
                    btns.each(function(ele,i){
                        delayTime = i * delay;      
                        S.later(function(){
                            ele.addClass('open');
                        }, delayTime);
                    });
                }else{
                    node.removeClass('power_button_clicked');
                    btns = el.one('nav').all('.outer_circle');
                    btns.each(function(ele,i){
                        delayTime = (btns.length - i) * delay;      
                        S.later(function(){
                            ele.removeClass('open');
                        }, delayTime);
                    });
                }  
            }
        }
    };


    S.extend(SideNavigation, Brick, {
        initialize: function() {

        }
    });
    return SideNavigation;
}, {
    requires: ["brix/core/brick"]
});