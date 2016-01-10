;(function(){
    var slice = [].slice;

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
        
        canvas.prototype.items.call(this, params.items, false);
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
        items: function(items, needDraw){
            if(!this._items){
                this._items = new linq([]);
            }
            if(CL.isArray(items) || items instanceof linq){
                if(this.items !== canvas.prototype.items) delete this.items;
                this._items = new linq([]);
                this.add.apply(this, items.source || items);
                if(needDraw !== false) this.draw();
            }
            return this._items;
        },
        add: function(){
            var that = this;
            var args = slice.call(arguments, 0);
            var items = this.items();
            CL.each(args, function(i, arg){
                arg.canvas = that;
                items.add(arg);
            });
        },
        remove: function(){
            this._items = linq.prototype.remove.apply(this._items, arguments);
        },
        getImageData: function(x, y, w, h){
            var imgData = this.getContext().getImageData(x, y, w, h);
            var data= imgData.data;
            var len = data.length / 4;
            var i = 0, t;
            var results = new linq([]);

            for (i = 0; i < len; i++, t = i * 4) {
                results.add({
                    x: i % w,
                    y: Math.floor(i / w),
                    r: data[t],
                    g: data[t + 1],
                    b: data[t + 2],
                    a: data[t + 3]
                });
            }
            imgData.each = function(){
            }
            imgData.map = results;
            return imgData;
        },
        drawText: function(x, y, content, callback){
            if(content){
                var ctx = this.getContext();
                var width = ctx.measureText(content).width;
                ctx.font = this.font;
                ctx.textBaseline = 'bottom';
                if(CL.isFunction(callback)){
                    callback(ctx);
                //ctx.fillStyle = item.color || '#FFFFFF';
                }
                ctx.fillText(content, Math.round(x - width / 2), y);
            }
        }
    }

    window.canvas = canvas;
})();