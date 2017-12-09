'use strict';

const Phyl = require('phylo');

const { Context } = require('./src/Context');

let context = Context.from(Phyl.from(__dirname).join('test/projects/solo-app'));

console.log('descriptor: ' + context.file);
console.log('workspace: ' + context.workspace.file);
