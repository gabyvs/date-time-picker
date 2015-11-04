var webpack = require("webpack");
module.exports = exports = Object.create(require("./webpack.config.js"));

exports.output.filename = "date-time-picker.browser.js";
exports.output.library = "dateTimePicker";
exports.output.libraryTarget = "var";
