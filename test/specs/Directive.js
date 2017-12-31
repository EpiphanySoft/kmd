'use strict';

/* global describe, beforeEach */
const expect = require('assertly').expect;

const Directive = require('../../src/Directive');

describe('Directive', function () {
    describe('simple directives', function () {
        it('should ignore non-directives', function () {
            let d = Directive.parse('// define Ext.Msg');

            expect(d).to.be(null);

            d = Directive.parse('// <define> foo');

            expect(d).to.be(null);
        });

        it('should parse @define', function () {
            let d = Directive.parse('// @define Ext.Msg');

            expect(d.tag).to.be('define');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//@ define Ext.Msg');

            expect(d.tag).to.be('define');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse #define', function () {
            let d = Directive.parse('// #define Ext.Msg');

            expect(d.tag).to.be('define');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//# define Ext.Msg');

            expect(d.tag).to.be('define');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse @require', function () {
            let d = Directive.parse('// @require Ext.Msg');

            expect(d.tag).to.be('require');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//@ require Ext.Msg');

            expect(d.tag).to.be('require');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse #require', function () {
            let d = Directive.parse('// #require Ext.Msg');

            expect(d.tag).to.be('require');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//# require Ext.Msg');

            expect(d.tag).to.be('require');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse @uses', function () {
            let d = Directive.parse('// @uses Ext.Msg');

            expect(d.tag).to.be('uses');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//@ uses Ext.Msg');

            expect(d.tag).to.be('uses');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse #uses', function () {
            let d = Directive.parse('// #uses Ext.Msg');

            expect(d.tag).to.be('uses');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//# uses Ext.Msg');

            expect(d.tag).to.be('uses');
            expect(d.value).to.be('Ext.Msg');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse @tag', function () {
            let d = Directive.parse('// @tag core,platform');

            expect(d.tag).to.be('tag');
            expect(d.value).to.be('core,platform');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//@ tag core,platform');

            expect(d.tag).to.be('tag');
            expect(d.value).to.be('core,platform');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });

        it('should parse #tag', function () {
            let d = Directive.parse('// #tag core,platform');

            expect(d.tag).to.be('tag');
            expect(d.value).to.be('core,platform');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);

            d = Directive.parse('//# tag core,platform');

            expect(d.tag).to.be('tag');
            expect(d.value).to.be('core,platform');
            expect(d.preprocessor).to.be(false);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(false);
        });
    });

    describe('preprocessor directives', function () {
        it('should parse <debug>', function () {
            let d = Directive.parse('//<debug>');

            expect(d.tag).to.be('debug');
            expect(d.value).to.be(null);
            expect(d.preprocessor).to.be(true);
            expect(d.openTag).to.be(true);
            expect(d.closeTag).to.be(false);

            d = Directive.parse(' // <debug>');

            expect(d.tag).to.be('debug');
            expect(d.value).to.be(null);
            expect(d.preprocessor).to.be(true);
            expect(d.openTag).to.be(true);
            expect(d.closeTag).to.be(false);
        });

        it('should parse </debug>', function () {
            let d = Directive.parse('//</debug>');

            expect(d.tag).to.be('debug');
            expect(d.value).to.be(null);
            expect(d.preprocessor).to.be(true);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(true);

            d = Directive.parse(' // </debug>  ');

            expect(d.tag).to.be('debug');
            expect(d.value).to.be(null);
            expect(d.preprocessor).to.be(true);
            expect(d.openTag).to.be(false);
            expect(d.closeTag).to.be(true);
        });
    });
});