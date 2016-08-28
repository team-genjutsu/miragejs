'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const _ = require('lodash');
const favicon = require('serve-favicon');
const path = require('path');
const startSockets = require('./sockLogic.js');

// app.use(express.static(__dirname + "/public"));

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 8000;

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = https.createServer(options, app).listen(port, function(){
  console.log('Listening on ' + port)
});

app.use('/', express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname,'public','favicon.ico')));

startSockets(server);

// })
