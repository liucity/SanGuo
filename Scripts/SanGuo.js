;(function () {
    var requiredJS = ['LinqArray', 'CL', 'SanGuo_SourceManager', 'SanGuo_Event', 'SanGuo_Canvas', 'SanGuo_Unit', 'SanGuo_Main'];

    var head= document.getElementsByTagName('head')[0];
    var loadJSFile = function(path, callback){
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= path;
        script.onload = callback;
        head.appendChild(script);
    }
    
    var i = 0,
        l = requiredJS.length;
    var load = function(){
        if(requiredJS[i]){
            loadJSFile('./Scripts/' + requiredJS[i++] + '.js', load);
        }else{
            var game = new SanGuo();
            game.init();
        }
    }

    load();
})();