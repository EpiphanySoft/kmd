'use strict';

const CLASS = Object.freeze({
    kind: 'class',
    class: true,
    file: false,
    tag: false
});

const FILE = Object.freeze({
    kind: 'file',
    class: false,
    file: true,
    tag: false
});

const TAG = Object.freeze({
    kind: 'tag',
    class: false,
    file: false,
    tag: true
});

//-------------------

class Type {
    constructor (name, kind = CLASS, weak = false) {
        this.name = name;
        this.kind = kind;
        this.weak = weak;

        Object.freeze(this);
    }
}

Type.CLASS = CLASS;
Type.FILE = FILE;
Type.TAG = TAG;

//-------------------

class Reference {
    constructor (at, type, target) {
        this.at = at;
        this.type = type;
        this.target = target;
    }
}

Reference.TYPE = {
    // From Ext.define or Ext.application:
    extend:   new Type('extend'),
    mixins:   new Type('mixins'),
    requires: new Type('requires'),
    uses:     new Type('uses', CLASS, true),

    //----

    ExtRequire:     new Type('Ext.require'),

    // @require
    atRequire:      new Type('require'),
    atRequireFile:  new Type('require', FILE),
    atRequireTag:   new Type('require', TAG),

    // @uses
    atUses:         new Type('@uses', true),
    atUsesFile:     new Type('@uses', FILE, true),
    atUsesTag:      new Type('@uses', TAG, true)
};

module.exports = Reference;
