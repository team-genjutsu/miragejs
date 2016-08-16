'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const _ = require('lodash')

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const config = require('./webpack.config.js');

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

const connections = [];
const chatters = [];
let initialClientId;
let secondClientId;


app.use(express.static(__dirname));

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = https.createServer(options, app).listen(8000);

const io = require('socket.io').listen(server);


io.sockets.on('connection', function(socket) {
  connections.push(socket);
  //


  socket.once('disconnect', function() {
    let member = chatters.filter(chatter => chatter.id === socket.id);
    if (member) {
      chatters.splice(chatters.indexOf(member),1);
      io.sockets.emit('updateChatters', chatters);
    }
    connections.splice(connections.indexOf(socket), 1);
    socket.disconnect();
  })

  socket.on('initiator?', (payload) => {

      let chatter = {
        id: socket.id,
        initiator: false
      }
    if (chatters.filter(chatter => chatter.initiator === true).length === 0) {

        chatter.initiator = true;
      }
      chatters.push(chatter);

      io.to(socket.id).emit('initiated', chatter);

  });

  socket.on('initial', function(payload) {
    initialClientId = payload;
    io.sockets.emit('initialConnected', payload);
  });

  socket.on('second', function(payload) {
    io.to(socket.id).emit('secondPart2', initialClientId);
  });

  socket.on('third', function(payload) {
    secondClientId = payload;
    io.sockets.emit('thirdPart2', payload);
  });

})
