define(function() {
    return function(params) {
        return {
            has: function(key) {
                return (key in localStorage);
            },
            get: function(key) {
                return localStorage.getItem(key);
            },
            set: function(key, value) {
                localStorage.setItem(key, ''+value);
            },
            delete: function(key) {
                localStorage.removeItem(key);
            },
            object: function(key, factory) {
                var obj = factory(JSON.parse(localStorage.getItem(key)));
                var tid;
                var save = function() {
                    localStorage.setItem(key, JSON.stringify(obj.snapshot()));
                    console.log('Saved ('+(new Date())+')');
                };
                var om = function() {
                    if (tid) {
                        clearTimeout(tid);
                    }
                    tid = setTimeout(save, 5000);
                };
                obj.bind('modified', om);
                return obj;
            }
        };
    };
});