'use strict';

const { Empty } = require('./util');

const LEVEL = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    log: 4
};

const OUT = {
    debug: 'log'
};

class Manager {
    constructor () {
        this.logger = console;
        this.levels = new Empty();
        this.threshold = 'info';
        this.thresholds = new Empty();
    }

    log (msg, src, loc, ...params) {
        let code = msg.code;
        let level = this.levels[code] || msg.level;
        let min = this.thresholds[code] || this.threshold;

        if (LEVEL[level] <= LEVEL[min]) {
            let m = msg.format(src, loc, ...params);
            let out = OUT[level] || level;

            this.logger[out](m);
        }
    }
}

Manager.default = new Manager();
Manager.prototype.isManager = true;

//------------------------------------------------------------------------

class Msg {
    constructor (code, level, text) {
        Msg.all[code] = this;

        this.code = code;
        this.level = level;
        this.text = `${code}: ${text}`;
    }

    format (src, loc, ...params) {
        let s = this.text;

        for (let i = 0; i < params.length; ++i) {
            s = s.split(`\${${i}}`).join(params[i]);
        }

        if (src && src.path) {
            s += ' -- ' + src.path;

            if (loc.node) {
                loc = loc.node;
            }
            if (loc.loc) {
                loc = loc.loc;
            }

            let at = loc && loc.start;
            if (at) {
                s += ':' + at.line;
                if (!isNaN(at.column)) {
                    s += ':' + (at.column + 1);
                }
            }
        }

        return s;
    }
}

Msg.all = new Empty();

Msg.BAD_DEFINE = new Msg('C1000', 'warn', 'Unrecognized use of Ext.define (${0})');

// Object.assign(Msg.prototype, {
//     closeTag: false,
//     openTag: false,
//     preprocessor: false
// });

module.exports = {
    Manager,
    Msg
};
