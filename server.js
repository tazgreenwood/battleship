var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('src'));

var games = [];

// WEBSOCKET STUFF
var t = false;
io.on('connection', function(socket) {
  console.log('a user connected');
  // console.log(socket.client);
  socket.emit('connected', { data: 'You are connected to the server', pID: socket.id });
  socket.on('looking', function(data) {
    console.log("Finding Match For", socket.id);
    matchmaking(socket);
  });

  socket.on('guess', function(data) {
    console.log("guess data:\n",data);
    // console.log("guess state:\n",games[data.gameID]);
    var game = games[data.gameID];
    if (data.pID === game.p1.id) {
      game.p2.emit('guess', { guess: data.cell });
    } else {
      game.p1.emit('guess', { guess: data.cell });
    }
  });

  socket.on('hit', function(data) {
    console.log("hit data:\n",data);
    // console.log("hit state:\n",games[data.gameID]);
    var game = games[data.gameID];
    if (data.pID !== game.p1.id) {
      console.log("p1 hit p2");
      game.p1.emit('hit');
      game.p2.emit('your turn');
      game.p1.emit('opp turn');
    } else {
      console.log("p2 hit p1");
      game.p2.emit('hit');
      game.p1.emit('your turn');
      game.p2.emit('opp turn');
    }
  });

  socket.on('miss', function(data) {
    console.log("miss data:\n",data);
    // console.log("miss state:\n",games[data.gameID]);
    var game = games[data.gameID];
    if (data.pID !== game.p1.id) {
      console.log("p1 miss p2");
      game.p1.emit('miss');
      game.p2.emit('your turn');
      game.p1.emit('opp turn');
    } else {
      console.log("p2 miss p1");
      game.p2.emit('miss');
      game.p1.emit('your turn');
      game.p2.emit('opp turn');
    }
  });

})

http.listen(3000, function() {
  console.log("server is listening on port", 3000);
});

function matchmaking(socket) {
  // search for open game to join
  var gameID = '';
  for (var i = 0; i < games.length; i++) {
    if (games[i].p2 === "") {
      games[i].p2 = socket;
      gameID = i;
      var p1 = games[i].p1;
      var p2 = games[i].p2;
      p1.emit('found', { gameID: i });
      p2.emit('found', { gameID: i });
      console.log("game joined");
      p1.emit('your turn');
      p2.emit('opp turn');
    }
  }
  // if no open games create one
  if (gameID === '') {
    games.push({p1: socket, p2: ''});
    gameID = games.length;
    console.log("new game created");
  }
}
