import { useEffect } from 'react'
import { X, Tag, User, Calendar, Clock, ArrowRight, AlertTriangle } from 'lucide-react'

const STATUS_MAP = {
  OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
}

const CATEGORY_COLORS = {
  Hostel:       'bg-orange-50 text-orange-700',
  Transport:    'bg-indigo-50 text-indigo-700',
  Library:      'bg-teal-50 text-teal-700',
  Electrical:   'bg-yellow-50 text-yellow-700',
  Plumbing:     'bg-sky-50 text-sky-50',
  Carpentry:    'bg-amber-50 text-amber-700',
  Civil:        'bg-violet-50 text-violet-700',
  'IT Support': 'bg-cyan-50 text-cyan-700',
}

const REASON_LABELS = {
  STAFF_NOT_RESPONDING: 'Staff not responding',
  OUT_OF_SCOPE:         'Out of scope',
  URGENT:               'Urgent',
  REPEATED_ISSUE:       'Repeated issue',
  UNRESOLVED_LONG:      'Unresolved for too long',
  NEEDS_HIGHER_AUTH:    'Needs higher authority',
  OTHER:                'Other',
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ComplaintDetailModal({ complaint, onClose }) {
  if (!complaint) return null

  const statusKey    = complaint.status || 'OPEN'
  const status       = STATUS_MAP[statusKey] || STATUS_MAP['OPEN']
  const categoryName = complaint.category || complaint.category_name || 'General'

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Coloured top bar */}
        <div className={`h-1.5 w-full ${status.bar}`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
              {complaint.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              #{complaint.id?.toString().padStart(4, '0')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
              {status.label}
            </span>
            <button onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[65vh]">

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description || 'No description provided.'}
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
                <Tag className="w-3 h-3" />{categoryName}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
              <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>

            {(complaint.student_name || complaint.upvote_count !== undefined) && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Submitted by</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {complaint.student_name || 'Student'}
                </p>
              </div>
            )}

            {complaint.upvote_count !== undefined && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Upvotes</p>
                <p className="text-sm font-medium text-slate-700">👍 {complaint.upvote_count || 0}</p>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Submitted on</p>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Last updated</p>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {timeAgo(complaint.updated_at)}
              </p>
            </div>

            {complaint.assigned_to_name && (
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Assigned to</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />{complaint.assigned_to_name}
                </p>
              </div>
            )}
          </div>

          {/* Escalation info if present */}
          {(complaint.escalation_reason || complaint.chain_escalation_reason) && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Escalation Details
              </p>
              <p className="text-xs text-rose-600">
                Reason: {REASON_LABELS[complaint.escalation_reason || complaint.chain_escalation_reason] || complaint.escalation_reason || complaint.chain_escalation_reason}
              </p>
              {(complaint.escalation_message || complaint.chain_escalation_message) && (
                <p className="text-xs text-rose-800 italic">
                  "{complaint.escalation_message || complaint.chain_escalation_message}"
                </p>
              )}
              {complaint.escalated_by_name && (
                <p className="text-xs text-rose-600">By: {complaint.escalated_by_name}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}