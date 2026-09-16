import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="font-display font-semibold text-slate-800 text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center ml-1">
          <span className="text-white text-xs font-semibold">{user?.avatar}</span>
        </div>
      </div>
    </header>
  )
}