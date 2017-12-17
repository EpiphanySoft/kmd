'use strict';

const Bag = require('./Bag');

class FileBag extends Bag {
    constructor (baseDir) {
        super();
        this.baseDir = baseDir;
    }

    /**
     * Returns the lookup key for the given object.
     * @param {String/File} key
     * @returns {String}
     */
    keyify (key) {
        if (key.file && key.file.path) {
            key = key.file;
        }

        if (!key.$isFile) {
            key = this.baseDir.resolve(key);
        }

        return key.absolutePath();
    }
}

module.exports = FileBag;
