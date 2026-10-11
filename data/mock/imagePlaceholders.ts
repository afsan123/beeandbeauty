/**
 * Generates bespoke, luxury SVG data URI placeholders for Bee&Beauty products
 * Completely self-contained, no external requests, zero placeholder bloat
 */

type ProductType = 'lipstick' | 'liquid_lipstick' | 'foundation' | 'compact' | 'kajal' | 'mascara' | 'palette' | 'nail' | 'serum' | 'kit';

export function createProductSvg(
  type: ProductType,
  title: string,
  primaryHex: string = '#C5A059',
  secondaryHex: string = '#111111',
  variantName: string = ''
): string {
  let illustration = '';

  switch (type) {
    case 'lipstick':
      illustration = `
        <!-- Lipstick base -->
        <rect x="150" y="220" width="100" height="150" rx="4" fill="#1A1A1A" stroke="#C5A059" stroke-width="2"/>
        <rect x="160" y="170" width="80" height="50" fill="#D4AF37"/>
        <!-- Lipstick bullet -->
        <path d="M165 170 L165 90 C165 70 235 50 235 90 L235 170 Z" fill="${primaryHex}"/>
        <path d="M175 160 L210 80" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round"/>
        <!-- Brand embossing band -->
        <rect x="150" y="215" width="100" height="10" fill="#C5A059"/>
      `;
      break;

    case 'liquid_lipstick':
      illustration = `
        <!-- Vial tube -->
        <rect x="165" y="140" width="70" height="220" rx="6" fill="#F8F8F8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="175" y="160" width="50" height="180" rx="3" fill="${primaryHex}"/>
        <!-- Cap & wand -->
        <rect x="160" y="40" width="80" height="100" rx="4" fill="#111111" stroke="#C5A059" stroke-width="1.5"/>
        <line x1="200" y1="40" x2="200" y2="140" stroke="#C5A059" stroke-width="3"/>
      `;
      break;

    case 'foundation':
      illustration = `
        <!-- Glass bottle -->
        <rect x="140" y="130" width="120" height="220" rx="14" fill="#FFFFFF" stroke="#E2E2E2" stroke-width="2"/>
        <rect x="150" y="150" width="100" height="180" rx="8" fill="${primaryHex}" opacity="0.9"/>
        <!-- Frosted finish line -->
        <path d="M150 170 Q200 160 250 170 L250 330 L150 330 Z" fill="${primaryHex}"/>
        <!-- Pump & collar -->
        <rect x="180" y="100" width="40" height="30" fill="#D4AF37"/>
        <rect x="170" y="50" width="60" height="50" rx="6" fill="#111111"/>
        <path d="M170 65 L150 65" stroke="#111111" stroke-width="8" stroke-linecap="round"/>
      `;
      break;

    case 'compact':
      illustration = `
        <!-- Compact outer case -->
        <circle cx="200" cy="200" r="140" fill="#111111" stroke="#C5A059" stroke-width="3"/>
        <circle cx="200" cy="200" r="115" fill="#1F1F1F"/>
        <!-- Powder pan -->
        <circle cx="200" cy="200" r="100" fill="${primaryHex}"/>
        <!-- Pressed waffle/honeycomb pattern -->
        <circle cx="200" cy="200" r="85" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="6,4"/>
        <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      `;
      break;

    case 'kajal':
    case 'mascara':
      illustration = `
        <!-- Sleek cylindrical tube -->
        <rect x="180" y="30" width="40" height="340" rx="20" fill="#111111" stroke="#C5A059" stroke-width="2"/>
        <rect x="180" y="150" width="40" height="15" fill="#C5A059"/>
        <circle cx="200" cy="80" r="6" fill="${primaryHex}"/>
        <line x1="200" y1="180" x2="200" y2="320" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      `;
      break;

    case 'palette':
      illustration = `
        <!-- Palette tray -->
        <rect x="70" y="90" width="260" height="220" rx="10" fill="#111111" stroke="#C5A059" stroke-width="2"/>
        <!-- 4 shade pans -->
        <rect x="95" y="120" width="95" height="75" rx="6" fill="${primaryHex}"/>
        <rect x="210" y="120" width="95" height="75" rx="6" fill="${secondaryHex}"/>
        <rect x="95" y="210" width="95" height="75" rx="6" fill="#C5A059"/>
        <rect x="210" y="210" width="95" height="75" rx="6" fill="#8C3A48"/>
      `;
      break;

    case 'nail':
      illustration = `
        <!-- Bottle -->
        <rect x="145" y="170" width="110" height="160" rx="18" fill="#FFFFFF" stroke="#E2E2E2" stroke-width="2"/>
        <rect x="155" y="185" width="90" height="130" rx="10" fill="${primaryHex}"/>
        <!-- Tall handle cap -->
        <rect x="175" y="50" width="50" height="120" rx="4" fill="#111111" stroke="#C5A059" stroke-width="1.5"/>
      `;
      break;

    case 'serum':
      illustration = `
        <!-- Dropper bottle -->
        <rect x="145" y="140" width="110" height="200" rx="20" fill="#FDFCF7" stroke="#E0DACB" stroke-width="2"/>
        <rect x="155" y="165" width="90" height="155" rx="12" fill="${primaryHex}" opacity="0.85"/>
        <!-- Golden dropper ring & rubber teat -->
        <rect x="175" y="105" width="50" height="35" rx="3" fill="#C5A059"/>
        <ellipse cx="200" cy="85" rx="20" ry="25" fill="#1A1A1A"/>
      `;
      break;

    case 'kit':
    default:
      illustration = `
        <!-- Luxury presentation gift box -->
        <rect x="80" y="100" width="240" height="210" rx="8" fill="#141414" stroke="#C5A059" stroke-width="3"/>
        <!-- Gold ribbon band -->
        <rect x="185" y="100" width="30" height="210" fill="#D4AF37"/>
        <rect x="80" y="190" width="240" height="26" fill="#D4AF37"/>
        <!-- Center emblem seal -->
        <circle cx="200" cy="203" r="28" fill="#141414" stroke="#D4AF37" stroke-width="2"/>
        <circle cx="200" cy="203" r="22" fill="${primaryHex}"/>
      `;
      break;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#FCFCFA"/>
          <stop offset="60%" stop-color="#F4F4F0"/>
          <stop offset="100%" stop-color="#ECECE6"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg-glow)"/>
      <g filter="url(#shadow)">
        ${illustration}
      </g>
      <!-- Brand watermark footer -->
      <text x="200" y="375" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#888888" letter-spacing="3">BEE &amp; BEAUTY</text>
      ${variantName ? `<text x="200" y="30" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="500" fill="#666666" letter-spacing="1.5">${variantName.toUpperCase()}</text>` : ''}
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
