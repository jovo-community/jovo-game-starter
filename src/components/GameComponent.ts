import { Component, BaseComponent, Intents } from '@jovotech/framework';

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
    this.$game.startGame();

    this.$component.data.questionCount = 0;
    this.$component.data.correctCount = 0;

    this.$send(this.$t('gameIntro'));
    return this.GameTurn();
  }

  GameTurn() {
    if (this.$component.data.questionCount >= this.MAX_QUESTIONS) {
      return this.GameOver();
    }
    const count = this.$component.data.questionCount + 1;
    return this.$send(this.$t('question', { count }));
  }

  CorrectAnswerIntent() {
    this.$component.data.questionCount++;
    this.$component.data.correctCount++;

    this.$send(this.$t('correct'));

    return this.GameTurn();
  }

  WrongAnswerIntent() {
    this.$component.data.questionCount++;

    this.$send(this.$t('wrong'));

    return this.GameTurn();
  }

  CancelGameIntent() {
    this.$game.cancelGame();
    return this.$resolve('cancel');
  }

  async GameOver() {
    this.$badges.setValue('correctAnswers', this.$component.data.correctCount);

    if (this.$component.data.correctCount >= this.WIN_ANSWERS) {
      await this.$game.winGame();
      return this.$resolve('won');
    } else {
      this.$game.loseGame();
      return this.$resolve('lost');
    }
  }

  UNHANDLED() {
    return this.GameTurn();
  }
}
