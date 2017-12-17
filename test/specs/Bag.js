'use strict';

/* global describe, beforeEach */
const expect = require('assertly').expect;

const Bag = require('../../src/Bag');

describe('Bag', function () {
    describe('basics', function () {
        it('should add items', function () {
            let bag = new Bag();

            expect(bag.length).to.be(0);

            expect(bag.get('hello')).to.be(null);
            expect(bag.get('world')).to.be(null);
            expect(bag.get('abc')).to.be(null);

            expect(bag.has('hello')).to.be(false);
            expect(bag.has('world')).to.be(false);
            expect(bag.has('abc')).to.be(false);

            expect(bag.indexOf('hello')).to.be(-1);
            expect(bag.indexOf('world')).to.be(-1);
            expect(bag.indexOf('abc')).to.be(-1);

            bag.add('hello');

            expect(bag.length).to.be(1);
            expect(bag.get('hello')).to.be('hello');
            expect(bag.has('hello')).to.be(true);
            expect(bag.indexOf('hello')).to.be(0);

            bag.add('world');

            expect(bag.length).to.be(2);
            expect(bag.get('world')).to.be('world');
            expect(bag.has('world')).to.be(true);
            expect(bag.indexOf('world')).to.be(1);

            bag.add('abc');

            expect(bag.length).to.be(3);
            expect(bag.get('abc')).to.be('abc');
            expect(bag.has('abc')).to.be(true);
            expect(bag.indexOf('abc')).to.be(2);

            bag.add('world');  // already there ... no effect

            expect(bag.length).to.be(3);

            expect(bag.get('hello')).to.be('hello');
            expect(bag.get('world')).to.be('world');
            expect(bag.get('abc')).to.be('abc');

            expect(bag.has('hello')).to.be(true);
            expect(bag.has('world')).to.be(true);
            expect(bag.has('abc')).to.be(true);

            expect(bag.indexOf('hello')).to.be(0);
            expect(bag.indexOf('world')).to.be(1);
            expect(bag.indexOf('abc')).to.be(2);
        });

        it('should remove items', function () {
            let bag = new Bag();

            bag.remove('hello');

            expect(bag.length).to.be(0);

            bag.add('hello');
            bag.add('world');
            bag.add('abc');

            expect(bag.length).to.be(3);

            expect(bag.get('hello')).to.be('hello');
            expect(bag.get('world')).to.be('world');
            expect(bag.get('abc')).to.be('abc');

            expect(bag.has('hello')).to.be(true);
            expect(bag.has('world')).to.be(true);
            expect(bag.has('abc')).to.be(true);

            expect(bag.indexOf('hello')).to.be(0);
            expect(bag.indexOf('world')).to.be(1);
            expect(bag.indexOf('abc')).to.be(2);

            bag.remove('hello');

            expect(bag.length).to.be(2);
            expect(bag.get('hello')).to.be(null);
            expect(bag.has('hello')).to.be(false);
            expect(bag.indexOf('hello')).to.be(-1);

            // the hole created by removing at index 0 should be filled by the
            // last item:
            expect(bag.get('abc')).to.be('abc');
            expect(bag.has('abc')).to.be(true);
            expect(bag.indexOf('abc')).to.be(0);

            // The item at index 1 should remain:
            expect(bag.get('world')).to.be('world');
            expect(bag.has('world')).to.be(true);
            expect(bag.indexOf('world')).to.be(1);

            bag.remove('world');

            expect(bag.length).to.be(1);
            expect(bag.get('world')).to.be(null);
            expect(bag.has('world')).to.be(false);
            expect(bag.indexOf('world')).to.be(-1);

            // That was the item at the end, so no effect on the survivor:
            expect(bag.get('abc')).to.be('abc');
            expect(bag.has('abc')).to.be(true);
            expect(bag.indexOf('abc')).to.be(0);

            bag.remove('abc');

            expect(bag.length).to.be(0);
            expect(bag.get('abc')).to.be(null);
            expect(bag.has('abc')).to.be(false);
            expect(bag.indexOf('abc')).to.be(-1);
        });

        it('should sort items', function () {
            let bag = new Bag();

            expect(bag._sorter('b', 'a')).to.be(1);
            expect(bag._sorter('b', 'b')).to.be(0);
            expect(bag._sorter('b', 'c')).to.be(-1);

            bag.add('hello');
            bag.add('world');
            bag.add('abc');

            expect(bag.length).to.be(3);

            bag.sort();

            expect(bag.get('hello')).to.be('hello');
            expect(bag.get('world')).to.be('world');
            expect(bag.get('abc')).to.be('abc');

            expect(bag.has('hello')).to.be(true);
            expect(bag.has('world')).to.be(true);
            expect(bag.has('abc')).to.be(true);

            expect(bag.indexOf('hello')).to.be(1);
            expect(bag.indexOf('world')).to.be(2);
            expect(bag.indexOf('abc')).to.be(0);

            bag.sort((a, b) => (a < b) ? 1 : ((b < a) ? -1 : 0));

            expect(bag.get('hello')).to.be('hello');
            expect(bag.get('world')).to.be('world');
            expect(bag.get('abc')).to.be('abc');

            expect(bag.has('hello')).to.be(true);
            expect(bag.has('world')).to.be(true);
            expect(bag.has('abc')).to.be(true);

            expect(bag.indexOf('hello')).to.be(1);
            expect(bag.indexOf('world')).to.be(0);
            expect(bag.indexOf('abc')).to.be(2);

            let items = [];
            for (let s of bag) {
                items.push(s);
            }

            expect(items).to.equal([ 'world', 'hello', 'abc' ]);
        });
    });

    describe('custom bag', function () {
        class Cache extends Bag {
            keyify (key) {
                return key.extra ? key.key : key;
            }

            miss (key, extra) {
                return extra ? { key, extra } : null;
            }
        }

        it('should be able to lazily add items', function () {
            let cache = new Cache();

            let item = cache.get('abc');

            expect(cache.length).to.be(0);
            expect(item).to.be(null);

            item = cache.get('abc', 123);

            expect(cache.length).to.be(1);
            expect(item).to.equal({ key: 'abc', extra: 123 });
        });
    });
});
