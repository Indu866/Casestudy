import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, AlertTriangle, Tag, Calendar, CheckCircle2, Loader2 } from 'lucide-react'

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700',
}

const REASON_LABELS = {
  UNRESOLVED_LONG:   'Unresolved for too long',
  NEEDS_HIGHER_AUTH: 'Needs higher authority',
  REPEATED_ISSUE:    'Repeated issue',
  URGENT:            'Urgent / Safety concern',
  OTHER:             'Other',
}

const STATUS_COLORS = {
  OPEN:        'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-emerald-100 text-emerald-700',
  ESCALATED:   'bg-rose-100 text-rose-700',
}

export default function ManagerEscalatedPage() {
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => { fetchEscalations() }, [])

  const fetchEscalations = async () => {
    try {
      setLoading(true)
      const data = await api.get('/my-escalations')
      setEscalations(data.escalations || [])
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">
          {escalations.length === 0
            ? 'No escalations sent yet.'
            : `${escalations.length} complaint${escalations.length !== 1 ? 's' : ''} escalated to Admin`}
        </p>
        <button onClick={fetchEscalations}
          className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {escalations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No escalations yet</p>
          <p className="text-sm mt-1">Complaints you escalate will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {escalations.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-rose-100 flex flex-col overflow-hidden shadow-sm">
              <div className="h-1 bg-rose-400" />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-slate-800 text-sm line-clamp-2">{e.complaint_title}</h3>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[e.complaint_status] || STATUS_COLORS.OPEN}`}>
                    {e.complaint_status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{e.complaint_description}</p>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {REASON_LABELS[e.reason] || e.reason}
                  </p>
                  <p className="text-xs text-rose-800 italic">"{e.message}"</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[e.category] || 'bg-slate-100 text-slate-600'}`}>
                    <Tag className="w-3 h-3" />{e.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {e.complaint_status === 'RESOLVED' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved by Admin
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}