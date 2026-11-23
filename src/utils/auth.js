// Session token persistence shared by admin/developer consoles.
// The token is stored after a successful /api/auth/login so subsequent
// privileged API calls can attach `Authorization: Bearer <token>`.
const TOKEN_STORAGE_KEY = 'nexstore_session_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode) — token stays in memory only.
  }
}

export function authHeaders(base = {}) {
  const token = getStoredToken();
  return token ? { ...base, Authorization: `Bearer ${token}` } : { ...base };
}
