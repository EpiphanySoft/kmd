'use strict';

const traverse = require('babel-traverse').default;

const CodeSymbol = require('./CodeSymbol');

class ClassDef extends CodeSymbol {
    constructor (sourceFile, node) {
        super(node);

        this.sourceFile = sourceFile;

        this.name = node.arguments[0].value; //TODO is StringLiteral?
    }
}

Object.assign(ClassDef.prototype, {
    isClassDef: true
});

module.exports = ClassDef;
