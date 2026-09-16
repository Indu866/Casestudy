import { ArrowUpDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'priority', label: 'Priority (High to Low)' },
]

export default function SortBar({ value, onChange, count, label = 'complaints' }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <p className="text-slate-500 text-sm">
        {count} {label}{count !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white">
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}