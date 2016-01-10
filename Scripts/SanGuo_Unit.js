;(function () {
    var isFun = CL.isFunction;
    var extend = CL.extend;
    var getAvg = function(x, y){
        return Math.sqrt(x * x + y * y);
    }
    var inRange = function(v, min, max){
        return min <= v && v <=max;
    }
    var updatePosition = function(x, y, tx, ty, distance){
        var dx = tx - x,
            dy = ty - y,
            l = getAvg(dx, dy),
            percent = Math.min(l, distance) / l,
            direction;

        dx = dx * percent || 0;
        dy = dy * percent || 0;

        if(dx || dy){
            if(Math.abs(dx) > Math.abs(dy)){
                direction = dx > 0 ? 'right' : 'left';
            }else {
                direction = dy > 0 ? 'down' : 'up';
            }
        }

        return {
            x: x + dx,
            y: y + dy,
            dx: dx,
            dy: dy,
            direction: direction
        };
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
                case 'shot':
                    return 16;
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
                case 'shot':
                    return 16;
            }
            return 0;
        },
        getSourceX: function(step){
            switch(this.action){
                case 'hurt':
                    return 0;
                case 'shot':
                    return 0;
                default: 
                    return this.getWidth() * (Math.floor(step) % 4);
            }
        },
        getSourceY: function(face){
            switch(face){
                case 'left': face = 1; break;
                case 'right': face = 2; break;
                case 'up': face = 3; break;
                case 'down':
                default:
                    face = 0; break;
            }
            switch(this.action){
                case 'hurt':
                    return this.getHeight() * 3;
                case 'shot':
                    return 48 * face;
                default: 
                    return this.getHeight() * face;
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
        },
        onRender: function(p){
            var t = (p.time - this.time) || 16;
            this.time = p.time;

            var position = this.getPosition(t);
            position.t = t;

            var step = this.getStep(t);
            var action = this.getAction(position);
            var face = this.getFace(position);

            var img = new image(this.path, action);
            
            if(this.step % 4 <= 2 && (this.step + step) % 4 >= 2 && isFun(this[action])){
                this[action](p);
            }
            
            this.x += position.dx;
            this.y += position.dy;
            this.step = (this.step || 0) + step;
            
            p.ctx.drawImage(
                img.getSource(),
                img.getSourceX(this.step), img.getSourceY(face), img.getWidth(), img.getHeight(),
                Math.round(this.x) - img.getWidth() / 2, Math.round(this.y - this.height), img.getWidth(), img.getHeight()
            );
//            if(this.type === 'MountedMissile'){
//            console.log(this.path, img.action, img.getSourceX(this.step), img.getSourceY(this.getFace()))
//            }
        },
        afterRender: function(p){
        },
        inRange: function(x, y){
            return inRange(x, this.x - this.width / 2, this.x + this.width / 2) && inRange(y, this.y - this.height, this.y);
        },
        getPosition: function(t){
            var target = this.target;
            var tx, ty;
              
            if(target){
                if(target.type){
                    if(Math.abs(target.x - this.x) > (target.width / 2 + this.width / 2)){
                        tx = target.x;
                    }else{
                        tx = this.x;
                    }
                    if(Math.abs(target.y - this.y) > 25){
                        ty = target.y;
                    }else{
                        ty = this.y;
                    }
                }else{
                    tx = target.x;
                    ty = target.y;
                }
            }
            var position = updatePosition(this.x, this.y, tx, ty, t * this.moveSpeed / 25);
            
            if(!position.dx && !position.dy){
                if(target && !target.type){
                    this.target = undefined;
                }
            }

            return position;
        },
        getAction: function(position){
            var action = '';

            if(this.timeout){//do hurt & other actions
                this.timeout -= position.t;
                if(this.timeout > 0){
                    return this.action;
                }else{
                    this.timeout = 0;
                }
            }

            if(position.dx || position.dy){
                action = 'move';
            }else{
                if(this.target && this.target.type){
                    action = 'attack';
                }else{
                    action = 'stand';
                }
            }
            
            if(this.action !== action){
                //if(this.type === 'FootMelee') console.log(this.action, action)
                this.action = action;
                this.step = 0;
            }
            return this.action;
        },
        getStep: function(t){
            return (this[this.action + 'Speed'] || 0) / t;
        },
        getFace: function(position){
            var target = this.target;
            var dx = position.dx,
                dy = position.dy;

            if(!dx && !dy){
                dx = target && (target.x - this.x) || 0;
                dy = target && (target.y - this.y) || 0;
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
                this.target.hurt(p, this.damage, 300);
            }
        },
        hurt: function(p, damage, timeout){
            this.action = 'hurt';
            this.timeout = timeout;
            this.step = Math.max(0, this.step - 100);
            this.canvas.add(unitManager({
                type: 'Damage',
                x: this.x,
                y: this.y - this.height,
                content: damage,
                time: p.time
            }));
//            this._time = this._time || p.time;
//            this._count = (this._count + 1) || 0;
            //console.log(this.type, Math.round((p.time - this._time )/ this._count));
        },
        remove: function(){
            if(isFun(this.onRemove)) this.onRemove();
            this.canvas.remove(this);
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
            attackSpeed: 1.5,
            attackRange: 24,
            isNPC: true
        },
    //轻骑兵
        MountedMelee: {
            path: './Images/NPC/轻骑兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 3,
            attackSpeed: 1.5,
            attackRange: 30,
            isNPC: true
        },
    //弓兵
        FootMissile: {
            path: './Images/NPC/弓兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 1.5,
            attackSpeed: 1.5,
            attackRange: 50,
            isNPC: true
        },
    //弓骑兵
        MountedMissile: {
            path: './Images/NPC/弓骑兵/',
            width: 48,
            height: 64,
            damage: 10,
            moveSpeed: 3,
            attackSpeed: 1.5,
            attackRange: 50,
            attack: function(p){
                var target = this.target;
                if(target && target.type){
                    this.canvas.add(unitManager({
                        type: 'Arrow',
                        x: this.x,
                        y: this.y - this.height / 2,
                        target: {
                            x: target.x,
                            y: target.y - this.height / 2,
                        },
                        time: p.time,
                        damage: this.damage,
                        creater: this
                    }));
                }
            },
            isNPC: true
        }
    });

    extend(unitManager, {
        Damage: {
            content: '',
            beforeRender: function(p){
            },
            onRender: function(p){
                this.canvas.drawText(this.x, Math.round(this.y - (p.time - this.time) * 0.01), this.content, this.fillColor);
            },
            afterRender: function(p){
                if(p.time - this.time > 1000){
                    this.remove();
                }
            },
            fillColor: function(ctx){
                ctx.fillStyle = '#FF0000';
            }
        },
        Arrow: {
            path: './Images/NPC/',
            action: 'shot',
            width: 16,
            height: 16,
            moveSpeed: 9,
            beforeRender: function(p){
            },
            onRender: function(p){
                var arrow = this;
                var position = updatePosition(this.x, this.y, this.target.x, this.target.y, this.moveSpeed * (p.time - this.time) / 30);
                this.x = position.x;
                this.y = position.y;
                this.time = p.time;

                var target = this.canvas.items().first(function(){
                    return this.isNPC && this !== arrow.creater && this.inRange(position.x, position.y);
                })

                if(target || !position.dx && !position.dy){
                    if(target){
                        target.hurt(p, this.damage, 300);
                    }
                    this.remove();
                }else{
                    var img = new image(this.path, this.action);
            
                    p.ctx.drawImage(
                        img.getSource(),
                        img.getSourceX(0), img.getSourceY(position.direction), img.getWidth(), img.getHeight(),
                        Math.round(this.x) - img.getWidth() / 2, Math.round(this.y - this.height), img.getWidth(), img.getHeight()
                    );
                }
            },
            afterRender: function(p){
            }
        }
    });
})();