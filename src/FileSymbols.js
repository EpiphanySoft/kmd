'use strict';

const traverse = require('babel-traverse').default;

const Bag = require('./Bag');
const Msg = require('./Msg');
const Directive = require('./Directive');
const SymbolBag = require('./SymbolBag');
const { Ast } = require('./symbols/Util');
const ClassDef = require('./symbols/ClassDef');
const { capitalize } = require('./util');

class FileSymbols {
    constructor (owner, sourceFile, manager) {
        this.file = sourceFile.file;
        this.generation = sourceFile.generation;
        this.manager = manager;
        this.sourceFile = sourceFile;
        this.tags = new Bag();
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
                        me.manager.log(Msg.BAD_DEFINE, path.node, classInfo.error);
                    }
                    else {
                        classes.add(new ClassDef(me.sourceFile, classInfo));
                    }
                }
            }
        });

        for (let c of ast.comments) {
            if (c.type === 'CommentLine') {
                let d = Directive.parse('//' + c.value, c.loc);

                if (d && !d.preprocessor) {
                    let m = `_handle${capitalize(d.tag)}Directive`;
                    if (this[m]) {
                        this[m](d, c);
                    }
                }
            }
        }
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

    _handleDefineDirective (directive, comment) {
        for (let name of directive.value.split(',')) {
            let className = name.trim();

            if (!this._classes.has(className)) {
                this._classes.add(new ClassDef(this.sourceFile, {
                    body: null,
                    name: className,
                    node: comment
                }));
            }
        }
    }

    _handleTagDirective (directive) {
        let tags = directive.value.split(',');

        for (let t of tags) {
            this.tags.add(t);
        }
    }
}

Object.assign(FileSymbols.prototype, {
    isFileSymbols: true,
    _classes: null
});

module.exports = FileSymbols;
