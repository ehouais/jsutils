// Wraps a DOM node, providing width() and height() cross-browser methods and a way to trigger resize events
define(['observable', 'jquery'], function(obs, $) {
    return function(dom) {
        var c = $(dom), cs = obs();
        cs.width = function() { return c.width(); };
        cs.height = function() { return c.height(); };
        cs.resize = function() { cs.trigger('resized'); };
        cs.dom = function() { return dom; };
        return cs;
    };
});