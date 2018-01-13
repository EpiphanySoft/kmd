'use strict';

function Empty () {}
Empty.prototype = Object.create(null);

module.exports = {
    Empty,

    capitalize (str) {
        return str && (str[0].toUpperCase() + str.substr(1));
    },

    primitive (v) {
        let t = typeof v;
        return t === 'string' || t === 'number' || t === 'boolean';
    },

    raise (msg) {
        throw new Error(msg);
    }
};
