// SSR smoke: renders the real <App/> tree and reports mount-time crashes.
const stubs = {
  localStorage: {
    _m: new Map(),
    getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
    setItem(k, v) { this._m.set(k, String(v)); },
    removeItem(k) { this._m.delete(k); }
  },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
  addEventListener() {},
  removeEventListener() {},
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  location: { search: '', href: 'http://localhost/', origin: 'http://localhost', pathname: '/' },
  navigator: { clipboard: { writeText: async () => {} }, userAgent: 'smoke' },
  scrollTo() {},
  getComputedStyle: () => ({ getPropertyValue: () => '' })
};
globalThis.window = stubs;
globalThis.localStorage = stubs.localStorage;
globalThis.sessionStorage = stubs.localStorage;
globalThis.matchMedia = stubs.matchMedia;
try { Object.defineProperty(globalThis, 'navigator', { value: stubs.navigator, configurable: true }); } catch {}
try { Object.defineProperty(globalThis, 'location', { value: stubs.location, configurable: true }); } catch {}
globalThis.requestAnimationFrame = stubs.requestAnimationFrame;
globalThis.cancelAnimationFrame = stubs.cancelAnimationFrame;
globalThis.EventSource = class { constructor() {} addEventListener() {} close() {} };
globalThis.WebSocket = class { constructor() {} addEventListener() {} send() {} close() {} };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.AudioContext = undefined;
globalThis.CSS = { supports: () => false };

async function main() {
  const { renderToString } = await import('react-dom/server');
  const React = (await import('react')).default;
  const App = (await import('../src/App.jsx')).default;
  try {
    const html = renderToString(React.createElement(App));
    console.log('SMOKE_OK length=' + html.length);

    // Tab-gated views are not mounted at boot — smoke them directly too.
    const CommunityView = (await import('../src/components/CommunityView.jsx')).default;
    const SysCheckView = (await import('../src/components/SysCheckView.jsx')).default;
    const AuthGateView = (await import('../src/components/AuthGateView.jsx')).default;
    const DesktopSideNav = (await import('../src/components/DesktopSideNav.jsx')).default;
    const MobileBottomNav = (await import('../src/components/MobileBottomNav.jsx')).default;
    const Navbar = (await import('../src/components/Navbar.jsx')).default;
    const session = { token: 't', account: { username: 'dev', role: 'developer' } };
    const app = { id: 'a1', name: 'Test App' };
    for (const [name, el] of [
      ['CommunityView', React.createElement(CommunityView, { session, apps: [app] })],
      ['SysCheckView', React.createElement(SysCheckView, { session })],
      ['AuthGateView', React.createElement(AuthGateView, { tab: 'admin', session: null })],
      ['DesktopSideNav', React.createElement(DesktopSideNav, { session, activeTab: 'store', setActiveTab: () => {} })],
      ['MobileBottomNav', React.createElement(MobileBottomNav, { session, activeTab: 'store', setActiveTab: () => {} })],
      ['Navbar', React.createElement(Navbar, { session, activeTab: 'store', setActiveTab: () => {} })]
    ]) {
      renderToString(el);
      console.log('SMOKE_OK view=' + name);
    }
  } catch (err) {
    console.error('SMOKE_FAIL');
    console.error(err && err.stack ? err.stack.split('\n').slice(0, 16).join('\n') : String(err));
    process.exit(1);
  }
}
main();
