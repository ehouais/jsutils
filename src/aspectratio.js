// Binds a viewbox to a canvas, preserving the aspect ratio and providing the resulting viewbox
define(['observable'], function(obs) {
    return function(vb, cs) {
        var v = obs(), r, cw, ch, vw, vh, w, h, rx, ry;
        var updateVb = function() { vw = vb.width(); vh = vb.height(); };
        var updateCs = function() { cw = cs.width(); ch = cs.height(); };
        var update = function() { r = Math.min(cw/vw, ch/vh); w = cw/r; h = ch/r; rx = w/vw; ry = h/vh; };
        vb.bind('modified', function() { updateVb(); update(); v.trigger('modified'); });
        cs.bind('modified', function() { updateCs(); update(); v.trigger('modified'); });
        v.boundaries = function() { var c = vb.center(); return [c[0]-w/2, c[1]-h/2, c[0]+w/2, c[1]+h/2]; };
        v.center = function() { return vb.center(); };
        v.width = function() { return w; };
        v.height = function() { return h; };
        v.zoom = function(r, dx, dy) { vb.zoom(r, dx*rx, dy*ry); };
        v.pan = function(dx, dy) { vb.pan(dx*rx, dy*ry); };
        updateVb(); updateCs(); update();
        return v;
    };
});