// karma.conf.base.js
var webpack = require('webpack');

module.exports = function () {
    return {
        browsers: ['PhantomJS'],
        files: [
            'node_modules/phantomjs-polyfill/bind-polyfill.js',
            'node_modules/jquery/dist/jquery.js',
            { pattern: 'tests.webpack.js', watched: false }
        ],
        frameworks: ['jasmine'],
        preprocessors: {
            'tests.webpack.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots'],
        singleRun: true,
        webpack: {
            devtool: 'inline-source-map',
            module: {
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
            },
            watch: true
        },
        webpackServer: {
            noInfo: true
        }
    }
};