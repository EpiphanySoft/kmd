'use strict';

const { Empty } = require('./util');

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
        let ast = this.sourceFile.ast;

        //TODO
        this._classes = new Empty();
    }
}

Object.assign(FileSymbols.prototype, {
    isFileSymbols: true,
    _classes: null
});

module.exports = FileSymbols;
