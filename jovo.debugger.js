const { DebuggerConfig } = require('@jovotech/plugin-debugger');

const debuggerConfig = new DebuggerConfig({
  locales: ['en'],
  buttons: [
    {
      label: 'LAUNCH',
      input: {
        type: 'LAUNCH',
      },
    },
    {
      label: 'Start Game',
      input: {
        intent: 'StartGameIntent',
      },
    },
    {
      label: 'Correct',
      input: {
        intent: 'CorrectAnswerIntent',
      },
    },
    {
      label: 'Wrong',
      input: {
        intent: 'WrongAnswerIntent',
      },
    },
    {
      label: 'Cancel Game',
      input: {
        intent: 'CancelGameIntent',
      },
    },
    {
      label: 'Subscribe',
      input: {
        intent: 'SubscribeIntent',
      },
    },
    {
      label: 'Badges',
      input: {
        intent: 'ListBadgesIntent',
      },
    },
    {
      label: 'Score',
      input: {
        intent: 'ScoreIntent',
      },
    },
    {
      label: 'Leaderboard',
      input: {
        intent: 'LeaderboardIntent',
      },
    },    
  ],
});

module.exports = debuggerConfig;
