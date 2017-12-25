'use strict';

function Empty () {}
Empty.prototype = Object.create(null);

module.exports = {
    Empty,

    capitalize (str) {
        return str && (str[0].toUpperCase() + str.substr(1));
    }
};
