'use strict';

const traverse = require('babel-traverse').default;

const Bag = require('./Bag');
const { Msg } = require('./Msg');
const Directive = require('./Directive');
const Reference = require('./Reference');
const SymbolBag = require('./SymbolBag');
const { Ast } = require('./symbols/Util');
const ClassDef = require('./symbols/ClassDef');
const { capitalize } = require('./util');

class FileSymbols {
    constructor (owner, sourceFile, manager) {
        this.file = sourceFile.file;
        this.generation = sourceFile.generation;
        this.manager = manager;
        this.references = [];
        this.sourceFile = sourceFile;

        this.aliases = new Bag();
        this.names = new Bag();
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

    get path () {
        return this.sourceFile.path;
    }

    _addRef (at, type, target) {
        this.references.push(new Reference(at, type, target));
    }

    _parse () {
        let me = this;
        let ast = me.sourceFile.ast;
        let classes = me._classes = new SymbolBag();

        me._gatherComments(ast);

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

        traverse(ast, {
            CallExpression (path) {
                if (Ast.isExtDefine(path.node)) {
                    let classInfo = Ast.grokClass(path.node, me.comments);

                    if (classInfo.error) {
                        me.manager.log(Msg.BAD_DEFINE, me._at(path), classInfo.error);
                    }
                    else {
                        classInfo.at = me._at(classInfo.node);
                        classes.add(new ClassDef(me, classInfo));
                    }
                }
            }
        });

        for (let c of classes) {
            c.register();
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
                this._classes.add(new ClassDef(this, {
                    at: this._at(comment),
                    body: null,
                    name: className,
                    node: comment
                }));
            }
        }
    }

    _handleRequireDirective (directive, comment) {
        let target = directive.value;
        let type = Reference.TYPE.atRequire;

        if (target.endsWith('.js')) {
            type = Reference.TYPE.atRequireFile;
        }
        else if (target[0] === '@') {
            type = Reference.TYPE.atRequireTag;
            target = target.substr(1);
        }

        this._addRef(this._at(comment), type, target);
    }

    _handleTagDirective (directive) {
        let tags = directive.value.split(',');

        for (let t of tags) {
            this.tags.add(t.trim());
        }
    }

    _handleUsesDirective (directive, comment) {
        let target = directive.value;
        let type = Reference.TYPE.atUses;

        if (target.endsWith('.js')) {
            type = Reference.TYPE.atUsesFile;
        }
        else if (target[0] === '@') {
            type = Reference.TYPE.atUsesTag;
            target = target.substr(1);
        }

        this._addRef(this._at(comment), type, target);
    }

    _at (loc) {
        let at = loc.node || loc;

        return Object.assign({ file: this.file }, at.loc || at);
    }
}

Object.assign(FileSymbols.prototype, {
    isFileSymbols: true,
    _classes: null
});

module.exports = FileSymbols;
