'use strict';

const Phyl = require('phylo');

const PropertyMap = require('./PropertyMap');

/**
 * This class is an abstract base class for App, Package and Workspace. Each directory in
 * a Cmd workspace can contain one of the master descriptors (app.json, package.json and/or
 * workspace.json) and these class manage loading and accessing these descriptors.
 *
 * Typically, a context is loaded from the current directory (cwd):
 *
 *      let context = Context.get();
 *
 *      if (context) {
 *          // the cwd corresponds to, or is a subdirectory of, some Cmd context...
 *          if (context.isApp) {
 *              // cwd is an app or a subdir of an app...
 *
 *              let workspace = context.workspace;  // get the workspace
 *          }
 *          else if (context.isPackage) {
 *              // cwd is a package or a subdir of one...
 *
 *              let workspace = context.workspace;
 *          }
 *          else {
 *              // cwd is a workspace or subdir of one...
 *          }
 *      }
 *
 * In some cases, a directory can correspond to an App and a Workspace.
 */
class Context {
    /**
     * @property {"app.json"/"package.json"/"workspace.json"} FILE
     */
    static get FILE () {
        return this.$file || (this.$file = this.KEY + '.json');
    }

    /**
     * @property {"app"/"package"/"workspace"} KEY
     */
    static get KEY () {
        return this.$key || (this.$key = this.name.toLowerCase());
    }

    /**
     * Returns `true` if the given directory is this type of `Context`.
     * @param {String/phylo.File} dir
     * @return {Boolean}
     */
    static at (dir) {
        let d = Phyl.from(dir);

        if (this === Context) {
            return App.at(d) || Package.at(d) || Workspace.at(d);
        }

        return d.hasFile(this.FILE);
    }

    /**
     * Starting in the specified location and climbing upwards, create and return the
     * most specific type of `Context`.
     * @param {String/File} dir The path as a string of `File` (from `phylo` module).
     * @param {Context} [creator] Used internally to pass the Context responsible for
     * creating this new Context.
     * @return {Context} The most specific type of context or `null`.
     */
    static from (dir, creator = null) {
        let root = Phyl.from(dir).up(d => this.at(d));

        return this.load(root, creator);
    }

    /**
     * Starting in the `cwd()` and climbing upwards, create and return the most specific
     * type of `Context`.
     * @param {Context} [creator] Used internally to pass the Context responsible for
     * creating this new Context.
     * @return {Context} The most specific type of context or `null`.
     */
    static get (creator = null) {
        return Context.from(Phyl.cwd(), creator);
    }

    /**
     * From the specified location, create and return the most specific type of `Context`.
     * @param {String/File} dir The path as a string of `File` (from `phylo` module).
     * @param {Context} [creator] Used internally to pass the Context responsible for
     * creating this new Context.
     * @return {Context} The most specific type of context or `null`.
     */
    static load (dir, creator = null) {
        if (dir == null) {
            return null;
        }

        let d = Phyl.from(dir);

        if (this === Context) {
            return App.load(d, creator) || Package.load(d, creator) || Workspace.load(d, creator);
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

    /**
     * Returns the `PropertyMap` of properties for this context.
     * @param {Boolean} [refresh] Pass `true` to rebuild the property map.
     * @return {PropertyMap}
     */
    getConfigProps (refresh = false) {
        if (refresh) {
            this.configProps = null;
        }

        return this.configProps || (this.configProps = this._gatherProps());
    }

    /**
     * Looks up a property in the property map (see `getConfigProps`).
     * @param {String} prop The name of the property to retrieve.
     * @param {Boolean} [refresh] Pass `true` to rebuild the property map.
     * @return {Mixed}
     */
    getProp (prop, refresh = false) {
        let props = this.getConfigProps(refresh);
        return props.get(prop);
    }

    relativePath (dir) {
        let rel = Phyl.from(dir).relativize(this.dir);
        rel = rel.slashify();
        return rel;
    }

    _gatherProps (props = null) {
        props = props || new PropertyMap();

        let key = this.constructor.KEY;

        props.flatten(key, this.data);
        props.add(key + '.dir', this.dir.path);

        return props;
    }

    _set (prop, value) {
        Object.defineProperty(this, prop, { value: value });
    }
}

Object.assign(Context.prototype, {
    isContext: true,
    configProps: null,
    creator: null
});

//--------------------------------------------------------------------------------

class Workspace extends Context {
    get apps () {
        let apps = [];
        let creator = this.creator && this.creator.isApp && this.creator;
        let creatorPath = creator && creator.dir.path;
        let found = !creator;

        if (this.data.apps) {
            let app, dir;

            for (let path of this.data.apps) {
                dir = this.dir.join(path).absolutify();

                if (dir.equals(creatorPath)) {
                    app = creator;
                    found = true;
                }
                else {
                    app = App.load(dir, this);
                }

                if (app) {
                    apps.push(app);
                }
            }
        }

        if (!found) {
            apps.push(creator);
        }

        this._set('apps', apps);

        return apps;
    }

    get packages () {
        let dirs = this.getPackagePath();
        let creator = this.creator && this.creator.isPackage && this.creator;
        let creatorPath = creator && creator.dir.path;
        let pkgs = [];

        let load = d => {
            let p = d.equals(creatorPath) ? creator : Package.load(d, this);
            if (p) {
                pkgs.push(p);
            }
            return p;
        };

        for (let dir of dirs) {
            // The package path can point directly at a package...
            if (!load(dir)) {
                // ...but typically points at a folder of packages
                dir.list('d', (name, d) => load(d));
            }
        }

        this._set('packages', pkgs);

        return pkgs;
    }

    get workspace () {
        return this;
    }

    getPackagePath () {
        let dirs = [ Phyl.from(this.getProp('workspace.packages.extract')) ];
        let dir = this.getProp('workspace.packages.dir');

        if (dir) {
            for (let d of dir.split(',')) {
                dirs.push(Phyl.from(d));
            }
        }
        else {
            dirs.push(this.dir.join('packages'));
        }

        let map = {};
        let distinct = d => {
            let p = d && d.exists() && d.absolutePath();
            return p && !map[p] && (map[p] = d);
        };

        return dirs.filter(distinct).map(d => d.nativize());
    }
}

Object.assign(Workspace.prototype, {
    isWorkspace: true
});

//--------------------------------------------------------------------------------

class CodeBase extends Context {
    get workspace () {
        let workspace = this.creator;

        if (!workspace || !workspace.isWorkspace) {
            workspace = Workspace.from(this.dir, this);
        }

        this._set('workspace', workspace);

        return workspace;
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
            return typeof data.sencha === 'object';
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
    CodeBase,
    App,
    Package
};
