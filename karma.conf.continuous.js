// karma.conf.continuous.js
var webpack = require('webpack');
var _ = require('lodash');
var baseConf = require('./karma.conf.base');

module.exports = function(config) {
    config.set(_.assign(baseConf(), {
        autoWatch: true,
        singleRun: false
    }));
};