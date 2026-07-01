// ─────────────────────────────────────────────────────────────
// Auron Design System — Light Purple Theme
// Single source of truth. Import in every component.
// ─────────────────────────────────────────────────────────────

export const T = {
  // ── Backgrounds ──────────────────────────────
  pageBg:       '#F0EFF8',      // very light lavender page background
  surface:      '#FFFFFF',      // white cards
  surfaceLight: '#F5F4FC',      // slightly tinted surface
  surfaceMid:   '#ECEAF8',      // input backgrounds, subtle containers
  heroGrad1:    '#5548D9',      // hero card gradient start
  heroGrad2:    '#7B6CF6',      // hero card gradient end
  heroSurface:  'rgba(255,255,255,0.15)', // frosted elements inside hero

  // ── Brand purple ─────────────────────────────
  purple:       '#6C5CE7',
  purpleLight:  'rgba(108,92,231,0.12)',
  purpleMid:    'rgba(108,92,231,0.25)',
  purpleDark:   '#4B3FC7',

  // ── Semantic colours ─────────────────────────
  green:        '#2ECC71',
  greenLight:   'rgba(46,204,113,0.12)',
  amber:        '#F5A623',
  amberLight:   'rgba(245,166,35,0.12)',
  red:          '#E05252',
  redLight:     'rgba(224,82,82,0.12)',
  blue:         '#4DB6F5',
  blueLight:    'rgba(77,182,245,0.12)',

  // ── Text ─────────────────────────────────────
  text:         '#1A1A2E',      // near-black primary text
  textMuted:    '#7A7A9A',      // secondary text
  textDim:      '#ADADC8',      // placeholder / disabled
  textOnHero:   '#FFFFFF',      // text on purple hero card
  textOnHeroMuted: 'rgba(255,255,255,0.7)',

  // ── Borders & dividers ───────────────────────
  border:       'rgba(108,92,231,0.12)',
  borderStrong: 'rgba(108,92,231,0.28)',
  divider:      '#EBEBF5',

  // ── Shadows ──────────────────────────────────
  shadow:       '0 2px 16px rgba(108,92,231,0.10)',
  shadowStrong: '0 4px 24px rgba(108,92,231,0.18)',
  shadowCard:   '0 1px 8px rgba(26,26,46,0.06)',
}

// Global CSS string — inject once in App.jsx via <style>
export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${T.pageBg};
    color: ${T.text};
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

  input, button, select, textarea { font-family: inherit; }
  button { cursor: pointer; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn   { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`
