'use strict';

const Phyl = require('phylo');

const Bag = require('./Bag');
const SourceFile = require('./SourceFile');

class SourceBag extends Bag {
    constructor (baseDir) {
        super();
        this.baseDir = baseDir;
    }

    keyify (key) {
        if (key.isSourceFile) {
            key = key.file;
        }

        if (!key.$isFile) {
            key = this.baseDir.resolve(key);
        }

        return key.absolutePath();
    }

    miss (key, context) {
        let file = Phyl.from(key);

        if (!context) {
            file = file.relativize(this.baseDir).slashify();
            throw new Error(`No such file in project: "${file.path}"`);
        }

        return new SourceFile(context, file);
    }
}

class Sources {
    constructor (workspace) {
        this.workspace = workspace;

        this.files = new SourceBag(workspace.dir);
    }

    async load (context) {
        await this._loadFiles(context, context.getClassFiles());
        await this._loadFiles(context, context.getOverrideFiles());

        this.files.sort(this._sorter);
    }

    async _loadFiles (context, files) {
        for (let f of files) {
            let sf = this.files.get(f, context);

            await sf.load();
        }
    }

    _sorter (a, b) {
        let ka = a.relativePath.path;
        let kb = b.relativePath.path;
        return (ka < kb) ? -1 : ((kb < ka) ? 1 : 0);
    }
}

Object.assign(Sources.prototype, {
    isSources: true
});

module.exports = Sources;
