'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const config = require('./webpack.config.js');

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
app.use(webpackHotMiddleware(compiler));

let connections = [];
let initialClientId;
let secondClientId;


app.use(express.static(__dirname));

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

// app.get('/', function(req, res) {
  // var filename = __dirname + '/index.html';

    // This line opens the file as a readable stream
    // var readStream = fs.createReadStream(filename);

    // This will wait until we know the readable stream is actually valid before piping
    // readStream.on('open', function() {
        // This just pipes the read stream to the response object (which goes to the client)
        // readStream.pipe(res);
    // });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    // readStream.on('error', function(err) {
        // res.end(err);
    // });

    // res.writeHead(200);

// });

const server = https.createServer(options, app).listen(8000);

const io = require('socket.io').listen(server);


io.sockets.on('connection', function(socket) {
  connections.push(socket);
  //
  // socket.or

  socket.on('initial', function(payload) {
    initialClientId = payload;
    io.sockets.emit('initalConnected', payload);
  });

  socket.on('second', function(payload) {
    this.emit('secondPart2', initialClientId);
  });

  socket.on('third', function(payload) {
    secondClientId = payload;
    io.sockets.emit('thirdPart2', payload);
  });

})
