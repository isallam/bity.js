var WebSocketServer = require('ws').Server;
var express = require('express');
//var fs = require('fs');
var util = require('util');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var events = require('events');
//var ansi = require('ansi');
//var cursor = ansi(process.stdout);
var objyAccess  = require('bindings')('objyaccess');

// make sure we have a valid path to the bootfile passed as an argument
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " <bootfile_path>");
    process.exit(-1);
}
 
var bootfile_path = process.argv[2];
 
console.log('using BootFile: ' + bootfile_path);

var doAccess = new objyAccess.ObjyAccess(bootfile_path);

console.log('querying FD: ', doAccess.connection()); 

doAccess.query("From Block return count(*)", function(msg) {
  console.log(msg);
})


//cursor.eraseData(2).goto(1, 1);
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
      var qType       = messageData['qType'];
      var qContext    = messageData['qContext'];
      var maxResult   = messageData['maxResult']
      var count = 0;
      if (qType == 'DOQuery') {
        var doStatement = messageData['doStatement']
        doAccess.query(doStatement, Number(maxResult), function(res) {
          var objectAsJson = JSON.parse(res)
          //console.log('result: ', objectAsJson)
          if (objectAsJson.__class__ !== '_Projection')
          { // normal class data so we need to collapsed the arrays to just a number
            for (var attr in objectAsJson)
            {
      //        console.log('prop: ', attr)
              if (objectAsJson[attr] instanceof Array) {
                objectAsJson[attr] = objectAsJson[attr].length
              }
            }
          }
          ws.send(JSON.stringify({qType: qType, context: qContext, 
            data: objectAsJson, moreResults: true}));
          count++;
        })
      } else if (qType == 'GetEdges') {
        var objRef = messageData['objRef']
        doAccess.getEdges(objRef, Number(maxResult), function(res) {
          //console.log('result: ', res)
          ws.send(JSON.stringify({qType: qType, context: qContext, 
            data: JSON.parse(res), moreResults: true}))
          count++
        })
      } else if (qType == 'DOUpdate') {
        var doStatement = messageData['doStatement']
        doAccess.update(doStatement, function(res) {
          console.log('result: ', res)
          ws.send(JSON.stringify({qType: qType, context: qContext, 
            data: JSON.parse(res), moreResults: true}));
          count++;
        })
      } else if (qType == 'GetData') {
        var oidListStr = messageData['oids'] // oids are passed as "oid1 oid2...."
        doAccess.getData(oidListStr, function(res) {
          var objectAsJson = JSON.parse(res)
          for (var attr in objectAsJson)
          {
            if (objectAsJson[attr] instanceof Array) {
              objectAsJson[attr] = objectAsJson[attr].length
            }
          }
          console.log('processed res: ', objectAsJson)
          ws.send(JSON.stringify({qType: qType, context: qContext, 
            data: objectAsJson, moreResults: true}))
          count++
        })
      } 
      ws.send(JSON.stringify({qType: qType, context: qContext, data: null, moreResults: false}));
    } else {
      console.log("message ignored: ", data);
    }
  });

  ws.on('close', function () {
    //cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d disconnected.', thisId);
  });

  ws.on('error', function (e) {
    //cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d error: %s', thisId, e.message);
  });
});

console.log('Welcome to the Objectivity/Bitcoin query server.');
server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});

//---------------
// REST stuff
//---------------

// Create the express router object for object details
var objyRouter = express.Router();

objyRouter.get('/', function(req, res) {
  console.log('get a REST call: ', req.params)
})

//GET /objyget/do:oid — Retrieve an object using OID
objyRouter.get('/oid/:oid', function(req, res) { 
  // get the OID param from the request object
  var oid = req.params.oid;
  console.log('req.params: ', req.params)
  
  if (oid != null) {
    doAccess.getObject(oid, function(qRes) {
      var objectAsJson = JSON.parse(qRes)
      for (var attr in objectAsJson)
      {
//        console.log('prop: ', attr)
        if (objectAsJson[attr] instanceof Array) {
          objectAsJson[attr] = objectAsJson[attr].length
        }
      }
      console.log('processed res: ', objectAsJson)
      res.json(objectAsJson)
    })
  }
  else {
    console.error(err);
    res.statusCode = 500;
    return res.json({ errors: ['Could not find object with OID: ' + oid] });
  }
    
  // send results
  res.end();
});

//GET /objyget/do:oid — Retrieve an object data using DO
//objyRouter.get('/do/:qString', function(req, res) { 
//  // get the OID param from the request object
//  var qString = req.params.qString;
//  console.log('req.params: ', req.params)
//  
//  if (qString != null) {
//    doAccess.query(qString, function(qRes) {
//      console.log('result: ', qRes)
//      var objectAsJson = JSON.parse(qRes)
//      res.json(objectAsJson)
//      count++;
//    })
//  }
//  else {
//    console.error(err);
//    res.statusCode = 500;
//    return res.json({ errors: ['Could not execute: ' + qString] });
//  }
//    
//  // send results
//  res.end();
//});

// Attach the routers for their respective paths
app.use('/objyget', objyRouter);

