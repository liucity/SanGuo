;(function () {
    //manage image source
    var splice = [].splice;

    var sourceManager = {
        cache: {},
        load: function(type, source, callback){
            var manager = this;
            var obj = manager.cache[source];
            if(obj){
                if(CL.isFunction(callback)) callback.call(obj, obj);
            }else{
                obj = document.createElement(type);
                obj.src = source;
                obj.onload = function(){
                    manager.cache[source] = obj;
                    return manager.load(type, source, callback);
                }
            }
            return obj;
        },
        image: function(){
            splice.call(arguments, 0, 0, 'img');
            return this.load.apply(this, arguments);
        },
        script: function(){
            var arg = splice.call(arguments, 0, 0, 'script');
            return this.load.apply(this, arg);
        }
    }

    window.sourceManager = sourceManager;
})();