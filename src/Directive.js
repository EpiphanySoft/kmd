'use strict';

const json5 = require('json5');

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
        else if (value) {
            if (value.startsWith('{') && value.endsWith('}')) {
                try {
                    this.value = json5.parse(value);
                }
                catch (e) {
                    // ignore and leave this.value as a string
                }
            }
        }
        else {
            // convert things like #noOptimize.callParent into
            // tag=noOptimize, value=callParent
            let parts = tag.split('.');

            if (parts.length > 1) {
                this.value = parts.pop();
                this.tag = parts.join('.');
            }
        }
    }
}

Object.assign(Directive.prototype, {
    closeTag: false,
    openTag: false,
    preprocessor: false
});

module.exports = Directive;
