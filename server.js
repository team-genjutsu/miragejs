'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

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

https.createServer(options, app).listen(8000, function() {
    console.log('Listening on port 8000');
});


