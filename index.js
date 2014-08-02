var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioredis = require('socket.io-redis');

server.listen(3000);
io.adapter(ioredis({host: 'localhost', port: 6379}));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client/index.html');
});

io.on('connection', function (socket) {
  socket.join('lobby');
  for (var i = 0; i < io.sockets.length; i++) {
    console.log(io.sockets[i].rooms)
    console.log("----------");
  }
  /*for (s in io.sockets) {
    console.log(s);
    console.log("test");
  }*/
  //console.log(io.sockets);
  socket.on('join', function (data) {
    socket.join(data.roomid);
  });
  socket.on('leave', function (data) {
    socket.leave(data.roomid);
  });
  socket.on('data', function (data) {

  });
  socket.on('matchmaking', findOpponent);
});

function findOpponent(data) {
  socket.join('lobby');

}
