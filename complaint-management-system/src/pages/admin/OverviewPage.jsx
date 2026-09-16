import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, TrendingUp, CheckCircle2, Clock, FileText, AlertTriangle, Loader2 } from 'lucide-react'

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await api.get('/admin/stats')
      setStats(data)
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

  const { total, today, weekly, monthly, statusCounts, resolutionRate, avgResolutionHours } = stats

  const topCards = [
    { label: 'Total Complaints',    value: total,   sub: 'all time',       icon: FileText,     color: 'bg-slate-100 text-slate-600' },
    { label: 'Today',               value: today,   sub: 'submitted today', icon: TrendingUp,   color: 'bg-blue-100 text-blue-600' },
    { label: 'This Week',           value: weekly,  sub: 'this week',       icon: TrendingUp,   color: 'bg-violet-100 text-violet-600' },
    { label: 'This Month',          value: monthly, sub: 'this month',      icon: TrendingUp,   color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Resolution Rate',     value: `${resolutionRate}%`, sub: 'of all complaints', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Avg Resolution Time', value: `${avgResolutionHours}h`, sub: 'per complaint', icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ]

  const statusCards = [
    { label: 'Open',        value: statusCounts.OPEN,        color: 'border-l-amber-400',   badge: 'bg-amber-100 text-amber-700' },
    { label: 'In Progress', value: statusCounts.IN_PROGRESS, color: 'border-l-blue-400',    badge: 'bg-blue-100 text-blue-700' },
    { label: 'Resolved',    value: statusCounts.RESOLVED,    color: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
    { label: 'Escalated',   value: statusCounts.ESCALATED,   color: 'border-l-rose-400',    badge: 'bg-rose-100 text-rose-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {topCards.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-800">{value}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Current Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusCards.map(({ label, value, color, badge }) => (
            <div key={label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${color} p-5`}>
              <p className="text-3xl font-display font-bold text-slate-800">{value}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>{label}</span>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color.replace('border-l-', 'bg-')}`}
                  style={{ width: total > 0 ? `${Math.round((value / total) * 100)}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{total > 0 ? Math.round((value / total) * 100) : 0}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}