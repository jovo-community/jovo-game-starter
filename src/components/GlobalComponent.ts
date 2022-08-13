import { Component, BaseComponent, Global } from '@jovotech/framework';
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
    return this.$send('Welcome. To start a game say: start game');
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
    return this.$send('Congratulations! You won the game. What do you want to do now?');
  }

  gameLost() {
    return this.$send('Sorry. You lost the game. What do you want to do now?');
  }

  gameCancelled() {
    return this.$send('You cancelled the game. What do you want to do now?');
  }

  SubscribeIntent() {
    this.$badges.setValue('hasSubscription', true);
    return this.$send('Subscribed. What next?');
  }

  ListBadgesIntent() {
    const earned = this.$badges.getEarnedBadges();
    return this.$send(`You have earned ${earned.length} badges. What next?`);
  }

  async ScoreIntent() {
    // const score = this.$user.data.score;

    const score = await this.$playfab.getStat('score') ?? 0;

    return this.$send(`Your score is: ${score}. What next?`);
  }

  async LeaderboardIntent() {
    const leaderboard = await this.$playfab.getLeaderboard('score');

    if (leaderboard) {
    const currentPlayerIndex = leaderboard?.findIndex((p) => p.IsCurrentPlayer);   
    const currentPlayer = leaderboard[currentPlayerIndex];
    if (currentPlayer.Position === 0) {
      this.$send(`Congratulations! You are ranked #1 on the leaderboard with a score of ${currentPlayer.StatValue}.`);
    } else {
      const topPlayer = leaderboard[0];
      const topDiff = topPlayer.StatValue - currentPlayer.StatValue;
      
      const closestNeighbor = leaderboard[currentPlayerIndex - 1];
      const closestDiff = closestNeighbor.StatValue - currentPlayer.StatValue;
      
      this.$send(`Your rank on the leaderboard is ${currentPlayer.Position + 1} with a score of ${currentPlayer.StatValue}. You are ${closestDiff} points behind the next player and need ${topDiff + 1} points to earn the top spot.`);
    }
    } else {
      this.$send(`Sorry. Unable to access the leaderboard right now.`);  
    }

    return this.$send('What next?');
  }
}
