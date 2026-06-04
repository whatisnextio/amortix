import { NavLink, Outlet, Navigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Package,
  Hash,
  Bell,
  Plug,
  ScrollText,
} from 'lucide-react'

const settingsNav = [
  { to: '/settings/general',       label: 'General',       icon: Building2  },
  { to: '/settings/users',         label: 'Users & Roles', icon: Users      },
  { to: '/settings/products',      label: 'Products',      icon: Package    },
  { to: '/settings/nominals',      label: 'Nominal Codes', icon: Hash       },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell       },
  { to: '/settings/integrations',  label: 'Integrations',  icon: Plug       },
  { to: '/settings/audit',         label: 'Audit Log',     icon: ScrollText },
]

export default function SettingsLayout() {
  return (
    <div className="flex h-full min-h-0">
      {/* Sub-nav */}
      <aside className="w-56 shrink-0 border-r border-white/5 pt-8 pb-6 px-3">
        <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Settings
        </p>
        <nav className="space-y-0.5">
          {settingsNav.map(({ to, label, icon: Icon }) => (
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
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  )
}

export function SettingsIndex() {
  return <Navigate to="/settings/general" replace />
}
