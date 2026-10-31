export function renderProductSvg(productId, query = {}, productRecord = null) {
  const view = query.view || 'hero';
  const customHex = query.color || null;

  const themes = {
    'prod-aether-pro': {
      accent: customHex || '#6366f1',
      secondary: '#a855f7',
      bg1: '#090d16',
      bg2: '#131b2e',
      label: 'AETHER PRO X1 // 106MM PLANAR',
      code: 'NEX-AUD-001',
      kind: 'headphones'
    },
    'prod-chronos-key': {
      accent: customHex || '#10b981',
      secondary: '#06b6d4',
      bg1: '#071318',
      bg2: '#0f292f',
      label: 'CHRONOS 75 // HALL-EFFECT 8KHZ',
      code: 'NEX-PER-002',
      kind: 'keyboard'
    },
    'prod-nova-book': {
      accent: customHex || '#06b6d4',
      secondary: '#3b82f6',
      bg1: '#080e1a',
      bg2: '#111f38',
      label: 'NOVABOOK PRO 16 // TANDEM OLED',
      code: 'NEX-CMP-003',
      kind: 'laptop'
    },
    'prod-solaris-watch': {
      accent: customHex || '#f59e0b',
      secondary: '#ef4444',
      bg1: '#140f09',
      bg2: '#271c11',
      label: 'SOLARIS APEX // GRADE-5 TITANIUM',
      code: 'NEX-WRB-004',
      kind: 'watch'
    },
    'prod-volt-gan': {
      accent: customHex || '#8b5cf6',
      secondary: '#ec4899',
      bg1: '#110a1c',
      bg2: '#221438',
      label: 'VOLTMATRIX 240W // GAN PRIME HUB',
      code: 'NEX-PWR-005',
      kind: 'powerhub'
    },
    'prod-lumina-cam': {
      accent: customHex || '#ec4899',
      secondary: '#f43f5e',
      bg1: '#170911',
      bg2: '#2b1220',
      label: 'LUMINA FX9 // 8K GLOBAL SHUTTER',
      code: 'NEX-IMG-006',
      kind: 'camera'
    },
    'prod-spectre-mouse': {
      accent: customHex || '#14b8a6',
      secondary: '#6366f1',
      bg1: '#091416',
      bg2: '#13282c',
      label: 'SPECTRE CARBON // 39G 42K DPI',
      code: 'NEX-PER-007',
      kind: 'mouse'
    },
    'prod-vision-air': {
      accent: customHex || '#38bdf8',
      secondary: '#818cf8',
      bg1: '#08111d',
      bg2: '#102238',
      label: 'VISIONAIR PRO // MICRO-OLED AR',
      code: 'NEX-WRB-008',
      kind: 'glasses'
    },
    'prod-pulse-dac': {
      accent: customHex || '#f59e0b',
      secondary: '#ec4899',
      bg1: '#160f09',
      bg2: '#2a1b10',
      label: 'PULSE R2R // BALANCED TUBE DAC',
      code: 'NEX-AUD-009',
      kind: 'dac'
    },
    'prod-aero-drone': {
      accent: customHex || '#22d3ee',
      secondary: '#10b981',
      bg1: '#08141c',
      bg2: '#0f2735',
      label: 'AEROVORTEX X4 // LIDAR CINE-DRONE',
      code: 'NEX-IMG-010',
      kind: 'drone'
    },
    'prod-canvas-display': {
      accent: customHex || '#60a5fa',
      secondary: '#c084fc',
      bg1: '#0a0f1d',
      bg2: '#16203a',
      label: 'PROCANVAS 32 // 6K MINI-LED',
      code: 'NEX-CMP-011',
      kind: 'display'
    },
    'prod-terra-powerstation': {
      accent: customHex || '#84cc16',
      secondary: '#10b981',
      bg1: '#0b1409',
      bg2: '#162712',
      label: 'TERRACORE 1500 // SOLID-STATE UPS',
      code: 'NEX-PWR-012',
      kind: 'powerstation'
    }
  };

  const categoryKindMap = {
    audio: 'headphones',
    compute: 'laptop',
    peripherals: 'keyboard',
    wearables: 'watch',
    power: 'powerhub',
    imaging: 'camera',
    displays: 'laptop',
    networking: 'powerhub'
  };
  const resolvedCategory = String(productRecord?.category || query.category || '').toLowerCase();

  const theme = themes[productId] || {
    accent: customHex || '#6366f1',
    secondary: '#06b6d4',
    bg1: '#0b101b',
    bg2: '#162033',
    label: String(productRecord?.name || query.name || 'NEX HARDWARE SERIES')
      .toUpperCase()
      .slice(0, 32),
    code: String(productRecord?.sku || query.sku || 'NEX-CUSTOM').toUpperCase(),
    kind: categoryKindMap[resolvedCategory] || 'generic'
  };

  const isBlueprint = view === 'blueprint';
  const isSpec = view === 'spec';
  const isDetail = view === 'detail';

  const bgStart = isBlueprint ? '#06152d' : theme.bg1;
  const bgEnd = isBlueprint ? '#0a254d' : theme.bg2;
  const primaryStroke = isBlueprint ? '#38bdf8' : theme.accent;

  let centerIllustration = '';

  switch (theme.kind) {
    case 'headphones':
      centerIllustration = `
        <g transform="translate(400, 290) ${isDetail ? 'scale(1.22)' : 'scale(1)'}">
          <!-- Headband outer arc -->
          <path d="M -145,20 A 145,150 0 0,1 145,20" fill="none" stroke="url(#metalGrad)" stroke-width="22" stroke-linecap="round"/>
          <path d="M -132,20 A 132,136 0 0,1 132,20" fill="none" stroke="${primaryStroke}" stroke-width="4" stroke-opacity="0.8"/>
          <!-- Yokes -->
          <line x1="-145" y1="20" x2="-145" y2="85" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
          <line x1="145" y1="20" x2="145" y2="85" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
          <!-- Left Ear Cup -->
          <g transform="translate(-135, 95) rotate(-8)">
            <rect x="-36" y="-65" width="72" height="130" rx="36" fill="#1e293b" stroke="${primaryStroke}" stroke-width="3"/>
            <rect x="-24" y="-50" width="48" height="100" rx="24" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
            <circle cx="0" cy="0" r="18" fill="none" stroke="${primaryStroke}" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="0" cy="0" r="6" fill="${primaryStroke}"/>
          </g>
          <!-- Right Ear Cup -->
          <g transform="translate(135, 95) rotate(8)">
            <rect x="-36" y="-65" width="72" height="130" rx="36" fill="#1e293b" stroke="${primaryStroke}" stroke-width="3"/>
            <rect x="-24" y="-50" width="48" height="100" rx="24" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
            <circle cx="0" cy="0" r="18" fill="none" stroke="${primaryStroke}" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="0" cy="0" r="6" fill="${primaryStroke}"/>
          </g>
          <!-- Acoustic Wave Rings -->
          <circle cx="0" cy="70" r="55" fill="none" stroke="${primaryStroke}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="6 6"/>
          <circle cx="0" cy="70" r="85" fill="none" stroke="${theme.secondary}" stroke-opacity="0.18" stroke-width="1.5"/>
        </g>
      `;
      break;

    case 'keyboard':
      centerIllustration = `
        <g transform="translate(400, 300) ${isDetail ? 'scale(1.18)' : 'scale(1)'}">
          <!-- CNC Chassis -->
          <rect x="-230" y="-95" width="460" height="190" rx="18" fill="#1e293b" stroke="${primaryStroke}" stroke-width="3"/>
          <rect x="-216" y="-81" width="432" height="162" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <!-- OLED Screen & Rotary Knob top-right -->
          <rect x="135" y="-68" width="42" height="24" rx="4" fill="#020617" stroke="${primaryStroke}" stroke-width="1.5"/>
          <text x="156" y="-52" fill="${primaryStroke}" font-family="monospace" font-size="9" text-anchor="middle">8KHz</text>
          <circle cx="196" cy="-56" r="13" fill="url(#metalGrad)" stroke="${primaryStroke}" stroke-width="2"/>
          <!-- Keycap Matrix -->
          ${[-68, -38, -8, 22, 52].map((y, rowIdx) => {
            const cols = rowIdx === 0 ? 11 : rowIdx === 4 ? 8 : 13;
            let xCursor = -204;
            const keys = [];
            for (let c = 0; c < cols; c++) {
              const w = (rowIdx === 4 && c === 3) ? 132 : (c === 0 && rowIdx > 0 && rowIdx < 4) ? 38 : 26;
              const isAccentKey = (rowIdx === 0 && c === 0) || (rowIdx === 2 && c === 12) || (rowIdx === 4 && c === 3);
              keys.push(`<rect x="${xCursor}" y="${y}" width="${w}" height="24" rx="5" fill="${isAccentKey ? primaryStroke : '#1e293b'}" fill-opacity="${isAccentKey ? '0.85' : '1'}" stroke="${isAccentKey ? '#ffffff' : '#475569'}" stroke-width="1"/>`);
              xCursor += w + 5;
            }
            return keys.join('');
          }).join('')}
        </g>
      `;
      break;

    case 'laptop':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.18)' : 'scale(1)'}">
          <!-- Display Lid -->
          <rect x="-195" y="-125" width="390" height="230" rx="14" fill="#0f172a" stroke="${primaryStroke}" stroke-width="3"/>
          <rect x="-183" y="-113" width="366" height="206" rx="8" fill="url(#screenGlow)"/>
          <!-- Neural Waveform inside screen -->
          <path d="M -150,20 C -90,-65 -30,75 30,-40 C 90,-95 130,30 160,-20" fill="none" stroke="${primaryStroke}" stroke-width="3.5"/>
          <path d="M -150,40 C -80,-25 -20,85 50,-10 C 100,-55 140,45 160,10" fill="none" stroke="${theme.secondary}" stroke-width="2" stroke-opacity="0.7"/>
          <circle cx="0" cy="-15" r="38" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-dasharray="4 4"/>
          <!-- Unibody Base -->
          <path d="M -235,105 L 235,105 L 215,124 L -215,124 Z" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.5"/>
          <rect x="-42" y="105" width="84" height="6" rx="3" fill="${primaryStroke}"/>
        </g>
      `;
      break;

    case 'watch':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.22)' : 'scale(1)'}">
          <!-- Top & Bottom Titanium Strap -->
          <path d="M -52,-155 L 52,-155 L 64,-85 L -64,-85 Z" fill="#334155" stroke="#64748b" stroke-width="2"/>
          <path d="M -64,85 L 64,85 L 52,155 L -52,155 Z" fill="#334155" stroke="#64748b" stroke-width="2"/>
          <!-- Crown & Action Button -->
          <rect x="96" y="-38" width="14" height="32" rx="5" fill="${primaryStroke}"/>
          <rect x="-108" y="12" width="10" height="26" rx="4" fill="#f97316"/>
          <!-- Octagonal Titanium Bezel -->
          <circle cx="0" cy="0" r="98" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="3"/>
          <circle cx="0" cy="0" r="82" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
          <!-- Watch Face Telemetry -->
          <circle cx="0" cy="0" r="66" fill="none" stroke="${primaryStroke}" stroke-opacity="0.3" stroke-width="6" stroke-dasharray="18 6"/>
          <text x="0" y="-18" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">SOLAR TITANIUM</text>
          <text x="0" y="14" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="32" text-anchor="middle">10:49</text>
          <text x="0" y="42" fill="${primaryStroke}" font-family="monospace" font-size="12" text-anchor="middle">♥ 62 BPM • 98% SPO2</text>
        </g>
      `;
      break;

    case 'powerhub':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.2)' : 'scale(1)'}">
          <rect x="-165" y="-100" width="330" height="200" rx="22" fill="#18181b" stroke="${primaryStroke}" stroke-width="3"/>
          <!-- OLED Telemetry Display -->
          <rect x="-140" y="-76" width="175" height="105" rx="10" fill="#090d16" stroke="#3f3f46" stroke-width="2"/>
          <text x="-124" y="-46" fill="${primaryStroke}" font-family="monospace" font-weight="bold" font-size="24">238.4 W</text>
          <text x="-124" y="-24" fill="#a1a1aa" font-family="monospace" font-size="11">PD 3.1 EPR ACTIVE • 34.2°C</text>
          <path d="M -124,10 L -90,-8 L -55,2 L -15,-18 L 18,-12" fill="none" stroke="${theme.secondary}" stroke-width="2.5"/>
          <!-- 4 USB-C Ports + 2 USB-A Ports -->
          ${[-58, -22, 14, 50].map((y, idx) => `
            <g transform="translate(65, ${y})">
              <rect x="0" y="-10" width="52" height="20" rx="8" fill="#090d16" stroke="${primaryStroke}" stroke-width="2"/>
              <rect x="12" y="-3" width="28" height="6" rx="2" fill="${primaryStroke}"/>
              <text x="66" y="4" fill="#94a3b8" font-family="monospace" font-size="10">C${idx + 1}</text>
            </g>
          `).join('')}
        </g>
      `;
      break;

    case 'camera':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.2)' : 'scale(1)'}">
          <!-- Top Handle / EVF Cage -->
          <rect x="-75" y="-128" width="150" height="34" rx="8" fill="#27272a" stroke="#52525b" stroke-width="2"/>
          <!-- Main Cinema Body -->
          <rect x="-165" y="-95" width="330" height="195" rx="24" fill="#18181b" stroke="${primaryStroke}" stroke-width="3"/>
          <!-- Red REC Button -->
          <circle cx="118" cy="-64" r="12" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
          <!-- Full-Frame Lens Mount & Glass Elements -->
          <circle cx="0" cy="6" r="82" fill="url(#metalGrad)" stroke="#71717a" stroke-width="3"/>
          <circle cx="0" cy="6" r="66" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
          <circle cx="0" cy="6" r="46" fill="url(#screenGlow)" stroke="${theme.secondary}" stroke-width="1.5"/>
          <!-- Global Shutter Sensor Grid -->
          <rect x="-26" y="-14" width="52" height="40" rx="3" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1.5"/>
          <text x="-138" y="-60" fill="${primaryStroke}" font-family="monospace" font-weight="bold" font-size="13">FX9 // 8K RAW</text>
        </g>
      `;
      break;

    case 'mouse':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.22)' : 'scale(1)'}">
          <!-- Symmetrical Ultralight Shell -->
          <path d="M 0,-135 C 68,-135 86,-70 82,15 C 78,95 58,135 0,135 C -58,135 -78,95 -82,15 C -86,-70 -68,-135 0,-135 Z" fill="#18181b" stroke="${primaryStroke}" stroke-width="3"/>
          <!-- Split Triggers & Scroll Wheel -->
          <line x1="0" y1="-135" x2="0" y2="-25" stroke="#475569" stroke-width="2"/>
          <path d="M -78,-25 Q 0,-10 78,-25" fill="none" stroke="${primaryStroke}" stroke-width="2" stroke-opacity="0.7"/>
          <rect x="-11" y="-98" width="22" height="48" rx="11" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
          <!-- Forged Carbon Geometric Accents -->
          <polygon points="-35,35 -10,18 -18,52" fill="${primaryStroke}" fill-opacity="0.25"/>
          <polygon points="28,45 48,22 38,65" fill="${theme.secondary}" fill-opacity="0.25"/>
          <text x="0" y="92" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">39G CARBON</text>
        </g>
      `;
      break;

    case 'glasses':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.2)' : 'scale(1)'}">
          <!-- Titanium Brow Bar -->
          <path d="M -195,-45 Q 0,-68 195,-45" fill="none" stroke="url(#metalGrad)" stroke-width="10" stroke-linecap="round"/>
          <!-- Left & Right Electrochromic Micro-OLED Lenses -->
          <path d="M -182,-40 L -22,-32 L -34,48 L -168,38 Z" fill="url(#screenGlow)" stroke="${primaryStroke}" stroke-width="3" rx="12"/>
          <path d="M 22,-32 L 182,-40 L 168,38 L 34,48 Z" fill="url(#screenGlow)" stroke="${primaryStroke}" stroke-width="3" rx="12"/>
          <!-- Nose Bridge -->
          <path d="M -22,-25 Q 0,-42 22,-25" fill="none" stroke="#94a3b8" stroke-width="5"/>
          <!-- HUD Overlay Inside Lenses -->
          <rect x="-145" y="-14" width="85" height="38" rx="4" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-dasharray="4 2"/>
          <rect x="60" y="-14" width="85" height="38" rx="4" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-dasharray="4 2"/>
        </g>
      `;
      break;

    case 'dac':
      centerIllustration = `
        <g transform="translate(400, 300) ${isDetail ? 'scale(1.2)' : 'scale(1)'}">
          <!-- Vacuum Tubes Glowing on Top -->
          <rect x="-95" y="-125" width="36" height="58" rx="18" fill="#451a03" stroke="#f59e0b" stroke-width="2.5"/>
          <circle cx="-77" cy="-95" r="10" fill="#fbbf24"/>
          <rect x="-35" y="-125" width="36" height="58" rx="18" fill="#451a03" stroke="#f59e0b" stroke-width="2.5"/>
          <circle cx="-17" cy="-95" r="10" fill="#fbbf24"/>
          <!-- CNC DAC Chassis -->
          <rect x="-210" y="-68" width="420" height="145" rx="16" fill="#18181b" stroke="${primaryStroke}" stroke-width="3"/>
          <!-- Volume Attenuator Wheel -->
          <circle cx="135" cy="4" r="46" fill="url(#metalGrad)" stroke="${primaryStroke}" stroke-width="3"/>
          <circle cx="135" cy="4" r="32" fill="#090d16"/>
          <line x1="135" y1="4" x2="155" y2="-16" stroke="${primaryStroke}" stroke-width="3" stroke-linecap="round"/>
          <!-- Balanced XLR & 4.4mm Jacks -->
          <circle cx="-145" cy="4" r="26" fill="#090d16" stroke="#71717a" stroke-width="2.5"/>
          <circle cx="-82" cy="4" r="16" fill="#090d16" stroke="#f59e0b" stroke-width="2.5"/>
          <text x="-5" y="10" fill="${primaryStroke}" font-family="monospace" font-size="16" font-weight="bold">R2R 24-BIT</text>
        </g>
      `;
      break;

    case 'drone':
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.18)' : 'scale(1)'}">
          <!-- Carbon Arms -->
          <line x1="-165" y1="-95" x2="165" y2="95" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
          <line x1="165" y1="-95" x2="-165" y2="95" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
          <!-- 4 Rotor Discs -->
          ${[[-165, -95], [165, -95], [-165, 95], [165, 95]].map(([x, y]) => `
            <g transform="translate(${x}, ${y})">
              <circle cx="0" cy="0" r="54" fill="none" stroke="${primaryStroke}" stroke-width="2" stroke-dasharray="10 6"/>
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="${primaryStroke}" stroke-width="2.5"/>
            </g>
          `).join('')}
          <!-- Central Fuselage & Gimbal Camera -->
          <rect x="-48" y="-76" width="96" height="152" rx="34" fill="#0f172a" stroke="${primaryStroke}" stroke-width="3"/>
          <circle cx="0" cy="-42" r="24" fill="url(#screenGlow)" stroke="#ffffff" stroke-width="2"/>
          <circle cx="0" cy="-42" r="9" fill="${primaryStroke}"/>
        </g>
      `;
      break;

    case 'display':
      centerIllustration = `
        <g transform="translate(400, 290) ${isDetail ? 'scale(1.18)' : 'scale(1)'}">
          <!-- Stand Arm & Base -->
          <rect x="-26" y="75" width="52" height="65" fill="url(#metalGrad)"/>
          <rect x="-85" y="135" width="170" height="10" rx="5" fill="#94a3b8"/>
          <!-- 32" 6K Panel -->
          <rect x="-230" y="-130" width="460" height="225" rx="10" fill="#090d16" stroke="${primaryStroke}" stroke-width="3"/>
          <rect x="-220" y="-120" width="440" height="205" rx="6" fill="url(#screenGlow)"/>
          <!-- Color Grading Scopes Overlay -->
          <circle cx="-110" cy="-18" r="52" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5"/>
          <path d="M -25,45 L 40,-65 L 105,45 Z" fill="none" stroke="${primaryStroke}" stroke-width="2.5"/>
          <text x="145" y="-55" fill="#ffffff" font-family="monospace" font-size="13">6016x3384</text>
          <text x="145" y="-35" fill="${primaryStroke}" font-family="monospace" font-size="11">2000 NITS HDR</text>
        </g>
      `;
      break;

    default:
      centerIllustration = `
        <g transform="translate(400, 295) ${isDetail ? 'scale(1.2)' : 'scale(1)'}">
          <rect x="-155" y="-110" width="310" height="220" rx="22" fill="#18181b" stroke="${primaryStroke}" stroke-width="3"/>
          <rect x="-125" y="-75" width="250" height="85" rx="12" fill="#090d16" stroke="#3f3f46" stroke-width="2"/>
          <text x="0" y="-22" fill="${primaryStroke}" font-family="monospace" font-weight="bold" font-size="28" text-anchor="middle">1536Wh UPS</text>
          <circle cx="-75" cy="52" r="24" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
          <circle cx="0" cy="52" r="24" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
          <circle cx="75" cy="52" r="24" fill="#090d16" stroke="${primaryStroke}" stroke-width="2.5"/>
        </g>
      `;
      break;
  }

  const specOverlay = isSpec ? `
    <g transform="translate(80, 445)">
      <rect x="0" y="0" width="640" height="82" rx="12" fill="#020617" fill-opacity="0.88" stroke="${primaryStroke}" stroke-width="1.5"/>
      <text x="24" y="28" fill="#94a3b8" font-family="monospace" font-size="11">TELEMETRY BENCHMARK // QA VERIFIED</text>
      <rect x="24" y="42" width="440" height="10" rx="5" fill="#1e293b"/>
      <rect x="24" y="42" width="412" height="10" rx="5" fill="${primaryStroke}"/>
      <text x="485" y="51" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">98.4% SCORE</text>
      <text x="24" y="70" fill="${theme.secondary}" font-family="monospace" font-size="11">THERMAL LOAD: OPTIMAL • LATENCY: 0.12ms • CERTIFICATION: ISO-9001</text>
    </g>
  ` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryStroke}" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0f172a" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryStroke}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${primaryStroke}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${primaryStroke}" stroke-width="0.6" stroke-opacity="${isBlueprint ? '0.28' : '0.09'}"/>
    </pattern>
  </defs>

  <!-- Studio Backdrop -->
  <rect width="800" height="600" fill="url(#bgGrad)"/>
  <rect width="800" height="600" fill="url(#gridPattern)"/>
  <circle cx="400" cy="295" r="260" fill="url(#haloGlow)"/>

  <!-- Top Engineering Header HUD -->
  <g transform="translate(42, 42)">
    <rect x="0" y="0" width="128" height="26" rx="6" fill="${primaryStroke}" fill-opacity="0.16" stroke="${primaryStroke}" stroke-width="1"/>
    <text x="64" y="17" fill="${primaryStroke}" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle">${theme.code}</text>
    <text x="144" y="17" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1.5">${theme.label}</text>
    <text x="716" y="17" fill="#64748b" font-family="monospace" font-size="11" text-anchor="end">VIEW // ${view.toUpperCase()}</text>
  </g>

  ${isBlueprint ? `
    <g stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="4 4">
      <line x1="400" y1="70" x2="400" y2="530"/>
      <line x1="90" y1="295" x2="710" y2="295"/>
      <circle cx="400" cy="295" r="210" fill="none"/>
    </g>
  ` : ''}

  <!-- Main Hardware Illustration -->
  ${centerIllustration}

  ${specOverlay}

  <!-- Bottom Corner Markers -->
  <g stroke="#475569" stroke-width="1.5" fill="none">
    <path d="M 36 530 L 36 560 L 66 560"/>
    <path d="M 764 530 L 764 560 L 734 560"/>
  </g>
  <text x="400" y="560" fill="#64748b" font-family="monospace" font-size="11" letter-spacing="2" text-anchor="middle">NEX HARDWARE LABS • PRECISION ENGINEERED</text>
</svg>`;
}
