import { Jovo } from '@jovotech/framework';
import { GameEndReason, ReadonlyBadgeProperties, ReadonlyEarnedBadge } from 'badgerific';

import badges from '../badges.json';

export const badgeCallbacksHook = (jovo: Jovo): void => {
  // onBadgeEarned
  jovo.$badges.onBadgeEarned = async (badge: ReadonlyEarnedBadge) => {
    console.log(`Badgerific:onBadgeEarned ${badge.id}`);

    // use external badge info to earn points
    const badgeInfo = badges.find((b) => b.id === badge.id);
    if (badgeInfo && badgeInfo.points > 0) {
      await jovo.$game.addScore(badgeInfo.points);
    }
  };

  // onNewTimePeriod
  jovo.$badges.onNewTimePeriod = (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
  ) => {
    console.log('Badgerific:onNewTimePeriod');

    if (systemProps.isNewDay) {
      jovo.$badges.setValue('dailyWins', 0, true);
    }
  };

  // onSessionStart
  jovo.$badges.onSessionStart = (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
  ) => {
    console.log('Badgerific:onSessionStart');
  };

  // onSessionEnd
  jovo.$badges.onSessionEnd = (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
  ) => {
    console.log('Badgerific:onSessionEnd');
  };

  // onGameStart
  jovo.$badges.onGameStart = (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
  ) => {
    console.log('Badgerific:onGameStart');

    if (props.hasSubscription) {
      jovo.$badges.addValue('subscribedGames', 1, true);
    }
  };

  // onGameEnd
  jovo.$badges.onGameEnd = (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
    reason: GameEndReason,
  ) => {
    console.log('Badgerific:onGameEnd');

    if (reason === GameEndReason.Win) {
      jovo.$badges.addValue('dailyWins', 1, true);
    }
  };
};
