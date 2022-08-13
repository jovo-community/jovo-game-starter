import { Component, BaseComponent, Intents } from '@jovotech/framework';
import { GameEndReason } from 'badgerific';

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
|
| A component consists of handlers that respond to specific user requests
| Learn more here: www.jovo.tech/docs/components, jovo.tech/docs/handlers
|
*/
@Component()
export class GameComponent extends BaseComponent {
  private MAX_QUESTIONS = 3;
  private WIN_ANSWERS = 2;

  START() {
    this.$badges.startGame();
    this.$component.data.questionCount = 0;
    this.$component.data.correctCount = 0;

    this.$send(
      'A game consists of 3 turns. You can answer with the correct or the wrong answer. Get 2 correct answers to win.',
    );
    return this.GameTurn();
  }

  GameTurn() {
    if (this.$component.data.questionCount >= this.MAX_QUESTIONS) {
      return this.GameOver();
    }

    return this.$send(`Question ${this.$component.data.questionCount + 1}. What is your answer?`);
  }

  CorrectAnswerIntent() {
    this.$component.data.questionCount++;
    this.$component.data.correctCount++;
    this.$send('Correct.');

    return this.GameTurn();
  }

  WrongAnswerIntent() {
    this.$component.data.questionCount++;
    this.$send('Wrong.');

    return this.GameTurn();
  }

  CancelGameIntent() {
    this.$badges.endGame(GameEndReason.Cancel);
    return this.$resolve('cancel');
  }

  async GameOver() {
    this.$badges.setValue('correctAnswers', this.$component.data.correctCount);

    if (this.$component.data.correctCount >= this.WIN_ANSWERS) {
      this.$badges.endGame(GameEndReason.Win);

      // points for winning the game
      
      // this.$user.data.score += 10; 

      let score = await this.$playfab.getStat('score') ?? 0;
      score += 10;

      await this.$playfab.updateStat('score', score);

      return this.$resolve('won');
    } else {
      this.$badges.endGame(GameEndReason.Lose);
      return this.$resolve('lost');
    }
  }

  UNHANDLED() {
    return this.GameTurn();
  }
}
