;(function () {
    var unitManager = function (params) {
        if (!(this instanceof unitManager)) {
            return new unitManager(params);
        }

        CL.extend(this, {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            source: null,
            type: null,
            init: null,
            render: null
        }, params);

        if (CL.isFunction(this.init)) this.init.call(this);
    }

    window.unitManager = unitManager;

    //轻步兵 
    unitManager.FootMelee = new unitManager({
        source: sourceManager.image('./Images/NPC/重步兵/重步兵.png')
    })
})();