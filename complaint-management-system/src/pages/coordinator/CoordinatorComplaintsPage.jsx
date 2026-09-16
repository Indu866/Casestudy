// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { AlertCircle, Tag, ThumbsUp, Calendar, Bell, X, Send, Filter, ArrowUpCircle } from 'lucide-react'

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

// const ESCALATION_REASONS = [
//   { value: 'STAFF_NOT_RESPONDING', label: 'Staff not responding' },
//   { value: 'OUT_OF_SCOPE', label: 'Out of scope for support staff' },
//   { value: 'URGENT', label: 'Urgent — needs higher authority' },
//   { value: 'REPEATED_ISSUE', label: 'Repeated unresolved issue' },
//   { value: 'OTHER', label: 'Other' },
// ]

// export default function CoordinatorComplaintsPage() {
//   const [complaints, setComplaints] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [statusFilter, setStatusFilter] = useState('ALL')

//   // Reminder modal
//   const [reminderTarget, setReminderTarget] = useState(null)
//   const [reminderMsg, setReminderMsg] = useState('')
//   const [reminderLoading, setReminderLoading] = useState(false)
//   const [reminderSuccess, setReminderSuccess] = useState('')

//   // Escalation modal
//   const [escalateTarget, setEscalateTarget] = useState(null)
//   const [escalateReason, setEscalateReason] = useState('')
//   const [escalateMsg, setEscalateMsg] = useState('')
//   const [escalateLoading, setEscalateLoading] = useState(false)
//   const [escalateSuccess, setEscalateSuccess] = useState('')

//   useEffect(() => { fetchComplaints() }, [])

//   const fetchComplaints = async () => {
//     try {
//       setLoading(true)
//       const data = await api.get('/coordinator/complaints')
//       setComplaints(data.complaints || [])
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const sendReminder = async () => {
//     if (!reminderMsg.trim()) return
//     setReminderLoading(true)
//     try {
//       await api.post(`/coordinator/complaints/${reminderTarget.id}/remind`, { message: reminderMsg })
//       setReminderSuccess('Reminder sent successfully!')
//       setReminderMsg('')
//       setTimeout(() => { setReminderTarget(null); setReminderSuccess('') }, 1500)
//     } catch (err) {
//       alert(err.message)
//     } finally {
//       setReminderLoading(false)
//     }
//   }

//   const sendEscalation = async () => {
//     if (!escalateReason || !escalateMsg.trim()) return
//     setEscalateLoading(true)
//     try {
//       await api.post(`/coordinator/complaints/${escalateTarget.id}/escalate`, {
//         reason: escalateReason,
//         message: escalateMsg
//       })
//       setEscalateSuccess('Complaint escalated to HOD!')
//       // Update status in UI
//       setComplaints(prev => prev.map(c =>
//         c.id === escalateTarget.id ? { ...c, status: 'ESCALATED' } : c
//       ))
//       setTimeout(() => { setEscalateTarget(null); setEscalateSuccess(''); setEscalateReason(''); setEscalateMsg('') }, 1800)
//     } catch (err) {
//       alert(err.message)
//     } finally {
//       setEscalateLoading(false)
//     }
//   }

//   const filtered = statusFilter === 'ALL' ? complaints : complaints.filter(c => c.status === statusFilter)

//   if (loading) return (
//     <div className="flex items-center justify-center py-24">
//       <span className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
//     </div>
//   )

//   if (error) return (
//     <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
//       <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
//     </div>
//   )

//   return (
//     <div>
//       {/* Filter bar */}
//       <div className="flex flex-wrap items-center gap-2 mb-6">
//         <Filter className="w-4 h-4 text-slate-400" />
//         {['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].map(s => (
//           <button key={s} onClick={() => setStatusFilter(s)}
//             className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
//               statusFilter === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
//             }`}>
//             {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
//           </button>
//         ))}
//         <span className="ml-auto text-slate-400 text-sm">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''}</span>
//         <button onClick={fetchComplaints}
//           className="text-sm text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition">
//           Refresh
//         </button>
//       </div>

//       {filtered.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-slate-400">
//           <p className="font-display font-semibold text-lg text-slate-500">No complaints found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filtered.map((c) => {
//             const { label, color, bar } = STATUS_MAP[c.status] || STATUS_MAP['OPEN']
//             const categoryName = c.category || 'General'
//             const canEscalate = ['OPEN', 'IN_PROGRESS'].includes(c.status)
//             const canRemind = c.status === 'OPEN'

//             return (
//               <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
//                 <div className={`h-1 w-full ${bar}`} />
//                 <div className="p-5 flex flex-col gap-3 flex-1">
//                   <div className="flex items-start justify-between gap-3">
//                     <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2">{c.title}</h3>
//                     <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>{label}</span>
//                   </div>
//                   <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>
//                   <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
//                     <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
//                       <Tag className="w-3 h-3" />{categoryName}
//                     </span>
//                     <span className="flex items-center gap-1.5"><ThumbsUp className="w-3 h-3" />{c.upvote_count || 0}</span>
//                     <span className="flex items-center gap-1.5">
//                       <Calendar className="w-3 h-3" />
//                       {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//                     </span>
//                   </div>
//                   {c.student_name && <p className="text-xs text-slate-400">By: <span className="font-medium text-slate-600">{c.student_name}</span></p>}
//                   {c.assigned_to_name && <p className="text-xs text-slate-400">Assigned: <span className="font-medium text-slate-600">{c.assigned_to_name}</span></p>}
//                 </div>
//                 <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2 flex-wrap">
//                   <span className="text-xs text-slate-400 font-mono">#{c.id?.toString().padStart(4, '0')}</span>
//                   <div className="flex gap-2">
//                     {canRemind && (
//                       <button onClick={() => { setReminderTarget(c); setReminderMsg('') }}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 transition">
//                         <Bell className="w-3.5 h-3.5" /> Remind
//                       </button>
//                     )}
//                     {canEscalate && (
//                       <button onClick={() => { setEscalateTarget(c); setEscalateReason(''); setEscalateMsg('') }}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-700 transition">
//                         <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {/* ── Reminder Modal ── */}
//       {reminderTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h3 className="font-display font-bold text-slate-800 text-lg">Send Reminder</h3>
//                 <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">"{reminderTarget.title}"</p>
//               </div>
//               <button onClick={() => setReminderTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
//                 <X className="w-4 h-4 text-slate-500" />
//               </button>
//             </div>
//             {reminderSuccess ? (
//               <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-medium">✓ {reminderSuccess}</div>
//             ) : (
//               <>
//                 <textarea value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}
//                   placeholder="Write a reminder message for the support staff..."
//                   rows={4}
//                   className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
//                 <div className="flex gap-3 mt-4">
//                   <button onClick={() => setReminderTarget(null)}
//                     className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
//                   <button onClick={sendReminder} disabled={reminderLoading || !reminderMsg.trim()}
//                     className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition">
//                     {reminderLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Escalation Modal ── */}
//       {escalateTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
//                   <ArrowUpCircle className="w-5 h-5 text-rose-500" /> Escalate to HOD
//                 </h3>
//                 <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">"{escalateTarget.title}"</p>
//               </div>
//               <button onClick={() => setEscalateTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
//                 <X className="w-4 h-4 text-slate-500" />
//               </button>
//             </div>
//             {escalateSuccess ? (
//               <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-medium">✓ {escalateSuccess}</div>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Reason for escalation</label>
//                   <div className="space-y-2">
//                     {ESCALATION_REASONS.map(r => (
//                       <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
//                         escalateReason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
//                       }`}>
//                         <input type="radio" name="reason" value={r.value}
//                           checked={escalateReason === r.value}
//                           onChange={e => setEscalateReason(e.target.value)}
//                           className="accent-rose-500" />
//                         <span className="text-sm text-slate-700">{r.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional message to HOD</label>
//                   <textarea value={escalateMsg} onChange={e => setEscalateMsg(e.target.value)}
//                     placeholder="Describe the situation and why this needs HOD attention..."
//                     rows={3}
//                     className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
//                 </div>
//                 <div className="flex gap-3">
//                   <button onClick={() => setEscalateTarget(null)}
//                     className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
//                   <button onClick={sendEscalation} disabled={escalateLoading || !escalateReason || !escalateMsg.trim()}
//                     className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold transition">
//                     {escalateLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><ArrowUpCircle className="w-4 h-4" /> Escalate</>}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, Tag, ThumbsUp, Calendar, Bell, X, Send, Filter, ArrowUpCircle } from 'lucide-react'
import SortBar from '../../components/complaints/SortBar'
import { sortComplaints } from '../../utils/sortComplaints'

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

const ESCALATION_REASONS = [
  { value: 'STAFF_NOT_RESPONDING', label: 'Staff not responding' },
  { value: 'OUT_OF_SCOPE', label: 'Out of scope for support staff' },
  { value: 'URGENT', label: 'Urgent — needs higher authority' },
  { value: 'REPEATED_ISSUE', label: 'Repeated unresolved issue' },
  { value: 'OTHER', label: 'Other' },
]

export default function CoordinatorComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Reminder modal
  const [reminderTarget, setReminderTarget] = useState(null)
  const [reminderMsg, setReminderMsg] = useState('')
  const [reminderLoading, setReminderLoading] = useState(false)
  const [reminderSuccess, setReminderSuccess] = useState('')

  // Escalation modal
  const [escalateTarget, setEscalateTarget] = useState(null)
  const [escalateReason, setEscalateReason] = useState('')
  const [escalateMsg, setEscalateMsg] = useState('')
  const [escalateLoading, setEscalateLoading] = useState(false)
  const [escalateSuccess, setEscalateSuccess] = useState('')

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await api.get('/coordinator/complaints')
      setComplaints(data.complaints || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendReminder = async () => {
    if (!reminderMsg.trim()) return
    setReminderLoading(true)
    try {
      await api.post(`/coordinator/complaints/${reminderTarget.id}/remind`, { message: reminderMsg })
      setReminderSuccess('Reminder sent successfully!')
      setReminderMsg('')
      setTimeout(() => { setReminderTarget(null); setReminderSuccess('') }, 1500)
    } catch (err) {
      alert(err.message)
    } finally {
      setReminderLoading(false)
    }
  }

  const sendEscalation = async () => {
    if (!escalateReason || !escalateMsg.trim()) return
    setEscalateLoading(true)
    try {
      await api.post(`/coordinator/complaints/${escalateTarget.id}/escalate`, {
        reason: escalateReason,
        message: escalateMsg
      })
      setEscalateSuccess('Complaint escalated to HOD!')
      // Update status in UI
      setComplaints(prev => prev.map(c =>
        c.id === escalateTarget.id ? { ...c, status: 'ESCALATED' } : c
      ))
      setTimeout(() => { setEscalateTarget(null); setEscalateSuccess(''); setEscalateReason(''); setEscalateMsg('') }, 1800)
    } catch (err) {
      alert(err.message)
    } finally {
      setEscalateLoading(false)
    }
  }

  const filtered = sortBy === 'priority'
  ? complaints
      .filter(c => c.status !== 'RESOLVED') // Exclude resolved complaints for priority sorting
      .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)) // Sort by priority_score descending
  : statusFilter === 'ALL'
    ? complaints // Show all complaints
    : complaints.filter(c => c.status === statusFilter); // Filter by status
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
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-slate-400" />
        {['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              statusFilter === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
            }`}>
            {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <SortBar value={sortBy} onChange={setSortBy} count={filtered.length} />
          <button onClick={fetchComplaints}
            className="text-sm text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition">
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="font-display font-semibold text-lg text-slate-500">No complaints found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortComplaints(filtered, sortBy).map((c) => {
            const { label, color, bar } = STATUS_MAP[c.status] || STATUS_MAP['OPEN']
            const categoryName = c.category || 'General'
            const canEscalate = ['OPEN', 'IN_PROGRESS'].includes(c.status)
            const canRemind = c.status === 'OPEN'

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                <div className={`h-1 w-full ${bar}`} />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2">{c.title}</h3>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>{label}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
                      <Tag className="w-3 h-3" />{categoryName}
                    </span>
                    <span className="flex items-center gap-1.5"><ThumbsUp className="w-3 h-3" />{c.upvote_count || 0}</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {c.student_name && <p className="text-xs text-slate-400">By: <span className="font-medium text-slate-600">{c.student_name}</span></p>}
                  {c.assigned_to_name && <p className="text-xs text-slate-400">Assigned: <span className="font-medium text-slate-600">{c.assigned_to_name}</span></p>}
                </div>
                <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-mono">#{c.id?.toString().padStart(4, '0')}</span>
                  <div className="flex gap-2">
                    {canRemind && (
                      <button onClick={() => { setReminderTarget(c); setReminderMsg('') }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 transition">
                        <Bell className="w-3.5 h-3.5" /> Remind
                      </button>
                    )}
                    {canEscalate && (
                      <button onClick={() => { setEscalateTarget(c); setEscalateReason(''); setEscalateMsg('') }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-700 transition">
                        <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Reminder Modal ── */}
      {reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Send Reminder</h3>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">"{reminderTarget.title}"</p>
              </div>
              <button onClick={() => setReminderTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {reminderSuccess ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-medium">✓ {reminderSuccess}</div>
            ) : (
              <>
                <textarea value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}
                  placeholder="Write a reminder message for the support staff..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setReminderTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button onClick={sendReminder} disabled={reminderLoading || !reminderMsg.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition">
                    {reminderLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Escalation Modal ── */}
      {escalateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-rose-500" /> Escalate to HOD
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">"{escalateTarget.title}"</p>
              </div>
              <button onClick={() => setEscalateTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {escalateSuccess ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-medium">✓ {escalateSuccess}</div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reason for escalation</label>
                  <div className="space-y-2">
                    {ESCALATION_REASONS.map(r => (
                      <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        escalateReason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input type="radio" name="reason" value={r.value}
                          checked={escalateReason === r.value}
                          onChange={e => setEscalateReason(e.target.value)}
                          className="accent-rose-500" />
                        <span className="text-sm text-slate-700">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional message to HOD</label>
                  <textarea value={escalateMsg} onChange={e => setEscalateMsg(e.target.value)}
                    placeholder="Describe the situation and why this needs HOD attention..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEscalateTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button onClick={sendEscalation} disabled={escalateLoading || !escalateReason || !escalateMsg.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold transition">
                    {escalateLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><ArrowUpCircle className="w-4 h-4" /> Escalate</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}