const sharp = require('sharp');
const path = require('path');

const GREEN = '#059669';
const LIGHT_GREEN = '#10B981';
const DARK_BG = '#022C22';
const DARK_MID = '#033D2E';
const WHITE = '#FFFFFF';

// One bold shield, one road. Nothing else.

function shield(fill = GREEN, stroke = LIGHT_GREEN, strokeW = 8) {
  return `
    <path d="
      M 512 115
      C 640 115 770 145 820 178
      Q 855 198 855 240
      L 855 500
      Q 855 660 750 760
      L 512 930
      L 274 760
      Q 169 660 169 500
      L 169 240
      Q 169 198 204 178
      C 254 145 384 115 512 115 Z
    " fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`;
}

function road() {
  return `
    <!-- Road surface -->
    <path d="
      M 468 240 L 468 760 Q 468 800 512 830 Q 556 800 556 760 L 556 240
      Q 556 200 512 185 Q 468 200 468 240 Z
    " fill="${DARK_BG}" opacity="0.55"/>

    <!-- White dashed center line -->
    <line x1="512" y1="230" x2="512" y2="310" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <line x1="512" y1="360" x2="512" y2="440" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <line x1="512" y1="490" x2="512" y2="570" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <line x1="512" y1="620" x2="512" y2="700" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <line x1="512" y1="750" x2="512" y2="800" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>`;
}

// --- App icon (1024x1024, rounded square bg) ---
function createAppIconSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
    ${shield()}
    ${road()}
  </svg>`;
}

// --- Splash icon (transparent bg, shows on #022C22) ---
function createSplashIconSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024">
    ${shield()}
    ${road()}
  </svg>`;
}

// --- Adaptive foreground (transparent bg, within 66% safe zone) ---
function createAdaptiveForegroundSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${shield()}
    ${road()}
  </svg>`;
}

// --- Adaptive background ---
function createAdaptiveBackgroundSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>
  </svg>`;
}

// --- Monochrome (white silhouette on transparent) ---
function createMonochromeSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${shield(WHITE, WHITE, 0)}
    <path d="
      M 468 240 L 468 760 Q 468 800 512 830 Q 556 800 556 760 L 556 240
      Q 556 200 512 185 Q 468 200 468 240 Z
    " fill="black" opacity="0.35"/>
    <line x1="512" y1="230" x2="512" y2="310" stroke="black" stroke-width="10" stroke-linecap="round" opacity="0.35"/>
    <line x1="512" y1="360" x2="512" y2="440" stroke="black" stroke-width="10" stroke-linecap="round" opacity="0.35"/>
    <line x1="512" y1="490" x2="512" y2="570" stroke="black" stroke-width="10" stroke-linecap="round" opacity="0.35"/>
    <line x1="512" y1="620" x2="512" y2="700" stroke="black" stroke-width="10" stroke-linecap="round" opacity="0.35"/>
    <line x1="512" y1="750" x2="512" y2="800" stroke="black" stroke-width="10" stroke-linecap="round" opacity="0.35"/>
  </svg>`;
}

// --- Favicon (48x48, must read at tiny size) ---
function createFaviconSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#bg)"/>

    <!-- Bold solid shield -->
    <path d="
      M 24 6
      C 30 6 36 7.5 39 9
      Q 41 10 41 12
      L 41 25
      Q 41 32 36 36.5
      L 24 44
      L 12 36.5
      Q 7 32 7 25
      L 7 12
      Q 7 10 9 9
      C 12 7.5 18 6 24 6 Z
    " fill="${GREEN}" stroke="${LIGHT_GREEN}" stroke-width="1"/>

    <!-- Road -->
    <rect x="22" y="11" width="4" height="28" rx="2" fill="${DARK_BG}" opacity="0.5"/>
    <line x1="24" y1="12" x2="24" y2="17" stroke="${WHITE}" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="21" x2="24" y2="26" stroke="${WHITE}" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="30" x2="24" y2="35" stroke="${WHITE}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

async function generate() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const tasks = [
    { name: 'icon.png',                   svg: createAppIconSVG(),            size: 1024 },
    { name: 'adaptive-icon.png',           svg: createAppIconSVG(),            size: 1024 },
    { name: 'splash-icon.png',             svg: createSplashIconSVG(),         size: 512  },
    { name: 'android-icon-foreground.png', svg: createAdaptiveForegroundSVG(), size: 1024 },
    { name: 'android-icon-background.png', svg: createAdaptiveBackgroundSVG(), size: 1024 },
    { name: 'android-icon-monochrome.png', svg: createMonochromeSVG(),         size: 1024 },
    { name: 'favicon.png',                 svg: createFaviconSVG(),            size: 48   },
  ];

  for (const t of tasks) {
    await sharp(Buffer.from(t.svg)).resize(t.size, t.size).png().toFile(path.join(assetsDir, t.name));
    console.log(`OK  ${t.name} (${t.size}x${t.size})`);
  }
  console.log('\nDone.');
}

generate().catch(err => { console.error(err); process.exit(1); });
