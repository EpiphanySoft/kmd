'use strict';

const traverse = require('babel-traverse').default;

const SymbolBag = require('./SymbolBag');
const { isExtDefine } = require('./symbols/util');
const ClassDef = require('./symbols/ClassDef');

class FileSymbols {
    constructor (sourceFile) {
        this.file = sourceFile.file;
        this.generation = sourceFile.generation;
        this.sourceFile = sourceFile;
    }

    get classes () {
        let classes = this._classes;

        if (!classes) {
            this._parse();
            classes = this._classes;
        }

        return classes;
    }

    _parse () {
        let me = this;
        let ast = me.sourceFile.ast;
        let classes = me._classes = new SymbolBag();

        traverse(ast, {
            enter (path) {
                //
            },

            CallExpression (path) {
                if (isExtDefine(path.node)) {
                    classes.add(new ClassDef(me.sourceFile, path.node));
                }
            }
        });
    }
}

Object.assign(FileSymbols.prototype, {
    isFileSymbols: true,
    _classes: null
});

module.exports = FileSymbols;
