define(function() {
    var isArray = function(obj) {
        return(obj.constructor.toString().indexOf("Array") != -1);
    };
    var isObject = function(obj) {
        return (obj.constructor == Object);
    };
    var isFunction = function(obj) {
        var getType = {};
        return obj && getType.toString.call(obj) == '[object Function]';
    };
    var extend = function(obj, extObj) {
        if (arguments.length > 2) {
            for (var a = 1; a < arguments.length; a++) { extend(obj, arguments[a]); }
        } else {
            for (var i in extObj) { obj[i] = extObj[i]; }
        }
        return obj;
    };
    var clone = function(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" != typeof obj) return obj;
        var copy;
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
        } else if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; ++i) {
                copy[i] = clone(obj[i]);
            }
        } else if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
        } else {
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
        return copy;
    };
    return {
        isArray: isArray,
        isObject: isObject,
        isFunction: isFunction,
        extend: extend,
        clone: clone
    };
});
