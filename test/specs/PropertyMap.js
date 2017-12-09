'use strict';

const expect = require('assertly').expect;

const PropertyMap = require('../../src/PropertyMap');

describe('PropertyMap', function () {
    beforeEach(function () {
        this.map = new PropertyMap();
    });

    it('should flatten object', function () {
        this.map.flatten({
            abc: {
                xyz: {
                    val: 2
                }
            },
            str: 'foo',
            array: [
                { def: 42 }
            ],
            primitiveArray: [
                'tuff',
                'turf',
                427,
                true
            ]
        });

        expect(this.map.props).to.equal({
            'abc.xyz.val': 2,
            str: 'foo',
            'array.0.def': 42,
            primitiveArray: 'tuff,turf,427,true',
            'primitiveArray.0': 'tuff',
            'primitiveArray.1': 'turf',
            'primitiveArray.2': 427,
            'primitiveArray.3': true
        });
    });

    it('should expand properly', function () {
        this.map.add('foo', 'bar');
        this.map.add('zip', '${foo} ${foo}');
        this.map.add('zap', '$${foo} $${foo}');
        this.map.add('woot', '${zip}${zap}$${zip}$${zap}');

        let v;

        v = this.map.get('foo');
        expect(v).to.be('bar');

        v = this.map.get('zip');
        expect(v).to.be('bar bar');

        v = this.map.get('zap');
        expect(v).to.be('${foo} ${foo}');

        v = this.map.get('woot');
        expect(v).to.be('bar bar${foo} ${foo}${zip}${zap}');
    });

    it('should reject circular references', function () {
        this.map.add('foo', '${bar}');
        this.map.add('bar', '${foo}');
        this.map.add('zap', '${zap}');

        let v;

        expect(() => {
            v = this.map.get('foo');
        }).to.throw('Circular property references: foo -> bar -> foo');

        expect(() => {
            v = this.map.get('zap');
        }).to.throw('Circular property references: zap -> zap');
    });
});
