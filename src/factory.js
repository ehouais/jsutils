define(['observable', 'core'], function(obs, core) {
    return {
        object: function(model) {
            return function(data) {
                data = data || {};
                var o = obs();
                var addProp = function(pn, p) {
                    if (typeof(p.type) == 'string') {
                        if (typeof data[pn] === "undefined") {
                            data[pn] = p.defval;
                        }
                        if (p.access == 'readonly') {
                            o[pn] = function() {
                                return data[pn];
                            };
                        } else {
                            o[pn] = core.getset(function() {
                                return data[pn];
                            }, function(val) {
                                data[pn] = val;
                                o.trigger('modified');
                                return o;
                            });
                        }
                    } else if (core.isArray(p.type)) {
                        if (!core.isSet(data[pn]) || p.type.indexOf(data[pn]) == -1) {
                            data[pn] = p.defval;
                        }
                        o[pn] = core.getset(function() {
                            return data[pn];
                        }, function(val) {
                            data[pn] = (p.type.indexOf(val) == -1 ? p.defval : val);
                            o.trigger('modified');
                            return o;
                        });
                    } else {
                        data[pn] = p.type(data[pn]);
                        data[pn].bind('modified', function() {
                            o.trigger('modified');
                        });
                        o[pn] = function() { return data[pn]; };
                    }
                };
                for (var pn in model) {
                    if (model.hasOwnProperty(pn)) addProp(pn, model[pn]);
                }
                o.snapshot = function() {
                    var s = {};
                    for (var pn in model) {
                        if (model.hasOwnProperty(pn)) {
                            s[pn] = (typeof(data[pn]) == 'object' ? data[pn].snapshot() : data[pn]);
                        }
                    }
                    return s;
                };
                o.toString = function() {
                    var s = [];
                    for (var pn in model) {
                        if (model.hasOwnProperty(pn)) s.push(pn+': '+data[pn]);
                    }
                    return '{'+s.join(', ')+'}';
                };
                return o;
            };
        },
        map: function(factory) {
            return function(data) {
                data = data || {}; // TODO: use safe map, e.g. dict.js
                var mp = obs();
                var bind = function(e) {
                    return e.bind('modified', function() { mp.trigger('elementModified', [e]).trigger('modified'); });
                };
                mp.has = function(key) {
                    return (key in data);
                };
                mp.get = function(key) {
                    return data[key];
                };
                mp.set = function() {
                    var args = arguments;
                    if (args.length > 1) {
                        var key = args[0], value = args[1];
                        if (factory) {
                            // value is either snapshot data to use for initialization
                            // or an initialization callback called before any event binding is done
                            value = bind(core.isFunction(value) ? value(factory()) : factory(value));
                        }
                        data[key] = value;
                        mp.trigger('elementAdded', [value]).trigger('modified');
                    } else if (core.isObject(args[0])) {
                        data = args[0];
                        mp.trigger('modified');
                    }
                    return mp;
                };
                mp.delete = function(key) {
                    var e = data[key];
                    delete data[key];
                    mp.trigger('elementRemoved', [e]).trigger('modified');
                    return mp;
                };
                mp.snapshot = function() {
                    var s = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            s[key] = (typeof(data[key]) == 'object' ? data[key].snapshot() : data[key]);
                        }
                    }
                    return s;
                };
                mp.toString = function() {
                    var s = [];
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) s.push(key+': '+data[key]);
                    }
                    return '{'+s.join(', ')+'}';
                };
                mp.each = function(cb) {
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) cb(key);
                    }
                };
                if (factory) {
                    for (var key in data) { 
                        if (data.hasOwnProperty(key)) data[key] = bind(factory(data[key]));
                    }
                }
                return mp;
            };
        },
        set: function(factory) {
            return function(data) {
                data = data || [];
                var st = obs();
                var bind = function(e) {
                    return e.bind('modified', function() { st.trigger('elementModified', [e]).trigger('modified'); });
                };
                st.each = function(cb) {
                    data.forEach(cb, st);
                    return this;
                };
                st.add = function(value) {
                    if (factory) {
                        // value is either snapshot data to use for initialization
                        // or an initialization callback called before any event binding is done
                        value = bind(core.isFunction(value) ? value(factory()) : factory(value));
                    }
                    data.push(value);
                    st.trigger('elementAdded', [value]).trigger('modified');
                    return value;
                };
                st.remove = function(e) {
                    var pos = data.indexOf(e);
                    if (pos != -1) {
                        data.splice(pos, 1);
                        st.trigger('elementRemoved', [e]).trigger('modified');
                    }
                    return st;
                };
                st.snapshot = function() {
                    return data.map(function(e) { return (typeof(e) == 'object' ? e.snapshot() : e); });
                };
                st.toString = function() {
                    return '['+(data.map(function(e) { return e.toString(); }) || []).join(', ')+']';
                };
                if (factory) {
                    data = data.map(function(e) { return bind(factory(e)); });
                }
                return st;
            };
        }
    };
});
