/*
 * grunt-apiDoc2Swagger
 * https://github.com/Giwi/apiDoc2Swagger
 *
 * Copyright (c) 2015 Xavier MARIN
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
            jshint: {
                all: [
                    'Gruntfile.js',
                    'tasks/*.js',
                    '<%= nodeunit.tests %>'
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            apidoc: {
                myapp: {
                    src: 'test/',
                    dest: 'tmp/apidoc'
                }
            },

            // Before generating any new files, remove any previously-created files.
            clean: {
                tests: ['tmp']
            },
            'swagger-js-codegen': {
                queries: {
                    options: {
                        apis: [
                            {
                                swagger: 'tmp/swagger/APITest.json',
                                moduleName: 'APITest', // This is the model and file name
                                className: 'APITest',
                                fileName: 'APITest.js'
                            }
                        ],
                        dest: 'tmp/angular'
                    },
                    dist: {}
                }
            },

            // Configuration to be run (and then tested).
            apidoc2swagger: {
                testAPI: {
                    options: {
                        apiProject: 'tmp/apidoc/api_project.json',
                        apiData: 'tmp/apidoc/api_data.json',
                        swagger: 'tmp/swagger'
                    }
                }
            },
            // Unit tests.
            nodeunit: {
                tests: ['test/*_test.js']
            },
            jsdoc: {
                dist: {
                    src: ['tmp/angular/**/*.js', 'README.md'],
                    options: {
                        destination: 'tmp/jsdoc'
                    }
                }
            }, changelog: {
                options: {
                    version: require('./package.json').version
                }
            },
            bump: {
                options: {
                    files: ['package.json'],
                    updateConfigs: [],
                    commit: true,
                    commitMessage: 'Release v%VERSION%',
                    commitFiles: ['package.json'],
                    createTag: true,
                    tagName: 'v%VERSION%',
                    tagMessage: 'Version %VERSION%',
                    push: true,
                    pushTo: 'origin',
                    gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                    globalReplace: false
                }
            }
        }
    );

// Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

// These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-swagger-js-codegen');
    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-bump');
// Whenever the "test" task is run, first clean the "tmp" dir, then run this
// plugin's task(s), then test the result.

// By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'clean', 'apidoc', 'apidoc2swagger', 'swagger-js-codegen', 'jsdoc']);
}
;
