var WebSocketServer = require('ws').Server;
var express = require('express');
//var fs = require('fs');
var util = require('util');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var events = require('events');
var ansi = require('ansi');
var cursor = ansi(process.stdout);


cursor.eraseData(2).goto(1, 1);
app.use(express.static(path.join(__dirname, '/public')));

var clientId = 0;
var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
  var thisId = ++clientId;
  //cursor.goto(1, 4 + thisId).eraseLine();
  console.log('Client #%d connected', thisId);

  var messageData = null;
  ws.on('message', function (data) {
    if (typeof data === 'string') {
      messageData = JSON.parse(data);
      console.log("message: ", messageData);
    } else {
      console.log("message ignored: ", data);
    }
  });

  ws.on('close', function () {
    //cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d disconnected.', thisId);
  });

  ws.on('error', function (e) {
    cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d error: %s', thisId, e.message);
  });
});

console.log('Welcome to the Objectivity/Bitcoin query server.');
server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});
