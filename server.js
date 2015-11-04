/* global process */
// This file is our entry point for Node.js
var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
var app = express();

var port =  3000;
var publicPath = path.resolve(__dirname, 'example');
var node_modules = path.resolve(__dirname, 'node_modules');

// We point to our static assets
app.use('/', express.static(publicPath));
app.use('/node_modules', express.static(node_modules));

require('./webpack.server.js')();

// Any requests to localhost:3000/build is proxied
// to webpack-dev-server
app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
});

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
    console.log('Could not connect to proxy, please try again...');
});

// And run the server
app.listen(port, function () {
    console.log('Server running at port %s', port);
});
