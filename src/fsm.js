define(['core', 'observable'], function(core, observable) {
    return function(states, initial) {
        var current = initial;
        var st = observable();
        st.transition = function(action) {
            if (states[current].transitions[action]) {
                current = states[current].transitions[action];
                this.trigger('changed', [current, this.current()]);
            } else {
                console.error('unautorized transition: '+current+'.'+action+'()');
            }
        };
        st.current = function() {
            return core.clone(states[current].state);
        };
        return st;
    };
});
