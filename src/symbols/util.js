'use strict';

const Utils = {
    isExtDefine (node) {
        let callee = node.type === 'CallExpression' && node.callee;

        return callee && callee.type === 'MemberExpression' &&
                Utils.isIdent(callee.object, 'Ext') &&
                Utils.isIdent(callee.property, 'define');
    },

    isIdent (node, value) {
        return node && node.type === 'Identifier' && node.name === value;
    }
};

module.exports = Utils;
