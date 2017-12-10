'use strict';

const Phyl = require('phylo');
const expect = require('assertly').expect;

const { Context, Workspace } = require('../../src/Context');

const baseDir = Phyl.from(__dirname).resolve('../..');
const projectsDir = Phyl.from(__dirname).resolve('../projects');

describe('Context', function () {
    it('should return null when there is just an npm package', function () {
        let context = Context.from(projectsDir);

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
        let context = Context.from(projectsDir.join('solo-app'));

        expect(context.file.name).to.be('app.json');

        let props = context.getConfigProps();

        expect(props).to.not.be(null);

        let v = props.get('workspace.build.dir');

        expect(v).to.not.be(null);

        let dir = Phyl.from(v).relativize(baseDir);
        dir = dir.slashify();
        expect(dir.path).to.be('test/projects/solo-app/build');
    });

    it('should load solo-app via cwd', function () {
        let was = Phyl.cwd;

        Phyl.cwd = () => projectsDir.join('solo-app');

        try {
            let context = Context.get();

            expect(context.file.name).to.be('app.json');

            let props = context.getConfigProps();

            expect(props).to.not.be(null);

            let v = props.get('workspace.build.dir');

            expect(v).to.not.be(null);

            let dir = Phyl.from(v).relativize(baseDir);
            dir = dir.slashify();
            expect(dir.path).to.be('test/projects/solo-app/build');
        }
        finally {
            Phyl.cwd = was;
        }
    });

    it('should load a workspace', function () {
        let context = Context.from(projectsDir.join('workspace'));

        expect(context.file.name).to.be('workspace.json');

        let props = context.getConfigProps();

        expect(props).to.not.be(null);

        let v = props.get('workspace.build.dir');

        expect(v).to.not.be(null);

        let dir = Phyl.from(v).relativize(baseDir);
        dir = dir.slashify();
        expect(dir.path).to.be('test/projects/workspace/build');
    });

    it('should load a package', function () {
        let context = Context.from(projectsDir.join('workspace/packages/local/foo'));

        expect(context.file.name).to.be('package.json');

        let props = context.getConfigProps();

        expect(props).to.not.be(null);

        let v = props.get('workspace.build.dir');

        expect(v).to.not.be(null);

        let dir = Phyl.from(v).relativize(baseDir);
        dir = dir.slashify();
        expect(dir.path).to.be('test/projects/workspace/build');
    });
});
