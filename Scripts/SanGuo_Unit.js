;(function () {
    var isFun = CL.isFunction;
    var extend = CL.extend;
    var getAvg = function(x, y){
        return Math.sqrt(x * x + y * y);
    }

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
            afterRender: null
        }, params);

        if (isFun(this.init)) this.init();
    }

    var unitManager = function (params) {
        return new renderItem(extend({}, unitManager.Base, unitManager[params.type], params));
    }

    unitManager.Base = {
        beforeRender: function(p){
            if(this.target && (this.target.x !== this.x || this.target.y !== this.y)){
                this.preparePosition(p);
                this.prepareSource(p);
            }
        },
        onRender: function(p){
            p.ctx.drawImage(
                this.getSource(p),
                this.getSourceX(p), this.getSourceY(p), this.getWidth(), this.getHeight(),
                Math.round(this.x) - this.getWidth() / 2, Math.round(this.y - this.height), this.getWidth(), this.getHeight()
                //Math[p.dx < 0 ? 'ceil': 'floor'](this.x), Math[p.dy < 0 ? 'ceil': 'floor'](this.y - this.height), this.width, this.height
            );
        },
        afterRender: function(p){
        },
        preparePosition: function(p){
            var t = p.time - this.time;
            var target = this.target;
            var dx = 0,
                dy = 0,
                l;

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

            if(!dx && !dy){
                if(!target.type){
                    this.target = undefined;
                }
            }else{
                l = getAvg(dx, dy);
                dx = Math[dx < 0 ? 'max' : 'min'](dx, t * this.speed / l / 200 * dx);
                dy = Math[dy < 0 ? 'max' : 'min'](dy, t * this.speed / l / 200 * dy);
            }

            this.x += dx;
            this.y += dy;

            p.dx = dx;
            p.dy = dy;
            p.dt = t;
            this.time = p.time;
        },
        prepareSource: function(p){
            var t = p.dt || 16;
            if(!p.dx && !p.dy){
                if(this.target){
                    this.action = 'attack';
                    this.step += this.attackSpeed / t / 10;
                }else{
                    this.action = 'move';
                    this.step = 0;
                }
            }else{
                if(Math.abs(p.dx) > Math.abs(p.dy)){
                    this.face = p.dx > 0 ? 'right' : 'left';
                }else {
                    this.face = p.dy > 0 ? 'down' : 'up';
                }
                this.action = 'move';
                this.step += this.speed / t / 10;
            }
        },
        getSource: function(p){
            return sourceManager.image(this.path + (this.action || 'move') + '.png');
        },
        getSourceX: function(p){
            return this.getWidth() * (Math.floor(this.step) % 4);
        },
        getSourceY: function(p){
            switch(this.face){
                case 'down': return this.getHeight() * 0;
                case 'left': return this.getHeight() * 1;
                case 'right': return this.getHeight() * 2;
                case 'up': return this.getHeight() * 3;
            }
        },
        getWidth: function(p){
            switch(this.action){
                case 'move': return 48;
                case 'attack': return 64;
            }
        },
        getHeight: function(p){
            switch(this.action){
                case 'move': return 64;
                case 'attack': return 64;
            }
        },
        checkState: function(p){
        }
    };

    window.unitManager = unitManager;

    extend(unitManager, {
    //轻步兵
        FootMelee: {
            width: 48,
            height: 64,
            speed: 15,
            attackSpeed: 15,
            path: './Images/NPC/轻步兵/'
        },
    //轻骑兵
        MountedMelee: {
            width: 48,
            height: 64,
            speed: 25,
            attackSpeed: 15,
            path: './Images/NPC/轻骑兵/'
        },
    //弓兵
        FootMissile: {
            width: 48,
            height: 64,
            speed: 12,
            attackSpeed: 15,
            path: './Images/NPC/弓兵/'
        },
    //弓骑兵
        MountedMissile: {
            width: 48,
            height: 64,
            speed: 25,
            attackSpeed: 15,
            path: './Images/NPC/弓骑兵/'
        }
    })
})();