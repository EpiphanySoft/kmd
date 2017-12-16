'use strict';

class SourceFile {
    constructor (context, file) {
        this.context = context;
        this.file = file;
        this.relativePath = file.relativize(context.workspace.dir).slashify();
    }

    async load () {
        this.code = await this.file.asyncLoad('text');
    }
}

Object.assign(SourceFile.prototype, {
    isSourceFile: true,
    code: null
});

module.exports = SourceFile;
