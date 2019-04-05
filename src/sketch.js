var myboard = new Array(100).fill(0); 
var enemyboard = new Array(100).fill(0); 
var CELL_SIZE = 50;
var ships = [5,4,3,3,2];
var status = "setup";
var ship = "carrier";
var playing = false;
var b1xoffset = 100;
var b1yoffset = 100;
var gameID = '';
var pID = '';
var lastGuess = 0;

var socket = io('http://localhost:3000');

// RECIEVE COMMUNICATION FROM SERVER
function checkForMsg() {
  socket.on('connected', function(data) {
    console.log(data);
    pID = data.pID;
  });
  socket.on('found', function(data) {
    console.log(data);
    status = 'found';
    gameID = data.gameID;
  });
  socket.on('your turn', function(data) {
    status = 'myturn';
  })
  socket.on('opp turn', function(data) {
    status = 'oppturn';
  })
  socket.on('guess', function(data) {
    checkGuess(data.guess);
  })
  socket.on('hit', function(data) {
    enemyboard[lastGuess] = 2;
  })
  socket.on('miss', function(data) {
    enemyboard[lastGuess] = 3;
  })
}

function setup() {
  createCanvas(1500, 800);
}

function draw() {
  checkForMsg();
  background('black');
  if (status === 'setup' || status === 'addingships') drawBoard(myboard, b1xoffset, b1yoffset);
  if (status === 'setup') gameMessage("Click spaces to add a ship");
  if (status === 'addingships' && ship === 'carrier') gameMessage("Add Carrier - 5 spaces");
  if (status === 'addingships' && ship === 'battleship') gameMessage("Add Battleship - 4 spaces");
  if (status === 'addingships' && ship === 'cruiser') gameMessage("Add Cruiser - 3 spaces");
  if (status === 'addingships' && ship === 'submarine') gameMessage("Add Submarine - 3 spaces");
  if (status === 'addingships' && ship === 'destroyer') gameMessage("Add Destroyer - 2 spaces");
  if (playing) {
    dupBoard();
    fill('white');
    textSize(32);
    text("My Board", 750, 650)
    text("Enemy Board", 100, 650);
    drawBoard(enemyboard, 100, 100);
  }
  if (status === 'findenemy') {
    gameMessage("Looking for an opponent...");
    socket.emit('looking', { my: 'data' });
    status = 'finding';
  }
  if (status === 'finding') {
    gameMessage("Looking for an opponent...");
  }
  if (status === 'found') {
    gameMessage("We've found a match for you!");
  }
  if (status === 'myturn') {
    gameMessage("It's your turn...");
  }
  if (status === 'oppturn') {
    gameMessage("Waiting for your opponent...");
  }
}

function mouseClicked() {
  if (status === 'setup') {
    status = 'addingships';
  }
  else if (status === 'addingships') {
    var cell = Number(String(Math.floor((mouseY - b1xoffset)/CELL_SIZE)) + String(Math.floor((mouseX - b1yoffset)/CELL_SIZE)));
    if (cell >= 0 && cell < 100) {
      if (ship === 'carrier') addCarrier(cell); 
      if (ship === 'battleship') addBattleship(cell);
      if (ship === 'cruiser') addCruiser(cell);
      if (ship === 'submarine') addSubmarine(cell);
      if (ship === 'destroyer') addDestroyer(cell);
    }
  }
  else if (status === 'myturn') {
    var cell = Number(String(Math.floor((mouseY - b1xoffset)/CELL_SIZE)) + String(Math.floor((mouseX - b1yoffset)/CELL_SIZE)));
    if (cell >= 0 && cell < 100) {
      lastGuess = cell;
      socket.emit('guess', { cell: cell, pID: pID, gameID: gameID });
    }
  }
}

function checkGuess(guess) {
  if (myboard[guess] === 1) {
    // HIT
    socket.emit('hit', { pID: pID, gameID: gameID });
    myboard[guess] = 2;
  }
  if (myboard[guess] === 0) {
    // MISS
    socket.emit('miss', { pID: pID, gameID: gameID });
    myboard[guess] = 3;
  }
}

function dupBoard() {
  drawBoard(myboard, 750, 100);
}

function drawBoard(board, offsetx, offsety) {
  for (var i = 0; i < board.length; i++) {
    if (board[i] === 0) fill('navy');
    if (board[i] === 1) fill('gray');
    if (board[i] === 2) fill('red');
    if (board[i] === 3) fill('black');
    stroke('white');
    rect(Math.floor(i%10) * CELL_SIZE + offsetx, Math.floor(i/10) * CELL_SIZE + offsety, CELL_SIZE, CELL_SIZE);
    // fill('white');
    // textSize(16);
    // text(i, Math.floor(i%10) * CELL_SIZE + offsetx + 20, Math.floor(i/10) * CELL_SIZE + offsety + 30);
  }
}

function gameMessage(msg) {
  textSize(32);
  fill('white');
  text(msg, 100, 75);
}

function addCarrier(cell) {
  if (ships[0] > 0) {
    myboard[cell] = 1;
    ships[0]--;
  } else {
    ship = 'battleship'
  }
}

function addBattleship(cell) {
  if (ships[1] > 0) {
    myboard[cell] = 1;
    ships[1]--;
  } else {
    ship = 'cruiser';
  }
}

function addCruiser(cell) {
  if (ships[2] > 0) {
    myboard[cell] = 1;
    ships[2]--;
  } else {
    ship = 'submarine';
  }
}

function addSubmarine(cell) {
  if (ships[3] > 0) {
    myboard[cell] = 1;
    ships[3]--;
  } else {
    ship = 'destroyer';
  }
}

function addDestroyer(cell) {
  if (ships[4] > 0) {
    myboard[cell] = 1;
    ships[4]--;
  } else {
    ship = '';
    status = "findenemy";
    playing = true;
  }
}