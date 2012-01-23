// Catch the mouse events in the provided DOM node and trigger corresponding zoom and pan events
define(['observable', 'order!jquery', 'order!jquery.mousewheel'], function(obs, $) {
    return function(canvas) {
        var c = $(canvas.dom()), zp = obs(), pos, w, h;
        var updateDims = function() { w = canvas.width(); h = canvas.height(); };
        canvas.bind('resized', updateDims);
        var mm = function(e) {
            var x = e.pageX, y = e.pageY;
            zp.trigger('panned', [(x-pos[0])/w, (y-pos[1])/h]);
            pos = [x, y];
        };
        var mu = function() { c.unbind('mousemove', mu).unbind('mousemove', mm); };
        c.mousedown(function(e) { pos = [e.pageX, e.pageY]; c.mousemove(mm).mouseup(mu); e.preventDefault(); });
        c.mousewheel(function(e, wd) { zp.trigger('zoomed', [Math.exp(-wd/10), e.pageX/w-0.5, e.pageY/h-0.5]); });
        updateDims();
        return zp;
    };
});