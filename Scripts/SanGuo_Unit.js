;(function () {
    var isFun = CL.isFunction;
    var extend = CL.extend;
    var getAvg = function(x, y){
        return Math.sqrt(x * x + y * y);
    }
    var inRange = function(v, min, max){
        return min <= v && v <=max;
    }
    var image = function(path, action){
        action = action || 'move';
        switch(action){
            case 'stand': path += 'move'; break;
            case 'hurt': path += 'spc'; break;
            default: path += action; break;
        }
        this.path = path + '.png';
        this.action = action;
    }

    image.prototype = {
        getSource: function(){
            return sourceManager.image(this.path);
        },
        getWidth: function(){
            switch(this.action){
                case 'move': 
                case 'stand':
                case 'hurt':
                    return 48;
                case 'attack': 
                    return 64;
            }
            return 0;
        },
        getHeight: function(){
            switch(this.action){
                case 'hurt':
                    return 48;
                case 'move': 
                case 'stand':
                case 'attack': 
                    return 64;
            }
            return 0;
        },
        getSourceX: function(step){
            switch(this.action){
                case 'hurt':
                    return 0;
                default: 
                    return this.getWidth() * (Math.floor(step) % 4);
            }
        },
        getSourceY: function(face){
            switch(this.action){
                case 'hurt':
                    return this.getHeight() * 3;
                    break;
                default: 
                    switch(face){
                        case 'left': return this.getHeight() * 1;
                        case 'right': return this.getHeight() * 2;
                        case 'up': return this.getHeight() * 3;
                        case 'down':
                        default:
                            return this.getHeight() * 0;
                    }
                    break;
            }
        }
    };

    var renderItem = function(params){
        if (!(this instanceof renderItem)) {
            return new renderItem(params);
        }

        extend(this, {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            init: null,

            path: '',
            face: 'down',
            step: 0,
            target: null,
            action: 'move', //move,attack,dead

            beforeRender: null,
            onRender: null,
            afterRender: null,
            temp: {}
        }, params);

        if (isFun(this.init)) this.init();
    }

    var unitManager = function (params) {
        return new renderItem(extend({}, unitManager.Base, unitManager[params.type], params));
    }

    unitManager.Base = {
        data: function(key, val){
            var temp = this.temp;
            if(typeof key === 'object'){
                CL.each(key, function(k, v){
                    temp[k] = v;
                })
            }else if(key){
                if(val === undefined){
                    return temp[key];
                }
                temp[key] = val;
            }
            return this;
        },
        beforeRender: function(p){
            this.preparePosition(p);
            this.getAction(p);
            if(this.step % 4 <= 2 && (this.step + this.data('step')) % 4 >= 2 && CL.isFunction(this[this.action])){
                this[this.action](p);
            }
        },
        onRender: function(p){
            var img = new image(this.path, this.action);

            this.x += this.data('movedX');
            this.y += this.data('movedY');
            this.step += this.data('step') || 0;
            
            p.ctx.drawImage(
                img.getSource(),
                img.getSourceX(this.step), img.getSourceY(this.getFace()), img.getWidth(), img.getHeight(),
                Math.round(this.x) - img.getWidth() / 2, Math.round(this.y - this.height), img.getWidth(), img.getHeight()
                //Math[p.dx < 0 ? 'ceil': 'floor'](this.x), Math[p.dy < 0 ? 'ceil': 'floor'](this.y - this.height), this.width, this.height
            );
//            if(this.type === 'MountedMissile'){
//            console.log(this.path, img.action, img.getSourceX(this.step), img.getSourceY(this.getFace()))
//            }
        },
        afterRender: function(p){
        },
        preparePosition: function(p){
            var t = p.time - this.time;
            var target = this.target;
            var dx = 0,
                dy = 0,
                l;
              
            if(target){
                if(target.type){
                    if(target.x < this.x){
                        if(target.x + target.width < this.x){ //tx <- x
                            dx = target.x + target.width - this.x;
                        }
                    }else{
                        if(target.x > this.x + this.width){ //x -> tx
                            dx = target.x - this.x - this.width;
                        }
                    }
                    if(target.y < this.y){
                        if(target.y + target.height < this.y){//ty <- y
                            dy = target.y + target.height - this.y;
                        }
                    }else{
                        if(target.y > this.y + this.height){//x -> ty
                            dy = target.y - this.y - this.height;
                        }
                    }
                }else{
                    dx = target.x - this.x;
                    dy = target.y - this.y;
                }
            }
            
            if(!dx && !dy){
                if(target && !target.type){
                    this.target = undefined;
                }
            }else{
                l = getAvg(dx, dy);
                dx = Math[dx < 0 ? 'max' : 'min'](dx, t * this.moveSpeed / l / 30 * dx);
                dy = Math[dy < 0 ? 'max' : 'min'](dy, t * this.moveSpeed / l / 30 * dy);
            }

            this.data({
                'movedX': dx,
                'movedY': dy,
                'pasedTime': t
            });
            this.getStep();
            this.time = p.time;
        },
        getAction: function(p){
            var action = '';
            var t = this.data('pasedTime') || 16;

            if(this.timeout){//do hurt & other actions
                this.timeout -= t;
                if(this.timeout > 0){
                    return;
                }else{
                    this.timeout = 0;
                }
            }

            if(this.data('movedX') || this.data('movedY')){
                action = 'move';
            }else{
                if(this.target && this.target.type){
                    action = 'attack';
                }else{
                    action = 'stand';
                }
            }
            
            if(this.action !== action){
                this.action = action;
                this.step = 0;
            }
            return this.action;
        },
        getStep: function(){
            var t = this.data('pasedTime') || 16;
            this.data('step', (this[this.action + 'Speed'] || 0) / t);
        },
        getFace: function(){
            var target = this.target;
            var dx = this.data('movedX'),
                dy = this.data('movedY');

            if(!dx && !dy){
                dx = target && ((target.x + (target.width || 0) / 2) - (this.x + this.width / 2)) || 0;
                dy = target && ((target.y + (target.height || 0) / 2) - (this.y + this.height / 2)) || 0;
            }

            if(dx || dy){
                if(Math.abs(dx) > Math.abs(dy)){
                    this.face = dx > 0 ? 'right' : 'left';
                }else {
                    this.face = dy > 0 ? 'down' : 'up';
                }
            }
            
            return this.face;
        },
        attack: function(p){
            if(this.target && this.target.type){
                this.target.hurt(this.damage, 300);
            }
        },
        hurt: function(damage, timeout){
            this.action = 'hurt';
            this.timeout = timeout;
        }
    };

    window.unitManager = unitManager;

    extend(unitManager, {
    //轻步兵
        FootMelee: {
            path: './Images/NPC/轻步兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 2,
            attackSpeed: 1.5
        },
    //轻骑兵
        MountedMelee: {
            path: './Images/NPC/轻骑兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 3,
            attackSpeed: 1.5
        },
    //弓兵
        FootMissile: {
            path: './Images/NPC/弓兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 1.5,
            attackSpeed: 1.5
        },
    //弓骑兵
        MountedMissile: {
            path: './Images/NPC/弓骑兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 3,
            attackSpeed: 1.5
        }
    })
})();