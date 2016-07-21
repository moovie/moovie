/* globals module:false, require:false */
module.exports = function (config) {
    'use strict';

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon'],

        // list of files / patterns to load in the browser
        files: [
            // dependencies
            'vendor/mootools/dist/mootools-core.min.js',
            'vendor/mootools-more/Source/Types/URI.js',
            'vendor/mootools-more/Source/Drag/Drag.js',
            'vendor/mootools-more/Source/Interface/Tips.js',
            'vendor/screenfull/dist/screenfull.min.js',

            // source
            'src/js/Moovie.js',
            'src/js/Moovie.*.js',

            // specs
            'tests/specs/Moovie.js',
            'tests/specs/Moovie.*.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

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
        browsers: [/*'Chrome',*/ 'Firefox', /*'Safari', 'Opera', 'IE',*/],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        // mocha options
        client: {
            mocha: {
                // I'm using Jasmine-style matchers here.
                // I don't mind chaining, but I think at a certain
                // point it becomes a bit too much (looking at you Chai).
                require: [require.resolve('expectations')],
                ui: 'bdd',
            }
        },

        // All coverage can be found in either the "build/coverage"
        // or "build/logs" directories
        coverageReporter: {
            dir: 'build',
            reporters: [
                {
                    type: 'html',
                    subdir: function (browser) {
                        return 'coverage/' + browser.toLowerCase().split(/[ /-]/)[0];
                    }
                },
                {
                    type: 'lcovonly',
                    subdir: 'logs'
                }
            ]
        }
    });
};
