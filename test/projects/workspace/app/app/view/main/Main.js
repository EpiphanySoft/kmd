// @define WA.view.main.Main
// #define WA.MainView
// #tag mainview, viewmain

/**
 * This is the main view.
 * @class
 */
Ext.define('WA.view.main.Main', function (Main) {
    return {
        extend: 'Ext.Panel',
        alias: 'mainview',
        xtype: 'main',
        alternateClassName: 'WA.AltMain',

        'requires': [
            'Ext.grid.Grid'
        ],

        mixins: {
            mixin: 'Ext.mixin.Mixin'
        },

        config: {
            //# cmd-auto-dependency 1
            /**
             * @cfg {Boolean} boolConfig
             */
            boolConfig: false,

            // @cmd-auto-dependency 2
            /**
             * @cfg {Number} numberConfig
             */
            numberConfig: 1,

            /**
             * @cfg {String} stringConfig
             */
            stringConfig: 'str'
        },

        eventedConfig: {
            /**
             * @cfg {Boolean} eventedBool
             */
            eventedBool: false,

            /**
             * @cfg {Number} eventedNumber
             */
            eventedNumber: 1,

            /**
             * @cfg {String} eventedString
             */
            eventedString: 'str'
        },

        platformConfig: {
            '!phone': {
                layout: 'hbox'
            }
        },

        layout: 'vbox',

        *[Symbol.iterator] () {},

        constructor (config) {
            Ext.apply(this, config);
        },

        foo: 42,
        bar: true,
        zip: null,
        derp: function (x) { return x; }
    }
});
