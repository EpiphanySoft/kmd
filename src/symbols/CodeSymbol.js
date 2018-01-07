'use strict';

class CodeSymbol {
    constructor (at, node) {
        this.at = at;
        this.node = node;
    }
}

Object.assign(CodeSymbol.prototype, {
    isCodeSymbol: true
});

module.exports = CodeSymbol;
