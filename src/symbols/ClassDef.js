'use strict';

//const traverse = require('babel-traverse').default;

const CodeSymbol = require('./CodeSymbol');

class ClassDef extends CodeSymbol {
    constructor (sourceFile, info) {
        super(info.at, info.node);

        this.sourceFile = sourceFile;

        this.name = info.name;
        this.info = info;
    }
}

Object.assign(ClassDef.prototype, {
    isClassDef: true
});

module.exports = ClassDef;
