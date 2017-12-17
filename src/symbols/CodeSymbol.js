'use strict';

class CodeSymbol {
    constructor (node) {
        this.node = node;
    }
}

Object.assign(CodeSymbol.prototype, {
    isCodeSymbol: true
});

module.exports = CodeSymbol;
