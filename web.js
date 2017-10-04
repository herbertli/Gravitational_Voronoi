var http = require('http');
var fs = require('fs');
net = require('net');

var webserver = http.createServer(function (request, response)
{
  fs.readFile('index.html', 'utf-8', function (error, data)
  {
    response.writeHead(200, {'Content-Type': 'text/html'})
    response.end(data);
  });
}).listen(10000);

var io = require('socket.io')(webserver);

// ----------------------------------------------------------------------------

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

function euclideanDistance(x1, y1, x2, y2)
{
  var distance = ((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1));
  return distance;
}

var numberOfPlayers = parseInt(process.argv[2]);
console.log(numberOfPlayers);

// Setting up the pull on each pixel by each of the player's stones
var pull  = [];
var outer = [];
var inner = [];
for(var i = 0 ; i < numberOfPlayers ; i++)
{
    outer = [];
    for(var j = 0 ; j < 1000 ; j++)
    {
      inner = [];
      for(var k = 0 ; k < 1000 ; k++)
      {
        inner.push(0.00000000000);
      }
      outer.push(inner);
    }
    pull.push(outer);
}

// Setting up the pixels owned by the players with the higher pull
var scoreGrid = []
for(var i = 0 ; i < 1000 ; i++)
{
  var inner = [];
  for(var j = 0 ; j < 1000 ; j++)
  {
    inner.push(0);
  }
  scoreGrid.push(inner);
}

server.bind(8080, '');

server.on('error', function(err){
  console.log('server error:\n${err.stack}');
  server.close();
});



server.on('message', function(msg, rinfo){

  msg = decoder.write(msg);
  var message = msg.split(" ");
  var i = parseInt(message[0]);
  var j = parseInt(message[1]);
  var currentTurn = parseInt(message[2]) - 1;

  for(var x = 0 ; x < 1000 ; x++)
  {
    for(var y = 0 ; y < 1000 ; y++)
    {
      if(x == i && y == j)
      {
        continue;
      }

      var Di = euclideanDistance(x, y, i, j);
      pull[currentTurn][x][y] += (1 / (Di * Di));


      var oldPlayer = scoreGrid[x][y];
      if(oldPlayer == 0)
      {
        scoreGrid[x][y] = currentTurn + 1;
      }
      else
      {
        if(pull[currentTurn][x][y] > pull[oldPlayer - 1][x][y] && oldPlayer - 1 != currentTurn)
        {
          scoreGrid[x][y] = currentTurn + 1;
        }
      }
    }
  }

  var board = "";
  for(var x = 0 ; x < 1000 ; x++)
  {
    for(var y = 0 ; y < 1000 ; y++)
    {
      board = board + scoreGrid[x][y].toString() + " ";
    }
  }

  var player = currentTurn + 1;
  board = board + numberOfPlayers.toString() + " ";
  board = board + (player).toString() + " ";
  board = board + i.toString() + " ";
  board = board + j.toString();

  io.sockets.emit('to_client', board);
});

server.on('listening', function(){
  var address = server.address();
  console.log('server listening');
});
