import { BadgerificPlugin, BadgerificInitData } from '@jovo-community/plugin-badgerific';
import { PlayFabPlugin, ProfileInfo } from '@jovo-community/plugin-playfab';
import { PlayerGenerator } from '@jovo-community/plugin-playergenerator';
import { TimeZonePlugin } from '@jovo-community/plugin-timezone';
import { App, Jovo } from '@jovotech/framework';

import { GlobalComponent } from './components/GlobalComponent';
import { GameComponent } from './components/GameComponent';

import badgeRules from './badgeRules.json';

import en from './i18n/en.json';
import { gameInitHook } from './hooks/gameInitHook';
import { badgeCallbacksHook } from './hooks/badgeCallbacksHook';

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

  i18n: {
    resources: {
      en,
    },
  },
});

app.hook('before.dialogue.start', gameInitHook);
app.hook('after.dialogue.start', badgeCallbacksHook);

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
