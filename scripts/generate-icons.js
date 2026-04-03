const sharp = require('sharp');
const path = require('path');

const BRAND_GREEN = '#059669';
const LIGHT_GREEN = '#10B981';
const DARK_BG = '#022C22';
const DARK_MID = '#033D2E';
const WHITE = '#FFFFFF';

// Shield with road/path and 4 service dots — represents all roadside services
// No text. Clean, bold, reads at 48px.

function shieldIcon() {
  // Shield path: wide rounded top, pointed bottom
  // Centered at 512,512 in a 1024x1024 viewBox
  return `
    <!-- Shield outline -->
    <path d="
      M 512 130
      C 620 130 740 150 800 180
      Q 830 195 830 230
      L 830 480
      Q 830 620 740 720
      L 512 910
      L 284 720
      Q 194 620 194 480
      L 194 230
      Q 194 195 224 180
      C 284 150 404 130 512 130
      Z
    " fill="url(#shieldGrad)" stroke="${LIGHT_GREEN}" stroke-width="6"/>

    <!-- Inner shield bevel -->
    <path d="
      M 512 178
      C 604 178 706 194 756 218
      Q 780 230 780 258
      L 780 472
      Q 780 594 700 682
      L 512 852
      L 324 682
      Q 244 594 244 472
      L 244 258
      Q 244 230 268 218
      C 318 194 420 178 512 178
      Z
    " fill="url(#innerGrad)" opacity="0.5"/>`;
}

function roadPath() {
  // Vertical road/path element inside shield — dashed center line
  return `
    <!-- Road surface -->
    <path d="
      M 462 350 L 462 720 Q 462 740 482 756 L 512 780 L 542 756 Q 562 740 562 720 L 562 350
      Q 562 320 512 310 Q 462 320 462 350 Z
    " fill="${DARK_BG}" opacity="0.35"/>

    <!-- Road dashed center line -->
    <line x1="512" y1="340" x2="512" y2="400" stroke="${LIGHT_GREEN}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <line x1="512" y1="430" x2="512" y2="490" stroke="${LIGHT_GREEN}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <line x1="512" y1="520" x2="512" y2="580" stroke="${LIGHT_GREEN}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <line x1="512" y1="610" x2="512" y2="670" stroke="${LIGHT_GREEN}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
}

function serviceIcons() {
  // 4 service symbols arranged around the road — tow hook, tire, battery, fuel
  const iconR = 52;
  return `
    <!-- Tow hook — top left -->
    <g transform="translate(360, 400)">
      <circle r="${iconR}" fill="${DARK_BG}" opacity="0.4"/>
      <circle r="${iconR - 4}" fill="none" stroke="${WHITE}" stroke-width="3" opacity="0.3"/>
      <path d="M -14 -18 L -14 8 Q -14 22 0 22 Q 14 22 14 8 L 14 -4" stroke="${WHITE}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <line x1="14" y1="-4" x2="14" y2="-20" stroke="${WHITE}" stroke-width="7" stroke-linecap="round"/>
      <line x1="-14" y1="-18" x2="-14" y2="-24" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- Tire — bottom left -->
    <g transform="translate(370, 560)">
      <circle r="${iconR}" fill="${DARK_BG}" opacity="0.4"/>
      <circle r="${iconR - 4}" fill="none" stroke="${WHITE}" stroke-width="3" opacity="0.3"/>
      <circle r="20" fill="none" stroke="${WHITE}" stroke-width="6"/>
      <circle r="6" fill="${WHITE}"/>
      <!-- Tire treads -->
      <line x1="-20" y1="0" x2="-12" y2="0" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
      <line x1="12" y1="0" x2="20" y2="0" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
      <line x1="0" y1="-20" x2="0" y2="-12" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
      <line x1="0" y1="12" x2="0" y2="20" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- Battery — top right -->
    <g transform="translate(664, 400)">
      <circle r="${iconR}" fill="${DARK_BG}" opacity="0.4"/>
      <circle r="${iconR - 4}" fill="none" stroke="${WHITE}" stroke-width="3" opacity="0.3"/>
      <!-- Battery body -->
      <rect x="-16" y="-12" width="32" height="28" rx="4" fill="none" stroke="${WHITE}" stroke-width="5"/>
      <!-- Battery terminals -->
      <rect x="-8" y="-18" width="6" height="8" rx="2" fill="${WHITE}"/>
      <rect x="2" y="-18" width="6" height="8" rx="2" fill="${WHITE}"/>
      <!-- + sign -->
      <line x1="-6" y1="4" x2="6" y2="4" stroke="${LIGHT_GREEN}" stroke-width="4" stroke-linecap="round"/>
      <line x1="0" y1="-2" x2="0" y2="10" stroke="${LIGHT_GREEN}" stroke-width="4" stroke-linecap="round"/>
    </g>

    <!-- Fuel drop — bottom right -->
    <g transform="translate(654, 560)">
      <circle r="${iconR}" fill="${DARK_BG}" opacity="0.4"/>
      <circle r="${iconR - 4}" fill="none" stroke="${WHITE}" stroke-width="3" opacity="0.3"/>
      <!-- Fuel drop -->
      <path d="M 0 -22 Q -18 4 -18 12 Q -18 24 0 24 Q 18 24 18 12 Q 18 4 0 -22 Z" fill="none" stroke="${WHITE}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="0" cy="10" r="4" fill="${LIGHT_GREEN}"/>
    </g>`;
}

// --- Icon SVG generators ---

function createAppIconSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
      <linearGradient id="shieldGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${LIGHT_GREEN}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${BRAND_GREEN}" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="innerGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Background rounded square -->
    <rect width="1024" height="1024" rx="220" fill="url(#bgGrad)"/>

    <!-- Subtle radial glow -->
    <circle cx="512" cy="480" r="360" fill="${BRAND_GREEN}" opacity="0.04"/>

    ${shieldIcon()}
    ${roadPath()}
    ${serviceIcons()}
  </svg>`;
}

function createSplashIconSVG() {
  // Splash: shield on transparent background (shows on #022C22 splash bg)
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="shieldGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${LIGHT_GREEN}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${BRAND_GREEN}" stop-opacity="0.1"/>
      </linearGradient>
      <linearGradient id="innerGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Subtle glow behind shield -->
    <ellipse cx="512" cy="500" rx="300" ry="280" fill="${BRAND_GREEN}" opacity="0.06"/>

    ${shieldIcon()}
    ${roadPath()}
    ${serviceIcons()}
  </svg>`;
}

function createAdaptiveForegroundSVG() {
  // Android adaptive: content within 66% safe zone (72dp in 108dp)
  // Scale shield to fit ~680px centered in 1024px
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="shieldGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${LIGHT_GREEN}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${BRAND_GREEN}" stop-opacity="0.1"/>
      </linearGradient>
      <linearGradient id="innerGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    ${shieldIcon()}
    ${roadPath()}
    ${serviceIcons()}
  </svg>`;
}

function createAdaptiveBackgroundSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bgG)"/>
    <circle cx="512" cy="480" r="400" fill="${BRAND_GREEN}" opacity="0.035"/>
  </svg>`;
}

function createMonochromeSVG() {
  // Simplified shield silhouette — must be single color on transparent
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <!-- Shield silhouette -->
    <path d="
      M 512 130
      C 620 130 740 150 800 180
      Q 830 195 830 230
      L 830 480
      Q 830 620 740 720
      L 512 910
      L 284 720
      Q 194 620 194 480
      L 194 230
      Q 194 195 224 180
      C 284 150 404 130 512 130
      Z
    " fill="${WHITE}"/>

    <!-- Road cutout -->
    <path d="
      M 480 320 L 480 700 Q 480 730 512 750 Q 544 730 544 700 L 544 320
      Q 544 300 512 290 Q 480 300 480 320 Z
    " fill="black" opacity="0.3"/>

    <!-- Dashes -->
    <line x1="512" y1="340" x2="512" y2="390" stroke="black" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
    <line x1="512" y1="420" x2="512" y2="470" stroke="black" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
    <line x1="512" y1="500" x2="512" y2="550" stroke="black" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
    <line x1="512" y1="580" x2="512" y2="630" stroke="black" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
  </svg>`;
}

function createFaviconSVG() {
  // Simplified shield for 48x48 — must read clearly
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="fbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${DARK_MID}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#fbg)"/>

    <!-- Bold shield at favicon scale -->
    <path d="
      M 24 8
      C 28 8 33 9 36 10.5
      Q 38 11.5 38 13
      L 38 24
      Q 38 30 34 34
      L 24 42
      L 14 34
      Q 10 30 10 24
      L 10 13
      Q 10 11.5 12 10.5
      C 15 9 20 8 24 8 Z
    " fill="${BRAND_GREEN}" opacity="0.35" stroke="${LIGHT_GREEN}" stroke-width="1.5"/>

    <!-- Road line -->
    <line x1="24" y1="14" x2="24" y2="20" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="24" y1="24" x2="24" y2="30" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <line x1="24" y1="34" x2="24" y2="37" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
}

// --- Generate all assets ---

async function generate() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  const tasks = [
    { name: 'icon.png',                     svg: createAppIconSVG(),             size: 1024 },
    { name: 'adaptive-icon.png',             svg: createAppIconSVG(),             size: 1024 },
    { name: 'splash-icon.png',               svg: createSplashIconSVG(),          size: 512  },
    { name: 'android-icon-foreground.png',   svg: createAdaptiveForegroundSVG(),  size: 1024 },
    { name: 'android-icon-background.png',   svg: createAdaptiveBackgroundSVG(),  size: 1024 },
    { name: 'android-icon-monochrome.png',   svg: createMonochromeSVG(),          size: 1024 },
    { name: 'favicon.png',                   svg: createFaviconSVG(),             size: 48   },
  ];

  for (const task of tasks) {
    const outPath = path.join(assetsDir, task.name);
    await sharp(Buffer.from(task.svg))
      .resize(task.size, task.size)
      .png()
      .toFile(outPath);
    console.log(`OK  ${task.name} (${task.size}x${task.size})`);
  }

  console.log('\nDone.');
}

generate().catch(err => { console.error('Error:', err); process.exit(1); });
