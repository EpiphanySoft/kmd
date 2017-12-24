'use strict';

const Ast = {
    convert (node) {
        let value;
        let method = false;

        if (node.type === 'ObjectExpression') {
            value = Ast.convertObject(node);
        }
        else if (node.type === 'ArrayExpression') {
            value = Ast.convertArray(node);
        }
        else if (node.type === 'FunctionExpression') {
            method = true;
        }
        else if (Ast.isLiteral(node)) {
            value = node.value;
        }
        else if (Ast.isNull(node)) {
            value = null;
        }
        else {
            debugger
        }

        return {
            $value: node,
            method: method,
            value: value
        };
    },

    convertArray (node) {
        let array = [];

        for (let el of node.elements) {
            array.push(Ast.convert(el));
        }

        return array;
    },

    convertObject (node) {
        let obj = {};

        for (let prop of node.properties) {
            let isProp = prop.type === 'ObjectProperty';
            let isMethod = prop.type === 'ObjectMethod';

            if (isProp || isMethod) {
                let kn = prop.key;
                let key;

                if (kn.type === 'Identifier') {
                    key = kn.name;
                }
                else if (kn.type === 'StringLiteral') {
                    key = kn.value;
                }
                else {
                    debugger
                }

                if (key) {
                    let rhs = {
                        $prop: prop,
                        $key: kn,
                        method: true
                    };

                    if (isProp) {
                        Object.assign(rhs, Ast.convert(rhs.$vn = prop.value));
                    }

                    obj[key] = rhs;
                }
            }
            else {
                debugger
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
            return r.argument;
        }

        return null;
    },

    grokClass (node) {
        let args = node.arguments;

        if (args[0].type !== 'StringLiteral') {
            return {
                src: args[0],
                error: 'Expected class name as first argument'
            };
        }

        let body = args[1];

        switch (body.type) {
            case 'FunctionExpression':
                body = Ast.getFunctionReturn(body);
                if (!body || body.type !== 'ObjectExpression') {
                    return {
                        src: body || args[1],
                        error: 'Expected function as 2nd argument to return an object literal'
                    };
                }
                break;

            case 'ObjectExpression':
                break;

            default:
                return {
                    src: body,
                    error: 'Expected 2nd argument to be an object or function returning an object'
                };
        }

        return {
            node: node,
            name: args[0].value,
            body: Ast.convertObject(body)
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

        return t === 'StringLiteral' || t === 'BooleanLiteral' || t === 'NumericLiteral';
    },

    isNull (node) {
        return node.type === 'NullLiteral';
    }
};

const Utils = {
    Ast
};

module.exports = Utils;
