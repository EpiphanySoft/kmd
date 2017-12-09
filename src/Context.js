'use strict';

const Phyl = require('phylo');

const PropertyMap = require('./PropertyMap');

class Context {
    static get FILE () {
        return this.$file || (this.$file = this.KEY + '.json');
    }

    static get KEY () {
        return this.$key || (this.$key = this.name.toLowerCase());
    }

    static from (path) {
        let context = null;
        let dir = Phyl.from(path).up(
            d => d.hasFile(Workspace.FILE) || d.hasFile(Package.FILE) || d.hasFile(App.FILE)
        );

        if (dir) {
            if (dir.hasFile(App.FILE)) {
                context = App;
            }
            else if (dir.hasFile(Package.FILE)) {
                context = Package;
            }
            else {
                context = Workspace;
            }

            context = context.load(dir);
        }

        return context;
    }

    static get () {
        return Context.from(Phyl.cwd());
    }

    static load (dir) {
        let file = Phyl.from(dir).upToFile(this.FILE);
        if (!file) {
            return null;
        }

        let data = file.load();

        return new this({
            dir: file.parent,
            file,
            data
        })
    }

    constructor (config) {
        this.dir = this.file = this.data = null;

        Object.assign(this, config);
    }

    getConfigProps (props = null) {
        props = props || new PropertyMap();

        let key = this.constructor.KEY;

        props.flatten(key, this.data);
        props.add(key + '.dir', this.dir.path);

        return props;
    }
}

//--------------------------------------------------------------------------------

class Workspace extends Context {
    static load (dir) {
        let context = super.load(dir);

        if (context) {
            context.workspace = this;
        }

        return context;
    }
}

//--------------------------------------------------------------------------------

class CodeBase extends Context {
    static load (dir) {
        let context = super.load(dir);
        context.workspace = Workspace.load(dir);

        return context;
    }

    getConfigProps () {
        let props = super.getConfigProps();

        this.workspace.getConfigProps(props);

        return props;
    }
}

//--------------------------------------------------------------------------------

class App extends CodeBase {
    //
}

//--------------------------------------------------------------------------------

class Package extends CodeBase {
    //
}

//--------------------------------------------------------------------------------

module.exports = {
    Context,
    Workspace,
    App,
    Package
};
