// Public enrollment destinations only; never store tester email addresses here.
export const groupUrl = 'https://groups.google.com/g/alpha-android-testers';
export const portalUrl = 'https://blinddraw.ink/beta/';
export const games = [
  {
    id: 'invisible-ink',
    name: 'Invisible Ink: Drawing Games',
    shortName: 'Invisible Ink',
    packageId: 'com.tendonlife.invisibleink',
    icon: 'images/app-icon.png',
    genre: 'Drawing · Party · Arcade',
    description: 'Draw in the dark, reveal your creations, and challenge friends in creative party games.',
    feedback: 'mailto:support@blinddraw.ink',
  },
  {
    id: 'teddy-dreams',
    name: 'Teddy Dreams: Match 3 Puzzle',
    shortName: 'Teddy Dreams',
    packageId: 'com.tendonlife.teddybear',
    icon: 'images/beta/teddy-dreams.png',
    genre: 'Cozy · Match 3 · Puzzle',
    description: 'Match adorable teddy bears, discover cozy bonuses, and explore a dreamy bedtime adventure.',
    feedback: 'mailto:Feedback@teddytoymatch.com',
  },
].map((game) => ({
  ...game,
  testingUrl: 'https://play.google.com/apps/testing/' + game.packageId,
  storeUrl: 'https://play.google.com/store/apps/details?id=' + game.packageId,
}));
