'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const path = require('path');
const startSockets = require('./sockLogic.js');

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let httpPort = process.env.PORT || 8000;
<<<<<<< HEAD
let port = process.env.PORT || 1337;

// let server = http.createServer(app).listen(httpPort, function(){
//   console.log('Listening on ' + httpPort);
// });
=======
// let httpsPort = process.env.PORT || 1337;

let server = http.createServer(app).listen(httpPort, function(){
  console.log('Listening on ' + httpPort);
});
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51

const options = {
  key: fs.readFileSync(__dirname + '/server_cert/server.key'),
  cert: fs.readFileSync(__dirname + '/server_cert/server.crt')
};


<<<<<<< HEAD
const server = https.createServer(options, app).listen(port, function(){
  console.log('Listening on ' + port);
});

// redirects all incoming requests from http protocol to https equivalent
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http') {
    res.redirect('https://' + req.hostname + req.url);
  } else {
    next();
  }
});
=======
// const server = https.createServer(options, app).listen(port, function(){
  // console.log('Listening on ' + port)
// });

// redirects all incoming requests from http protocol to https equivalent
// app.use((req, res, next) => {
  // if (req.headers['x-forwarded-proto'] === 'http') {
    // res.redirect('https://' + req.hostname + req.url);
  // } else {
    // next();
  // }
// });
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname,'public','favicon.ico')));


// let httpsServer = https.createServer(options, app).listen(httpsPort, function(){
<<<<<<< HEAD
//   console.log('Also listening on ' + httpsPort);
=======
  // console.log('Also listening on ' + httpsPort);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
// });

startSockets(server);
