'use strict';

const { raise, primitive } = require('./util');

function grow (path, name) {
    return path ? path + '.' + name : name;
}

class PropertyMap {
    constructor () {
        this.props = {};
        this.work = { map: {}, stack: [] };
    }

    add (key, value) {
        this.props[key] = value;
    }

    flatten (name, value) {
        if (!value) {
            value = name;
            name = '';
        }

        let props = this.props;

        if (primitive(value)) {
            props[name] = value;
        }
        else if (Array.isArray(value)) {
            if (value.every(primitive)) {
                props[name] = value.join(',');
            }

            let i = 0;
            for (let el of value) {
                this.flatten(grow(name, i), el);
                ++i;
            }
        }
        else {
            for (let key in value) {
                this.flatten(grow(name, key), value[key]);
            }
        }
    }

    get (name) {
        let value = this.props[name];

        if (typeof value === 'string' && value.indexOf('${') > -1) {
            let { map, stack } = this.work;

            stack.push(name);

            try {
                if (map[name]) {
                    raise(`Circular property references: ${stack.join(' -> ')}`);
                }

                map[name] = true;

                for (let pos = 0; (pos = value.indexOf('${', pos)) > -1;) {
                    if (pos > 0 && value[pos - 1] === '$') {
                        value = value.substr(0, pos) + value.substr(pos + 1);
                        //  "foo $${bar}"  ==>  "foo ${bar}"
                        //        ^                   ^
                    }
                    else {
                        let end = value.indexOf('}', pos);
                        let s = value.substring(pos + 2, end);
                        let v = this.get(s);

                        value = value.substr(0, pos) + v + value.substr(end + 1);
                        pos += v.length;
                    }
                }
            }
            finally {
                stack.pop();
                map[name] = false;
            }
        }

        return value;
    }
}

module.exports = PropertyMap;
