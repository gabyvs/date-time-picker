/* global __dirname */
var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve(__dirname, 'build');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var mainPath = path.resolve(__dirname, 'app', 'main.js');
var cssPath = path.resolve(__dirname, 'app', 'date-time-picker.less');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var config = {
    devtool: 'eval',
    entry: [
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080',
        cssPath,
        mainPath
    ],
    output: {
        path: buildPath,
        filename: 'date-time-picker.js',
        publicPath: '/build/'
    },
    externals: {
        'angular': 'angular',
        'jQuery': 'jQuery',
        'moment': 'moment',
        'lodash': '_'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: [nodeModulesPath]
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                exclude: [nodeModulesPath]
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.svg$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
};

module.exports = config;

