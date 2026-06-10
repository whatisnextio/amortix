const AUTH_KEY = 'amortix_auth'

export interface AuthUser {
  email: string
  name: string
  role: string
}

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'demo@amortix.io': {
    password: 'demo2026',
    user: { email: 'demo@amortix.io', name: 'Demo User', role: 'Administrator' },
  },
  'user@amortix.io': {
    password: 'user2026',
    user: { email: 'user@amortix.io', name: 'User', role: 'Director' },
  },
}

export function login(email: string, password: string): AuthUser | null {
  const entry = DEMO_USERS[email.toLowerCase()]
  if (!entry || entry.password !== password) return null
  localStorage.setItem(AUTH_KEY, JSON.stringify(entry.user))
  return entry.user
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}
