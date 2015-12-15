;(function () {
    "use strict";

    var slice = [].slice;

    var CL = {
        isArray: function (obj) {
            return Array.isArray(obj);
        },
        isFunction: function (obj) {
            return typeof obj === 'function';
        },
        isObject: function(obj){
            return typeof obj === 'object';
        },
        getTime: function(){
            return (new Date()).getTime();
        },
        random: function(range){
            return Math.round(range * Math.random());
        }
    };

    CL.each = function (obj, callback) {
        var i = 0, name, length = obj.length;
        if (CL.isArray(obj)) {
            for (; i < length; ) {
                if (callback.call(obj[i], i, obj[i++]) === false) break;
            }
        } else {
            for (name in obj) {
                if (callback.call(obj[name], name, obj[name]) === false) break;
            }
        }
    };

    CL.extend = function (target) {
        var args = slice.call(arguments, 1);
        target = target || {};
        CL.each(args, function (i, item) {
            if(item){
                CL.each(item, function (k, v) {
                    if (item.hasOwnProperty(k)) {
                        target[k] = v;
                    }
                });
            }
        });
        return target;
    };

    if (window.CL) {
        CL.extend(window.CL, CL);
    } else {
        window.CL = CL;
    }
})();



;(function () {
    var spiltReg = /\s+/;
    var dom = function (key) {
        if(!(this instanceof dom)){
            return new dom(key);
        }

        var selector = new linq((key || '').split(spiltReg)),
            result = document;

        selector.each(function (k) {
            if (k.indexOf('#') > -1) {
                result = [result.getElementById(k.substr(1))];
            } else if (k.indexOf('.') > -1) {
                result = result.getElementsByClassName(k.substr(1));
            } else {
                result = result.getElementsByTagName(k);
            }
        });

        this.source = result === document ? undefined : result;
    }
    
    var dManager = CL.extend(new linq(), {
        get: function(dom, key){
            return this.where(function(){
                return this.key === key && this.dom === dom;
            }).select(function(){
                return this.data;
            });
        },
        set: function(dom, key, data){
            this.add({
                dom: dom,
                key: key,
                data: data
            });
        },
        remove: function(dom, key){
            linq.prototype.remove.call(this, function(){
                return key ? this.dom === dom && this.key === key : this.dom === dom;
            });
        }
    });
    
    dom.prototype = CL.extend(new linq(), {
        data: function(key, value){
            if(value !== undefined){
                this.each(function(){
                    dManager.set(this, key, value);
                });
                return this;
            }else{
                return dManager.get(this.first(), key).array();
            }
        },
        on: function(type, callback){
            this.each(function(){
                this.addEventListener(type, callback);
                dManager.set(this, '_event_' + type, callback);
            });
            return this;
        },
        one: function(type, callback){
            this.each(function(){
                this.addEventListener(type, function(e){
                    callback.call(this, e);
                    a.removeEventListener(type, e);
                    dManager.remove(this, '_event_' + type);
                });
                dManager.set(this, '_event_' + type, callback);
            });
            return this;
        },
        fire: function(type){
            var e = new Event(type);
            
            this.each(function(){
                this.dispatchEvent(e);
            });
            return this;
        },
        off: function(type){
            this.each(function(elm){
                dManager.get(this, '_event_' + type).each(function(value){
                    elm.removeEventListener(type, value);
                });
                dManager.remove(this, '_event_' + type);
            });
            return this;
        }
    });

    CL.extend(dom.prototype, {
        append: function(){
        },
        prepend: function(){
        },
        before: function(){
        },
        after: function(){
        },
        remove: function(){
            this.each(function(elm){
                dManager.get(this).each(function(value){
                    elm.removeEventListener(type, value);
                });
                dManager.remove(this);
                return this.parentNode.removeChild(this);
            });
        }
    });
    
    var slice = [].slice;
    CL.extend(dom.prototype, {
        css: function(params){
            if(typeof params === 'string' && this.count()){
                return this.first().style.params;
            }else{
                this.each(function(item){
                    CL.each(params, function(k, v){
                        item.style[k] = v;
                    });
                });
            }
            return this;
        },
        width: function(v){
            if(v){
                return this.css('width', Number((v + '').replace('px', '')) + 'px');
            }
            return this.first().clientWidth;
        },
        height: function(v){
            if(v){
                return this.css('height', Number((v + '').replace('px', '')) + 'px');
            }
            return this.first().clientHeight;
        },
        class: function(){
        },
        attr: function(params){
            if(typeof params === 'string' && this.count()){
                return this.first().attributes[params];
            }else{
                this.each(function(item){
                    CL.each(params, function(k, v){
                        item.setAttribute(k, v);
                    });
                });
            }
            return this;
        },
        transform: (function(){
            var transformReg = /\w+\([^\)]*\)/g,
                translateReg = /^\d+(\.\d+)?(%|px)$/,
                scaleReg = /^\d+(\.\d+)?$/,
                rotateReg = /^\d+(\.\d+)?turn$/,
                surfixList = new linq(['px', 'turn']),
                format = function(input, type){
                    switch(type){
                        case 'translate':
                        case 'translateX':
                        case 'translateY':
                            if(translateReg.test(input)){
                                return input;
                            }else if(!isNaN(input)){
                                return input + 'px';
                            }
                            break;
                        case 'scale':
                        case 'scaleX':
                        case 'scaleY':
                            if(scaleReg.test(input)){
                                return input;
                            }else{
                                return 1;
                            }
                            break;
                        case 'rotate':
                        case 'skewX':
                        case 'skewY':
                            if(rotateReg.test(input)){
                                return input;
                            }else if(!isNaN(input)){
                                return input + 'turn';
                            }
                            break;
                        case 'matrix':
                            break;
                    }
                    return '';
                },
                getTransform = function(type){
                    switch(type){
                        case 'translate':
                        case 'scale':
                            return type + '(' + format(arguments[1], type) + ',' + format(arguments[2], type) + ')';
                        case 'rotate':
                        case 'translateX':
                        case 'translateY':
                        case 'scaleX':
                        case 'scaleY':
                        case 'skewX':
                        case 'skewY':
                            return type + '(' + format(arguments[1], type) + ')';
                    }
                    return '';
                };

            return function(type){
                var callback,
                    arg,
                    val;

                if(arguments.length > 1){
                    arg = getTransform.apply(null, arguments);
                    callback = function(item){
                        return item.indexOf(type) === -1;
                    }
                    this.each(function(item){
                        val = this.style.transform;
                        if(val){
                            val = new linq(val.match(transformReg)).where(callback).add(arg).array().join(' ');
                        }else{
                            val = arg;
                        }

                        this.style.transform = val;
                    });
                }else if(this.count()){
                    val = this.first().style.transform;
                    if(val){
                        val = new linq(val.match(transformReg)).first(function(item){
                            return item.indexOf(type) !== -1;
                        });
                        val = new linq((val || '').replace(type + '(', '').replace(')', '').split(', ')).select(function(item){
                            surfixList.each(function(surfix){
                                item = item.replace(surfix, '');
                            })
                            return Number(item);
                        }).array();
                    }
                    return val;
                }

                return this;
            };
        })()
    });

    window.dom = dom;
})();