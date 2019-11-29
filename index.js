const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    "color": "#374054",
    "headType": "evil",
    "tailType": "bolt"
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  console.log(request.body);

  // Board information
  var width = request.body.board.width - 1;
  var height = request.body.board.height - 1;
  var head = request.body.you.body[0];
  var snakes = request.body.board.snakes;
  var food = request.body.board.food;

  // Directions
  var up = true;
  var down = true;
  var left = true;
  var right = true;

  // Future movement coordinates
  var moveUp = {
    x: head.x,
    y: head.y - 1
  }
  var moveDown = {
    x: head.x,
    y: head.y + 1
  }
  var moveLeft = {
    x: head.x - 1,
    y: head.y
  }
  var moveRight = {
    x: head.x + 1,
    y: head.y
  }

  // Keep snake from touching other snakes or eating itself
  for (s = 0; s < snakes.length; s++) {
    snakeBody = snakes[s].body;
    for (b = 0; b < snakeBody.length; b++) {
      if (moveUp.x == snakeBody[b].x && moveUp.y == snakeBody[b].y) {
        up = false;
      }
      if (moveDown.x == snakeBody[b].x && moveDown.y == snakeBody[b].y) {
        down = false;
      }
      if (moveLeft.x == snakeBody[b].x && moveLeft.y == snakeBody[b].y) {
        left = false;
      }
      if (moveRight.x == snakeBody[b].x && moveRight.y == snakeBody[b].y) {
        right = false;
      }
    }
  }

  // Keep snake on board
  if (head.y == 0) {
    up = false;
  }
  if (head.y == height) {
    down = false;
  }
  if (head.x == 0) {
    left = false;
  }
  if (head.x == width) {
    right = false;
  }

  // Store safe movements in array
  var directions = [];

  // Check for food directly next to snake's head
  for (f = 0; f < food.length; f++) {
    if (moveUp.x == food[f].x && moveUp.y == food[f].y) {
      up = 'food';
    }
    if (moveDown.x == food[f].x && moveDown.y == food[f].y) {
      down = 'food';
    }
    if (moveLeft.x == food[f].x && moveLeft.y == food[f].y) {
      left = 'food';
    }
    if (moveRight.x == food[f].x && moveRight.y == food[f].y) {
      right = 'food';
    }
  }

  // Sophisticated decision chooser
  function sophisticated(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }

  // Go for the food first else use sophisticated logic
  if (up == 'food') {
    directions.push('up');
  } else if (down == 'food') {
    directions.push('down');
  } else if (left == 'food') {
    directions.push('left');
  } else if (right == 'food') {
    directions.push('right');
  } else {
    if (up) {
      directions.push('up');
    }
    if (down) {
      directions.push('down');
    }
    if (left) {
      directions.push('left');
    }
    if (right) {
      directions.push('right');
    }

    sophisticated(directions);
  }

  // Response data
  const data = {
    move: directions[0], // one of: ['up','down','left','right']
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
