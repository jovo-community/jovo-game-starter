import { Component, BaseComponent, Global, JovoError } from '@jovotech/framework';
import { GameComponent } from './GameComponent';

/*
|--------------------------------------------------------------------------
| Global Component
|--------------------------------------------------------------------------
|
| The global component handlers can be reached from anywhere in the app
| Learn more here: www.jovo.tech/docs/components#global-components
|
*/
@Global()
@Component()
export class GlobalComponent extends BaseComponent {
  LAUNCH() {
    this.$send(this.$t('welcome'));
    return this.$send(this.$t('start'));
  }

  END() {
    return this.$send({ message: this.$t('goodbye'), listen: false });
  }

  StartGameIntent() {
    return this.$delegate(GameComponent, {
      resolve: {
        won: this.gameWon,
        lost: this.gameLost,
        cancel: this.gameCancelled,
      },
    });
  }

  gameWon() {
    this.$send(this.$t('gameWin'));
    return this.$send(this.$t('whatNext'));
  }

  gameLost() {
    this.$send(this.$t('gameLose'));
    return this.$send(this.$t('whatNext'));
  }

  gameCancelled() {
    this.$send(this.$t('gameCancel'));
    return this.$send(this.$t('whatNext'));
  }

  SubscribeIntent() {
    this.$badges.setValue('hasSubscription', true);

    this.$send(this.$t('subscribed'));
    return this.$send(this.$t('whatNext'));
  }

  ListBadgesIntent() {
    const earned = this.$badges.getEarnedBadges();
    this.$send(this.$t('listBadges', { earned }));
    return this.$send(this.$t('whatNext'));
  }

  async ScoreIntent() {
    const score = (await this.$playfab.getStat('score')) ?? 0;

    this.$send(this.$t('getScore', { score }));
    return this.$send(this.$t('whatNext'));
  }

  async LeaderboardIntent() {
    const leaderboard = (await this.$playfab.getLeaderboard('score')) as any;

    if (leaderboard) {
      const currentPlayerIndex = leaderboard?.findIndex((p: any) => p.IsCurrentPlayer);
      const currentPlayer = leaderboard[currentPlayerIndex];
      if (currentPlayer.Position === 0) {
        this.$send(this.$t('leaderboard.rankTop', { currentPlayer }));
      } else {
        const topPlayer = leaderboard[0];
        const topDiff = topPlayer.StatValue - currentPlayer.StatValue;

        const closestNeighbor = leaderboard[currentPlayerIndex - 1];
        const closestDiff = closestNeighbor.StatValue - currentPlayer.StatValue;

        this.$send(this.$t('leaderboard.rankOther', { currentPlayer, closestDiff, topDiff }));
      }
    } else {
      this.$send(this.$t('leaderboard.error'));
    }

    return this.$send(this.$t('whatNext'));
  }
}
