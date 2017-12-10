'use strict';

const Phyl = require('phylo');

const PropertyMap = require('./PropertyMap');

class Context {
    /**
     * @property {"app.json"/"package.json"/"workspace.json"} FILE
     */
    static get FILE () {
        return this.$file || (this.$file = this.KEY + '.json');
    }

    static get KEY () {
        return this.$key || (this.$key = this.name.toLowerCase());
    }

    static at (dir) {
        let d = Phyl.from(dir);

        if (this === Context) {
            return App.at(d) || Package.at(d) || Workspace.at(d);
        }

        return d.hasFile(this.FILE);
    }

    static from (path) {
        let root = Phyl.from(path).up(d => this.at(d));

        return this.load(root);
    }

    static get () {
        return Context.from(Phyl.cwd());
    }

    static load (dir, creator = null) {
        if (dir == null) {
            return null;
        }

        let d = Phyl.from(dir);

        if (this === Context) {
            return App.load(d) || Package.load(d) || Workspace.load(d);
        }

        if (!this.at(d)) {
            return null;
        }

        let file = d.join(this.FILE);
        let data = file.load();
        let config = {
            dir: file.parent,
            file,
            data
        };

        if (creator) {
            config.creator = creator;
        }

        return new this(config);
    }

    constructor (config) {
        this.data = null;

        Object.assign(this, config);

        this.dir = this.dir.absolutify();
        this.file = this.file.absolutify();
    }

    getConfigProps (refresh = false) {
        if (refresh) {
            this.configProps = null;
        }

        return this.configProps || (this.configProps = this._gatherProps());
    }

    _gatherProps (props = null) {
        props = props || new PropertyMap();

        let key = this.constructor.KEY;

        props.flatten(key, this.data);
        props.add(key + '.dir', this.dir.path);

        return props;
    }
}

Object.assign(Context.prototype, {
    isContext: true,
    configProps: null
});

//--------------------------------------------------------------------------------

class Workspace extends Context {
    static load (dir) {
        let context = super.load(dir);

        if (context) {
            context.workspace = this;
        }

        return context;
    }

    get apps () {
        let apps = [];

        if (this.data.apps) {
            let app, dir;

            for (let path of this.data.apps) {
                dir = this.dir.join(path).absolutify();
                app = this._item;

                if (app && app.path === dir.path) {
                    this._item = null;
                }
                else {
                    app = App.load(dir, this);
                }

                if (app) {
                    apps.push(app);
                }
            }
        }

        Object.defineProperty(this, 'apps', {
            value: apps
        });

        return apps;
    }

    get packages () {
        let dirs = [];

        let dir = this.getConfigProps('workspace.packages.dir');
        if (dir) {
            for (let d of dir.split(',')) {
                dir = Phyl.from(d);
                if (dir.exists()) {
                    dirs.push(dir);
                }
            }
        }

        dir = Phyl.from(this.getConfigProps('workspace.packages.extract'));
        if (dir && dir.exists()) {
            dirs.push(dir);
        }

        let pkgs = [];

        for (dir of dirs) {
            // The package path can point directly at a package...
            let pkg = Package.load(dir, this);
            if (pkg) {
                pkgs.push(pkg);
            }
            else {
                // ...but typically points at a folder of packages
                dir.list('d', d => {
                    pkg = Package.load(d, this);
                    if (pkg) {
                        pkgs.push(pkg);
                    }
                });
            }
        }

        Object.defineProperty(this, 'packages', {
            value: pkgs
        });
    }

    _setup (item) {
        this._item = item;
    }
}

Object.assign(Workspace.prototype, {
    isWorkspace: true,
    _item: null
});

//--------------------------------------------------------------------------------

class CodeBase extends Context {
    static load (dir) {
        let context = super.load(dir);

        if (context) {
            context.workspace = Workspace.from(dir);

            if (context.workspace) {
                context.workspace._setup(context);
            }
        }

        return context;
    }

    _gatherProps () {
        let props = super._gatherProps();

        this.workspace._gatherProps(props);

        return props;
    }
}

Object.assign(CodeBase.prototype, {
    isCodeBase: true
});

//--------------------------------------------------------------------------------

class App extends CodeBase {
    //
}

Object.assign(App.prototype, {
    isApp: true
});

//--------------------------------------------------------------------------------

class Package extends CodeBase {
    static at (dir) {
        if (super.at(dir)) {
            let data = dir.join(this.FILE).load();
            return 'sencha' in data;
        }

        return false;
    }
}

Object.assign(Package.prototype, {
    isPackage: true
});

//--------------------------------------------------------------------------------

module.exports = {
    Context,
    Workspace,
    App,
    Package
};
