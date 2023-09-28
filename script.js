const startButton = document.getElementById("start-button");
const currentTime = document.getElementById("time");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const gameOverArea = document.getElementById("game-over-area");
const gameOverText = document.getElementById("game-over-text");
const finishTime = document.getElementById("finish-time");
const highestTime = document.getElementById("highest-score");
const restartButton = document.getElementById("restart-button");

const dinosaurUpImg = new Image();
dinosaurUpImg.src = "dinosaur_up.png";
const dinosaurDownImg = new Image();
dinosaurDownImg.src = "dinosaur_down.png"

const DINOSAUR_WIDTH = 60;
const DINOSAUR_HEIGHT = 80;

let dinosaur = {
  x: 10,
  y: canvas.height - DINOSAUR_HEIGHT,
  width: DINOSAUR_WIDTH,
  height: DINOSAUR_HEIGHT,
  background: dinosaurUpImg
};

const OBSTACLE_DIM = 50;

let obstacle = {
  x: canvas.width,
  y: canvas.height - OBSTACLE_DIM,
  width: Math.floor(OBSTACLE_DIM / 2),
  height: OBSTACLE_DIM,
  color: "#ccc",
  dx: 2,
};

let obstacles = [];
let isGameOver = false;

// I use this function to reload the game when the restart game button is clicked and to display the highest score
const restartGame = () => {
  location.reload();
  score = 0;
  updateScoreDisplay();
};

// This function I get the highest score from localStorage and convert to an integer
const getHighestScore = () => {
  const highestScore = localStorage.getItem("highestScore");
  return highestScore ? parseInt(highestScore) : 0;
}

// With this function I save the highest score in localStorage
const saveHighestScore = (score) => {
  localStorage.setItem("highestScore", score);
}

// I use this function to update the score display element with the highest score
const highestScore = getHighestScore();

const updateScoreDisplay = () => {
  highestTime.innerHTML = `Highest Score: ${highestScore}`;
}

// I used this function to check if the current score is higher than the highest score, to stop the game and time and to show the text Game Over, 
// the score and the highest score.
const gameOver = () => { 
  const highestScore = getHighestScore();
  if (score > highestScore) {
    saveHighestScore(score);
  }
  isGameOver = true;
  clearInterval(intervalID);
  gameOverArea.style.display = "block";
  gameOverText.innerHTML = "Game Over!";
  clearInterval(stopGame);
  currentTime.style.display = "none";
  finishTime.innerHTML = `Score: ${score}`;
  updateScoreDisplay();
};

// In this function I draw the dinosaur in the canvas.
const drawDinosaur = () => {
  context.drawImage(dinosaur.background, dinosaur.x, dinosaur.y, dinosaur.width, dinosaur.height);
};

// In this function I draw the obstacles in the canvas.
const drawObstacles = () => {
  for (let i = 0; i < obstacles.length; i++) {
    context.fillStyle = obstacles[i].color;
    context.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
  }
};

// In this function I acces all the function were I draw objects.
const drawElemCanvas = () => {
  drawDinosaur();
  drawObstacles();
};

// In this function I redraw the obstacle and when is out the canvas I remove the obstacle.
const updateObstacles = () => {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= obstacles[i].dx;
  }
};

// With this function I acces function gameOver when the dinosaur hit an obstacle.
const avoidObstacles = () => {
  for (let i = 0; i < obstacles.length; i++) {
    if (
      obstacles[i].x < dinosaur.x + (Math.floor(dinosaur.width / 2)) &&
      obstacles[i].x + obstacles[i].width > dinosaur.x &&
      obstacles[i].y < dinosaur.y + dinosaur.height &&
      obstacles[i].y + obstacles[i].height > dinosaur.y
    ) {
      gameOver();
    }
  }
};

// This is a loop function where I acces the functions I will need and I clear the canvas after every move.
const gameLoop = () => {
  if (isGameOver) {
    return;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawElemCanvas();
  updateObstacles();
  avoidObstacles();
};

// With this function every new obstacle created I put it into the array named obstacles.
const createObstacles = () => {
  obstacles.push({...obstacle});
};

// With this function I create an obstacle at the random time interval and when the score is more then 50 create the obstacles in the air. 
const createObstacleWithRandomInterval = () => {
  if (isGameOver) {
    return;
  }
  let randomInterval = Math.floor(Math.random() * 1000) + 900;
  let oldY = canvas.height - OBSTACLE_DIM;
  let newY = canvas.height - ( 2 * DINOSAUR_WIDTH );
  if (score > 50) {
    obstacle.y = Math.random() < 0.5 ? oldY : newY;
  }
  setTimeout(() => {
    createObstacles();
    createObstacleWithRandomInterval();
  }, randomInterval);
}

let intervalID;
let score = 0;
let gameSpeed = 8;

// this function is to make the time increase and also when the time is divisible by 100, to increase the speed of the game and to display the time.
const increaseTime = () => {
  ++score;
  if (score % 100 === 0 && gameSpeed !== 5) {
    clearInterval(stopGame);
    gameSpeed -= 1;
    stopGame = setInterval(gameLoop, gameSpeed);
  }
  if (gameSpeed === 5){
    clearInterval(stopGame);
    gameSpeed = 5;
    stopGame = setInterval(gameLoop, gameSpeed);
  }
  currentTime.innerHTML = `Score: ${score}`;
};

let stopGame;

// The startGame function makes the start button disappear, the game board appear, starts the timer with function increaseTime,
// starts creating obstacles with function createObstacles and acces game loop function at a setted time.
const startGame = () => {
  startButton.style.display = "none";
  canvas.classList.remove("hide-canvas");
  highestTime.innerHTML = `Highest Score: ${highestScore}`;
  intervalID = setInterval(increaseTime, 100);
  createObstacleWithRandomInterval();
  stopGame = setInterval(gameLoop, gameSpeed);
};

// This function is to set position and image when the dinosaur is down
const dinosaurDown = () => {
  dinosaur.y = canvas.height - DINOSAUR_WIDTH;
  dinosaur.width = DINOSAUR_HEIGHT;
  dinosaur.height = DINOSAUR_WIDTH;
  dinosaur.background = dinosaurDownImg;
};

// This function is to set position and image when the dinosaur is up
const dinosaurUp = () => {
  dinosaur.y = canvas.height - DINOSAUR_HEIGHT;
  dinosaur.width = DINOSAUR_WIDTH;
  dinosaur.height = DINOSAUR_HEIGHT;
  dinosaur.background = dinosaurUpImg;
};

let limit = canvas.height - Math.floor(2.5 * DINOSAUR_HEIGHT);
let goingDown = false;
let isDown = true;
let jumpSpeed = 8; // higher = faster
let jumping;

// With this function I will make the dinosaur to jump over obstacles
const dinosaurJump = () => {
  if (dinosaur.y > limit && !goingDown) {
    dinosaur.y -= jumpSpeed;
  } else {
    goingDown = true;
    if (dinosaur.y >= canvas.height - DINOSAUR_HEIGHT) {
      clearInterval(jumping);
      goingDown = false;
      isDown = true;
      return;
    }
    dinosaur.y += jumpSpeed;
  }
};

let isKeyPressed = false;

// In this function I set the dinosaur to jump when I press arrow up or the spacebar on the keybord and bend down when I press arrow down on the keyboard.
const onKeyDown = (event) => {
  if (isKeyPressed) return;
  if ((event.key === "ArrowUp" || event.key === " ") && isDown) {
    isDown = false;
    jumping = setInterval(dinosaurJump, 30);
  }
  if (event.key === "ArrowDown") dinosaurDown();
  isKeyPressed = true;
};

// With this function I set the dinosaur bend down until I release the key.
const onKeyUp = (event) => {
  isKeyPressed = false;
  if (event.key === "ArrowDown") {
    dinosaurUp();
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
