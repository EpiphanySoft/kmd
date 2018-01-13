'use strict';

const FileBag = require('./FileBag');
const SourceFile = require('./SourceFile');

class Sources {
    constructor (workspace, manager) {
        this.workspace = workspace;
        this.manager = manager;

        this.files = new FileBag(workspace.dir);
    }

    async load (context) {
        await this._loadFiles(context, context.getClassFiles());
        await this._loadFiles(context, context.getOverrideFiles());

        this.files.sort(this._sorter);
    }

    async _loadFiles (context, files) {
        for (let f of files) {
            let sf = new SourceFile(context, f, this.manager);

            await sf.load();

            this.files.add(sf);
        }
    }

    _sorter (a, b) {
        let ka = a.path;
        let kb = b.path;
        return (ka < kb) ? -1 : ((kb < ka) ? 1 : 0);
    }
}

Object.assign(Sources.prototype, {
    isSources: true
});

module.exports = Sources;
