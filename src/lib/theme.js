// Auron design tokens
// Using var declarations to prevent Rollup TDZ initialization errors
// in production bundles when this module is imported by multiple files

var T = {
  pageBg:          '#F0EFF8',
  surface:         '#FFFFFF',
  surfaceLight:    '#F5F4FC',
  surfaceMid:      '#ECEAF8',
  heroGrad1:       '#5548D9',
  heroGrad2:       '#7B6CF6',
  heroSurface:     'rgba(255,255,255,0.15)',
  purple:          '#6C5CE7',
  purpleLight:     'rgba(108,92,231,0.12)',
  purpleMid:       'rgba(108,92,231,0.25)',
  purpleDark:      '#4B3FC7',
  green:           '#2ECC71',
  greenLight:      'rgba(46,204,113,0.12)',
  amber:           '#F5A623',
  amberLight:      'rgba(245,166,35,0.12)',
  red:             '#E05252',
  redLight:        'rgba(224,82,82,0.12)',
  blue:            '#4DB6F5',
  blueLight:       'rgba(77,182,245,0.12)',
  text:            '#1A1A2E',
  textMuted:       '#7A7A9A',
  textDim:         '#ADADC8',
  textOnHero:      '#FFFFFF',
  textOnHeroMuted: 'rgba(255,255,255,0.7)',
  border:          'rgba(108,92,231,0.12)',
  borderStrong:    'rgba(108,92,231,0.28)',
  divider:         '#EBEBF5',
  shadow:          '0 2px 16px rgba(108,92,231,0.10)',
  shadowStrong:    '0 4px 24px rgba(108,92,231,0.18)',
  shadowCard:      '0 1px 8px rgba(26,26,46,0.06)',
}

var globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F0EFF8; color: #1A1A2E; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(108,92,231,0.2); border-radius: 2px; }
  input, button, select, textarea { font-family: inherit; }
  button { cursor: pointer; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn   { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`

export { T, globalCss }
