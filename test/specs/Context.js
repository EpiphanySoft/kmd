'use strict';

/* global describe */

const Phyl = require('phylo');
const expect = require('assertly').expect;

const { Manager, Context, App, Package, Workspace } = require('../../src/Context');
const Sources = require('../../src/Sources');

const baseDir = Phyl.from(__dirname).resolve('../..');
const projectsDir = Phyl.from(__dirname).resolve('../projects');

const Dir = {
    base: baseDir,
    projects: projectsDir,
    soloApp: projectsDir.join('solo-app'),
    workspace: projectsDir.join('workspace')
};

function baseRel (p) {
    return Phyl.from(p).relativize(baseDir).slashify();
}

describe('Context', function () {
    describe('basics', function () {
        it('should return null when there is just an npm package', function () {
            let context = Context.from(Dir.projects);

            expect(context).to.be(null);  // we are in a Node.js package not Cmd package
        });

        it('should return null when there is nothing', function () {
            let context = Context.from(Phyl.home());

            expect(context).to.be(null);
        });

        it('should return null when there is nothing', function () {
            let workspace = Workspace.from(Phyl.home());

            expect(workspace).to.be(null);

            workspace = Workspace.load(Phyl.home());

            expect(workspace).to.be(null);
        });

        it('should load solo-app', function () {
            let context = Context.from(Dir.soloApp);

            expect(context.file.name).to.be('app.json');
            expect(context.isApp).to.be(true);
            expect(context.manager).to.not.be.falsy();

            let props = context.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = baseRel(v);
            expect(dir.path).to.be('test/projects/solo-app/build');
        });

        it('should load solo-app w/manager', function () {
            let mgr = new Manager();
            let context = Context.from(Dir.soloApp, mgr);

            expect(context.file.name).to.be('app.json');
            expect(context.isApp).to.be(true);
            expect(context.manager).to.be(mgr);

            let props = context.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = baseRel(v);
            expect(dir.path).to.be('test/projects/solo-app/build');
        });

        it('should load solo-app via cwd', function () {
            let was = Phyl.cwd;

            Phyl.cwd = () => Dir.soloApp;

            try {
                let context = Context.get();

                expect(context.file.name).to.be('app.json');

                let props = context.getConfigProps();

                expect(props).to.not.be(null);

                let v = props.get('workspace.build.dir');

                expect(v).to.not.be(null);

                let dir = baseRel(v);
                expect(dir.path).to.be('test/projects/solo-app/build');
            }
            finally {
                Phyl.cwd = was;
            }
        });

        it('should load a workspace', function () {
            let workspace = Context.from(Dir.workspace);

            expect(workspace.file.name).to.be('workspace.json');

            let props = workspace.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = baseRel(v);
            expect(dir.path).to.be('test/projects/workspace/build');
        });

        it('should load a package', function () {
            let pkg = Context.from(Dir.projects.join('workspace/packages/local/foo'));

            expect(pkg.file.name).to.be('package.json');

            let props = pkg.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = baseRel(v);
            expect(dir.path).to.be('test/projects/workspace/build');
        });

        it('should report properties', function () {
            let workspace = Context.from(Dir.workspace);

            expect(workspace.file.name).to.be('workspace.json');

            let props = workspace.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = baseRel(v);
            expect(dir.path).to.be('test/projects/workspace/build');

            workspace.data.build.dir = '${workspace.dir}/derp';
            let v2 = workspace.getProp('workspace.build.dir');
            expect(v).to.be(v2);

            v2 = workspace.getProp('workspace.build.dir', true);
            expect(v).to.not.be(v2);

            let dir2 = baseRel(v2);
            expect(dir2.path).to.be('test/projects/workspace/derp');
        });
    });

    describe('workspaces', function () {
        it('should load a workspace w/o apps', function () {
            let workspace = Workspace.from(Dir.workspace.join('app'));

            expect(workspace.workspace).to.be(workspace);

            // noinspection JSAnnotator
            delete workspace.data.apps;

            let apps = workspace.apps;
            expect(apps.length).to.be(0);
        });

        it('should load a workspace w/o package paths', function () {
            let workspace = Workspace.from(Dir.workspace.join('app'));

            expect(workspace.workspace).to.be(workspace);

            delete workspace.data.packages;

            let pkgs = workspace.packages;
            expect(pkgs.length).to.be(0);

            pkgs = workspace.getPackagePath();
            expect(pkgs.length).to.be(1);

            let p = workspace.relativize(pkgs[0]);
            expect(p.path).to.be('packages');
        });

        it('should load a workspace w/direct package paths', function () {
            let workspace = Workspace.from(Dir.workspace.join('app'));

            expect(workspace.workspace).to.be(workspace);

            workspace.data.packages = {
                dir: '${workspace.dir}/packages/local/foo'
            };

            let pkgs = workspace.packages;
            expect(pkgs.length).to.be(1);

            let pkg = pkgs[0];
            expect(pkg.data.name).to.be('foo');

            expect(pkg.creator).to.be(workspace);
            expect(pkg.workspace).to.be(workspace);
        });

        it('should load the apps of a workspace', function () {
            let workspace = Workspace.from(Dir.workspace.join('app'));

            expect(workspace.workspace).to.be(workspace);

            let apps = workspace.apps;
            expect(apps.length).to.be(1);
            expect(apps[0].data.name).to.be('WA');
        });

        it('should load the packages of a workspace', function () {
            let workspace = Workspace.from(Dir.workspace.join('app'));

            let pkgs = workspace.packages;
            expect(pkgs.length).to.be(1);

            let pkg = pkgs[0];
            expect(pkg.data.name).to.be('foo');

            expect(pkg.creator).to.be(workspace);
            expect(pkg.workspace).to.be(workspace);
        });

        it('should load the workspace of an app and reciprocate', function () {
            let app = App.from(Dir.workspace.join('app'));

            let workspace = app.workspace;
            let apps = workspace.apps;

            expect(workspace.creator).to.be(app);

            expect(apps.length).to.be(1);
            expect(apps[0]).to.be(app);
        });

        it('should load the workspace of an app and reciprocate even if not listed', function () {
            let app = App.from(Dir.workspace.join('app'));

            let workspace = app.workspace;

            workspace.data.apps.length = 0;

            let apps = workspace.apps;

            expect(workspace.creator).to.be(app);

            expect(apps.length).to.be(1);
            expect(apps[0]).to.be(app);
        });

        it('should load the workspace of a package and reciprocate', function () {
            let pkg = Package.from(Dir.workspace.join('packages/local/foo'));

            let workspace = pkg.workspace;

            expect(workspace.relativize(pkg.file).path).
                to.be('packages/local/foo/package.json');

            let pkgs = workspace.packages;

            expect(workspace.creator).to.be(pkg);

            expect(pkgs.length).to.be(1);
            expect(pkgs[0]).to.be(pkg);
        });
    });

    describe('apps', function () {
        it('should return the proper classpath', function () {
            let app = App.from(Dir.soloApp);
            let cp = app.classpath;
            let rp = cp.map(p => baseRel(p).path);

            expect(rp).to.equal([
                'test/projects/solo-app/app'
            ]);

            let cp2 = app.classpath;
            expect(cp).to.be(cp2);  // should be cached
        });

        it('should return the proper overrides', function () {
            let app = App.from(Dir.soloApp);
            let op = app.overrides;
            let rp = op.map(p => baseRel(p).path);

            expect(rp).to.equal([
                'test/projects/solo-app/overrides'
            ]);

            let op2 = app.overrides;
            expect(op).to.be(op2);
        });

        it('should load app source files', async function () {
            let workspace = Context.from(Dir.workspace);
            let app = workspace.apps[0];

            let sources = await app.loadSources();
            let files = sources.files.items;

            expect(sources.files.length).to.be(2);

            let f1 = files[0];
            let f2 = files[1];

            expect(f1.relFile.path).to.be('app/app/Application.js');
            expect(f2.relFile.path).to.be('app/app/view/main/Main.js');

            expect(f1.code.includes("Ext.define('WA.Application',")).to.be(true);
            expect(f2.code.includes("Ext.define('WA.view.main.Main',")).to.be(true);

            let nf = sources.files.get(app.dir.resolve('app.js'));
            expect(nf).to.be(null);

            expect(sources._sorter(f1, f1)).to.be(0);
            expect(sources._sorter(f1, f2)).to.be(-1);
            expect(sources._sorter(f2, f1)).to.be(1);
        });

        it('should load augmented app source files', async function () {
            let workspace = Context.from(Dir.workspace);
            let app = workspace.apps[0];

            app.data.classpath.unshift('app.js'); // add a file to the classpath
            let sources = await app.loadSources(new Sources(workspace));
            let files = sources.files.items;

            expect(sources.files.length).to.be(3);

            let f1 = files[0];
            let f2 = files[1];
            let f3 = files[2];

            expect(f1.relFile.path).to.be('app/app.js');
            expect(f2.relFile.path).to.be('app/app/Application.js');
            expect(f3.relFile.path).to.be('app/app/view/main/Main.js');

            expect(f1.code.startsWith("Ext.application(")).to.be(true);
            expect(f2.code.includes("Ext.define('WA.Application',")).to.be(true);
            expect(f3.code.includes("Ext.define('WA.view.main.Main',")).to.be(true);

            // Repeat:
            sources = await app.loadSources();
            files = sources.files.items;

            expect(sources.files.length).to.be(3);

            f1 = files[0];
            f2 = files[1];
            f3 = files[2];

            expect(f1.relFile.path).to.be('app/app.js');
            expect(f2.relFile.path).to.be('app/app/Application.js');
            expect(f3.relFile.path).to.be('app/app/view/main/Main.js');

            expect(f1.code.startsWith("Ext.application(")).to.be(true);
            expect(f2.code.includes("Ext.define('WA.Application',")).to.be(true);
            expect(f3.code.includes("Ext.define('WA.view.main.Main',")).to.be(true);
        });
    });

    describe('packages', function () {
        it('should return the proper classpath', function () {
            let workspace = Workspace.from(Dir.workspace);
            let pkg = workspace.packages[0];

            let cp = pkg.classpath;
            let rp = cp.map(p => baseRel(p).path);

            expect(rp).to.equal([
                'test/projects/workspace/packages/local/foo/src'
            ]);

            let cp2 = pkg.classpath;
            expect(cp).to.be(cp2);
        });

        it('should return the proper overrides', function () {
            let workspace = Workspace.from(Dir.workspace);
            let pkg = workspace.packages[0];

            let op = pkg.overrides;
            let rp = op.map(p => baseRel(p).path);

            expect(rp).to.equal([
                'test/projects/workspace/packages/local/foo/overrides'
            ]);

            let op2 = pkg.overrides;
            expect(op).to.be(op2);
        });
    });
});
