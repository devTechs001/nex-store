/**
 * NEX Store — Role-based navigation policy (single source of truth).
 *
 * Navigation surfaces (DesktopSideNav, Navbar, MobileBottomNav, Command
 * Palette) filter their links through this module so the menu a session sees
 * exactly matches what the router will authorize:
 *   • guest      → public storefront surfaces only
 *   • user       → public + User Account Portal
 *   • developer  → public + Developer Portal
 *   • admin      → everything (Root Admin)
 */

export const TAB_ROLE_ACCESS = {
  subsystems: ['admin'],
  database: ['admin'],
  overview: ['admin'],
  admin: ['admin'],
  'developer-portal': ['admin', 'developer'],
  'user-portal': ['admin', 'user']
};

export const ROLE_LABELS = {
  admin: 'Root Admin',
  developer: 'Developer',
  user: 'System User',
  guest: 'Guest'
};

export const ROLE_BADGE_STYLES = {
  admin: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
  developer: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35',
  user: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
  guest: 'bg-slate-500/15 text-slate-300 border-slate-500/35'
};

export function roleForSession(session) {
  return session?.account?.role || 'guest';
}

export function canRoleAccessTab(role, tab) {
  const roles = TAB_ROLE_ACCESS[tab];
  if (!roles) return true; // public tab
  return roles.includes(role);
}

/**
 * Filter a nav/command item array for a role. Items resolve access by:
 *   1. an explicit `roles: [...]` allow-list on the item, else
 *   2. `item.tab || item.id` looked up in TAB_ROLE_ACCESS (public by default).
 */
export function filterNavForRole(items, role) {
  return items.filter((item) => {
    if (Array.isArray(item.roles)) return item.roles.includes(role);
    return canRoleAccessTab(role, item.tab || item.id);
  });
}
