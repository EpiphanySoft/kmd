'use strict';

/* global describe */

const Phyl = require('phylo');
const expect = require('assertly').expect;

const { Context, App, Package, Workspace } = require('../../src/Context');
const Symbols = require('../../src/Symbols');

const baseDir = Phyl.from(__dirname).resolve('../..');
const projectsDir = Phyl.from(__dirname).resolve('../projects');

const Dir = {
    base: baseDir,
    projects: projectsDir,
    soloApp: projectsDir.join('solo-app'),
    workspace: projectsDir.join('workspace')
};

describe('Symbols', function () {
    describe('basics', async function () {
        it('should load classes', async function () {
            let workspace = Context.from(Dir.workspace);
            let app = workspace.apps[0];

            let sources = await app.loadSources();

            let symbols = new Symbols(sources);

            let classes = symbols.classes;

            expect(classes).to.not.be(null);

            // Ensure items are cached:
            let sf = sources.files.items[0];
            let ast = sf._ast;
            expect(sf.ast).to.be(ast);

            let syms = symbols.files.items[0];
            let cls = syms._classes;
            classes = syms.classes;
            expect(cls).to.be(classes);
        });
    });
});
