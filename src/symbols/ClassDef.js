'use strict';

//const traverse = require('babel-traverse').default;

const CodeSymbol = require('./CodeSymbol');

class ClassDef extends CodeSymbol {
    constructor (sourceFile, info, comments) {
        super(info.node);

        this.sourceFile = sourceFile;

        this.name = info.name;
        this.info = info;
    }
}

Object.assign(ClassDef.prototype, {
    isClassDef: true
});

//--------------------------------------------------------------------------------

// https://github.com/babel/babylon/blob/master/ast/spec.md

class ClassVisitor {

}

module.exports = ClassDef;
