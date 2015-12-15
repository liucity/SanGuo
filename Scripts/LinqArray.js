; (function () {
    "use strict";

    var slice = [].slice,
        splice = [].splice,
        push = [].push,
        isArray = function (obj) {
            return Array.isArray(obj);
        },
        isFunction = function (obj) {
            return typeof obj === 'function';
        };

    var LinqArray = function (source) {
        if (!(this instanceof LinqArray)) {
            return new LinqArray(source);
        }
        if (source instanceof LinqArray) {
            source = source.array();
        }
        this.source = isArray(source) ? slice.call(source, 0) : [];
    };

    LinqArray.prototype = {
        each: function (callback, reverse) {
            var arr = this.source,
                l = arr.length,
                i = 0;

            if (reverse) {
                while (l--) {
                    if (callback.call(arr[l], arr[l], l) === false) break;
                }
            } else {
                for (; i < l; i++) {
                    if (callback.call(arr[i], arr[i], i) === false) break;
                }
            }
            return this;
        },
        add: function () {
            push.apply(this.source, arguments);
            return this;
        },
        insert: function (index) {
            var args = slice.call(arguments, 0);
            splice.call(args, 1, 0, 0);
            splice.apply(this.source, args);
            return this;
        },
        remove: function (callback) {
            var result = new LinqArray(),
                source = this.source;
            this.each(function (item, i) {
                if (callback.call(item, item, i)) {
                    result.add(i);
                }
            })
            result.each(function (item) {
                splice.call(source, item, 1);
            }, true);
        },
        where: function (callback) {
            var result = new LinqArray();
            this.each(function (item, i) {
                if (callback.call(item, item, i)) {
                    result.add(item);
                }
            });
            return result;
        },
        first: function (callback) {
            var result;

            if (isFunction(callback)) {
                this.each(function (item, i) {
                    if (callback.call(item, item, i)) {
                        result = item;
                        return false;
                    }
                });
            } else {
                result = this.source[0];
            }
            return result;
        },
        last: function (callback) {
            var result;

            if (isFunction(callback)) {
                this.each(function (item, i) {
                    if (callback.call(item, item, i)) {
                        result = item;
                        return false;
                    }
                }, true);
            } else {
                result = this.source[this.source.length - 1];
            }
            return result;
        },
        select: function (callback) {
            var result = new LinqArray();
            this.each(function (item, i) {
                result.add(callback.call(item, item, i));
            });
            return result;
        },
        selectmany: function (callback) {
            var result = new LinqArray(),
                obj;
            this.each(function (item, i) {
                obj = callback.call(item, item, i);
                result.add[isArray(obj) ? 'apply' : 'call'](result, obj);
            });
            return result;
        },
        group: function (callback) {
            var map = {},
                result = new LinqArray(),
                key;

            this.each(function (item, i) {
                i = callback.call(item, item, i);
                key = JSON.stringify(i);
                map[key] = map[key] || [];
                map[key].push(item);
            });

            for (key in map) {
                var list = new LinqArray(map[key]);
                list.key = JSON.parse(key);
                result.add(list);
            }

            return result;
        },
        unique: function () {
            var map = {},
                result = new LinqArray(),
                key;

            this.each(function (item, i) {
                map[JSON.stringify(this)] = item;
            });
            for (key in map) {
                result.add(map[key]);
            }
            return result;
        },
        max: function (callback) {
            var items = isFunction(callback) ? this.select(callback) : this;

            return Math.max.apply(null, items.selectmany(function (item) {
                return item;
            }).array());
        },
        min: function (callback) {
            var items = isFunction(callback) ? this.select(callback) : this;

            return Math.min.apply(null, items.selectmany(function (item) {
                return item;
            }).array());
        },
        order: function(key){
            this.source.sort(function(a, b){
                return a[key] > b[key] ? 1 : -1;
            })
            return this;
        },
        orderDesc: function(){
            this.source.sort(function(a, b){
                return b[key] > a[key] ? 1 : -1;
            })
            return this;
        },
        reverse: function () {
            var result = new LinqArray([]);

            this.each(function (item) {
                result.add(item);
            }, true);

            return result;
        },
        concat: function (source) {
            var results = new LinqArray(source);

            push.apply(results.source, this.source);
            return results;
        },
        any: function (callback) {
            var result;
            this.each(function (i, item) {
                return !(result = callback.call(item, i, item));
            });
            return !!result;
        },
        count: function () {
            return this.source.length;
        },
        array: function () {
            return this.source;
        }
    }

    window.linq = LinqArray;
})();