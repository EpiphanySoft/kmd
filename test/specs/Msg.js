'use strict';

/* global describe, beforeEach */
const expect = require('assertly').expect;

const { Msg } = require('../../src/Msg');

describe('Msg', function () {
    describe('basics', function () {
        it('format messages if no src is given', function () {
            let s = Msg.BAD_DEFINE.format(null, 'FooBar');

            expect(s).to.be('C1000: Unrecognized use of Ext.define (FooBar)');
        });
    });
});
