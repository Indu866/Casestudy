import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertTriangle, AlertCircle, Tag, Calendar, ThumbsUp } from 'lucide-react'

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
  Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
  Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
}

const REASON_LABELS = {
  STAFF_NOT_RESPONDING: 'Staff not responding',
  OUT_OF_SCOPE: 'Out of scope',
  URGENT: 'Urgent',
  REPEATED_ISSUE: 'Repeated issue',
  OTHER: 'Other',
}

export default function CoordinatorEscalatedPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await api.get('/coordinator/escalated-complaints')
      setComplaints(data.complaints || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
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
          {complaints.length === 0
            ? "You haven't escalated any complaints yet."
            : `${complaints.length} escalated complaint${complaints.length !== 1 ? 's' : ''}`}
        </p>
        <button onClick={fetchComplaints}
          className="text-sm text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No escalated complaints</p>
          <p className="text-sm mt-1">Complaints you escalate to HOD will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {complaints.map((c) => {
            const categoryName = c.category || 'General'
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm flex flex-col overflow-hidden">
                <div className="h-1 w-full bg-rose-500" />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2">{c.title}</h3>
                    <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border bg-rose-100 text-rose-700 border-rose-200">
                      Escalated
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>

                  {/* Escalation details */}
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Escalated to: {c.hod_name}
                    </p>
                    <p className="text-xs text-rose-600">
                      Reason: {REASON_LABELS[c.escalation_reason] || c.escalation_reason}
                    </p>
                    <p className="text-xs text-rose-800 italic">"{c.escalation_message}"</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
                      <Tag className="w-3 h-3" />{categoryName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-3 h-3" />{c.upvote_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.escalated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {c.student_name && <p className="text-xs text-slate-400">By: <span className="font-medium text-slate-600">{c.student_name}</span></p>}
                  {c.assigned_to_name && <p className="text-xs text-slate-400">Was assigned to: <span className="font-medium text-slate-600">{c.assigned_to_name}</span></p>}
                </div>
                <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
                  <span className="text-xs text-slate-400 font-mono">#{c.id?.toString().padStart(4, '0')}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}