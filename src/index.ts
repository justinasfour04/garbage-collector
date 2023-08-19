import '../static/stylesheet/index.css';
import AppIcon from '../static/img/appIcon.png';

import { ImageCache } from './imageCache';
import { GameState } from './gameState';
import { GarbageCan } from './garbageCan';
import { Lives } from './lives';
import { ObjectFactory } from './obstacleFactory';

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

async function draw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  if (ctx !== null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(ImageCache.getBackground(gameState.backgroundKey), 0, 0);
    garbageBag.draw();
    obstacleFactory.draw();
    lives.draw(garbageBag.lives);
  }
}

function drawGameScreen(canvas: HTMLCanvasElement) {
  const container = document.getElementById('app');
  if (container !== null) {
    if (container?.clientWidth < 1024) {
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
    } else {
      const onlyForMobile = document.createElement('div');
      onlyForMobile.className = 'desktop-message';
      const onlyForMobileImage = document.createElement('img');
      const onlyForMobileText = document.createElement('h1');
      onlyForMobileText.textContent = 'Only for mobile';
      onlyForMobileImage.src = AppIcon;
      onlyForMobile.appendChild(onlyForMobileImage);
      onlyForMobile.appendChild(onlyForMobileText);
      container.appendChild(onlyForMobile);
    }
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
  obstacleFactory.reset(gameState.score);
}

function resetGame() {
  garbageBag.reset();
  obstacleFactory.reset(gameState.score);
  gameState.score = 0;
  gameState.highscore = parseInt(localStorage.getItem('highscore') ?? '0', 10);
}

async function mainLoop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frameTime?: number,
) {
  if (frameTime) {
    if (!then) {
      then = frameTime;
    }
    elapsed = (frameTime - then) / 1000;

    if (!gameState.isGameScreenDrawn) {
      drawGameScreen(canvas);
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
    obstacleFactory.create(gameState.score);
    draw(canvas, ctx);

    then = frameTime;
    window.requestAnimationFrame((time) => mainLoop(canvas, ctx, time));
  } else {
    window.requestAnimationFrame((time) => mainLoop(canvas, ctx, time));
  }
}

async function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  await ImageCache.loadAllImages(canvas);
}

function preventMotion(event: Event) {
  window.scrollTo(0, 0);
  event.preventDefault();
  event.stopPropagation();
}

async function init() {
  window.addEventListener('scroll', preventMotion, false);
  window.addEventListener('touchmove', preventMotion, false);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

  window.addEventListener('resize', () => resizeCanvas(canvas), false);
  window.addEventListener('orientationchange', () => resizeCanvas(canvas), false);
  await resizeCanvas(canvas);

  return {
    canvas,
    ctx,
  };
}

(async () => {
  const {
    canvas,
    ctx,
  } = await init();

  gameState = new GameState();
  garbageBag = new GarbageCan(ctx as CanvasRenderingContext2D);
  obstacleFactory = new ObjectFactory(ctx as CanvasRenderingContext2D, gameState.score);
  lives = new Lives(ctx as CanvasRenderingContext2D);

  if (ctx !== null) {
    await mainLoop(canvas, ctx);
  }
})();
