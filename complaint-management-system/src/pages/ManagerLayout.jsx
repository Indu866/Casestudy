import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ClipboardList, CheckCircle2, Archive, AlertTriangle, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// navItems and title passed as props so this layout works for all 3 managers
export default function ManagerLayout({ navItems, pageTitles, portalLabel, accentColor = 'slate', endpoints, escalateLabel }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || portalLabel

  const activeClass   = `bg-${accentColor}-700 text-white`
  const inactiveClass = `text-slate-600 hover:bg-slate-50 hover:text-slate-800`

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-30 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs font-display">CV</span>
            </div>
            <div>
              <span className="font-display font-semibold text-slate-800 text-sm block">CampusVoice</span>
              <span className="text-xs text-slate-500 font-medium">{portalLabel}</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-slate-800 text-white' : inactiveClass}`}>
              {({ isActive }) => (
                <><Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />{label}</>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{user?.name?.slice(0,2).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium">{portalLabel}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="font-display font-semibold text-slate-800 text-lg">{title}</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{user?.name?.slice(0,2).toUpperCase()}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <Outlet context={{ endpoints, escalateLabel, location }}/>
          </div>
        </main>
      </div>
    </div>
  )
}