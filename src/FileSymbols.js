'use strict';

const traverse = require('babel-traverse').default;

const SymbolBag = require('./SymbolBag');
const { Ast } = require('./symbols/Util');
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

        me._gatherComments(ast);

        traverse(ast, {
            enter (path) {
                //
            },

            CallExpression (path) {
                if (Ast.isExtDefine(path.node)) {
                    let classInfo = Ast.grokClass(path.node, me.comments);

                    if (classInfo.error) {
                        console.log('Unrecognized use of Ext.define: ' + classInfo.error);
                    }
                    else {
                        classes.add(new ClassDef(me.sourceFile, classInfo));
                    }
                }
            }
        });
    }

    _gatherComments (ast) {
        this.comments = {
            // lastLine: Comment
        };

        for (let c of ast.comments) {
            this.comments[c.loc.end.line] = {
                block: c.type === 'CommentBlock',
                node: c,
                value: c.value
            };
        }
    }
}

Object.assign(FileSymbols.prototype, {
    isFileSymbols: true,
    _classes: null
});

module.exports = FileSymbols;
