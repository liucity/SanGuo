; (function () { 
    var __events = {};
    var eventManager = {
        add: function(type, callback, obj){
            __events[type] = __events[type] || new linq([]);
            __events[type].add({
                callback: callback,
                target: obj
            });
        },
        remove: function(obj, type){
            if(__events[type]){
                __events[type] = __events[type].where(function(){
                    return this.target !== obj;
                });
            }
        },
        trigger: function(type, event){
            var x = event.x,
                y = event.y,
                temp;
            if(__events[type]){
                __events[type].each(function(){
                    temp = this.target;
                    if((temp.x < x) && (temp.x + temp.width > x) && (temp.y < y) && (temp.y + temp.height > y)){
                        this.callback.call(temp, event);
                    }
                });
            }
        }
    };

    window.addEventListener('click', function(e){
        eventManager.trigger('click', e);
    })
    window.addEventListener('mouseover', function(e){
        eventManager.trigger('mouseover', e);
    })

    window.EventManager = eventManager;
})();