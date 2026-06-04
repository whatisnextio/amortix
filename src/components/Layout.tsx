import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, LogOut } from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/contacts', label: 'Contacts', icon: Users },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 flex-col bg-slate-900 text-white">
        <div className="flex items-center gap-2 border-b border-slate-700 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-xs font-bold">
            LO
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Loan Operator</p>
            <p className="text-xs text-slate-400">Demo Account</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 px-3 py-4">
          <div className="mb-3 flex items-center gap-2 px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-600 text-xs font-medium">
              LM
            </div>
            <div>
              <p className="text-xs font-medium">Loan Maker</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
