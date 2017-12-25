'use strict';

const { Empty } = require('./util');

class Msg {
    static define (code, level, text) {
        return Msg.all[code] = new Msg(code, level, text);
    }

    constructor (code, level, text) {
        this.code = code;
        this.level = level;
        this.text = text;
    }

    format (loc, ...params) {
        let s = this.text;

        for (let i = 0; i < params.length; ++i) {
            s = s.split(`\${${i}}`).join(params[i]);
        }

        return s;
    }
}

Msg.all = new Empty();

Msg.BAD_DEFINE = Msg.define(1000, 'warn', 'Unrecognized use of Ext.define (${0})');

// Object.assign(Msg.prototype, {
//     closeTag: false,
//     openTag: false,
//     preprocessor: false
// });

module.exports = Msg;
