/*global module:false*/
module.exports = function (grunt) {
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed MIT %> */\n',

        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },

            dist: {
                src: ['src/js/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },

            css: {
                src: ['src/css/<%= pkg.name %>.css'],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: '<%= concat.dist.dest %>',
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
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },

            gruntfile: {
                src: 'Gruntfile.js'
            },

            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },

        qunit: {
            files: ['test/**/*.html']
        },

        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },

            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('minify', ['concat', 'uglify', 'cssmin']);
    grunt.registerTask('default', ['jshint', 'qunit', 'minify']);
};
