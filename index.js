var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('lodash');
var shortId = require('shortid');

var roomIdToSockets = {};
var socketsToRoomId = {};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));

server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client/index.html');
});

io.on('connection', function (socket) {
  /*var t = 0;
  setInterval(function() {
    var randomTpm = Math.random() * 128;
    t += (randomTpm/60)
    socket.emit('data', {m: 'twerk', c: { tpm: randomTpm, t: t } });
  }, 1000);*/
  socket.on('join', function (data) {
    console.log('JOIN');
    console.log(data);
    if (data.c.spectator !== undefined) {
      socket.spectator = data.c.spectator;
    }
      joinRoom(socket, data.c.roomId);
  });
  socket.on('leave', function (data) {
    console.log('LEAVE');
    console.log(data);
    leaveRoom(socket, data.c.roomId);
  });
  socket.on('data', function (data) {
    console.log('DATA');
    console.log(data);
    socket.emit('data', data);
    if (data.m === "getRooms") socket.emit('data', {m: "rooms", c: { rooms: _.keys(roomIdToSockets)} });
    if (data.c !== undefined) {
      if (data.c.roomId !== undefined) {
        switch(data.m) {
          case "ready":
            socket.isReady = true;
            data.c.id = socket.id;
            socket.broadcast.to(data.c.roomId).emit('data', data);
            if(checkReadyStatus(data.c.roomId)) {
              console.log("READY READY READY READY");
              io.to(data.c.roomId).emit('data', {m: 'startMatch', c: { countdown: 5, duration: 120 } });
            }
            break;
          case "unready":
            socket.isReady = false;
            socket.broadcast.to(data.c.roomId).emit('data', data);
            break;
          case "twerk":
            data.c.id = socket.id;
            socket.broadcast.to(data.c.roomId).emit('data', data);
            break;
        }
      }
    }
  });
  socket.on('matchmaking', function (data) {
    console.log('MATCHMAKING');
    console.log(data);
    switch (data.m) {
      case "join":
        socket.name = data.c.name;
        joinMatchmaking(socket, data);
        break;
      case "leave":
        leaveMatchmaking(socket, data);
        break;
    }
  });
  socket.on('disconnect', function () {
    var rooms = socketsToRoomId[socket.id];
    if (_.isArray(rooms)) {
      rooms.forEach(function (room) {
        leaveRoom(socket, room);
      });
    }
  });
});

function checkReadyStatus(roomId) {
  var sockets = getSocketsInRoom(roomId);
  var returnVal = false;
  if (sockets !== undefined) {
    if (sockets.length > 1) {
      returnVal = true;
    }
    sockets.forEach(function (s) {
      if (!s.isReady && (!s.spectator || s.spectator === undefined)) {
        returnVal = false;
      }
    });
  }
  return returnVal;
}

setInterval(function () {
  matchmake();
}, 1000);

function matchmake() {
  var pair = findPair();
  if (pair) {
      var randomRoomId = shortId.generate();
      var player1 = pair[0];
      var player2 = pair[1];
      joinRoom(player1, randomRoomId);
      joinRoom(player2, randomRoomId);
      player1.emit('matchmaking', {m: 'joinRoom', c:{roomId: randomRoomId, opponent: player2.id}})
      player2.emit('matchmaking', {m: 'joinRoom', c:{roomId: randomRoomId, opponent: player1.id}});
      leaveRoom(player1, 'lobby');
      leaveRoom(player2, 'lobby');
    }
}

function joinMatchmaking(socket, data) {
  joinRoom(socket, 'lobby');
}

function leaveMatchmaking(socket, data) {
  leaveRoom(socket, 'lobby');
}

function findPair() {
  var pool = getSocketsInRoom('lobby');

  pool = _.shuffle(pool);

  return pool.length > 1 ? [pool[0], pool[1]] : false;
}

function joinRoom(socket, roomId) {
  socket.join(roomId);
  if (_.isArray(roomIdToSockets[roomId])) {
    roomIdToSockets[roomId].push(socket);
  } else {
    roomIdToSockets[roomId] = [socket];
  }
  if (_.isArray(socketsToRoomId[socket.id])) {
    socketsToRoomId[socket.id].push(roomId);
  } else {
    socketsToRoomId[socket.id] = [roomId];
  }
  var roomSockets = getSocketsInRoom(roomId);
  var roomSocketObjs = _.map(roomSockets, function (s) {
    return {id: s.id, spectator: s.spectator ? s.spectator : false, uuid: socket.uuid ? socket.uuid : null, name: socket.name};
  });
  io.to(roomId).emit('data', {m: 'updateRoom', c:{ users: roomSocketObjs }});
}

function leaveRoom(socket, roomId) {
  socket.leave(roomId);
  _.pull(roomIdToSockets[roomId], socket);
  _.pull(socketsToRoomId[socket.id], roomId);
  var roomSockets = getSocketsInRoom(roomId);
  var roomSocketIds = _.map(roomSockets, function (s) {
    return s.id;
  });
  socket.to(roomId).emit('data', {m: 'updateRoom', c:{ users: roomSocketIds }});
}

function getSocketsInRoom(roomId) {
  return roomIdToSockets[roomId];
}
