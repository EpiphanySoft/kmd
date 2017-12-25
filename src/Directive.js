'use strict';

const directiveRe = /^\s*\/\/\s*[@#]\s*([a-z.\-]+)\s*(?:\s(.+))?\s*$/i;
const preprocessorOpenRe = /^\s*\/\/\s*<([a-z.\-]+)\s*(?:\s(.+))?\s*>\s*$/i;
const preprocessorCloseRe = /^\s*\/\/\s*<\/([a-z.\-]+)\s*>\s*$/i;

class Directive {
    static parse (line, loc = null) {
        let m = directiveRe.exec(line);
        let d = null;

        if (m) {
            d = new Directive(m[1], m[2], loc);
        }
        else {
            m = preprocessorOpenRe.exec(line);

            if (m) {
                d = new Directive(m[1], m[2], loc, 'openTag');
            }
            else {
                m = preprocessorCloseRe.exec(line);

                if (m) {
                    d = new Directive(m[1], m[2], loc, 'closeTag');
                }
            }
        }

        return d;
    }

    constructor (tag, value, loc, openClose) {
        this.loc = loc;
        this.tag = tag;
        this.value = value || null;

        if (openClose) {
            this.preprocessor = true;
            this[openClose] = true;
        }
    }
}

Object.assign(Directive.prototype, {
    closeTag: false,
    openTag: false,
    preprocessor: false
});

module.exports = Directive;
