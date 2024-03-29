import { BackgroundKey } from './imageCache';

export class GameState {
  score: number;

  highscore: number;

  playerName: string | undefined;

  backgroundKey: BackgroundKey;

  isGameRunning: boolean;

  isGameOver: boolean;

  isGameScreenDrawn: boolean;

  isGameMenuDrawn: boolean;

  isGameOverDrawn: boolean;

  isInMenu: boolean;

  constructor() {
    this.score = 0;
    this.highscore = parseInt(localStorage.getItem('highscore') ?? '0', 10);
    this.playerName = localStorage.getItem('playername') ?? undefined;
    this.backgroundKey = BackgroundKey.ONE;
    this.isGameRunning = false;
    this.isGameOver = false;
    this.isGameScreenDrawn = false;
    this.isGameMenuDrawn = false;
    this.isGameOverDrawn = false;
    this.isInMenu = true;
  }

  reset() {
    this.isGameRunning = false;
    this.isGameOver = false;
    this.isGameScreenDrawn = false;
    this.isGameMenuDrawn = false;
    this.isGameOverDrawn = false;
    this.isInMenu = true;
  }
}
