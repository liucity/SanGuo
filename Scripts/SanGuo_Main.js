;(function () {
    var isFun = CL.isFunction;
    var getTime = CL.getTime;

    var game = function(){
    }

    game.prototype = {
        init: function(){
            var body = dom('body');
            var width = body.width();
            var height = body.height();
            var time = getTime();
            var x, y, img;
            
            /*--------background start --------*/
            var backgroundItems = [];

            var backgroundCanvas = new canvas({
                dom: dom('#background'),
                x: 0,
                y: 0,
                width: width,
                height: height,
                items: backgroundItems,
                render: function (t) {
                    var context = this.getContext();
                    (new linq(this.items)).each(function(){
                        context.drawImage(
                            this.source,
                            0, 0, this.width, this.height,
                            this.x, this.y, this.width, this.height
                        );
                    });
                    return false;
                }
            });

            img = sourceManager.image('./Images/mark/46.png', function(){
                backgroundCanvas.draw();
            });

            for(x =0; x < width;){
                for(y =0; y < width;){
                    backgroundItems.push({
                        x: x,
                        y: y,
                        width: 48,
                        height: 48,
                        source: img
                    })
                    y += 48;
                }
                x += 48;
            }
            /*--------background end --------*/
            
            /*--------npc start --------*/
            var player = unitManager({
                type: 'MountedMissile',
                x: width / 2,
                y: height / 2,
                isPlay: true,
                afterRender: function(p){
                }
            });

            var frontItems = new linq([
                player,
                unitManager({
                    type: 'FootMelee',
                    x: 0,
                    y: 100,
                    target: player,
                    time: time
                }),unitManager({
                    type: 'MountedMelee',
                    x: 400,
                    y: 400,
                    target: player,
                    time: time
                }),unitManager({
                    type: 'FootMissile',
                    x: 0,
                    y: 100,
                    target: player,
                    time: time
                })
            ]);
                
            var frontCanvas = new canvas({
                dom: dom('#npcs'),
                x: 0,
                y: 0,
                width: width,
                height: height,
                items: frontItems,
                render: function (p) {
                    var ctx = this.getContext();
                    p.ctx = ctx;
                    this.clean();
                    this.items.order('y').each(function(){
                        if(isFun(this.beforeRender)) this.beforeRender(p);
                        
                        if(isFun(this.onRender)) this.onRender(p);

                        if(isFun(this.afterRender)) this.afterRender(p);
                    });
                }
            });

            EventManager.add('click', function(e){
                var time = getTime();
                player.target = {
                    x: e.x,
                    y: e.y
                };
                player.time = time;
//                frontCanvas.items.each(function(){
//                    this.target = {
//                        x: e.x,
//                        y: e.y
//                    };
//                    this.time = time;
//                })
            }, frontCanvas);
            /*--------npc end --------*/

        }
    }

    window.SanGuo = game;
})();