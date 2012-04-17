// Wraps a DOM node, providing width() and height() cross-browser methods and a way to trigger resize events
define(['observable', 'jquery', 'jquery_mousewheel'], function(obs, $) {
    return function(dom) {
        var c = $(dom), cs = obs();

        // Dimensions are cached and updated when necessary
        var w, h;
        var update = function() {
            w = c.width();
            h = c.height();
        };
        cs.width = function() {
            return w;
        };
        cs.height = function() {
            return h;
        };

        // Resizing is explicit, not detected, to avoid polling
        cs.resize = function() {
            update();
            cs.trigger('resized');
        };

        // Give access to the underlying dom node
        cs.dom = function() {
            return dom;
        };

        // Detect panning and trigger corresponding event
        var pos;
        var mm = function(e) {
            var x = e.pageX, y = e.pageY;
            cs.trigger('panned', [(x-pos[0])/w, (y-pos[1])/h]);
            pos = [x, y];
        };
        var mu = function() {
            c.unbind('mousemove', mu).unbind('mousemove', mm);
        };
        c.mousedown(function(e) {
            pos = [e.pageX, e.pageY];
            c.mousemove(mm).mouseup(mu);
            e.preventDefault();
        });

        // Detect zooming and trigger corresponding event
        c.mousewheel(function(e, wd) {
            cs.trigger('zoomed', [Math.exp(-wd/10), e.pageX/w-0.5, e.pageY/h-0.5]);
        });

        // Get initial dimensions
        update();

        return cs;
    };
});