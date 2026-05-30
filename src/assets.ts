// Figma MCP asset URLs — valid for 7 days from generation.
// Replace these with local assets (public/images/) when they expire.
export const ASSETS = {
  // Concentric ring layers
  ringInnerFill:    'https://www.figma.com/api/mcp/asset/49545a84-9629-4a2e-b00b-4ab97b9d49da', // Ellipse21
  ringMid1:         'https://www.figma.com/api/mcp/asset/abff90b2-2f55-4842-8abd-5c430a1a2b64', // Ellipse22
  ringGreenArc:     'https://www.figma.com/api/mcp/asset/1bde9596-350a-4718-8270-2e6af83c4f60', // Ellipse26 – progress arc
  ringInnerBorder:  'https://www.figma.com/api/mcp/asset/dcd4c1d2-e482-4062-bdb4-9782a55cef40', // Ellipse28
  ringDot1:         'https://www.figma.com/api/mcp/asset/63c0ba86-827c-4089-b363-55ac3eef4dc1', // Ellipse29
  ringDot2:         'https://www.figma.com/api/mcp/asset/98185b93-9768-434e-9ce2-e7ccf243f7a6', // Ellipse30
  ringMid2:         'https://www.figma.com/api/mcp/asset/eda52217-570d-4f53-a9b2-9a3e7f050d90', // Ellipse23
  ringOuter1:       'https://www.figma.com/api/mcp/asset/1d742af6-e48c-4d15-bdbd-7cb68f1c2163', // Ellipse24
  ringOutermost:    'https://www.figma.com/api/mcp/asset/3c962664-8665-479d-87c2-0ffb00bcbdeb', // Ellipse25

  // User avatars for floating chips
  avatarCashout300: 'https://www.figma.com/api/mcp/asset/b6a49c1a-8cd0-4ca6-b2c8-34258d09e0db',
  avatarCashout600: 'https://www.figma.com/api/mcp/asset/d15b3bea-511c-4315-8dc7-aec99e180bc5',
  avatarPlaygame:   'https://www.figma.com/api/mcp/asset/b209512a-4065-412b-872f-8a18481b26ec',
  avatarBonus:      'https://www.figma.com/api/mcp/asset/366e78e1-d06f-49d6-a4fd-8b61548ae22b',

  // Icons
  checkCircleGreen:   'https://www.figma.com/api/mcp/asset/2bae4758-ec42-4c04-a3fe-741a83fbd1ce',
  checkCircleOutline: 'https://www.figma.com/api/mcp/asset/669f906e-48a1-4b6b-aaf9-417c4055896f',
  arrowForward:       'https://www.figma.com/api/mcp/asset/575718ec-c492-4602-972e-916fb170e61b',

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
