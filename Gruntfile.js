module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: [
                '/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * @author <%= pkg.author %>',
                ' **/\n'
            ].join('\n')
        },
        dirs: {
            dest: 'dist'
        },
        clean: {
            templates: ['tmp']
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/*.js', 'tmp/*.js'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
            }
        },
        compress: {
            main: {
                options: {
                    archive: '<%= dirs.dest %>/dt-picker.zip'
                },
                files: [
                    {src: ['<%= dirs.dest %>/*.js'], filter: 'isFile'}
                ]
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            build: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
            }
        },
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "<%= dirs.dest %>/dt-picker.css": "src/dt-picker.less" // destination file and source file
                }
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            build: {
                browsers: ['PhantomJS'],
                singleRun: true,
                autoWatch: false
            },
            test: {
                singleRun: false,
                autoWatch: true,
                browsers: ['Chrome'],
                preprocessors: {
                    'src/*.html': ['ng-html2js']
                }
            }
        },
        ngTemplates: {
            options: {
                archive: '<%= dirs.dest %>/date-time-picker.js'
            },
            'dt-picker': {
                files: [
                    {src: ['src/*.html'], filter: 'isFile'}
                ]
            }
        }
    });
    grunt.task.loadTasks('grunt/ng-template');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', 'build');
    grunt.registerTask('karma:build', 'build', ['concat', 'ngTemplates', 'uglify', 'less', 'compress', 'clean']);
//    grunt.registerTask('build', ['karma:build', 'concat', 'ngTemplates', 'uglify', 'less', 'compress', 'clean']);
    grunt.registerTask('test', ['karma:test']);
};