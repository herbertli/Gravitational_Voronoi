var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

http.listen(10000, function () {
  console.log("Webserver socket listening on 127.0.0.1:10000");
});

// ----------------------------------------------------------------------------

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// Set up the TCP server to communicate with the game server
const net = require('net');
const gameServer = net.createServer();
const PORT = 8080;
const HOST = '127.0.0.1';
gameServer.listen(PORT, HOST);
console.log(`Game server socket listening on ${HOST}:${PORT}`);

// All this server does is simply relay the information to the web client
let connectedClients = 0
gameServer.on('connection', sock => {
  if (connectedClients > 0) {
    console.log(`Only one game server can be connected at a time, refusing connection from ${sock.remoteAddress}:${sock.remotePort}`);
    return;
  }
  connectedClients++;
  console.log(`Game server connected from ${sock.remoteAddress}:${sock.remotePort}`);
  // Since this is a new client we reset the web interface
  io.sockets.emit('to_client', JSON.stringify({
    'reset': true
  }));

  // What to do when we get data
  sock.on('data', data => {
    io.sockets.emit('to_client', decoder.write(data));
  })

  sock.on('close', () => {
    connectedClients--;
    console.log(`Game server ${sock.remoteAddress}:${sock.remotePort} disconnected`);
  });
});