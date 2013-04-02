KISSY.add("components/list/index", function(S, Brick,setting, localStorage) {
    function List() {
        List.superclass.constructor.apply(this, arguments);
    }
    List.ATTRS = {
        data:{
            value:setting
        }
    }
    List.DOCEVENTS = {
        '': {
            'keydown': function(e) {
                //console.log(e.ctrlKey);
                if(e.ctrlKey && e.keyCode == 46) {
                    S.log(1);
                    localStorage.clear();
                }
            }
        }
    }
    S.extend(List, Brick, {
        initialize: function() {

        }
    });
    return List;
}, {
    requires: ["brix/core/brick","components/setting/index", "gallery/local-storage/1.0/"]
});