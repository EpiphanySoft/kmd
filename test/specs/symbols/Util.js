'use strict';
/* global describe, beforeEach */

const babylon = require('babylon');
const traverse = require('babel-traverse').default;

const expect = require('assertly').expect;

const { Ast } = require('../../../src/symbols/Util');

function parse (code) {
    return babylon.parse(code);
}

function parseClass (code) {
    let ast = parse(code);
    let info;

    traverse(ast, {
        CallExpression (path) {
            info = Ast.grokClass(path.node);
        }
    });

    return [ast, info];
}

describe('symbols/Util', function () {
    describe('convert', function () {
        it('should fail to convert unrecognized Ast node', function () {
            let ast = parse(`
                Ext.define();
            `);

            expect(() => {
                Ast.convert(ast);
            }).to.throw(`Cannot convert node type ${ast.type}`);
        });

        it('should fail to convert unrecognized object property keys', function () {
            expect(() => {
                Ast.convertObject({
                    properties: [{
                        type: 'ObjectProperty',
                        key: {
                            type: 'Unknown'
                        }
                    }]
                });
            }).to.throw(`Cannot convert node type Unknown`);
        });

        it('should skip unrecognized object property types', function () {
            let obj = Ast.convertObject({
                properties: [{
                    type: 'Unknown'
                }]
            });

            expect(obj).to.equal({});
        });

        it('should skip unrecognized properties', function () {
            let ast = parse(`
                let obj = {
                    [foo]: 42,
                    bar: 123,
                    zip () {}
                }
            `);

            let objExpr;

            traverse(ast, {
                ObjectExpression (path) {
                    objExpr = path.node;
                }
            });

            let obj = Ast.convert(objExpr);

            expect(obj.value).to.have.only.keys('bar', 'zip');

            expect(obj.value.bar.value).to.be(123);
            expect(obj.value.bar.method).to.be(false);

            expect(obj.value.zip.method).to.be(true);
        });
    });

    describe('Ext.define', function () {
        it('should report invalid call to Ext.define ', function () {
            let [ ast, cls ] = parseClass(`
                Ext.define();
            `);

            expect(cls.error).to.be('Expected class name as first argument');
        });

        it('should report invalid className arg to Ext.define ', function () {
            let [ ast, cls ] = parseClass(`
                Ext.define(42, {});
            `);

            expect(cls.error).to.be('Expected class name as first argument');
        });

        it('should report invalid function arg to Ext.define ', function () {
            let [ ast, cls ] = parseClass(`
                Ext.define('Foo.Bar', function () {});
            `);

            expect(cls.error).to.be(
                'Expected function as 2nd argument to return an object literal');
        });
    });
});
