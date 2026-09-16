// import { useState } from 'react'
// import { Calendar, Tag, ThumbsUp, UserCheck, CheckCircle2, Loader2, AlertTriangle, Send } from 'lucide-react'
// import { api } from '../../utils/api'
// import { useAuth } from '../../context/AuthContext'

// const STATUS_MAP = {
//   OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
//   IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
//   RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
//   ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
// }

// const CATEGORY_COLORS = {
//   Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
//   Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
//   Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
//   Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
// }

// const REASON_OPTIONS = [
//   { value: 'UNRESOLVED_LONG',    label: 'Unresolved for too long' },
//   { value: 'NEEDS_HIGHER_AUTH',  label: 'Needs higher authority' },
//   { value: 'REPEATED_ISSUE',     label: 'Repeated issue' },
//   { value: 'URGENT',             label: 'Urgent / Safety concern' },
//   { value: 'OTHER',              label: 'Other' },
// ]

// // Dept IDs that can escalate (for role 2 support staff)
// const ESCALATABLE_DEPTS = [5, 6] // library, transport

// export default function StaffComplaintCard({ complaint, onAccept, onResolve, onEscalated }) {
//   const { user } = useAuth()
//   const [actionLoading, setActionLoading] = useState(null)
//   const [showEscModal, setShowEscModal]   = useState(false)
//   const [reason, setReason]               = useState('')
//   const [message, setMessage]             = useState('')
//   const [escLoading, setEscLoading]       = useState(false)
//   const [escError, setEscError]           = useState('')

//   const isWarden = user?.role_id === 5
//   const isLibTransportStaff = user?.role_id === 2 && ESCALATABLE_DEPTS.includes(user?.department_id)
//   const canEscalate = isWarden || isLibTransportStaff

//   const escalateLabel = isWarden
//     ? 'Escalate to Hostel Manager'
//     : user?.department_id === 5
//       ? 'Escalate to Librarian'
//       : 'Escalate to Transport Manager'

//   const handleAccept = async () => {
//     setActionLoading('accept')
//     try {
//       const data = await api.put(`/complaints/${complaint.id}/accept`)
//       onAccept?.(complaint.id, data.complaint)
//     } catch (err) { alert(err.message) }
//     finally { setActionLoading(null) }
//   }

//   const handleResolve = async () => {
//     setActionLoading('resolve')
//     try {
//       const data = await api.put(`/complaints/${complaint.id}/resolve`)
//       onResolve?.(complaint.id, data.complaint)
//     } catch (err) { alert(err.message) }
//     finally { setActionLoading(null) }
//   }

//   const handleEscalate = async () => {
//     if (!reason || !message.trim()) return
//     setEscLoading(true)
//     setEscError('')
//     try {
//       await api.post(`/complaints/${complaint.id}/escalate-chain`, { reason, message })
//       onEscalated?.(complaint.id)
//       setShowEscModal(false)
//       setReason('')
//       setMessage('')
//     } catch (err) {
//       setEscError(err.message)
//     } finally {
//       setEscLoading(false)
//     }
//   }

//   const statusKey = complaint.status || 'OPEN'
//   const { label, color, bar } = STATUS_MAP[statusKey] || STATUS_MAP['OPEN']
//   const categoryName = complaint.category || 'General'
//   const alreadyEscalated = complaint.chain_escalated

//   return (
//     <>
//       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
//         <div className={`h-1 w-full ${bar}`} />

//         <div className="p-5 flex flex-col gap-3 flex-1">
//           <div className="flex items-start justify-between gap-3">
//             <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2">
//               {complaint.title}
//             </h3>
//             <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
//               {label}
//             </span>
//           </div>

//           <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{complaint.description}</p>

//           <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
//             <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
//               <Tag className="w-3 h-3" />{categoryName}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <ThumbsUp className="w-3 h-3" />{complaint.upvote_count || 0} upvotes
//             </span>
//             <span className="flex items-center gap-1.5">
//               <Calendar className="w-3 h-3" />
//               {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//             </span>
//           </div>
//         </div>

//         <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-3 flex-wrap">
//           <span className="text-xs text-slate-400 font-mono">#{complaint.id?.toString().padStart(4, '0')}</span>

//           <div className="flex gap-2 flex-wrap">
//             {complaint.status === 'OPEN' && (
//               <button onClick={handleAccept} disabled={actionLoading === 'accept'}
//                 className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition">
//                 {actionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
//                 Accept
//               </button>
//             )}
//             {complaint.status === 'IN_PROGRESS' && (
//               <>
//                 <button onClick={handleResolve} disabled={actionLoading === 'resolve'}
//                   className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition">
//                   {actionLoading === 'resolve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
//                   Resolve
//                 </button>
//                 {canEscalate && !alreadyEscalated && (
//                   <button onClick={() => setShowEscModal(true)}
//                     className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition">
//                     <AlertTriangle className="w-4 h-4" />
//                     {escalateLabel}
//                   </button>
//                 )}
//                 {canEscalate && alreadyEscalated && (
//                   <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium px-3 py-2">
//                     <AlertTriangle className="w-3.5 h-3.5" /> Escalated
//                   </span>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Escalate modal */}
//       {showEscModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
//             <div>
//               <h3 className="font-display font-bold text-slate-800 text-lg">{escalateLabel}</h3>
//               <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">"{complaint.title}"</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
//               <div className="space-y-2">
//                 {REASON_OPTIONS.map(r => (
//                   <label key={r.value}
//                     className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
//                       reason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
//                     }`}>
//                     <input type="radio" name="staff_esc_reason" value={r.value}
//                       checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-rose-500" />
//                     <span className="text-sm text-slate-700">{r.label}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
//               <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
//                 placeholder="Describe why you're escalating..."
//                 className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
//             </div>
//             {escError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{escError}</p>}
//             <div className="flex gap-3">
//               <button onClick={() => { setShowEscModal(false); setEscError('') }}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
//                 Cancel
//               </button>
//               <button onClick={handleEscalate} disabled={escLoading || !reason || !message.trim()}
//                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold transition">
//                 {escLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Escalate</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

import { useState } from 'react'
import { Calendar, Tag, ThumbsUp, UserCheck, CheckCircle2, Loader2, AlertTriangle, Send } from 'lucide-react'
import { api } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import ComplaintDetailModal from '../complaints/ComplaintDetailModal'

const STATUS_MAP = {
  OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
}

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
  Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
  Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
}

const REASON_OPTIONS = [
  { value: 'UNRESOLVED_LONG',   label: 'Unresolved for too long' },
  { value: 'NEEDS_HIGHER_AUTH', label: 'Needs higher authority' },
  { value: 'REPEATED_ISSUE',    label: 'Repeated issue' },
  { value: 'URGENT',            label: 'Urgent / Safety concern' },
  { value: 'OTHER',             label: 'Other' },
]

const ESCALATABLE_DEPTS = [5, 6]

export default function StaffComplaintCard({ complaint, onAccept, onResolve, onEscalated }) {
  const { user } = useAuth()
  const [actionLoading, setActionLoading] = useState(null)
  const [showEscModal, setShowEscModal]   = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [reason, setReason]               = useState('')
  const [message, setMessage]             = useState('')
  const [escLoading, setEscLoading]       = useState(false)
  const [escError, setEscError]           = useState('')

  const isWarden         = user?.role_id === 5
  const isLibTransport   = user?.role_id === 2 && ESCALATABLE_DEPTS.includes(user?.department_id)
  const canEscalate      = isWarden || isLibTransport
  const escalateLabel    = isWarden ? 'Escalate to Hostel Manager'
    : user?.department_id === 5 ? 'Escalate to Librarian'
    : 'Escalate to Transport Manager'

  const handleAccept = async (e) => {
    e.stopPropagation()
    setActionLoading('accept')
    try {
      const data = await api.put(`/complaints/${complaint.id}/accept`)
      onAccept?.(complaint.id, data.complaint)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(null) }
  }

  const handleResolve = async (e) => {
    e.stopPropagation()
    setActionLoading('resolve')
    try {
      const data = await api.put(`/complaints/${complaint.id}/resolve`)
      onResolve?.(complaint.id, data.complaint)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(null) }
  }

  const handleEscalate = async () => {
    if (!reason || !message.trim()) return
    setEscLoading(true)
    setEscError('')
    try {
      await api.post(`/complaints/${complaint.id}/escalate-chain`, { reason, message })
      onEscalated?.(complaint.id)
      setShowEscModal(false)
      setReason('')
      setMessage('')
    } catch (err) { setEscError(err.message) }
    finally { setEscLoading(false) }
  }

  const statusKey    = complaint.status || 'OPEN'
  const { label, color, bar } = STATUS_MAP[statusKey] || STATUS_MAP['OPEN']
  const categoryName = complaint.category || 'General'
  const alreadyEscalated = complaint.chain_escalated

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group">
        <div className={`h-1 w-full ${bar}`} />

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition">
              {complaint.title}
            </h3>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
              {label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
              <Tag className="w-3 h-3" />{categoryName}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3" />{complaint.upvote_count || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic">Click to view details</p>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-3 flex-wrap"
          onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-400 font-mono">#{complaint.id?.toString().padStart(4, '0')}</span>

          <div className="flex gap-2 flex-wrap">
            {complaint.status === 'OPEN' && (
              <button onClick={handleAccept} disabled={actionLoading === 'accept'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition">
                {actionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Accept
              </button>
            )}
            {complaint.status === 'IN_PROGRESS' && (
              <>
                <button onClick={handleResolve} disabled={actionLoading === 'resolve'}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition">
                  {actionLoading === 'resolve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Resolve
                </button>
                {canEscalate && !alreadyEscalated && (
                  <button onClick={e => { e.stopPropagation(); setShowEscModal(true) }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition">
                    <AlertTriangle className="w-4 h-4" />{escalateLabel}
                  </button>
                )}
                {canEscalate && alreadyEscalated && (
                  <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalated
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <ComplaintDetailModal complaint={complaint} onClose={() => setShowDetailModal(false)} />
      )}

      {/* Escalate Modal */}
      {showEscModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-lg">{escalateLabel}</h3>
              <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">"{complaint.title}"</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <div className="space-y-2">
                {REASON_OPTIONS.map(r => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${reason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="staff_esc_reason" value={r.value}
                      checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-rose-500" />
                    <span className="text-sm text-slate-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Describe why you're escalating..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
            </div>
            {escError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{escError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowEscModal(false); setEscError('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleEscalate} disabled={escLoading || !reason || !message.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold transition">
                {escLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Escalate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}