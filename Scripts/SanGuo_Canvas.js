;(function(){
    var canvas = function(params){
        if(!(this instanceof canvas)){
            return new canvas(params);
        }

        CL.extend(this, {
            dom: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            init: null,
            render: null,
            items: [],
            isRendering: false
        }, params);
        
        canvas.prototype.init.call(this);
        if(CL.isFunction(this.init)) this.init.call(this);
        this.draw();
    };

    canvas.prototype = {
        init: function(x, y, w, h){
            this.width = w || this.width;
            this.height = h || this.height;
            this.x = x || this.x;
            this.y = y || this.y;
            this.dom.attr({
                'Width': this.width,
                'Height': this.height
            }).css({
                position: 'absolute',
                left: this.x,
                right: this.y
            });
        },
        getContext: function(){
            if(!this.context){
                if(this.dom.count()){
                    this.context = this.dom.first().getContext("2d");
                }else{
                    throw 'no element found';
                }
            }
            return this.context;
        },
        draw: function(){
            var target = this,
                r,
                raf;

            if(!this.isRendering && CL.isFunction(this.render)){
                r = this.render;
                raf = function(){
                    target.isRendering = r.call(target, {
                        time: CL.getTime()
                    });
                    if(target.isRendering !== false){
                        requestAnimationFrame(raf);
                    }
                }
                raf();
            }
        },
        clean: function(){
            this.getContext().clearRect(0, 0, this.width, this.height);
        }
    }

    window.canvas = canvas;
})();