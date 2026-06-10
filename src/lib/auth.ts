import { supabase } from './supabase'

const AUTH_KEY = 'amortix_auth'

export interface AuthUser {
  email: string
  name:  string
  role:  string
}

// Demo credentials — used only when Supabase is not configured
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

export async function login(email: string, password: string): Promise<AuthUser | null> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return null
    const user: AuthUser = {
      email: data.user.email!,
      name:  data.user.user_metadata?.name  ?? data.user.email!.split('@')[0],
      role:  data.user.user_metadata?.role  ?? 'User',
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    return user
  }

  // Demo fallback — no Supabase configured
  const entry = DEMO_USERS[email.toLowerCase()]
  if (!entry || entry.password !== password) return null
  localStorage.setItem(AUTH_KEY, JSON.stringify(entry.user))
  return entry.user
}

export async function logout(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
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
