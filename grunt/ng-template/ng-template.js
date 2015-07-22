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
    var minify = require('html-minifier').minify;

    var escapeContent = function(content, quoteChar, indentString) {
        var bsRegexp = new RegExp('\\\\', 'g');
        var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
        var nlReplace = '\\n' + quoteChar + ' +\n' + indentString + indentString + quoteChar;
        return content.replace(bsRegexp, '\\\\').replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
    };

    // Warn on and remove invalid source files (if nonull was set).
    var existsFilter = function(filepath) {
        if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
        } else {
            return true;
        }
    };

    // return template content
    var getContent = function(filepath, options) {
        var content = grunt.file.read(filepath);

        // Process files as templates if requested.
        var process = options.process;
        if (typeof process === "function") {
            content = process(content, filepath);
        } else if (process) {
            if (process === true) {
                process = {};
            }
            content = grunt.template.process(content, process);
        }

        if (Object.keys(options.htmlmin).length) {
            try {
                content = minify(content, options.htmlmin);
            } catch (err) {
                grunt.warn(filepath + '\n' + err);
            }
        }

        // trim leading whitespace
        content = content.replace(/(^\s*)/g, '');

        return escapeContent(content, options.quoteChar, options.indentString);
    };

    // compile a template to an angular module
    var compileTemplate = function(moduleName, filepath, options) {
        var quoteChar    = options.quoteChar;
        var indentString = options.indentString;
        var content      = getContent(filepath, options);
        var doubleIndent = indentString + indentString;
        var compiled = '';

        compiled += indentString + '$templateCache.put(' + quoteChar + moduleName + quoteChar +
            ',\n' + doubleIndent  + quoteChar +  content + quoteChar + ');';
        return compiled;
    };

    grunt.registerMultiTask('ngTemplates', 'Compiles Angular-JS templates to JavaScript.', function() {

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
                return text.replace('/*{ng-template}*/', content);
            } });
        }

        // generate a separate module
        function generateModule(f) {


            // f.dest must be a string or write will fail
            var filePaths = f.src.filter(existsFilter);

            var modules = filePaths.map(function(filepath) {

                var moduleName = path.relative(options.base, filepath);
                if (grunt.util.kindOf(options.rename) === 'function') {
                    moduleName = options.rename(moduleName);
                }

                var compiled;
                compiled = compileTemplate(moduleName, filepath, options);

                return compiled;
            });

            counter += modules.length;
            modules  = modules.join('\n');

            return modules;
            grunt.file.write(f.dest, grunt.util.normalizelf(bundle + modules));
        }
    });
};
