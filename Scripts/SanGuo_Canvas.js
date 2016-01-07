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
            isRendering: false
        }, params);
        
        canvas.prototype.items.call(this, params.items);
        canvas.prototype.init.call(this);
        if(CL.isFunction(this.init)) this.init.call(this);
        this.draw();
    };

    canvas.prototype = {
        init: function(x, y, w, h){
            this.x = x || this.x;
            this.y = y || this.y;
            this.width = w || this.width;
            this.height = h || this.height;
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

            if(this.isRendering === false && CL.isFunction(this.render)){
                r = this.render;
                raf = function(){
                    if(target.items()){
                        target.isRendering = r.call(target, {
                            time: CL.getTime()
                        });
                    }
                    if(target.isRendering !== false){
                        requestAnimationFrame(raf);
                    }
                }
                raf();
            }
        },
        clean: function(x, y, w, h){
            this.getContext().clearRect(w || 0, y || 0, w || this.width, h || this.height);
        },
        items: function(items){
            var that;
            if(CL.isArray(items) || items instanceof linq){
                if(this.items !== canvas.prototype.items) delete this.items;
                this._items = new linq(items || []);
                that = this;
                this._items.each(function(){
                    this.canvas = that;
                });
                this.draw();
            }
            return this._items;
        },
        add: function(){
            linq.prototype.add.apply(this.items(), arguments);
        },
        remove: function(){
            linq.prototype.remove.apply(this.items(), arguments);
        },
        getImageData: function(x, y, w, h){
            var data = this.getContext().getImageData(x, y, w, h);
            var i = 0;

            for (var i = 0; i < w * 4; i += 4) {
                console.log(data.data[i], data.data[i+1], data.data[i+2], data.data[i+3])
                //data.data[i] = 0;
            }
        }
    }

    window.canvas = canvas;
})();