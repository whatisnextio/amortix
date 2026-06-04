import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, LogOut } from 'lucide-react'
import { AmortixMark } from './AmortixLogo'

const nav = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/contracts', label: 'Contracts',   icon: FileText        },
  { to: '/contacts',  label: 'Contacts',    icon: Users           },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-white/5 bg-surface-base">

        {/* Wordmark */}
        <div className="flex items-center gap-3 px-5 py-6">
          <AmortixMark size={30} />
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-ink-primary">AMORTI</span>
            <span style={{ background: 'linear-gradient(135deg,#00d4aa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
          </span>
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
              LM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-primary">Loan Maker</p>
              <p className="text-xs text-ink-muted">Administrator</p>
            </div>
            <button className="text-ink-muted hover:text-ink-secondary transition-colors">
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
