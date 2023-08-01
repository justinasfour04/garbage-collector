import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/stylesheet/index.css';

import { ImageCache } from './imageCache';
import { GameState } from './gameState';
import { GarbageCan } from './garbageCan';
import { Lives } from './lives';
import { ObjectFactory } from './obstacleFactory';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
(ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;
canvas.width = window.innerWidth < 1000 ? window.innerWidth / 1.1 : window.innerWidth / 2;
canvas.height = window.innerHeight / 1.05;

let gameState: GameState;
let garbageBag: GarbageCan;
let obstacleFactory: ObjectFactory;
let lives: Lives;

let then: number;
let elapsed: number;

async function saveHighscore() {
  const highscore = Math.max(gameState.score, gameState.highscore);
  localStorage.setItem('highscore', highscore.toString(10));
}

function update(secondsPassed: number = 1) {
  obstacleFactory.update(secondsPassed);
  obstacleFactory.deleteObjectOffScreen();
}

async function draw() {
  if (ctx !== null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(ImageCache.getBackground(gameState.backgroundKey), 0, 0);
    garbageBag.draw();
    obstacleFactory.draw();
    lives.draw(garbageBag.lives);
  }
}

function drawGameScreen() {
  const container = document.getElementById('app');
  if (container !== null) {
    container.innerHTML = '';

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score';
    scoreDiv.style.width = canvas.width.toString(10);

    const scoreText = document.createElement('p');
    scoreText.className = 'scoreText';
    scoreText.id = '_score';

    const highscoreText = document.createElement('p');
    highscoreText.className = 'scoreText';
    highscoreText.id = '_highscore';

    scoreDiv.appendChild(scoreText);
    scoreDiv.appendChild(highscoreText);

    container.appendChild(scoreDiv);
    container.appendChild(canvas);
  }
}

function setScore() {
  const highscoreValue = document.createElement('span');
  highscoreValue.textContent = gameState.highscore.toString(10);
  const highscore = document.getElementById('_highscore');
  if (highscore) {
    highscore.innerHTML = `High Score: ${highscoreValue.innerHTML}`;
  }

  const scoreValue = document.createElement('span');
  scoreValue.textContent = gameState.score.toString(10);
  const score = document.getElementById('_score');
  if (score) {
    score.innerHTML = `Score: ${scoreValue.innerHTML}`;
  }
}

function lostLife() {
  obstacleFactory.reset();
}

function resetGame() {
  garbageBag.reset();
  obstacleFactory.reset();
  gameState.score = 0;
  gameState.highscore = parseInt(localStorage.getItem('highscore') ?? '0', 10);
}

async function mainLoop(frameTime?: number) {
  if (frameTime) {
    if (!then) {
      then = frameTime;
    }
    elapsed = (frameTime - then) / 1000;

    if (!gameState.isGameScreenDrawn) {
      drawGameScreen();
      gameState.isGameScreenDrawn = true;
    }

    const collisionType = garbageBag.checkCollision(obstacleFactory, gameState);
    if (collisionType === 'bomb') {
      lostLife();
      if (garbageBag.lives === 0) {
        saveHighscore();
        resetGame();
      }
    }

    update(Math.min(elapsed, 0.1));
    setScore();
    obstacleFactory.create();
    draw();

    then = frameTime;
    window.requestAnimationFrame(mainLoop);
  } else {
    window.requestAnimationFrame(mainLoop);
  }
}

function init() {
  gameState = new GameState();
  garbageBag = new GarbageCan(ctx as CanvasRenderingContext2D);
  obstacleFactory = new ObjectFactory(ctx as CanvasRenderingContext2D);
  lives = new Lives(ctx as CanvasRenderingContext2D);
}

(async () => {
  await ImageCache.loadAllImages(canvas);
  init();
  await mainLoop();
})();
