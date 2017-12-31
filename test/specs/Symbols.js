'use strict';

/* global describe */

const Phyl = require('phylo');
const expect = require('assertly').expect;

const { Manager, Context, App, Package, Workspace } = require('../../src/Context');
const Symbols = require('../../src/Symbols');

const baseDir = Phyl.from(__dirname).resolve('../..');
const projectsDir = Phyl.from(__dirname).resolve('../projects');

const Dir = {
    base: baseDir,
    projects: projectsDir,
    soloApp: projectsDir.join('solo-app'),
    workspace: projectsDir.join('workspace')
};

class TestManager extends Manager {
    constructor () {
        super();

        this.messages = [];

        this.logger = {
            error: m => this._log('ERR', m),
            info:  m => this._log('INF', m),
            log:   m => this._log('DBG', m),
            warn:  m => this._log('WRN', m)
        };
    }

    _log (level, msg) {
        this.messages.push(`${level}: ${msg}`);
    }
}

function getClassNames (symbols) {
    let classes = symbols.classes;
    expect(classes).to.not.be(null);
    classes.sort();

    let classNames = classes.items.map(it => it.name);
    return [classes, classNames];
}

describe('Symbols', function () {
    describe('basics', async function () {
        it('should load classes', async function () {
            let mgr = new TestManager();
            let workspace = Context.from(Dir.workspace, mgr);
            let app = workspace.apps[0];

            let sources = await app.loadSources();

            let symbols = new Symbols(sources);

            let [classes, classNames] = getClassNames(symbols);

            expect(mgr.messages).to.equal([
                'WRN: C1000: Unrecognized use of Ext.define (Expected 2nd argument to be an ' +
                    'object or function returning an object) -- app/app/Application.js:7:1'
            ]);

            expect(classes).to.not.be(null);
            classes.sort();

            expect(classNames).to.equal([
                'WA.Application',
                'WA.MainView',
                'WA.view.main.Main'
            ]);

            // Ensure items are cached:
            let sf = sources.files.items[0];
            let ast = sf._ast;
            expect(sf.ast).to.be(ast);

            let syms = symbols.files.items[0];
            let cls = syms._classes;
            classes = syms.classes;
            expect(cls).to.be(classes);
        });

        it('should remove classes', async function () {
            let workspace = Context.from(Dir.workspace);
            let app = workspace.apps[0];

            let sources = await app.loadSources();

            let symbols = new Symbols(sources);

            expect(symbols.files.length).to.be(2);

            let classes = symbols.classes;

            expect(classes).to.not.be(null);

            symbols.sync();

            classes = symbols.classes;
            expect(classes).to.not.be(null);

            expect(symbols.files.length).to.be(2);

            sources.files.remove(sources.files.items[0]);

            symbols.sync();

            expect(symbols.files.length).to.be(1);

            let classNames;
            [classes, classNames] = getClassNames(symbols);

            expect(classNames).to.equal([
                'WA.MainView',
                'WA.view.main.Main'
            ]);
            // expect(classes.items[0].name).to.be('WA.Application');
            // expect(classes.items[0].name).to.be('WA.view.main.Main');

            expect(classes.get('WA.view.main.Main')).to.be(classes.items[1]);
        });
    });
});
