'use strict';

const Bag = require('./Bag');

class SymbolBag extends Bag {
    /**
     * Returns the lookup key for the given object.
     * @param {String/CodeSymbol} key
     * @returns {String}
     */
    keyify (key) {
        if (key.isCodeSymbol) {
            key = key.name;
        }

        return key;
    }
}

module.exports = SymbolBag;
