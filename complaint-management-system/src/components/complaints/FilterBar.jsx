import { Search, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, STATUS } from '../../data/complaints'

export default function FilterBar({ search, setSearch, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm appearance-none cursor-pointer min-w-[150px]"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Category filter */}
      <div className="relative">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  )
}