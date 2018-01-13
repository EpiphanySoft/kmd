'use strict';

//const traverse = require('babel-traverse').default;

const CodeSymbol = require('./CodeSymbol');
const Reference = require('../Reference');

const NONE = Object.freeze([]);

class ClassDef extends CodeSymbol {
    constructor (sourceSymbols, info) {
        super(info.at, info.node);

        this.sourceSymbols = sourceSymbols;

        this.name = info.name;
        this.info = info;

        this.extend = this.getBodyValues('extend', false);

        this.altNames = this.getBodyValues('altNames');
        this.alias = this.getBodyValues('alias');
        this.mixins = this.getBodyValues('mixins');
        this.requires = this.getBodyValues('requires');
        this.uses = this.getBodyValues('uses');
        this.xtypes = this.getBodyValues('xtypes');
    }

    register () {
        this._addRef(this.extend, Reference.TYPE.extend);

        this._addRefs(this.mixins, Reference.TYPE.mixins);
        this._addRefs(this.requires, Reference.TYPE.requires);
        this._addRefs(this.uses, Reference.TYPE.uses);

        this.sourceSymbols.names.add(this.name);

        for (let alt of this.altNames) {
            this.sourceSymbols.names.add(alt[0]);
        }

        for (let alias of this.alias) {
            this.sourceSymbols.aliases.add(alias[0]);
        }

        for (let xtype of this.xtypes) {
            this.sourceSymbols.aliases.add('widget.' + xtype[0]);
        }
    }

    getBodyValues (name, array = true) {
        let body = this.info.body;
        let prop = body && body.value[name];

        if (prop) {
            return this[array ? 'getValues' : 'getValue'](prop);
        }

        return array ? NONE : null;
    }

    getValue (val) {
        return [ val.value, this.sourceSymbols._at(val.$value) ];
    }

    getValues (vals) {
        if (Array.isArray(vals.value)) {
            return vals.value.map(v => this.getValue(v));
        }

        if (typeof vals.value === 'object') {
            return Object.values(vals.value).map(v => this.getValue(v));
        }

        return [ this.getValue(vals) ];
    }

    _addRef (val, type) {
        if (val) {
            this.sourceSymbols._addRef(val[1], type, val[0]);
        }
    }

    _addRefs (vals, type) {
        for (let val of vals) {
            this._addRef(val, type);
        }
    }
}

Object.assign(ClassDef.prototype, {
    isClassDef: true,

    altNames: null,
    aliases: null,
    xtypes: null,

    extend: null,
    mixins: null,
    requires: null,
    uses: null
});

module.exports = ClassDef;
