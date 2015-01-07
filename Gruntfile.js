/*!
 * Prettytable's Gruntfile
 * https://github.com/bilxio/jquery-prettytable
 * Copyright 2015 Bill Xiong.
 * Licensed under MIT
 */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: [
                'tmp/'
            ]
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            core: {
                src: 'jquery-prettytable.js'
            }
        },

        concat: {
            options: {
                separator: ';',
                stripBanners: true
            },
            dist: {
                src: [
                    "jquery-prettytable.js"
                ],
                dest: "tmp/jquery-prettytable.js"
            }
        },

        uglify: {
            options: {},
            dist: {
                files: {
                    'jquery-prettytable.min.js': 'tmp/jquery-prettytable.js'
                }
            }
        },

        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            compress: {
                files: {
                    'jquery-prettytable.min.css': [
                        "jquery-prettytable.css"
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'cssmin']);

    // Travis CI task.
    grunt.registerTask('travis', 'jshint');

};