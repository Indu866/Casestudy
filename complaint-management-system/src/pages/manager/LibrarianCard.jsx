import { useState } from 'react'
import { api } from '../../utils/api'
import {
  AlertTriangle, CheckCircle2, Tag, ThumbsUp, Clock,
  Loader2, Send, X
} from 'lucide-react'
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal'

const STATUS_COLORS = {
  OPEN:        'bg-amber-100 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RESOLVED:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  ESCALATED:   'bg-rose-100 text-rose-700 border-rose-200',
}

const STATUS_BAR = {
  OPEN: 'bg-amber-400', IN_PROGRESS: 'bg-blue-500',
  RESOLVED: 'bg-emerald-400', ESCALATED: 'bg-rose-500',
}

const REASON_OPTIONS = [
  { value: 'UNRESOLVED_LONG',   label: 'Unresolved for too long' },
  { value: 'NEEDS_HIGHER_AUTH', label: 'Needs higher authority' },
  { value: 'REPEATED_ISSUE',    label: 'Repeated issue' },
  { value: 'URGENT',            label: 'Urgent / Safety concern' },
  { value: 'OTHER',             label: 'Other' },
]

const REASON_LABELS = Object.fromEntries(REASON_OPTIONS.map(r => [r.value, r.label]))

export default function LibrarianCard({ complaint, onResolved, onEscalated }) {
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEscModal, setShowEscModal]       = useState(false)
  const [reason, setReason]                   = useState('')
  const [message, setMessage]                 = useState('')
  const [escLoading, setEscLoading]           = useState(false)
  const [resolveLoading, setResolveLoading]   = useState(false)
  const [escError, setEscError]               = useState('')

  const c            = complaint
  const isResolved   = c.status === 'RESOLVED'
  const escalatedToMgr   = !!c.chain_escalation_id   // support staff → transport manager
  const escalatedToAdmin = !!c.escalated_to_admin     // transport manager → admin

  const handleResolve = async (e) => {
    e.stopPropagation()
    setResolveLoading(true)
    try {
      await api.put(`/complaints/${c.id}/resolve`)
      onResolved(c.id)
    } catch (err) { alert(err.message) }
    finally { setResolveLoading(false) }
  }

  const handleEscalate = async () => {
    if (!reason || !message.trim()) return
    setEscLoading(true)
    setEscError('')
    try {
      await api.post(`/complaints/${c.id}/escalate-chain`, { reason, message })
      onEscalated(c.id)
      setShowEscModal(false)
      setReason('')
      setMessage('')
    } catch (err) { setEscError(err.message) }
    finally { setEscLoading(false) }
  }

  const bar = isResolved ? 'bg-emerald-400' : STATUS_BAR[c.status] || STATUS_BAR['OPEN']

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col overflow-hidden">
        <div className={`h-1 w-full ${bar}`} />

        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition">
              {c.title}
            </h3>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || STATUS_COLORS.OPEN}`}>
              {c.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Escalated by support staff badge */}
          {escalatedToMgr && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5">
              <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Escalated by {c.chain_escalated_by_name}
              </p>
              <p className="text-xs text-rose-600 mt-0.5">
                {REASON_LABELS[c.chain_escalation_reason] || c.chain_escalation_reason}
              </p>
            </div>
          )}

          {/* Already escalated to Admin badge */}
          {escalatedToAdmin && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Escalated to Admin
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-teal-50 text-teal-700">
              <Tag className="w-3 h-3" />Library
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3" />{c.upvote_count || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic">Click to view details</p>
        </div>

        {/* Action footer */}
        {!isResolved && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-2"
            onClick={e => e.stopPropagation()}>
            <button onClick={handleResolve} disabled={resolveLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition disabled:opacity-50 flex-1 justify-center">
              {resolveLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <><CheckCircle2 className="w-3.5 h-3.5" />Resolve</>}
            </button>

            {!escalatedToAdmin ? (
              <button onClick={e => { e.stopPropagation(); setShowEscModal(true) }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition flex-1 justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />Escalate to Admin
              </button>
            ) : (
              <span className="text-xs text-orange-600 font-medium flex items-center gap-1.5 flex-1 justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />Escalated to Admin
              </span>
            )}
          </div>
        )}

        {isResolved && (
          <div className="px-5 py-3 border-t border-slate-50 bg-emerald-50/50">
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />Resolved
            </span>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <ComplaintDetailModal complaint={c} onClose={() => setShowDetailModal(false)} />
      )}

      {/* Escalate to Admin Modal */}
      {showEscModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Escalate to Admin</h3>
                <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">"{c.title}"</p>
              </div>
              <button onClick={() => setShowEscModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <div className="space-y-2">
                {REASON_OPTIONS.map(r => (
                  <label key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      reason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <input type="radio" name="tm_esc_reason" value={r.value}
                      checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-rose-500" />
                    <span className="text-sm text-slate-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Describe why you're escalating to Admin..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
            </div>

            {escError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{escError}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setShowEscModal(false); setEscError('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleEscalate} disabled={escLoading || !reason || !message.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold transition">
                {escLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" />Escalate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}