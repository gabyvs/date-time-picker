var webpack = require("webpack");
module.exports = exports = Object.create(require("./webpack.config.js"));

exports.output.filename = "dateTimePicker.browser.js";
exports.output.library = "dateTimePicker";
exports.output.libraryTarget = "var";
