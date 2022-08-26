import { Jovo } from '@jovotech/framework';
import { GameEndReason } from 'badgerific';

declare module '@jovotech/framework/dist/types/Jovo' {
  interface Jovo {
    $game: Game;
  }
}

export class Game {
  constructor(readonly jovo: Jovo) {}

  get player() {
    return this.jovo.$session.data.playfab.profile;
  }

  startGame(): void {
    this.jovo.$badges.startGame();
  }

  cancelGame(): void {
    this.jovo.$badges.endGame(GameEndReason.Cancel);
  }

  async winGame(): Promise<void> {
    this.jovo.$badges.endGame(GameEndReason.Win);
    await this.addScore(10);
  }

  loseGame(): void {
    this.jovo.$badges.endGame(GameEndReason.Lose);
  }

  async setScore(score: number): Promise<void> {
    await this.jovo.$playfab.updateStat('score', score);
  }

  async addScore(increment: number): Promise<void> {
    let score = (await this.jovo.$playfab.getStat('score')) ?? 0;
    score += increment;

    await this.setScore(score);
  }
}
