import { BadgerificPlugin, BadgerificInitData } from '@jovo-community/plugin-badgerific';
import { PlayFabPlugin, ProfileInfo } from '@jovo-community/plugin-playfab';
import { PlayerGenerator } from '@jovo-community/plugin-playergenerator';
import { TimeZonePlugin } from '@jovo-community/plugin-timezone';
import { App, Jovo } from '@jovotech/framework';

import { GlobalComponent } from './components/GlobalComponent';
import { GameComponent } from './components/GameComponent';
import { GameEndReason, ReadonlyBadgeProperties, ReadonlyEarnedBadge } from 'badgerific';

import badgeRules from './badgeRules.json';
import badges from './badges.json';

/*
|--------------------------------------------------------------------------
| APP CONFIGURATION
|--------------------------------------------------------------------------
|
| All relevant components, plugins, and configurations for your Jovo app
| Learn more here: www.jovo.tech/docs/app-config
|
*/
const app = new App({
  /*
  |--------------------------------------------------------------------------
  | Components
  |--------------------------------------------------------------------------
  |
  | Components contain the Jovo app logic
  | Learn more here: www.jovo.tech/docs/components
  |
  */
  components: [GlobalComponent, GameComponent],

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Includes platforms, database integrations, third-party plugins, and more
  | Learn more here: www.jovo.tech/marketplace
  |
  */
  plugins: [
    new PlayerGenerator({
      displayName: {
        maxLength: 25,
      },
      avatar: {
        count: 50,
        urlPattern: 'https://example.com/avatar{{index}}.png',
      },
    }),
    new PlayFabPlugin({
      titleId: '',
      developerSecretKey: '',
      login: {
        extendedProfileKey: 'extendedProfile',
        maxNewProfileRetries: 2,
        infoRequestParameters: {
          GetPlayerProfile: true,
          ProfileConstraints: {
            ShowDisplayName: true,
            ShowAvatarUrl: true,
          },
          GetPlayerStatistics: true,
          PlayerStatisticNames: ['score'],
          GetUserData: true,
          UserDataKeys: ['extendedProfile'],
        },
        onNewProfile,
      },
      leaderboard: {
        topMax: 5,
        neighborMax: 3,
        userDataKeys: ['extendedProfile'],
        profileConstraints: {
          ShowDisplayName: true,
          ShowAvatarUrl: true,
        },
      },
    }),
    new TimeZonePlugin(),
    new BadgerificPlugin({
      onInit: async (jovo: Jovo) => {
        console.log('BadgerificPlugin:onInit');

        return {
          timeZone: await jovo.$timeZone.getTimeZone(),
          rules: badgeRules,
        } as BadgerificInitData;
      },
    }),
  ],

  /*
  |--------------------------------------------------------------------------
  | Other options
  |--------------------------------------------------------------------------
  |
  | Includes all other configuration options like logging
  | Learn more here: www.jovo.tech/docs/app-config
  |
  */
  logging: true,
});

app.hook('before.dialogue.start', (jovo: Jovo): void => {
  if (jovo.$user.isNew) {
    // jovo.$user.data.score = 0;
  }
});

app.hook('after.dialogue.start', (jovo: Jovo): void => {
  // onBadgeEarned
  jovo.$badges.onBadgeEarned = async (badge: ReadonlyEarnedBadge) => {
    console.log(`Badgerific:onBadgeEarned ${badge.id}`);

    // use external badge info to earn points
    const badgeInfo = badges.find((b) => b.id === badge.id);
    if (badgeInfo && badgeInfo.points > 0) {
      // points for earning badges
      // but this could be credits, coins, or something else (or a combination)
      // jovo.$user.data.score += badgeInfo.points;
      let score = await jovo.$playfab.getStat('score') ?? 0;
      score += badgeInfo.points;

      await jovo.$playfab.updateStat('score', score);
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
});

export { app };

async function onNewProfile(jovo: Jovo) {
  console.log('PlayFabPlugin:onNewProfile');

  const profile = jovo.$playergen.generateProfile();
  const playFabProfile = {
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    extendedProfile: {
      color: profile.color,
      locale: jovo.$request.getLocale(),
      platformUserId: jovo.$user.id,
    },
  } as ProfileInfo;

  return playFabProfile;
}
