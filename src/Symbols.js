'use strict';

const SymbolBag = require('./SymbolBag');
const FileBag = require('./FileBag');
const FileSymbols = require('./FileSymbols');

class Symbols {
    constructor (sources) {
        this.sources = sources;
        this.manager = sources.manager;

        this.files = new FileBag(sources.workspace.dir);

        this.generation = 0;
        this.sync();
        this.generation = 0;
    }

    get classes () {
        let classes = this._classes;

        if (!classes) {
            this._parse();
            classes = this._classes;
        }

        return classes;
    }

    sync () {
        let was = this.generation;

        for (let sf of this.sources.files) {
            let syms = this.files.get(sf.file);

            if (!syms || syms.generation !== sf.generation) {
                syms = new FileSymbols(this, sf, this.manager);

                this.files.add(syms);
                ++this.generation;
            }
        }

        let remove = [];

        for (let syms of this.files) {
            if (!this.sources.files.has(syms.file)) {
                remove.push(syms);
            }
        }

        if (remove.length) {
            ++this.generation;

            for (let syms of remove) {
                this.files.remove(syms);
            }
        }

        if (was !== this.generation) {
            this._classes = null;
        }
    }

    _parse () {
        ++this.generation;
        this._classes = new SymbolBag();

        for (let fileSymbols of this.files) {
            for (let c of fileSymbols.classes) {
                this._classes.add(c);
            }
        }

        for (let fileSymbols of this.files) {
            //
        }

        //
    }
}

Object.assign(Symbols.prototype, {
    isSymbols: true,
    _classes: null
});

module.exports = Symbols;
