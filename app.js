"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Nathan-Game';

/** Requires **/
var webSocketServer = require('websocket').server,
		expr = require("express"),
		xpress = expr(),
		server = require('http').createServer(xpress);

// Configure express
xpress.configure(function() {
     xpress.use(expr.static(__dirname + "/public"));
     xpress.set("view options", {layout: false});
});

// Handle GET requests to root directory
xpress.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/Bilge.html');
});

// WebSocket Server
var wsServer = new webSocketServer({
    httpServer: server
});

var pport = process.env.PORT || 5000;

// Set up the http server
server.listen(pport, function(err) {
});


console.log("--------------");
console.log("I'm here at!!!! " + pport);
console.log("--------------");

