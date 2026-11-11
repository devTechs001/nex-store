import { renderProductSvg } from '../../server/productArt.js';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_APPS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_ORDERS,
  SEED_SERVER_NODES,
  SEED_INTEGRATIONS,
  SEED_SECURITY_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_TERMINAL_LOGS,
  SEED_TERMINAL_SCRIPTS,
  SEED_BTO_CONFIGS
} from '../../server/seedData.js';

export function normalizeImageDataUrl(rawInput, fileName = '', mimeType = '') {
  if (!rawInput || typeof rawInput !== 'string') return '';
  const trimmed = rawInput.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const ext = String(fileName || '')
    .toLowerCase()
    .split('.')
    .pop();
  const extMimeMap = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    avif: 'image/avif',
    ico: 'image/x-icon',
    jfif: 'image/jpeg'
  };

  let resolvedMime =
    mimeType && mimeType.startsWith('image/')
      ? mimeType
      : extMimeMap[ext] || '';

  const genericBase64Match = trimmed.match(/^data:([^;]*);base64,([\s\S]+)$/i);
  if (genericBase64Match) {
    const existingMime = (genericBase64Match[1] || '').trim().toLowerCase();
    const b64Payload = genericBase64Match[2].replace(/\s+/g, '');
    if (existingMime.startsWith('image/')) {
      return `data:${existingMime};base64,${b64Payload}`;
    }
    if (!resolvedMime) {
      if (b64Payload.startsWith('iVBORw0KGgo')) resolvedMime = 'image/png';
      else if (b64Payload.startsWith('/9j/')) resolvedMime = 'image/jpeg';
      else if (b64Payload.startsWith('R0lGOD')) resolvedMime = 'image/gif';
      else if (b64Payload.startsWith('UklGR')) resolvedMime = 'image/webp';
      else if (b64Payload.startsWith('PHN2Zy') || b64Payload.startsWith('PD94bWw')) resolvedMime = 'image/svg+xml';
      else resolvedMime = 'image/png';
    }
    return `data:${resolvedMime};base64,${b64Payload}`;
  }

  return trimmed;
}

export function isLikelyImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  const name = String(file.name || '').toLowerCase();
  return /\.(png|jpe?g|webp|gif|svg|bmp|avif|ico|jfif|tiff?|heic|heif)$/i.test(name) || !file.type;
}

/**
 * Reads an uploaded image File directly into a normalized Data URL without using <canvas>,
 * avoiding any tainted-canvas SecurityError, memory limit error, or procedural fallback.
 */
export function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No image file selected'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || '');
      const normalized = normalizeImageDataUrl(raw, file.name || '', file.type || '');
      if (!normalized) {
        reject(new Error('Could not read uploaded image file'));
        return;
      }
      resolve({
        dataUrl: normalized,
        fileName: file.name || 'uploaded-image.png',
        fileSize: file.size || 0,
        mimeType: file.type || 'image/png',
        label: (file.name || 'Uploaded Image').replace(/\.[^.]+$/, '').slice(0, 28) || 'Uploaded Image'
      });
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file from device'));
    };
    reader.readAsDataURL(file);
  });
}

export function isCustomProductImage(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = normalizeImageDataUrl(url.trim());
  if (!trimmed) return false;
  if (trimmed.startsWith('/api/product-art/')) return false;
  if (trimmed.startsWith('/api/app-art/')) return false;
  if (trimmed.startsWith('data:image/svg+xml;charset=utf-8,') && trimmed.includes('NEX%20HARDWARE')) {
    return false;
  }
  if (trimmed.startsWith('data:image/svg+xml;charset=utf-8,') && trimmed.includes('NEX%20STORE%20PROPRIETARY')) {
    return false;
  }
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  );
}

export function isCustomImageSource(url) {
  return isCustomProductImage(url);
}

function escapeSvgXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const APP_LANG_THEMES = {
  python: { primary: '#3b82f6', secondary: '#eab308', label: 'PYTHON 3.12 • AI/ML TENSOR', badge: 'PY 3.12' },
  rust: { primary: '#f97316', secondary: '#ef4444', label: 'RUST 1.82 • WASM/SIMD', badge: 'RUST' },
  cpp: { primary: '#06b6d4', secondary: '#3b82f6', label: 'C++23 • AVX-512 KERNEL', badge: 'C++23' },
  java: { primary: '#ef4444', secondary: '#f59e0b', label: 'JAVA 21 • VIRTUAL THREADS', badge: 'JVM 21' },
  go: { primary: '#06b6d4', secondary: '#10b981', label: 'GO 1.23 • ANYCAST MESH', badge: 'GO 1.23' },
  typescript: { primary: '#6366f1', secondary: '#06b6d4', label: 'TYPESCRIPT • V8 EDGE', badge: 'TS 5.6' },
  javascript: { primary: '#f59e0b', secondary: '#10b981', label: 'JAVASCRIPT • ES2026', badge: 'ES2026' }
};

export function renderClientAppSvg(app = {}, view = 'hero') {
  const name = escapeSvgXml(app.name || 'NEX Cloud Application');
  const developer = escapeSvgXml(app.developer || 'NEX Verified Lab');
  const provider = escapeSvgXml(app.source_provider || 'Netlify');
  const langKey = String(app.language || 'typescript').toLowerCase();
  const version = escapeSvgXml(app.version || '1.0.0');
  const icon = escapeSvgXml(app.icon || '🚀');
  const category = escapeSvgXml(String(app.category || 'web').toUpperCase());
  const downloads = Number(app.downloads || 12400).toLocaleString();
  const size = escapeSvgXml(app.size || '24.5 MB');
  const score = Number(app.security_score || 99);
  const theme = APP_LANG_THEMES[langKey] || APP_LANG_THEMES.typescript;

  let centerBody = '';
  if (view === 'ui') {
    centerBody = `
      <g transform="translate(48, 96)">
        <rect x="0" y="0" width="864" height="310" rx="16" fill="#040814" stroke="${theme.primary}" stroke-width="2" />
        <rect x="0" y="0" width="864" height="34" rx="16" fill="#0d152c" />
        <circle cx="22" cy="17" r="6" fill="#ef4444" />
        <circle cx="42" cy="17" r="6" fill="#f59e0b" />
        <circle cx="62" cy="17" r="6" fill="#10b981" />
        <text x="432" y="22" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="middle">${name} — Interactive Workstation UI Viewport (1920x1080 HD)</text>
        <!-- Left Sidebar -->
        <rect x="18" y="50" width="190" height="242" rx="10" fill="#091024" stroke="rgba(148,163,184,0.18)" />
        <rect x="32" y="66" width="120" height="12" rx="4" fill="${theme.primary}" opacity="0.8" />
        <rect x="32" y="90" width="150" height="10" rx="4" fill="#334155" />
        <rect x="32" y="110" width="135" height="10" rx="4" fill="#334155" />
        <rect x="32" y="130" width="160" height="10" rx="4" fill="#334155" />
        <rect x="32" y="165" width="162" height="110" rx="8" fill="#050814" stroke="${theme.secondary}" stroke-width="1" />
        <text x="113" y="210" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">WASM HEAP: 42 MB</text>
        <text x="113" y="232" fill="#34d399" font-family="monospace" font-size="11" text-anchor="middle">FPS: 120 HZ LOCKED</text>
        <!-- Main Canvas -->
        <rect x="224" y="50" width="622" height="242" rx="10" fill="#070d1f" stroke="rgba(56,189,248,0.25)" />
        <path d="M 250 220 C 330 110, 410 250, 490 130 C 570 60, 650 210, 730 120 L 820 155" fill="none" stroke="url(#accentGrad)" stroke-width="4" />
        <path d="M 250 250 C 340 180, 430 260, 520 175 C 610 130, 700 220, 820 180" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 4" />
        <circle cx="490" cy="130" r="8" fill="#34d399" />
        <circle cx="730" cy="120" r="8" fill="#38bdf8" />
        <text x="252" y="84" fill="#f8fafc" font-family="monospace" font-size="14" font-weight="bold">LIVE TELEMETRY &amp; SHADER PIPELINE // ${theme.label}</text>
      </g>
    `;
  } else if (view === 'arch') {
    centerBody = `
      <g transform="translate(48, 96)">
        <rect x="0" y="0" width="864" height="310" rx="16" fill="#040b1a" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="8 5" />
        <text x="432" y="34" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">ZERO-TRUST SANDBOX &amp; CLOUD ARCHITECTURE TOPOLOGY // ${name}</text>
        <!-- 3 Architecture Nodes -->
        <g transform="translate(45, 75)">
          <rect x="0" y="0" width="210" height="175" rx="14" fill="#0b152e" stroke="${theme.primary}" stroke-width="2" />
          <text x="105" y="36" fill="#a5b4fc" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">1. EDGE INGRESS</text>
          <text x="105" y="68" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">${provider} CDN</text>
          <text x="105" y="96" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">TLS 1.3 + Anti-XSS Shield</text>
          <text x="105" y="122" fill="#34d399" font-family="monospace" font-size="11" text-anchor="middle">SHA-256 Verified</text>
        </g>
        <line x1="255" y1="162" x2="328" y2="162" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4" />
        <g transform="translate(328, 75)">
          <rect x="0" y="0" width="210" height="175" rx="14" fill="#0b152e" stroke="#38bdf8" stroke-width="2" />
          <text x="105" y="36" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">2. ISOLATED RUNTIME</text>
          <text x="105" y="68" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">${theme.badge} Kernel</text>
          <text x="105" y="96" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">/opt/nex-apps/sandbox</text>
          <text x="105" y="122" fill="#eab308" font-family="monospace" font-size="11" text-anchor="middle">256MB Heap Guard</text>
        </g>
        <line x1="538" y1="162" x2="610" y2="162" stroke="#34d399" stroke-width="3" stroke-dasharray="6 4" />
        <g transform="translate(610, 75)">
          <rect x="0" y="0" width="210" height="175" rx="14" fill="#0b152e" stroke="#10b981" stroke-width="2" />
          <text x="105" y="36" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">3. DUAL DB STORE</text>
          <text x="105" y="68" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">SQLite + MongoDB</text>
          <text x="105" y="96" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">WAL + Atlas BSON</text>
          <text x="105" y="122" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="middle">0.3ms Sync Latency</text>
        </g>
      </g>
    `;
  } else if (view === 'spec') {
    centerBody = `
      <g transform="translate(48, 96)">
        <rect x="0" y="0" width="864" height="310" rx="16" fill="#060c1d" stroke="#10b981" stroke-width="2" />
        <text x="36" y="42" fill="#34d399" font-family="monospace" font-size="15" font-weight="bold">5-STAGE ANTI-MALWARE &amp; BENCHMARK ATTESTATION // SCORE ${score}/100</text>
        <g transform="translate(36, 68)">
          <rect x="0" y="0" width="792" height="38" rx="8" fill="#0d1730" />
          <rect x="0" y="0" width="760" height="38" rx="8" fill="url(#accentGrad)" opacity="0.35" />
          <text x="18" y="24" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">STAGE 1-5: 0 TROJANS • 0 XSS HOOKS • 0 CRYPTO-MINERS • SHA-256 VERIFIED</text>
        </g>
        <g transform="translate(36, 128)" font-family="monospace" font-size="13" fill="#cbd5e1">
          <text x="0" y="24">• Package Size: <tspan fill="#38bdf8" font-weight="bold">${size}</tspan></text>
          <text x="380" y="24">• Total Installations: <tspan fill="#34d399" font-weight="bold">${downloads}</tspan></text>
          <text x="0" y="62">• Primary Language: <tspan fill="#a5b4fc" font-weight="bold">${escapeSvgXml(theme.label)}</tspan></text>
          <text x="380" y="62">• Category / Runtime: <tspan fill="#f59e0b" font-weight="bold">${category}</tspan></text>
          <text x="0" y="100">• Sandbox Mount: <tspan fill="#38bdf8" font-weight="bold">/opt/nex-apps/${escapeSvgXml(app.id || 'app')}</tspan></text>
          <text x="380" y="100">• DRM Policy: <tspan fill="#34d399" font-weight="bold">STRICTLY PROPRIETARY</tspan></text>
        </g>
      </g>
    `;
  } else {
    centerBody = `
      <!-- App Icon Emblem & Title -->
      <rect x="52" y="102" width="96" height="96" rx="22" fill="rgba(99,102,241,0.18)" stroke="${theme.primary}" stroke-width="2.5" />
      <text x="100" y="164" font-size="48" text-anchor="middle">${icon}</text>

      <text x="172" y="138" fill="#f8fafc" font-family="sans-serif" font-size="32" font-weight="bold">${name.slice(0, 34)}</text>
      <text x="172" y="170" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="bold">By ${developer.slice(0, 42)} • ${downloads} Installs • ${size}</text>
      <text x="172" y="196" fill="#94a3b8" font-family="sans-serif" font-size="14">${escapeSvgXml((app.description || 'Enterprise zero-trust sandboxed application.').slice(0, 82))}</text>

      <!-- Polyglot Telemetry Wave & Resource Bars -->
      <g transform="translate(52, 226)">
        <rect x="0" y="0" width="856" height="172" rx="16" fill="rgba(4,7,17,0.88)" stroke="rgba(148,163,184,0.22)" stroke-width="1.5" />
        <path d="M 28 112 Q 110 35, 195 98 T 365 76 T 535 104 T 705 52 T 828 88" fill="none" stroke="url(#accentGrad)" stroke-width="4" />
        <path d="M 28 132 Q 125 75, 220 118 T 410 96 T 600 124 T 828 108" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 5" opacity="0.75" />
        <text x="28" y="38" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">HIGH-RESOLUTION APP STUDIO PREVIEW // 4 VISUAL RESOURCES INCLUDED</text>
        <text x="28" y="64" fill="#94a3b8" font-family="monospace" font-size="12">1. STUDIO HERO BANNER   2. WORKSTATION UI VIEWPORT   3. ARCHITECTURE MAP   4. SECURITY SPEC</text>
        <text x="28" y="152" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">✓ ZERO-TRUST SANDBOX VERIFIED (${score}/100)</text>
        <text x="828" y="152" fill="#eab308" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">🔒 DRM PROTECTED</text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 500" width="960" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050814" />
      <stop offset="55%" stop-color="#0d152c" />
      <stop offset="100%" stop-color="#111c3d" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primary}" />
      <stop offset="100%" stop-color="${theme.secondary}" />
    </linearGradient>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(148,163,184,0.09)" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="960" height="500" fill="url(#bgGrad)" />
  <rect width="960" height="500" fill="url(#grid)" />

  <!-- Ambient Glow Orbs -->
  <circle cx="780" cy="110" r="170" fill="${theme.primary}" opacity="0.20" />
  <circle cx="180" cy="390" r="150" fill="${theme.secondary}" opacity="0.16" />

  <!-- Outer Studio Frame -->
  <rect x="24" y="20" width="912" height="460" rx="22" fill="rgba(9,14,28,0.78)" stroke="rgba(99,102,241,0.38)" stroke-width="2" />
  <rect x="24" y="20" width="912" height="6" fill="url(#accentGrad)" />

  <!-- Top Status Bar -->
  <rect x="52" y="44" width="165" height="32" rx="16" fill="rgba(6,182,212,0.18)" stroke="rgba(6,182,212,0.5)" />
  <text x="134" y="65" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">${provider.toUpperCase()}</text>

  <rect x="232" y="44" width="250" height="32" rx="16" fill="rgba(99,102,241,0.18)" stroke="rgba(99,102,241,0.5)" />
  <text x="357" y="65" fill="#a5b4fc" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${escapeSvgXml(theme.label)}</text>

  <rect x="730" y="44" width="178" height="32" rx="16" fill="rgba(16,185,129,0.18)" stroke="rgba(16,185,129,0.45)" />
  <text x="819" y="65" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">VIEW: ${escapeSvgXml(view.toUpperCase())} • v${version}</text>

  ${centerBody}

  <!-- Anti-Piracy Watermark Footer -->
  <text x="480" y="458" fill="rgba(148,163,184,0.55)" font-family="monospace" font-size="11" text-anchor="middle">
    © 2026 NEX STORE PROPRIETARY DRM • HIGH-RESOLUTION PRODUCTION ASSET • DO NOT SHARE OR PIRATE
  </text>
</svg>`;
}

export function getAppArtUrl(appOrObj, { view = 'hero', preferGenerated = false } = {}) {
  const appObj = typeof appOrObj === 'object' && appOrObj !== null ? appOrObj : { id: String(appOrObj || 'app-1'), name: String(appOrObj || 'NEX App') };
  if (typeof view === 'string' && isCustomProductImage(view)) {
    return view;
  }
  if (!preferGenerated && view === 'hero' && isCustomProductImage(appObj.image_url)) {
    return appObj.image_url;
  }
  const svg = renderClientAppSvg(appObj, view);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getAppVisualResources(app = {}) {
  const customHero = isCustomProductImage(app.image_url) ? app.image_url : null;
  const views = [
    {
      id: 'hero',
      type: 'image',
      name: 'og-studio-banner-hd.svg',
      label: 'Studio Hero Banner',
      resolution: '960×500 HD',
      size: '48 KB',
      url: customHero || getAppArtUrl(app, { view: 'hero', preferGenerated: true })
    },
    {
      id: 'ui',
      type: 'image',
      name: 'workstation-ui-viewport.svg',
      label: 'Workstation UI Viewport',
      resolution: '960×500 HD',
      size: '64 KB',
      url: getAppArtUrl(app, { view: 'ui', preferGenerated: true })
    },
    {
      id: 'arch',
      type: 'image',
      name: 'sandbox-architecture-topology.svg',
      label: 'Cloud & Sandbox Architecture',
      resolution: '960×500 HD',
      size: '52 KB',
      url: getAppArtUrl(app, { view: 'arch', preferGenerated: true })
    },
    {
      id: 'spec',
      type: 'image',
      name: 'security-benchmark-spec.svg',
      label: 'Security & Telemetry Spec',
      resolution: '960×500 HD',
      size: '44 KB',
      url: getAppArtUrl(app, { view: 'spec', preferGenerated: true })
    }
  ];
  return views;
}

export function hydrateApp(raw = {}) {
  const visualResources = getAppVisualResources(raw);
  return {
    ...raw,
    image_url: getAppArtUrl(raw, { view: 'hero' }),
    visual_resources: visualResources
  };
}

export function getProductArtUrl(productOrId, { view = 'hero', color = null, preferCad = false } = {}) {
  const id = typeof productOrId === 'string' ? productOrId : productOrId?.id || 'prod-aether-pro';
  const prodObj = typeof productOrId === 'object' ? productOrId : null;

  // If view itself is a direct image URL (e.g. from custom gallery item)
  if (typeof view === 'string' && isCustomProductImage(view)) {
    return view;
  }

  // If product has a custom uploaded image or URL and user is viewing 'hero' or 'custom'
  if (
    !preferCad &&
    prodObj &&
    (view === 'hero' || view === 'custom') &&
    isCustomProductImage(prodObj.custom_image_url || prodObj.image_url)
  ) {
    return prodObj.custom_image_url || prodObj.image_url;
  }

  const resolvedView = view === 'cad-hero' || view === 'custom' ? 'hero' : view;
  const svgString = renderProductSvg(id, { view: resolvedView, color }, prodObj);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

function safeParse(str, fallback) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function hydrateProduct(raw) {
  const colors = safeParse(raw.colors_json || raw.colors, []);
  const gallery = safeParse(raw.gallery_json || raw.gallery, [
    { label: 'Studio Hero', view: 'hero' },
    { label: 'Detail Cutaway', view: 'detail' },
    { label: 'CAD Blueprint', view: 'blueprint' },
    { label: 'Telemetry Spec', view: 'spec' }
  ]);
  const specs = safeParse(raw.specs_json || raw.specs, {});
  const tags = safeParse(raw.tags_json || raw.tags, []);
  const defaultColor = colors[0]?.hex || null;

  return {
    ...raw,
    featured: Boolean(raw.featured),
    is_flash_sale: Boolean(raw.is_flash_sale),
    colors,
    gallery,
    specs,
    tags,
    image_url: getProductArtUrl(raw, { view: 'hero', color: defaultColor })
  };
}

export function getFallbackBootstrapData() {
  const now = new Date().toISOString();
  const products = SEED_PRODUCTS.map(hydrateProduct);
  const apps = SEED_APPS.map((a) => hydrateApp({ ...a, created_at: now }));
  const categories = [...SEED_CATEGORIES];
  const coupons = [...SEED_COUPONS];
  const serverNodes = SEED_SERVER_NODES.map((s) => ({ ...s, updated_at: now }));
  const integrations = SEED_INTEGRATIONS.map((i) => ({ ...i, last_sync_at: now }));
  const securityEvents = [...SEED_SECURITY_EVENTS];
  const notifications = [...SEED_NOTIFICATIONS];
  const terminalLogs = [...SEED_TERMINAL_LOGS];
  const terminalScripts = SEED_TERMINAL_SCRIPTS.map((s) => ({
    ...s,
    code: s.code || s.script_body
  }));
  const btoConfigs = SEED_BTO_CONFIGS.map((b) => ({
    ...b,
    slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : b.slots || {}
  }));
  const appInstalls = apps.slice(0, 3).map((a) => ({
    id: `inst-${a.id}`,
    app_id: a.id,
    app_name: a.name,
    version: a.version,
    source_provider: a.source_provider || 'NEX Official',
    install_path: `/opt/nex-apps/${a.id}`,
    sandbox_url: `/api/sandbox/${a.id}`,
    sha256_verified: a.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924',
    status: 'INSTALLED',
    installed_at: new Date().toISOString()
  }));
  const orders = SEED_ORDERS.map((o) => ({
    ...o,
    items: (o.items || []).map((item) => ({
      ...item,
      product_image: getProductArtUrl(item.product_id, { view: 'hero' })
    }))
  }));
  const reviews = [...SEED_REVIEWS];
  const inventoryLogs = products.map((p) => ({
    id: `inv-${p.id}`,
    product_id: p.id,
    product_name: p.name,
    change_amount: p.stock,
    previous_stock: 0,
    new_stock: p.stock,
    reason: 'Initial Warehouse Allocation',
    actor: 'System Provisioner',
    created_at: now
  }));
  const activityEvents = [
    {
      id: 'act-1',
      event_type: 'order_placed',
      title: 'Order #NEX-8943 Placed',
      message: 'Chloe Takahashi in London purchased VisionAir Pro Spatial Glasses + Spectre Carbon Mouse ($568.51)',
      created_at: now
    },
    {
      id: 'act-2',
      event_type: 'order_status',
      title: 'Order #NEX-8942 Dispatched',
      message: 'Courier picked up Aether Pro X1 & VoltMatrix 240W for same-day delivery in Nairobi',
      created_at: now
    },
    {
      id: 'act-3',
      event_type: 'price_drop',
      title: 'Flash Deal Activated',
      message: 'Aether Pro X1 Planar Headphones dropped from $549 to $449 (-18%)',
      created_at: now
    }
  ];
  const chatMessages = [
    {
      id: 'chat-welcome-1',
      session_id: 'global',
      sender: 'concierge',
      sender_name: 'NEX Live Concierge',
      message:
        'Welcome to NEX Store! Ask me about specs, stock availability, promo codes (try NEX20 or WELCOME10), Netlify app imports, or live order tracking.',
      created_at: now
    }
  ];

  const totalRevenue = Number(orders.reduce((s, o) => s + o.total, 0).toFixed(2));
  const avgOrderValue = Number((totalRevenue / Math.max(1, orders.length)).toFixed(2));
  const totalUnitsInStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.low_stock_threshold).length;
  const totalUnitsSold = products.reduce((s, p) => s + p.sold_count, 0);

  const catMap = {};
  for (const p of products) {
    if (!catMap[p.category]) {
      catMap[p.category] = {
        category: p.category,
        productCount: 0,
        stockCount: 0,
        soldCount: 0,
        estimatedRevenue: 0
      };
    }
    catMap[p.category].productCount += 1;
    catMap[p.category].stockCount += p.stock;
    catMap[p.category].soldCount += p.sold_count;
    catMap[p.category].estimatedRevenue = Number(
      (catMap[p.category].estimatedRevenue + p.price * p.sold_count).toFixed(2)
    );
  }

  const tables = [
    { name: 'products', rowCount: products.length, rows: products },
    { name: 'apps', rowCount: apps.length, rows: apps },
    { name: 'categories', rowCount: categories.length, rows: categories },
    { name: 'orders', rowCount: orders.length, rows: orders },
    {
      name: 'order_items',
      rowCount: orders.reduce((s, o) => s + (o.items?.length || 0), 0),
      rows: orders.flatMap((o) => o.items || [])
    },
    { name: 'reviews', rowCount: reviews.length, rows: reviews },
    { name: 'coupons', rowCount: coupons.length, rows: coupons },
    { name: 'inventory_logs', rowCount: inventoryLogs.length, rows: inventoryLogs },
    { name: 'activity_events', rowCount: activityEvents.length, rows: activityEvents },
    { name: 'chat_messages', rowCount: chatMessages.length, rows: chatMessages },
    { name: 'subscribers', rowCount: 1, rows: [{ id: 'sub-1', email: 'vip@nexstore.io', created_at: now }] },
    { name: 'server_nodes', rowCount: serverNodes.length, rows: serverNodes },
    { name: 'integrations', rowCount: integrations.length, rows: integrations },
    { name: 'security_events', rowCount: securityEvents.length, rows: securityEvents },
    { name: 'push_notifications', rowCount: notifications.length, rows: notifications },
    { name: 'terminal_logs', rowCount: terminalLogs.length, rows: terminalLogs },
    { name: 'terminal_scripts', rowCount: terminalScripts.length, rows: terminalScripts },
    { name: 'bto_configs', rowCount: btoConfigs.length, rows: btoConfigs },
    { name: 'app_installs', rowCount: appInstalls.length, rows: appInstalls }
  ].map((t) => ({
    ...t,
    columns: Object.keys(t.rows[0] || { id: '' }).map((colName, i) => ({
      name: colName,
      type: typeof t.rows[0]?.[colName] === 'number' ? 'REAL' : 'TEXT',
      pk: i === 0
    }))
  }));

  return {
    categories,
    products,
    apps,
    coupons,
    orders,
    reviews,
    inventoryLogs,
    activityEvents,
    chatMessages,
    serverNodes,
    integrations,
    securityEvents,
    notifications,
    terminalLogs,
    terminalScripts,
    btoConfigs,
    appInstalls,
    analytics: {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
      totalProducts: products.length,
      totalUnitsInStock,
      lowStockCount,
      totalUnitsSold,
      totalReviews: reviews.length,
      avgRating: 4.9,
      categoryBreakdown: Object.values(catMap)
    },
    dbStats: {
      engine: 'SQLite 3 (Node.js Native DatabaseSync • WAL Mode)',
      filePath: 'data/nexstore.db',
      sizeBytes: 142336,
      sizeFormatted: '139.0 KB',
      totalTables: tables.length,
      totalRows: tables.reduce((s, t) => s + t.rowCount, 0),
      tables
    },
    presence: {
      connectedClients: 1,
      activeShoppers: 24,
      viewersByProduct: {
        'prod-aether-pro': 7,
        'prod-nova-book': 5,
        'prod-chronos-key': 4
      }
    }
  };
}
