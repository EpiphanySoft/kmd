# kmd
[![Build Status](https://travis-ci.org/EpiphanySoft/kmd.svg?branch=master)](https://travis-ci.org/EpiphanySoft/kmd)
[![Coverage Status](https://coveralls.io/repos/github/EpiphanySoft/kmd/badge.svg?branch=master)](https://coveralls.io/github/EpiphanySoft/kmd?branch=master)

Node.js-based tools to replace Sencha Cmd

**!!! UNDER CONSTRUCTION !!!**

# Classes

## Context, App, Package, Workspace

These classes manage loading the appropriate `app.json`, `package.json` and/or
`workspace.json` file(s) for a given directory. The contents of this file is loaded
as the `data` property.

There are many commonalities between apps and packages. These are collected in their
common base class `CodeBase`.

```javascript
let context = Context.get();  // from cwd

if (context) {
    // cwd is an app, package or workspace
    if (context.isApp) {
        // also context.isCodeBase
    }
    else if (context.isPackage) {
        // also context.isCodeBase
    }
    else {
        // context.isWorkspace
    }
}
```

## PropertyMap

This class mimics Ant properties and expands based on `'${foo}'` tokens.
