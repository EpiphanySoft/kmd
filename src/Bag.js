'use strict';

function Empty () {}
Empty.prototype = Object.create(null);

class Bag {
    constructor () {
        this.map = new Empty();
        this.items = [];
        this.length = 0;

        this._sorter = this._sorter.bind(this);
    }

    add (item, key) {
        let k = key || this.keyify(item);

        if (k in this.map) {
            this.items[this.map[k]] = item;
        }
        else {
            this.map[k] = this.length++;
            this.items.push(item);
        }
    }

    get (key, ...args) {
        let k = this.keyify(key);
        let item;

        if (this.has(k)) {
            item = this.items[this.map[k]];
        }
        else {
            item = this.miss(key, ...args);

            if (item !== null) {
                this.add(item, k);
            }
        }

        return item;
    }

    has (key) {
        let k = this.keyify(key);
        return k in this.map;
    }

    indexOf (key) {
        let k = this.keyify(key);

        return (k in this.map) ? this.map[k] : -1;
    }

    keyify (key) {
        return key;
    }

    miss () {
        return null;
    }

    remove (key) {
        let { items, map } = this;
        let k = this.keyify(key);

        if (k in map) {
            let index = map[k];

            delete map[k];

            let lastIndex = --this.length;

            if (index < lastIndex) {
                let lastItem = items[lastIndex];
                let lastKey = this.keyify(lastItem);

                map[lastKey] = index;
                items[index] = lastItem;
            }

            items.pop();
        }
    }

    sort (fn = null) {
        let items = this.items;

        items.sort(fn || this._sorter);

        for (let i = this.length; i-- > 0; ) {
            this.map[this.keyify(items[i])] = i;
        }
    }

    _sorter (a, b) {
        let ka = this.keyify(a);
        let kb = this.keyify(b);

        return (ka < kb) ? -1 : ((kb < ka) ? 1 : 0);
    }
}

module.exports = Bag;
