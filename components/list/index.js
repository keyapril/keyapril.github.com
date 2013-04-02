KISSY.add("components/list/index", function(S, Brick, SETTING, localStorage) {
    var TMPL = '@TEMPLATE|' + Brix.absoluteFilePath(this, 'index.html') + '|TEMPLATE@';
    return Brick.extend({}, {
        ATTRS: {
            tmpl: {
                value: TMPL
            },
            data: {
                value: SETTING
            }
        },
        DOCEVENTS: {
            '': {
                'keydown': function(e) {
                    if (e.ctrlKey && e.keyCode == 46) {
                        localStorage.clear();
                    }
                }
            }
        }
    });
}, {
    requires: ["brix/core/brick", "components/setting/index", "gallery/local-storage/1.0/"]
});