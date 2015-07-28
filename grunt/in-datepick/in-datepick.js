/*
 * grunt-html2js
 * https://github.com/karlgoldstein/grunt-html2js
 *
 * Copyright (c) 2013 Karl Goldstein
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var path = require('path');

    // Warn on and remove invalid source files (if nonull was set).
    var existsFilter = function(filepath) {
        if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
        } else {
            return true;
        }
    };

    grunt.registerMultiTask('inDatepick', 'Compiles Angular-JS templates to JavaScript.', function() {

        var options = this.options({
            archive: this.target + '.js',
            base: 'src',
            module: this.target,
            quoteChar: '\'',
            indentString: '    ',
            htmlmin: {},
            process: false
        });

        var counter = 0;
        var target = this.target;
        var content = this.files.map(generateModule).join('\n');
        rewriteModule(content);

        //Just have one output, so if we making thirty files it only does one line
        grunt.log.writeln("Successfully injected "+(""+counter).green +
            " html templates for " + options.target + ".");

        function rewriteModule(content) {
            grunt.file.copy(options.archive, options.archive, { process: function (text) {
                return text.replace('/*{datepick}*/', function () { return '\n' + content + '\n'; });
            } });
        }

        // generate a separate module
        function generateModule(f) {


            // f.dest must be a string or write will fail
            var filePaths = f.src.filter(existsFilter);

            var modules = filePaths.map(function(filepath) {
                return grunt.file.read(filepath);
            });

            counter += modules.length;
            modules  = modules.join('\n');

            return modules;
        }
    });
};
