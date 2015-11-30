/// karma.conf.js
var webpack = require('webpack');
var _ = require('lodash');
var baseConf = require('./karma.conf.base');

module.exports = function(config) {
    config.set(_.assign(baseConf(), {
        coverageReporter: {
            // specify a common output directory
            dir: 'reports/coverage'
        },
        preprocessors: {
            'tests.webpack.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots', 'coverage'],
        plugins: [
            'karma-coverage',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-webpack',
            'karma-sourcemap-loader'
        ],
        webpack: {
            module: {
                devtool: 'inline-source-map',
                postLoaders: [
                    // transpile and instrument only sources with istanbul (no test source)
                    {
                        test: /app\/(?!(?:.+Spec)|(?:datepick\/|custom-bootstrap\/)).+\.js$/,
                        loader: 'istanbul-instrumenter'
                    }
                ],
                loaders: [
                    {
                        test: /(?:(?:app\/[^\.]+)|(?:tests\.webpack))\.js$/,
                        loader: 'babel-loader'
                    },
                    {
                        test: /app\/[^\.]+\.html$/,
                        loader: "html-loader"
                    }
                ]
            }
        },
        webpackServer: {
            noInfo: true
        }
    }));
};