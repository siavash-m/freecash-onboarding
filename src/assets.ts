export const ASSETS = {
  // Concentric ring layers for CircularGoal (local SVGs)
  ringOutermost:    '/images/ring-outermost.svg',
  ringOuter1:       '/images/ring-outer1.svg',
  ringMid2:         '/images/ring-mid2.svg',
  ringMid1:         '/images/ring-mid1.svg',
  ringInnerFill:    '/images/ring-inner-fill.svg',
  ringInnerBorder:  '/images/ring-inner-border.svg',

  // User avatars — empty strings so CircularGoal always uses generated SVG initials
  avatarCashout300: '',
  avatarCashout600: '',
  avatarPlaygame:   '',
  avatarBonus:      '',

  // Icons
  checkCircleGreen:   '/icons/check_circle_green.svg',
  checkCircleOutline: '/icons/check_circle_outline.svg',
  arrowForward:       '/icons/arrow_forward.svg',

  // Payment method icons (screen 2)
  paidIcon:    '/icons/paid.svg',
  paypalLogo:  '/icons/paypal.svg',
  bankIcon:    '/icons/bank.svg',
  bitcoinIcon: '/icons/bitcoin.svg',
  amazonLogo:  '/icons/amazon.svg',

  // Game genre icons (screen 3)
  sportsEsports:     '/icons/sports_esports.svg',
  brick:             '/icons/brick.svg',
  forest:            '/icons/forest.svg',
  sportsAndOutdoors: '/icons/sports_and_outdoors.svg',

  // Session length icons (screen 4)
  acute:       '/icons/acute.svg',
  timer:       '/icons/timer.svg',
  cardsStar:   '/icons/cards_star.svg',
  rewardedAds: '/icons/rewarded_ads.svg',
} as const;
