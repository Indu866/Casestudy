import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, Loader2, Clock, TrendingUp } from 'lucide-react'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await api.get('/admin/department-stats')
      setDepartments(data.departments || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
      <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
    </div>
  )

  const maxTotal = Math.max(...departments.map(d => parseInt(d.total) || 0), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{departments.length} departments</p>
        <button onClick={fetchStats}
          className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map(d => {
          const total = parseInt(d.total) || 0
          const open = parseInt(d.open) || 0
          const inProgress = parseInt(d.in_progress) || 0
          const resolved = parseInt(d.resolved) || 0
          const escalated = parseInt(d.escalated) || 0
          const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0

          return (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-slate-800">{d.department}</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {total} total
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-100">
                  {resolved > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${(resolved/total)*100}%` }} />}
                  {inProgress > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${(inProgress/total)*100}%` }} />}
                  {escalated > 0 && <div className="bg-rose-400 transition-all" style={{ width: `${(escalated/total)*100}%` }} />}
                  {open > 0 && <div className="bg-amber-300 transition-all" style={{ width: `${(open/total)*100}%` }} />}
                </div>
              </div>

              {/* Status grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Open',     value: open,       color: 'text-amber-600',   bg: 'bg-amber-50' },
                  { label: 'Active',   value: inProgress, color: 'text-blue-600',    bg: 'bg-blue-50' },
                  { label: 'Resolved', value: resolved,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Escalated',value: escalated,  color: 'text-rose-600',    bg: 'bg-rose-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl py-2`}>
                    <p className={`text-lg font-bold font-display ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  {resRate}% resolved
                </span>
                {d.avg_resolution_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Avg {d.avg_resolution_hours}h
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-display font-semibold text-slate-700 text-sm">Comparison Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                {['Department','Total','Open','In Progress','Resolved','Escalated','Res. Rate','Avg Time'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map(d => {
                const total = parseInt(d.total) || 0
                const resolved = parseInt(d.resolved) || 0
                const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-semibold text-slate-800">{d.department}</td>
                    <td className="px-5 py-3 text-slate-600">{total}</td>
                    <td className="px-5 py-3 text-amber-600 font-medium">{parseInt(d.open)||0}</td>
                    <td className="px-5 py-3 text-blue-600 font-medium">{parseInt(d.in_progress)||0}</td>
                    <td className="px-5 py-3 text-emerald-600 font-medium">{resolved}</td>
                    <td className="px-5 py-3 text-rose-600 font-medium">{parseInt(d.escalated)||0}</td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${resRate >= 70 ? 'text-emerald-600' : resRate >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {resRate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{d.avg_resolution_hours ? `${d.avg_resolution_hours}h` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}