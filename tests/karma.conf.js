/* globals module:false, require:false */
module.exports = function (config) {
    'use strict';

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha', 'detectBrowsers'],

        // list of files / patterns to load in the browser
        files: [
            'vendor/mootools/dist/mootools-core.min.js',
            'vendor/mootools-more/Source/Element/Element.Measure.js',
            'vendor/mootools-more/Source/Interface/Tips.js',
            'tests/**/*.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tests/**/*.js': ['browserify'],
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        client: {
            mocha: {
                // I'm using Jasmine-style matchers here.
                // I don't mind chaining, but I think at a certain
                // point it becomes a bit too much (looking at you Chai).
                require: [require.resolve('expectations')],
                ui: 'bdd',
            }
        },

        detectBrowsers: {
            // phantomjs does not support the <video> element
            usePhantomJS: false,
        }
    });
};
