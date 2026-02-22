// scripts/generate-avatars.mjs
// Generates full-frame rectangular SVG portrait cards per celebrity
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'celebs')
mkdirSync(OUT_DIR, { recursive: true })

// Each celebrity has carefully chosen visual traits
const celebs = [
  {
    id: 'cr7', name: 'Cristiano Ronaldo', category: 'Football · Portugal',
    c1: '#1a56db', c2: '#0e9f6e', c3: '#0a3a8a',
    skin: '#c8956c', hair: '#100800', eyeColor: '#3a2010',
    // Short slicked-back hair, strong jaw, clean-shaven, athletic
    hairStyle: 'slicked', beard: false, female: false,
    // Characteristic: strong brow, square jaw
    jawW: 46, headW: 48, cheekH: 56, foreheadH: 0.38,
  },
  {
    id: 'salah', name: 'Mohamed Salah', category: 'Football · Egypt',
    c1: '#c62a47', c2: '#ff6b35', c3: '#8a1020',
    skin: '#b5743a', hair: '#0a0800', eyeColor: '#2a1808',
    // Tight curls, full beard, warm smile
    hairStyle: 'curly', beard: true, female: false,
    jawW: 44, headW: 46, cheekH: 54, foreheadH: 0.36,
  },
  {
    id: 'amr-diab', name: 'Amr Diab', category: 'Music · Egypt',
    c1: '#f59e0b', c2: '#b45309', c3: '#92400e',
    skin: '#c8956c', hair: '#1e1008', eyeColor: '#2a1808',
    // Wavy medium hair, goatee/stubble, mature
    hairStyle: 'wavy', beard: true, female: false,
    jawW: 43, headW: 46, cheekH: 55, foreheadH: 0.37,
  },
  {
    id: 'nancy-ajram', name: 'Nancy Ajram', category: 'Music · Lebanon',
    c1: '#ec4899', c2: '#7c3aed', c3: '#9d174d',
    skin: '#f0c8a0', hair: '#180e06', eyeColor: '#2a1808',
    // Long wavy dark hair, feminine, full lips
    hairStyle: 'long-wavy', beard: false, female: true,
    jawW: 40, headW: 44, cheekH: 52, foreheadH: 0.4,
  },
  {
    id: 'neymar', name: 'Neymar Jr.', category: 'Football · Brazil',
    c1: '#fbbf24', c2: '#059669', c3: '#d97706',
    skin: '#a0612a', hair: '#0a0800', eyeColor: '#2a1808',
    // Short dark hair often styled, clean-shaven, young face
    hairStyle: 'styled-short', beard: false, female: false,
    jawW: 42, headW: 46, cheekH: 54, foreheadH: 0.38,
  },
  {
    id: 'mrbeast', name: 'MrBeast', category: 'YouTube · USA',
    c1: '#2563eb', c2: '#1d4ed8', c3: '#1e3a8a',
    skin: '#f0c8a0', hair: '#3d2010', eyeColor: '#3a2010',
    // Casual medium brown hair, young, clean-shaven
    hairStyle: 'casual-medium', beard: false, female: false,
    jawW: 44, headW: 47, cheekH: 55, foreheadH: 0.39,
  },
  {
    id: 'elissa', name: 'Elissa', category: 'Music · Lebanon',
    c1: '#f472b6', c2: '#a855f7', c3: '#be185d',
    skin: '#f0c8a0', hair: '#c9a030', eyeColor: '#3a2010',
    // Honey/golden blonde long hair, glamorous, defined eyes
    hairStyle: 'long-blonde', beard: false, female: true,
    jawW: 39, headW: 43, cheekH: 51, foreheadH: 0.41,
  },
  {
    id: 'srk', name: 'Shah Rukh Khan', category: 'Bollywood · India',
    c1: '#6366f1', c2: '#7c3aed', c3: '#3730a3',
    skin: '#c8956c', hair: '#100800', eyeColor: '#2a1808',
    // Iconic floppy dark hair, trademark dimple, slight stubble
    hairStyle: 'floppy', beard: false, female: false, stubble: true,
    jawW: 43, headW: 46, cheekH: 54, foreheadH: 0.37,
  },
  {
    id: 'khaby', name: 'Khaby Lame', category: 'TikTok · Italy/Senegal',
    c1: '#059669', c2: '#065f46', c3: '#047857',
    skin: '#4a2810', hair: '#080808', eyeColor: '#0a0808',
    // Very short/shaved hair, deadpan wide eyes, clean shaven
    hairStyle: 'shaved', beard: false, female: false,
    jawW: 46, headW: 50, cheekH: 56, foreheadH: 0.34,
  },
  {
    id: 'tamer-hosny', name: 'Tamer Hosny', category: 'Music · Egypt',
    c1: '#f97316', c2: '#b91c1c', c3: '#c2410c',
    skin: '#c8956c', hair: '#100800', eyeColor: '#2a1808',
    // Gelled dark hair, clean-cut, boyish charm
    hairStyle: 'gelled', beard: false, female: false,
    jawW: 42, headW: 45, cheekH: 53, foreheadH: 0.38,
  },
  {
    id: 'gary-vee', name: 'Gary Vaynerchuk', category: 'Business · USA',
    c1: '#6366f1', c2: '#4338ca', c3: '#312e81',
    skin: '#f0c8a0', hair: '#2c2c2c', eyeColor: '#2a1808',
    // Short dark-grey hair, slight stubble, intense gaze
    hairStyle: 'short-grey', beard: false, female: false, stubble: true,
    jawW: 45, headW: 48, cheekH: 55, foreheadH: 0.36,
  },
  {
    id: 'haifa', name: 'Haifa Wehbe', category: 'Music · Lebanon',
    c1: '#f59e0b', c2: '#dc2626', c3: '#92400e',
    skin: '#f0c8a0', hair: '#c9a030', eyeColor: '#3a2010',
    // Long golden hair, iconic glamour, striking features
    hairStyle: 'long-glam', beard: false, female: true,
    jawW: 38, headW: 42, cheekH: 50, foreheadH: 0.42,
  },
  {
    id: 'federer', name: 'Roger Federer', category: 'Tennis · Switzerland',
    c1: '#0ea5e9', c2: '#0369a1', c3: '#0c4a6e',
    skin: '#f0c8a0', hair: '#4a2c10', eyeColor: '#3a2010',
    // Clean light-brown short hair, calm smile, athletic
    hairStyle: 'clean-short', beard: false, female: false,
    jawW: 44, headW: 47, cheekH: 55, foreheadH: 0.38,
  },
  {
    id: 'weeknd', name: 'The Weeknd', category: 'R&B · Canada',
    c1: '#1e1b4b', c2: '#6d28d9', c3: '#0f0e2e',
    skin: '#4a2810', hair: '#080808', eyeColor: '#0a0808',
    // Signature high-top dreadlocks/fro, intense dark gaze, slight beard
    hairStyle: 'hightop', beard: true, female: false,
    jawW: 44, headW: 47, cheekH: 54, foreheadH: 0.35,
  },
  {
    id: 'messi', name: 'Lionel Messi', category: 'Football · Argentina',
    c1: '#3b82f6', c2: '#7c3aed', c3: '#1d4ed8',
    skin: '#d4a26a', hair: '#2c1810', eyeColor: '#2a1808',
    // Short wavy dark hair, signature beard, calm expression
    hairStyle: 'short-wave', beard: true, female: false,
    jawW: 42, headW: 45, cheekH: 53, foreheadH: 0.38,
  },
  {
    id: 'elon', name: 'Elon Musk', category: 'Business · USA',
    c1: '#374151', c2: '#111827', c3: '#1f2937',
    skin: '#f0c8a0', hair: '#555555', eyeColor: '#3a2010',
    // Thinning grey hair, plain look, slightly tired gaze
    hairStyle: 'receding-grey', beard: false, female: false,
    jawW: 46, headW: 49, cheekH: 56, foreheadH: 0.35,
  },
]

// ─── Hair shape generators ────────────────────────────────────────────────────

function getHair(style, hair, cx, topY, hw, hh) {
  const hx = cx
  switch (style) {
    case 'slicked':
      return `
        <ellipse cx="${hx}" cy="${topY - 10}" rx="${hw + 4}" ry="${hh * 0.45}" fill="${hair}"/>
        <rect x="${hx - hw - 2}" y="${topY - 10}" width="${(hw + 2) * 2}" height="${hh * 0.35}" fill="${hair}"/>
      `
    case 'curly':
      return `
        <ellipse cx="${hx}" cy="${topY - 12}" rx="${hw + 8}" ry="${hh * 0.55}" fill="${hair}"/>
        <ellipse cx="${hx - hw - 4}" cy="${topY + 6}" rx="10" ry="18" fill="${hair}"/>
        <ellipse cx="${hx + hw + 4}" cy="${topY + 6}" rx="10" ry="18" fill="${hair}"/>
      `
    case 'wavy':
      return `
        <ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 6}" ry="${hh * 0.48}" fill="${hair}"/>
        <ellipse cx="${hx - hw + 2}" cy="${topY + 10}" rx="11" ry="22" fill="${hair}"/>
        <ellipse cx="${hx + hw - 2}" cy="${topY + 10}" rx="11" ry="22" fill="${hair}"/>
      `
    case 'long-wavy':
      return `
        <ellipse cx="${hx}" cy="${topY - 10}" rx="${hw + 6}" ry="${hh * 0.5}" fill="${hair}"/>
        <rect x="${hx - hw - 8}" y="${topY + 5}" width="18" height="120" rx="9" fill="${hair}"/>
        <rect x="${hx + hw - 8}" y="${topY + 5}" width="18" height="120" rx="9" fill="${hair}"/>
        <ellipse cx="${hx}" cy="${topY + 90}" rx="${hw - 10}" ry="20" fill="${hair}"/>
      `
    case 'styled-short':
      return `
        <ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 3}" ry="${hh * 0.44}" fill="${hair}"/>
        <path d="M ${hx - hw - 2} ${topY + 2} Q ${hx} ${topY - 20} ${hx + hw + 2} ${topY + 2}" fill="${hair}"/>
      `
    case 'casual-medium':
      return `
        <ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 5}" ry="${hh * 0.5}" fill="${hair}"/>
        <ellipse cx="${hx - hw - 2}" cy="${topY + 12}" rx="9" ry="20" fill="${hair}"/>
        <ellipse cx="${hx + hw + 2}" cy="${topY + 12}" rx="9" ry="20" fill="${hair}"/>
      `
    case 'long-blonde':
      return `
        <ellipse cx="${hx}" cy="${topY - 10}" rx="${hw + 7}" ry="${hh * 0.52}" fill="${hair}"/>
        <rect x="${hx - hw - 10}" y="${topY + 5}" width="20" height="130" rx="10" fill="${hair}"/>
        <rect x="${hx + hw - 8}" y="${topY + 5}" width="20" height="130" rx="10" fill="${hair}"/>
      `
    case 'floppy':
      return `
        <ellipse cx="${hx}" cy="${topY - 14}" rx="${hw + 7}" ry="${hh * 0.52}" fill="${hair}"/>
        <path d="M ${hx - hw - 6} ${topY + 5} Q ${hx - 20} ${topY - 28} ${hx + hw + 6} ${topY + 5}" fill="${hair}"/>
        <ellipse cx="${hx - 15}" cy="${topY - 5}" rx="18" ry="12" fill="${hair}" transform="rotate(-15, ${hx - 15}, ${topY - 5})"/>
      `
    case 'shaved':
      return `<ellipse cx="${hx}" cy="${topY - 2}" rx="${hw + 1}" ry="${hh * 0.28}" fill="${hair}" opacity="0.7"/>`
    case 'gelled':
      return `
        <ellipse cx="${hx}" cy="${topY - 10}" rx="${hw + 3}" ry="${hh * 0.46}" fill="${hair}"/>
        <path d="M ${hx - 20} ${topY - 12} Q ${hx} ${topY - 28} ${hx + 22} ${topY - 14}" fill="${hair}" stroke="none"/>
      `
    case 'short-grey':
      return `<ellipse cx="${hx}" cy="${topY - 6}" rx="${hw + 2}" ry="${hh * 0.40}" fill="${hair}"/>`
    case 'long-glam':
      return `
        <ellipse cx="${hx}" cy="${topY - 10}" rx="${hw + 8}" ry="${hh * 0.54}" fill="${hair}"/>
        <rect x="${hx - hw - 12}" y="${topY + 5}" width="22" height="140" rx="11" fill="${hair}"/>
        <rect x="${hx + hw - 8}" y="${topY + 5}" width="22" height="140" rx="11" fill="${hair}"/>
        <ellipse cx="${hx}" cy="${topY + 100}" rx="${hw}" ry="18" fill="${hair}"/>
      `
    case 'clean-short':
      return `<ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 2}" ry="${hh * 0.42}" fill="${hair}"/>`
    case 'hightop':
      // Signature fro/hightop
      return `
        <ellipse cx="${hx}" cy="${topY - 30}" rx="${hw + 10}" ry="${hh * 0.75}" fill="${hair}"/>
        <ellipse cx="${hx - hw - 3}" cy="${topY + 8}" rx="9" ry="20" fill="${hair}"/>
        <ellipse cx="${hx + hw + 3}" cy="${topY + 8}" rx="9" ry="20" fill="${hair}"/>
      `
    case 'short-wave':
      return `
        <ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 4}" ry="${hh * 0.46}" fill="${hair}"/>
        <ellipse cx="${hx - hw - 2}" cy="${topY + 8}" rx="9" ry="18" fill="${hair}"/>
        <ellipse cx="${hx + hw + 2}" cy="${topY + 8}" rx="9" ry="18" fill="${hair}"/>
      `
    case 'receding-grey':
      return `
        <ellipse cx="${hx - hw * 0.6}" cy="${topY - 4}" rx="20" ry="${hh * 0.32}" fill="${hair}" opacity="0.8"/>
        <ellipse cx="${hx + hw * 0.6}" cy="${topY - 4}" rx="20" ry="${hh * 0.32}" fill="${hair}" opacity="0.8"/>
        <ellipse cx="${hx}" cy="${topY - 2}" rx="${hw - 10}" ry="${hh * 0.22}" fill="${hair}" opacity="0.5"/>
      `
    default:
      return `<ellipse cx="${hx}" cy="${topY - 8}" rx="${hw + 2}" ry="${hh * 0.44}" fill="${hair}"/>`
  }
}

// ─── Main SVG builder ─────────────────────────────────────────────────────────

function makeSVG(c) {
  const {
    id, name, category, c1, c2, c3,
    skin, hair, eyeColor, hairStyle,
    beard, female, stubble,
    jawW, headW, cheekH, foreheadH,
  } = c

  const W = 300, H = 380
  // Portrait composition: head centred horizontally, positioned in upper-mid area
  const cx = W / 2
  const headCY = 175           // vertical centre of head ellipse
  const headRX = headW         // half-width of head
  const headRY = cheekH        // half-height of head
  const headTopY = headCY - headRY
  const hairTopY = headTopY    // hair starts at head top

  const neckTop = headCY + headRY - 8
  const neckH   = 30
  const neckW   = jawW * 0.55

  const irisColor = ['#c9a030', '#4a2c10', '#555555', '#2c2c2c'].includes(hair)
    ? '#7c5c30' : '#2c1810'

  // Iris placement offset for male/female
  const eyeSpread = female ? 16 : 18
  const eyeLX = cx - eyeSpread
  const eyeRX = cx + eyeSpread
  const eyeY  = headCY - headRY * 0.15

  // Beard fill
  const beardSVG = beard
    ? `<ellipse cx="${cx}" cy="${headCY + headRY * 0.6}" rx="${jawW * 0.72}" ry="${headRY * 0.28}" fill="${hair}" opacity="0.62"/>
       <ellipse cx="${cx}" cy="${headCY + headRY * 0.42}" rx="${jawW * 0.58}" ry="${headRY * 0.18}" fill="${hair}" opacity="0.45"/>`
    : ''

  const stubbleSVG = stubble
    ? `<ellipse cx="${cx}" cy="${headCY + headRY * 0.55}" rx="${jawW * 0.65}" ry="${headRY * 0.22}" fill="${hair}" opacity="0.25"/>`
    : ''

  // Mouth
  const mouthY = headCY + headRY * 0.55
  const mouthSVG = female
    ? `<path d="M ${cx - 11} ${mouthY} Q ${cx} ${mouthY + 8} ${cx + 11} ${mouthY}" stroke="#d4607a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
       <path d="M ${cx - 8} ${mouthY} Q ${cx} ${mouthY + 4} ${cx + 8} ${mouthY}" fill="rgba(212,96,122,0.18)"/>`
    : `<path d="M ${cx - 13} ${mouthY} Q ${cx} ${mouthY + 9} ${cx + 13} ${mouthY}" stroke="rgba(0,0,0,0.22)" stroke-width="2" fill="none" stroke-linecap="round"/>`

  // Female lashes
  const lashSVG = female
    ? `<line x1="${eyeLX - 7}" y1="${eyeY - 4}" x2="${eyeLX - 9}" y2="${eyeY - 8}" stroke="${hair}" stroke-width="1.2"/>
       <line x1="${eyeLX - 3}" y1="${eyeY - 5.5}" x2="${eyeLX - 4}" y2="${eyeY - 9.5}" stroke="${hair}" stroke-width="1.2"/>
       <line x1="${eyeLX + 2}" y1="${eyeY - 5.5}" x2="${eyeLX + 2}" y2="${eyeY - 9.5}" stroke="${hair}" stroke-width="1.2"/>
       <line x1="${eyeRX - 2}" y1="${eyeY - 5.5}" x2="${eyeRX - 2}" y2="${eyeY - 9.5}" stroke="${hair}" stroke-width="1.2"/>
       <line x1="${eyeRX + 3}" y1="${eyeY - 5.5}" x2="${eyeRX + 4}" y2="${eyeY - 9.5}" stroke="${hair}" stroke-width="1.2"/>
       <line x1="${eyeRX + 7}" y1="${eyeY - 4}" x2="${eyeRX + 9}" y2="${eyeY - 8}" stroke="${hair}" stroke-width="1.2"/>`
    : ''

  const browW = female ? 10 : 12
  const browThick = female ? 1.7 : 2.6
  const browY = eyeY - headRY * 0.2

  // Shirt colour bands for shoulders
  const shirtRX = female ? 90 : 110

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="floor-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c3}"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="namebar-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
    </linearGradient>
    <radialGradient id="spotlight-${id}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.20)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>

  <!-- Background gradient fills full frame – no clip -->
  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#spotlight-${id})"/>

  <!-- Floor / lower darker band -->
  <rect x="0" y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="url(#floor-${id})"/>

  <!-- Subtle decorative orbs -->
  <circle cx="30"  cy="30"  r="80"  fill="rgba(255,255,255,0.05)"/>
  <circle cx="${W - 20}" cy="${H - 20}" r="90" fill="rgba(0,0,0,0.07)"/>

  <!-- Clothes / shirt collar area -->
  <ellipse cx="${cx}" cy="${H + 10}" rx="${shirtRX}" ry="${H * 0.32}" fill="${c1}dd"/>
  <ellipse cx="${cx}" cy="${H + 10}" rx="${shirtRX * 0.82}" ry="${H * 0.27}" fill="${c1}ff"/>

  <!-- Neck -->
  <rect x="${cx - neckW}" y="${neckTop}" width="${neckW * 2}" height="${neckH + 10}" rx="${neckW * 0.7}" fill="${skin}"/>

  <!-- ── Hair behind head ── -->
  ${getHair(hairStyle, hair, cx, hairTopY, headRX, headRY)}

  <!-- ── Head ── -->
  <ellipse cx="${cx}" cy="${headCY}" rx="${headRX}" ry="${headRY}" fill="${skin}"/>

  <!-- Ears -->
  <ellipse cx="${cx - headRX - 1}" cy="${headCY + headRY * 0.06}" rx="7" ry="9" fill="${skin}"/>
  <ellipse cx="${cx + headRX + 1}" cy="${headCY + headRY * 0.06}" rx="7" ry="9" fill="${skin}"/>
  <ellipse cx="${cx - headRX - 1}" cy="${headCY + headRY * 0.06}" rx="3.5" ry="5" fill="${skin}" opacity="0.7"/>
  <ellipse cx="${cx + headRX + 1}" cy="${headCY + headRY * 0.06}" rx="3.5" ry="5" fill="${skin}" opacity="0.7"/>

  <!-- ── Eyebrows ── -->
  <path d="M ${eyeLX - browW - 2} ${browY + 3} Q ${eyeLX} ${browY - 4} ${eyeLX + browW} ${browY + 1}"
    stroke="${hair}" stroke-width="${browThick}" fill="none" stroke-linecap="round"/>
  <path d="M ${eyeRX - browW} ${browY + 1} Q ${eyeRX} ${browY - 4} ${eyeRX + browW + 2} ${browY + 3}"
    stroke="${hair}" stroke-width="${browThick}" fill="none" stroke-linecap="round"/>

  <!-- ── Eyes ── -->
  <ellipse cx="${eyeLX}" cy="${eyeY}" rx="7.5" ry="5.5" fill="white"/>
  <ellipse cx="${eyeRX}" cy="${eyeY}" rx="7.5" ry="5.5" fill="white"/>
  <!-- Iris -->
  <circle cx="${eyeLX}" cy="${eyeY}" r="4.2" fill="${irisColor}"/>
  <circle cx="${eyeRX}" cy="${eyeY}" r="4.2" fill="${irisColor}"/>
  <!-- Pupil -->
  <circle cx="${eyeLX}" cy="${eyeY}" r="2.6" fill="rgba(0,0,0,0.88)"/>
  <circle cx="${eyeRX}" cy="${eyeY}" r="2.6" fill="rgba(0,0,0,0.88)"/>
  <!-- Highlight -->
  <circle cx="${eyeLX + 1.5}" cy="${eyeY - 1.5}" r="1.3" fill="rgba(255,255,255,0.92)"/>
  <circle cx="${eyeRX + 1.5}" cy="${eyeY - 1.5}" r="1.3" fill="rgba(255,255,255,0.92)"/>
  ${lashSVG}

  <!-- ── Nose ── -->
  <path d="M ${cx - 4} ${headCY + headRY * 0.12} L ${cx - 7} ${headCY + headRY * 0.42} Q ${cx} ${headCY + headRY * 0.48} ${cx + 7} ${headCY + headRY * 0.42} L ${cx + 4} ${headCY + headRY * 0.12}"
    stroke="rgba(0,0,0,0.10)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx - 6.5}" cy="${headCY + headRY * 0.43}" rx="4" ry="2.5" fill="rgba(0,0,0,0.07)"/>
  <ellipse cx="${cx + 6.5}" cy="${headCY + headRY * 0.43}" rx="4" ry="2.5" fill="rgba(0,0,0,0.07)"/>

  <!-- ── Mouth / Beard / Stubble ── -->
  ${mouthSVG}
  ${beardSVG}
  ${stubbleSVG}

  <!-- ── Bottom name bar ── -->
  <rect x="0" y="${H * 0.74}" width="${W}" height="${H * 0.26}" fill="url(#namebar-${id})"/>

  <text x="${cx}" y="${H - 34}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-size="16" font-weight="900"
    fill="rgba(255,255,255,0.97)" letter-spacing="0.3">${name}</text>

  <text x="${cx}" y="${H - 14}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11" font-weight="400"
    fill="rgba(255,255,255,0.68)" letter-spacing="0.5">${category}</text>
</svg>`
}

let count = 0
for (const c of celebs) {
  const svg = makeSVG(c)
  writeFileSync(join(OUT_DIR, `${c.id}.svg`), svg, 'utf8')
  count++
  console.log(`✓  ${c.id}.svg`)
}
console.log(`\nDone! ${count} avatars → public/celebs/`)
