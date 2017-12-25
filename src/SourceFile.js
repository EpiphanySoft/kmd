'use strict';

const babylon = require('babylon');

class SourceFile {
    constructor (context, file, manager) {
        this.context = context;
        this.file = file;
        this.generation = 0;
        this.manager = manager;
        this.relativePath = file.relativize(context.workspace.dir).slashify();
    }

    get ast () {
        let ast = this._ast;

        if (!ast) {
            this._ast = ast = babylon.parse(this.code);
        }

        return ast;
    }

    // invalidate () {
    //     this.code = this._ast = null;
    //     ++this.generation;
    // }

    async load () {
        this.code = await this.file.asyncLoad('text');
        this._ast = null;
        ++this.generation;
    }
}

Object.assign(SourceFile.prototype, {
    isSourceFile: true,
    _ast: null,
    code: null
});

module.exports = SourceFile;
