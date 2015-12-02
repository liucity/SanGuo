;(function () {
    var game = function(){
    }

    game.prototype = {
        init: function(){
            var body = dom('body');
            var width = body.width();
            var height = body.height();
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
            var frontItems = new linq([new unitManager({
                x: 100,
                y: 100,
                width: 48,
                height: 64,
                source: sourceManager.image('./Images/NPC/重步兵/重步兵.png')
            })]);
                
            var frontCanvas = new canvas({
                dom: dom('#npcs'),
                x: 0,
                y: 0,
                width: width,
                height: height,
                items: frontItems,
                render: function (t) {
                    var context = this.getContext();
                    this.clean();
                    this.items.each(function(){
                        context.drawImage(
                            this.source,
                            0, 0, this.width, this.height,
                            this.x - this.width / 2, this.y - this.height, this.width, this.height
                        );
                    });
                }
            });
            EventManager.add('click', function(e){
                frontCanvas.items.each(function(){
                    this.target = {
                        x: e.x,
                        y: e.y
                    };
                })
            }, frontCanvas);
            /*--------npc end --------*/
        }
    }

    window.SanGuo = game;
})();