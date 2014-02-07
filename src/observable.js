define(['core'], function(core) {
    return function(props) {
        // Create a RW property whose modification triggers 'modified' event
        var addrwprop = function(obj, key) {
            if (false/*isArray(props[key])*/) {
                obj[key] = function() {
                    var a = arguments, nb = a.length;
                    if (!nb) {
                        return core.clone(props[key]);
                    } else if (nb == 1) {
                        return props[key][a[0]];
                    } else {
                        props[key][a[0]] = a[1];
                        obj.trigger('modified');
                        return obj;
                    }
                };
            } else if (false/*isObject(props[key])*/) {
                if (props[key].bind) {
                    //obj[key] = props[key];
                }
            } else {
                obj[key] = core.getset(function() {
                    return props[key];
                }, function(val) {
                    props[key] = val; // TODO: check if same type
                    obj.trigger('modified');
                    return obj;
                });
            }
        };

        var obj = {}; // Observable object being created

        // If props are provided, make each of them a RW observable property
        // and add a [de]serialization methods
        if (props) {
            for (var key in props) {
                if (props.hasOwnProperty(key)) addrwprop(obj, key);
            }
            obj.serialize = function() { return JSON.stringify(props); };
        }

        // Classic 'observable' methods
        var os = {}; // Map of event types and attached observers;
        obj.bind = function(types, o) {
            types.split(' ').forEach(function(type) {
                if (!os[type]) { os[type] = []; }
                os[type].push(o);
            });
            return this;
        };
        obj.unbind = function(types, o) {
            if (types) {
                types.split(' ').forEach(function(type) {
                    var ost = os[type];
                    if (ost) {
                        if (o) {
                            var i = ost.indexOf(o);
                            if (i != -1) { ost.splice(i, 1); }
                        } else {
                            os[type] = [];
                        }
                    }
                });
            } else {
                os = {};
            }
            return this;
        };
        obj.trigger = function(type, data) {
            data = data || [];
            data.unshift({type: type, target: this});
            var that = this;
            if (os[type]) {
                os[type].forEach(function(o) { o.apply(that, data); });
            }
            return this;
        };
        if (props) { obj.snapshot = function() { return core.clone(props); }; }

        return obj;
    };
});
