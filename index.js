var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ioredis = require('socket.io-redis');
var _ = require('lodash');
var shortId = require('shortid');

server.listen(3000);
io.adapter(ioredis({host: 'localhost', port: 6379}));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client/index.html');
});

io.on('connection', function (socket) {
  socket.emit('data', {m: 'Patrick Stuff', c: { tpm: 12 } });
  socket.on('join', function (data) {
    joinRoom(socket, data.roomId);
  });
  socket.on('leave', function (data) {
    leaveRoom(socket, data.roomId);
  });
  socket.on('data', function (data) {
    socket.broadcast.to(data.c.roomId).emit('data', {m: 'twerk', c: data.c.twerk});
  });
  socket.on('matchmaking', function (data) {
    switch (data.m) {
      case "join":
        joinMatchmaking(socket, data);
        break;
      case "leave":
        leaveMatchmaking(socket, data);
        break;
      case "start":
        startGame(socket, data);
        break;
      case "end":
        endGame(socket, data);
        break;
    }
  });
});

function startGame(socket, data) {
  var opponent = findOpponent(socket, data);
  var randomRoomId = shortId.generate();
  if (opponent) {
      joinRoom(opponent, randomRoomId);
      joinRoom(socket, randomRoomId);
      socket.emit('matchmaking', {m: 'joinRoom', c: {roomId: randomRoomId, opponent: opponent.id}});
      leaveRoom(opponentPool[0], 'lobby');
    } else {
      socket.emit('error', {code: 404, msg: "Could not find opponent"})
    }
    leaveRoom(socket, 'lobby');
}

function endGame(socket, data) {
  joinRoom(socket, 'lobby');
}

function joinMatchmaking(socket, data) {
  joinRoom(socket, 'lobby');
}

function leaveMatchmaking(socket, data) {
  leaveRoom(socket, 'lobby');
}

function findOpponent(socket, data) {
  joinRoom(socket, 'lobby');

  var opponentPool = getSocketsInRoom('lobby');

  _.pull(opponentPool, socket);

  opponentPool = _.shuffle(opponentPool);

  return opponentPool.length > 0 ? opponentPool[0] : false;
}

function joinRoom(socket, roomId) {
  socket.join(roomId);
  var roomSockets = getSocketsInRoom(roomId);
  var roomSocketIds = _.map(roomSockets, function (s) {
    return s.id;
  });
  socket.to(roomId).emit('room', {m: 'updateRoom', c:{ users: roomSocketIds }});
}

function leaveRoom(socket, roomId) {
  socket.leave(roomId);
  var roomSockets = getSocketsInRoom(roomId);
  var roomSocketIds = _.map(roomSockets, function (s) {
    return s.id;
  });
  socket.to(roomId).emit('room', {m: 'updateRoom', c:{ users: roomSocketIds }});
}

function getSocketsInRoom(roomId) {
  var roomSockets = [];

  io.sockets.sockets.forEach(function (s) {
    s.rooms.forEach(function (id) {
        if (id === roomId) {
          roomSockets.push(s);
        }
    });
  });

  return roomSockets;
}
