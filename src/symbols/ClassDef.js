'use strict';

//const traverse = require('babel-traverse').default;

const CodeSymbol = require('./CodeSymbol');
const Reference = require('../Reference');

const NONE = Object.freeze([]);

class ClassDef extends CodeSymbol {
    constructor (origin, info) {
        super(info.at, info.node);

        this.origin = origin;
        this.name = info.name;
        this.info = info;

        this._extend = this.getBodyValues('extend', false);

        // this._altNames = this.getBodyValues('altNames');
        this._altNames = this.getBodyValues('alternateClassName');
        this._alias = this.getBodyValues('alias');
        this._mixins = this.getBodyValues('mixins');
        this._requires = this.getBodyValues('requires');
        this._uses = this.getBodyValues('uses');
        this._xtype = this.getBodyValues('xtype');
    }

    register () {
        this._addRef(this._extend, Reference.TYPE.extend);

        this._addRefs(this._mixins, Reference.TYPE.mixins);
        this._addRefs(this._requires, Reference.TYPE.requires);
        this._addRefs(this._uses, Reference.TYPE.uses);

        this.origin.names.add(this.name);

        for (let alt of this._altNames) {
            this.origin.names.add(alt[0]);
        }

        for (let alias of this._alias) {
            this.origin.aliases.add(alias[0]);
        }

        for (let xtype of this._xtype) {
            this.origin.aliases.add('widget.' + xtype[0]);
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
        return [ val.value, this.origin._at(val.$value) ];
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
            this.origin._addRef(val[1], type, val[0]);
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

    _altNames: null,
    _alias: null,
    _xtype: null,

    _extend: null,
    _mixins: null,
    _requires: null,
    _uses: null
});

module.exports = ClassDef;
