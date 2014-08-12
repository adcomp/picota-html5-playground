var WebSocketServer = require('websocket').server;
var http = require('http');

// list of currently connected clients (users)
var clients = [ ];

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(8888, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
      for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(message.utf8Data);
      }
    }
  });

  connection.on('close', function(connection) {
    // close user connection
    // remove user from the list of connected clients
    clients.splice(index, 1);
  });
});

