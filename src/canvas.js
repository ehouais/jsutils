// Wraps a DOM node, providing width() and height() cross-browser methods and a way to trigger resize events
define(['observable', 'order!jquery', 'order!jquery.mousewheel'], function(obs, $) {
    return function(dom) {
        var c = $(dom), cs = obs(), pos, w, h, update = function() { w = c.width(); h = c.height(); };
        cs.width = function() { return c.width(); };
        cs.height = function() { return c.height(); };
        cs.resize = function() { update(); cs.trigger('resized'); };
        cs.dom = function() { return dom; };
        var mm = function(e) {
            var x = e.pageX, y = e.pageY;
            cs.trigger('panned', [(x-pos[0])/w, (y-pos[1])/h]);
            pos = [x, y];
        };
        var mu = function() { c.unbind('mousemove', mu).unbind('mousemove', mm); };
        c.mousedown(function(e) { pos = [e.pageX, e.pageY]; c.mousemove(mm).mouseup(mu); e.preventDefault(); });
        c.mousewheel(function(e, wd) { cs.trigger('zoomed', [Math.exp(-wd/10), e.pageX/w-0.5, e.pageY/h-0.5]); });
        update();

        return cs;
    };
});