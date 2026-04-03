const sharp = require('sharp');
const path = require('path');

const BRAND_GREEN = '#059669';
const DARK_BG = '#022C22';
const WHITE = '#FFFFFF';

// Flatbed tow truck SVG path - clean silhouette design
function createTruckSVG(size, fgColor = WHITE) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  // Scale factor relative to 1024
  const f = s / 1024;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <g transform="translate(${cx - 320 * f}, ${cy - 140 * f}) scale(${f})">
        <!-- Flatbed truck body -->
        <!-- Cab -->
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${fgColor}"/>
        <!-- Cab window -->
        <rect x="480" y="80" width="120" height="70" rx="10" fill="${fgColor}" opacity="0.3"/>
        <!-- Flatbed -->
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${fgColor}"/>
        <!-- Flatbed ramp lines -->
        <rect x="40" y="130" width="80" height="10" rx="3" fill="${fgColor}" opacity="0.5"/>
        <!-- Chassis -->
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${fgColor}"/>
        <!-- Hydraulic arm -->
        <path d="M 420 140 L 460 80" stroke="${fgColor}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M 380 140 L 420 100" stroke="${fgColor}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>
        <!-- Front wheel -->
        <circle cx="520" cy="230" r="42" fill="${fgColor}"/>
        <circle cx="520" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="520" cy="230" r="8" fill="${fgColor}" opacity="0.5"/>
        <!-- Rear wheel -->
        <circle cx="160" cy="230" r="42" fill="${fgColor}"/>
        <circle cx="160" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="160" cy="230" r="8" fill="${fgColor}" opacity="0.5"/>
        <!-- Bumper / front detail -->
        <rect x="600" y="160" width="30" height="50" rx="6" fill="${fgColor}" opacity="0.7"/>
        <!-- Headlight -->
        <circle cx="620" cy="145" r="10" fill="#FCD34D" opacity="0.9"/>
        <!-- Hook -->
        <path d="M 30 130 Q 10 130 10 145 Q 10 160 30 160" stroke="${fgColor}" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`;
}

// Full app icon: rounded square with truck + text
function createAppIconSVG(size) {
  const s = size;
  const f = s / 1024;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#033D2E;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${DARK_BG};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${BRAND_GREEN};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>

      <!-- Subtle grid pattern -->
      <g opacity="0.03">
        <line x1="0" y1="256" x2="1024" y2="256" stroke="${WHITE}" stroke-width="1"/>
        <line x1="0" y1="512" x2="1024" y2="512" stroke="${WHITE}" stroke-width="1"/>
        <line x1="0" y1="768" x2="1024" y2="768" stroke="${WHITE}" stroke-width="1"/>
        <line x1="256" y1="0" x2="256" y2="1024" stroke="${WHITE}" stroke-width="1"/>
        <line x1="512" y1="0" x2="512" y2="1024" stroke="${WHITE}" stroke-width="1"/>
        <line x1="768" y1="0" x2="768" y2="1024" stroke="${WHITE}" stroke-width="1"/>
      </g>

      <!-- Green accent line at top -->
      <rect x="200" y="100" width="624" height="6" rx="3" fill="url(#accent)" opacity="0.6"/>

      <!-- Truck icon centered -->
      <g transform="translate(172, 220) scale(1.05)">
        <!-- Flatbed truck body -->
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${WHITE}"/>
        <rect x="480" y="80" width="120" height="70" rx="10" fill="${DARK_BG}" opacity="0.2"/>
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${WHITE}"/>
        <rect x="40" y="130" width="80" height="10" rx="3" fill="${WHITE}" opacity="0.5"/>
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${WHITE}"/>
        <path d="M 420 140 L 460 80" stroke="${WHITE}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M 380 140 L 420 100" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>
        <circle cx="520" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="520" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <circle cx="160" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="160" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="160" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <rect x="600" y="160" width="30" height="50" rx="6" fill="${WHITE}" opacity="0.7"/>
        <circle cx="620" cy="145" r="10" fill="#FCD34D" opacity="0.9"/>
        <path d="M 30 130 Q 10 130 10 145 Q 10 160 30 160" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Arabic text: سارد -->
      <text x="512" y="680" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="140" fill="${WHITE}" letter-spacing="8">سارد</text>

      <!-- English text -->
      <text x="512" y="770" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="64" fill="${BRAND_GREEN}" letter-spacing="16">SARED</text>

      <!-- Tagline -->
      <text x="512" y="840" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="32" fill="${WHITE}" opacity="0.5" letter-spacing="4">YOUR ROAD STORY</text>

      <!-- Bottom accent -->
      <rect x="200" y="900" width="624" height="6" rx="3" fill="url(#accent)" opacity="0.3"/>
    </svg>`;
}

// Splash icon: larger, more prominent with glow effects
function createSplashIconSVG(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${BRAND_GREEN};stop-opacity:0" />
          <stop offset="50%" style="stop-color:${BRAND_GREEN};stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:${BRAND_GREEN};stop-opacity:0" />
        </linearGradient>
      </defs>

      <!-- Glow behind truck -->
      <ellipse cx="256" cy="230" rx="200" ry="80" fill="url(#glow)"/>

      <!-- Truck scaled for splash -->
      <g transform="translate(56, 120) scale(0.62)">
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${WHITE}"/>
        <rect x="480" y="80" width="120" height="70" rx="10" fill="${DARK_BG}" opacity="0.15"/>
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${WHITE}"/>
        <rect x="40" y="130" width="80" height="10" rx="3" fill="${WHITE}" opacity="0.5"/>
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${WHITE}"/>
        <path d="M 420 140 L 460 80" stroke="${WHITE}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M 380 140 L 420 100" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>
        <circle cx="520" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="520" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <circle cx="160" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="160" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="160" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <rect x="600" y="160" width="30" height="50" rx="6" fill="${WHITE}" opacity="0.7"/>
        <circle cx="620" cy="145" r="10" fill="#FCD34D" opacity="0.9"/>
        <path d="M 30 130 Q 10 130 10 145 Q 10 160 30 160" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Arabic text -->
      <text x="256" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="72" fill="${WHITE}" letter-spacing="4">سارد</text>

      <!-- English subtitle -->
      <text x="256" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="28" fill="${BRAND_GREEN}" letter-spacing="10">SARED</text>

      <!-- Tagline -->
      <text x="256" y="465" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="16" fill="${WHITE}" opacity="0.4" letter-spacing="3">YOUR ROAD STORY, HANDLED</text>
    </svg>`;
}

// Android adaptive foreground (only the icon, no background)
function createAdaptiveForegroundSVG(size) {
  // Adaptive icons have a safe zone - content should be within 66% of the center
  const s = size;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
      <!-- Truck centered in safe zone -->
      <g transform="translate(212, 260) scale(0.92)">
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${WHITE}"/>
        <rect x="480" y="80" width="120" height="70" rx="10" fill="${DARK_BG}" opacity="0.15"/>
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${WHITE}"/>
        <rect x="40" y="130" width="80" height="10" rx="3" fill="${WHITE}" opacity="0.5"/>
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${WHITE}"/>
        <path d="M 420 140 L 460 80" stroke="${WHITE}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M 380 140 L 420 100" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>
        <circle cx="520" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="520" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <circle cx="160" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="160" cy="230" r="22" fill="${DARK_BG}"/>
        <circle cx="160" cy="230" r="8" fill="${WHITE}" opacity="0.5"/>
        <rect x="600" y="160" width="30" height="50" rx="6" fill="${WHITE}" opacity="0.7"/>
        <circle cx="620" cy="145" r="10" fill="#FCD34D" opacity="0.9"/>
        <path d="M 30 130 Q 10 130 10 145 Q 10 160 30 160" stroke="${WHITE}" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Brand name below truck -->
      <text x="512" y="620" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="100" fill="${WHITE}" letter-spacing="6">سارد</text>
    </svg>`;
}

// Android adaptive background (solid gradient)
function createAdaptiveBackgroundSVG(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#033D2E"/>
          <stop offset="100%" style="stop-color:${DARK_BG}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bgGrad)"/>
      <!-- Subtle pattern -->
      <g opacity="0.04">
        <circle cx="200" cy="200" r="300" fill="${BRAND_GREEN}"/>
        <circle cx="800" cy="800" r="300" fill="${BRAND_GREEN}"/>
      </g>
    </svg>`;
}

// Monochrome icon (single color, simple silhouette)
function createMonochromeSVG(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
      <g transform="translate(212, 280) scale(0.92)">
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${WHITE}"/>
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${WHITE}"/>
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${WHITE}"/>
        <path d="M 420 140 L 460 80" stroke="${WHITE}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <circle cx="520" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="18" fill="black"/>
        <circle cx="160" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="160" cy="230" r="18" fill="black"/>
        <rect x="600" y="160" width="30" height="50" rx="6" fill="${WHITE}"/>
        <path d="M 30 130 Q 10 130 10 145 Q 10 160 30 160" stroke="${WHITE}" stroke-width="10" stroke-linecap="round" fill="none"/>
      </g>
      <text x="512" y="620" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="100" fill="${WHITE}">سارد</text>
    </svg>`;
}

// Favicon
function createFaviconSVG(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
      <defs>
        <linearGradient id="fbg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#033D2E"/>
          <stop offset="100%" style="stop-color:${DARK_BG}"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#fbg)"/>
      <!-- Simplified truck for small size -->
      <g transform="translate(6, 12) scale(0.055)">
        <rect x="460" y="60" width="160" height="180" rx="20" fill="${WHITE}"/>
        <rect x="20" y="140" width="460" height="30" rx="6" fill="${WHITE}"/>
        <rect x="60" y="170" width="540" height="40" rx="8" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="520" cy="230" r="20" fill="${DARK_BG}"/>
        <circle cx="160" cy="230" r="42" fill="${WHITE}"/>
        <circle cx="160" cy="230" r="20" fill="${DARK_BG}"/>
      </g>
    </svg>`;
}

async function generate() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  const tasks = [
    {
      name: 'icon.png',
      svg: createAppIconSVG(1024),
      size: 1024,
    },
    {
      name: 'splash-icon.png',
      svg: createSplashIconSVG(512),
      size: 512,
    },
    {
      name: 'android-icon-foreground.png',
      svg: createAdaptiveForegroundSVG(1024),
      size: 1024,
    },
    {
      name: 'android-icon-background.png',
      svg: createAdaptiveBackgroundSVG(1024),
      size: 1024,
    },
    {
      name: 'android-icon-monochrome.png',
      svg: createMonochromeSVG(1024),
      size: 1024,
    },
    {
      name: 'adaptive-icon.png',
      svg: createAppIconSVG(1024),
      size: 1024,
    },
    {
      name: 'favicon.png',
      svg: createFaviconSVG(48),
      size: 48,
    },
  ];

  for (const task of tasks) {
    const outPath = path.join(assetsDir, task.name);
    await sharp(Buffer.from(task.svg))
      .resize(task.size, task.size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${task.name} (${task.size}x${task.size})`);
  }

  console.log('\nAll icons generated successfully!');
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
