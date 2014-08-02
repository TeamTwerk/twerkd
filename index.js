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
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
