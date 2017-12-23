'use strict';

const Ast = {
    convertObject (node) {
        let obj = {};

        for (let prop of node.properties) {
            let isProp = prop.type === 'ObjectProperty';
            let isMethod = prop.type === 'ObjectMethod';

            if (isProp || isMethod) {
                let kn = prop.key;
                let key, value;

                if (kn.type === 'Identifier') {
                    key = kn.name;
                }
                else {
                    debugger
                }

                if (key) {
                    if (isProp) {
                        let vn = prop.value;

                        if (Ast.isLiteral(vn)) {
                            value = vn.value;

                            obj[key] = {
                                $p: prop,
                                $k: kn,
                                $v: vn,
                                method: false,
                                value: value
                            };
                        }
                    }
                    else {
                        obj[key] = {
                            $p: prop,
                            $k: kn,
                            $v: null,
                            method: true,
                            value: null
                        };
                    }
                }
            }
        }

        return obj;
    },

    getFunctionReturn (node) {
        // node=FunctionExpression.body=BlockStatement.body=Array
        let body = node.body.body;
        let n = body.length;
        let r = body[n - 1];

        if (!node.async && !node.generator && r.type === 'ReturnStatement' && r.argument) {
            return {
                value: r.argument
            };
        }

        return null;
    },

    grokClass (node) {
        let args = node.arguments;

        if (args[0].type !== 'StringLiteral') {
            return {
                error: 'Expected class name as first argument'
            };
        }

        let body = args[1];

        switch (body.type) {
            case 'FunctionExpression':
                body = Ast.getFunctionReturn(body);
                if (!body || body.type !== 'ObjectExpression') {
                    return {
                        error: ''
                    }
                }
                break;

            case 'ObjectExpression':
                break;

            default:
                return {
                    error: ''
                }
        }

        let props = {};

        for (let prop of body.properties) {
            let k = prop.key, v = prop.value;
        }

        return {
            node: node,
            name: args[0].value
        };
    },

    isExtDefine (node) {
        let callee = node.type === 'CallExpression' && node.callee;

        return callee && callee.type === 'MemberExpression' &&
            Ast.isIdent(callee.object, 'Ext') &&
            Ast.isIdent(callee.property, 'define');
    },

    isIdent (node, value) {
        return node && node.type === 'Identifier' && node.name === value;
    },

    isLiteral (node) {
        let t = node.type;

        return t === 'StringLiteral';
    }
};

const Utils = {
    Ast
};

module.exports = Utils;
