'use strict';

const Phyl = require('phylo');

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
    constructor (baseDir) {
        this.baseDir = baseDir;
        this.logger = console;
        this.levels = new Empty();
        this.pathMode = 'abs';
        this.threshold = 'info';
        this.thresholds = new Empty();
    }

    log (msg, at, ...params) {
        let code = msg.code;
        let level = this.levels[code] || msg.level;
        let min = this.thresholds[code] || this.threshold;

        if (LEVEL[level] <= LEVEL[min]) {
            let src = this.formatSrc(at);
            let m = msg.format(src, ...params);
            let out = OUT[level] || level;

            this.logger[out](m);
        }
    }

    formatSrc (at) {
        let f = at.file;

        if (this.pathMode === 'rel') {
            f = f.relativize(this.baseDir).slashify();
        }

        return `${f.path}:${at.start.line}:${at.start.column + 1}`;
    }
}

Manager.prototype.isManager = true;

//------------------------------------------------------------------------

class Msg {
    constructor (code, level, text) {
        Msg.all[code] = this;

        this.code = code;
        this.level = level;
        this.text = `${code}: ${text}`;
    }

    format (src, ...params) {
        let s = this.text;

        for (let i = 0; i < params.length; ++i) {
            s = s.split(`\${${i}}`).join(params[i]);
        }

        if (src) {
            s += ' -- ' + src;
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
