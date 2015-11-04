/* global __dirname */
var path = require('path');
var buildPath = path.resolve(__dirname, 'build');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');

var config = {
    entry: "./src/main.js",
    output: {
        path: buildPath,
        filename: 'date-time-picker.js'
    },
    externals: {
        "angular": "angular"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: [nodeModulesPath]
            }
        ]
    }
};

module.exports = config;

