import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react'
import { getSession, logout } from '../lib/auth'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contracts', label: 'Contracts',  icon: FileText        },
  { to: '/contacts',  label: 'Contacts',   icon: Users           },
  { to: '/settings',  label: 'Settings',   icon: Settings        },
]

export default function Layout() {
  const navigate  = useNavigate()
  const session   = getSession()
  const initials  = session?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'AM'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-white/5 bg-surface-base">

        {/* Wordmark */}
        <div className="flex items-center px-4 py-5">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Amortix"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-ink-secondary hover:bg-white/5 hover:text-ink-primary'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-ink-primary">{session?.name ?? 'User'}</p>
              <p className="text-xs text-ink-muted">{session?.role ?? 'Administrator'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-ink-muted hover:text-ink-secondary transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
