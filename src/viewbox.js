// Returns an object that manages a viewbox's boundaries and provides zoom and pan methods
define(['observable'], function(obs) {
    return function(x, y, w, h) {
        var v = obs();
        v.boundaries = function() { return [x-w/2, y-h/2, x+w/2, y+h/2]; };
        v.center = function() { return [x, y]; };
        v.width = function() { return w; };
        v.height = function() { return h; };
        v.zoom = function(r, dx, dy) { x += dx*(w-w*r); y -= dy*(h-h*r); w *= r; h *= r; v.trigger('modified'); };
        v.pan = function(dx, dy) { x += dx*w; y += dy*h; v.trigger('modified'); };
        return v;
    };
});