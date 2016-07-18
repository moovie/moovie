/* global module:false, require:false */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        banner: '/*!\n' +
            '* Moovie: an advanced HTML5 video player for MooTools.\n' +
            '*\n' +
            '* @see http://colinaarts.com/code/moovie\n' +
            '* @version <%= pkg.version %>\n' +
            '* @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)\n' +
            '* @author Nathan Bishop <nbish11@hotmail.com>\n' +
            '* @copyright 2010 Colin Aarts\n' +
            '* @license MIT\n' +
            '*/\n',

        // Task configuration.
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: '**',
                dest: 'dist/',
                flatten: true,
                filter: 'isFile'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['*.css'],
                    dest: 'dist',
                    ext: '.min.css'
                }]
            }
        },

        jshint: {
            options: {
                jshintrc: true,
                reporterOutput: ''  // Bug??
            },

            gruntfile: {
                src: 'Gruntfile.js'
            },

            karmafile: {
                src: 'karma.conf.js'
            },

            target: {
                src: ['src/js/*.js', 'tests/specs/*Spec.js']
            }
        },

        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },

            karmafile: {
                files: '<%= jshint.karmafile.src %>',
                tasks: ['jshint:karmafile']
            },

            target: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:target']
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        'release-it': {
            options: {
                pkgFiles: ['package.json', 'bower.json'],
                buildCommand: 'grunt build',
                commitMessage: "Release v%s",
                tagName: "v%s",
                tagAnnotation: "Release v%s",
                changelogCommand: false,
                src: {
                    beforeStageCommand: "git log v[REV_RANGE] --pretty=format:'* %s (%h)'"
                }
                npm: {
                    publish: true
                },
                github: {
                    release: true
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('test', ['jshint', 'karma:unit:start']);
    grunt.registerTask('minify', ['copy', 'uglify', 'cssmin']);
    grunt.registerTask('build', ['test', 'minify']);
    grunt.registerTask('publish', ['release-it']);
    grunt.registerTask('default', ['test']);
};
