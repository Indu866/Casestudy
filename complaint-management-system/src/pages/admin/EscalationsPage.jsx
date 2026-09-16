// // import { useState, useEffect } from 'react'
// // import { api } from '../../utils/api'
// // import { AlertCircle, AlertTriangle, Tag, Calendar, Loader2, CheckCircle2 } from 'lucide-react'

// // const REASON_LABELS = {
// //   STAFF_NOT_RESPONDING: 'Staff not responding',
// //   OUT_OF_SCOPE: 'Out of scope',
// //   URGENT: 'Urgent',
// //   REPEATED_ISSUE: 'Repeated issue',
// //   OTHER: 'Other',
// // }

// // const STATUS_MAP = {
// //   OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200' },
// //   IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
// //   RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
// //   ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200' },
// // }

// // // Tab: 'coordinator' = existing coordinator→HOD escalations
// // //      'chain' = new complaint_escalations (warden/librarian/transport_mgr → admin)
// // export default function EscalationsPage() {
// //   const [activeTab, setActiveTab] = useState('coordinator')
// //   const [chainEscalations, setChainEscalations] = useState([])
// //   const [chainLoading, setChainLoading] = useState(false)

// //   const fetchChainEscalations = async () => {
// //     setChainLoading(true)
// //     try {
// //       const data = await api.get('/admin/chain-escalations')
// //       setChainEscalations(data.escalations || [])
// //     } catch (err) { console.error(err) }
// //     finally { setChainLoading(false) }
// //   }
// //   const [escalations, setEscalations] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState('')
// //   const [resolvingId, setResolvingId] = useState(null)

// //   useEffect(() => { fetchEscalations() }, [])
// //   useEffect(() => { if (activeTab === 'chain') fetchChainEscalations() }, [activeTab])

// //   const fetchEscalations = async () => {
// //     try {
// //       setLoading(true)
// //       const data = await api.get('/admin/escalations')
// //       setEscalations(data.escalations || [])
// //     } catch (err) {
// //       setError(err.message)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const resolveComplaint = async (complaintId, escalationId) => {
// //     setResolvingId(escalationId)
// //     try {
// //       await api.put(`/admin/complaints/${complaintId}/resolve`)
// //       // Update status in local state — no need to refetch
// //       setEscalations(prev => prev.map(e =>
// //         e.id === escalationId ? { ...e, complaint_status: 'RESOLVED' } : e
// //       ))
// //     } catch (err) {
// //       alert(err.message)
// //     } finally {
// //       setResolvingId(null)
// //     }
// //   }

// //   if (loading) return (
// //     <div className="flex items-center justify-center py-24">
// //       <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
// //     </div>
// //   )

// //   if (error) return (
// //     <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
// //       <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
// //     </div>
// //   )

// //   return (
// //     <div className="space-y-6">
// //       {/* Tabs */}
// //       <div className="flex gap-2 mb-2">
// //         {[
// //           { key: 'coordinator', label: 'Coordinator → HOD' },
// //           { key: 'chain',       label: 'Hostel / Library / Transport' },
// //         ].map(t => (
// //           <button key={t.key} onClick={() => setActiveTab(t.key)}
// //             className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
// //               activeTab === t.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
// //             }`}>
// //             {t.label}
// //           </button>
// //         ))}
// //       </div>

// //       <div className="flex items-center justify-between">
// //         <p className="text-slate-500 text-sm">{escalations.length} escalation{escalations.length !== 1 ? 's' : ''} across all departments</p>
// //         <button onClick={fetchEscalations}
// //           className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
// //           Refresh
// //         </button>
// //       </div>

// //       {escalations.length === 0 ? (
// //         <div className="flex flex-col items-center justify-center py-24 text-slate-400">
// //           <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
// //           <p className="font-display font-semibold text-lg text-slate-500">No escalations</p>
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //           {escalations.map(e => {
// //             const status = STATUS_MAP[e.complaint_status] || STATUS_MAP['ESCALATED']
// //             const isResolved = e.complaint_status === 'RESOLVED'
// //             const isResolving = resolvingId === e.id
// //             return (
// //               <div key={e.id} className="bg-white rounded-2xl border border-rose-100 flex flex-col overflow-hidden">
// //                 <div className={`h-1 ${isResolved ? 'bg-emerald-400' : 'bg-rose-500'}`} />
// //                 <div className="p-5 flex flex-col gap-3 flex-1">
// //                   <div className="flex items-start justify-between gap-3">
// //                     <h3 className="font-display font-semibold text-slate-800 text-sm line-clamp-2">{e.complaint_title}</h3>
// //                     <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
// //                       {status.label}
// //                     </span>
// //                   </div>

// //                   <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1.5">
// //                     <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
// //                       <AlertTriangle className="w-3.5 h-3.5" />
// //                       {REASON_LABELS[e.reason] || e.reason}
// //                     </p>
// //                     <p className="text-xs text-rose-800 italic line-clamp-2">"{e.message}"</p>
// //                   </div>

// //                   <div className="space-y-1 text-xs text-slate-500">
// //                     <p>Dept: <span className="font-medium text-slate-700">{e.department}</span></p>
// //                     <p>By: <span className="font-medium text-slate-700">{e.escalated_by_name}</span></p>
// //                     <p>To HOD: <span className="font-medium text-slate-700">{e.hod_name}</span></p>
// //                   </div>

// //                   <div className="flex items-center gap-2 text-xs text-slate-400">
// //                     <Tag className="w-3 h-3" />{e.category}
// //                     <Calendar className="w-3 h-3 ml-2" />
// //                     {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
// //                   </div>
// //                 </div>

// //                 {/* Resolve button at the bottom */}
// //                 <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
// //                   {isResolved ? (
// //                     <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
// //                       <CheckCircle2 className="w-4 h-4" /> Resolved by Admin
// //                     </div>
// //                   ) : (
// //                     <button
// //                       onClick={() => resolveComplaint(e.complaint_id, e.id)}
// //                       disabled={isResolving}
// //                       className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition disabled:opacity-50 w-full justify-center">
// //                       {isResolving
// //                         ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving...</>
// //                         : <><CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved</>}
// //                     </button>
// //                   )}
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>
// //       )}
// //       {activeTab === 'chain' && (
// //         chainLoading
// //           ? <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
// //           : chainEscalations.length === 0
// //           ? <div className="flex flex-col items-center justify-center py-24 text-slate-400">
// //               <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
// //               <p className="font-display font-semibold text-lg text-slate-500">No escalations</p>
// //             </div>
// //           : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //               {chainEscalations.map(e => {
// //                 const status = STATUS_MAP[e.complaint_status] || STATUS_MAP['ESCALATED']
// //                 return (
// //                   <div key={e.id} className="bg-white rounded-2xl border border-rose-100 flex flex-col overflow-hidden shadow-sm">
// //                     <div className="h-1 bg-rose-500" />
// //                     <div className="p-5 flex flex-col gap-3 flex-1">
// //                       <div className="flex items-start justify-between gap-3">
// //                         <h3 className="font-display font-semibold text-slate-800 text-sm line-clamp-2">{e.complaint_title}</h3>
// //                         <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>{status.label}</span>
// //                       </div>
// //                       <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1">
// //                         <p className="text-xs font-semibold text-rose-700">{e.escalated_by_name} ({e.escalated_by_role?.replace('_',' ')})</p>
// //                         <p className="text-xs text-rose-600">{e.reason?.replace('_',' ')}</p>
// //                         <p className="text-xs text-rose-800 italic">"{e.message}"</p>
// //                       </div>
// //                       <div className="flex items-center gap-2 text-xs text-slate-400">
// //                         <Tag className="w-3 h-3" />{e.category}
// //                         <Calendar className="w-3 h-3 ml-2" />
// //                         {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
// //                       </div>
// //                     </div>
// //                     <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
// //                       {e.complaint_status === 'RESOLVED'
// //                         ? <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold"><CheckCircle2 className="w-4 h-4" />Resolved</div>
// //                         : <button onClick={async () => {
// //                             try {
// //                               await api.put(`/admin/chain-escalations/${e.complaint_id}/resolve`)
// //                               setChainEscalations(prev => prev.map(x => x.id === e.id ? {...x, complaint_status: 'RESOLVED'} : x))
// //                             } catch(err) { alert(err.message) }
// //                           }}
// //                           className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition w-full justify-center">
// //                           <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
// //                         </button>
// //                       }
// //                     </div>
// //                   </div>
// //                 )
// //               })}
// //             </div>
// //       )}
// //     </div>
// //   )
// // }


// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { AlertCircle, AlertTriangle, Tag, Calendar, Loader2, CheckCircle2 } from 'lucide-react'

// const REASON_LABELS = {
//   STAFF_NOT_RESPONDING: 'Staff not responding',
//   OUT_OF_SCOPE:         'Out of scope',
//   URGENT:               'Urgent',
//   REPEATED_ISSUE:       'Repeated issue',
//   UNRESOLVED_LONG:      'Unresolved for too long',
//   NEEDS_HIGHER_AUTH:    'Needs higher authority',
//   OTHER:                'Other',
// }

// const STATUS_MAP = {
//   OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200' },
//   IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
//   RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
//   ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200' },
// }

// const SOURCE_LABELS = {
//   5:  'Warden → Admin',
//   6:  'Hostel Manager → Admin',
//   9:  'Librarian → Admin',
//   10: 'Transport Manager → Admin',
// }

// export default function EscalationsPage() {
//   const [escalations, setEscalations] = useState([])
//   const [loading, setLoading]         = useState(true)
//   const [error, setError]             = useState('')
//   const [resolvingId, setResolvingId] = useState(null)

//   useEffect(() => { fetchAll() }, [])

//   const fetchAll = async () => {
//     try {
//       setLoading(true)
//       const [chainData, hodData] = await Promise.all([
//         api.get('/admin/chain-escalations'),  // Warden/HM/Librarian/Transport Mgr → Admin
//         api.get('/admin/hod-escalations'),    // HOD → Admin
//       ])
//       const chain = (chainData.escalations || []).map(e => ({ ...e, source: 'chain' }))
//       const hod   = (hodData.escalations   || []).map(e => ({ ...e, source: 'hod' }))
//       const combined = [...chain, ...hod].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//       setEscalations(combined)
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resolve = async (e) => {
//     setResolvingId(`${e.source}-${e.id}`)
//     try {
//       await api.put(`/admin/complaints/${e.complaint_id}/resolve`)
//       setEscalations(prev => prev.map(x =>
//         x.id === e.id && x.source === e.source
//           ? { ...x, complaint_status: 'RESOLVED' }
//           : x
//       ))
//     } catch (err) {
//       alert(err.message)
//     } finally {
//       setResolvingId(null)
//     }
//   }

//   if (loading) return (
//     <div className="flex items-center justify-center py-24">
//       <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
//     </div>
//   )

//   if (error) return (
//     <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
//       <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
//     </div>
//   )

//   const pending  = escalations.filter(e => e.complaint_status !== 'RESOLVED')
//   const resolved = escalations.filter(e => e.complaint_status === 'RESOLVED')

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <p className="text-slate-500 text-sm">
//           {escalations.length} escalation{escalations.length !== 1 ? 's' : ''} to Admin
//           {pending.length > 0 && <span className="ml-2 text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{pending.length} pending</span>}
//         </p>
//         <button onClick={fetchAll}
//           className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
//           Refresh
//         </button>
//       </div>

//       {escalations.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-slate-400">
//           <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
//           <p className="font-display font-semibold text-lg text-slate-500">No escalations to Admin</p>
//           <p className="text-sm mt-1">Complaints escalated to you will appear here</p>
//         </div>
//       ) : (
//         <div className="space-y-8">
//           {/* Pending first */}
//           {pending.length > 0 && (
//             <div>
//               <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                 <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
//                 Pending Action ({pending.length})
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {pending.map(e => <EscalationCard key={`${e.source}-${e.id}`} e={e} onResolve={resolve} resolvingId={resolvingId} />)}
//               </div>
//             </div>
//           )}

//           {/* Resolved */}
//           {resolved.length > 0 && (
//             <div>
//               <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
//                 <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
//                 Resolved ({resolved.length})
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {resolved.map(e => <EscalationCard key={`${e.source}-${e.id}`} e={e} onResolve={resolve} resolvingId={resolvingId} />)}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// function EscalationCard({ e, onResolve, resolvingId }) {
//   const status      = STATUS_MAP[e.complaint_status] || STATUS_MAP['ESCALATED']
//   const isResolved  = e.complaint_status === 'RESOLVED'
//   const isResolving = resolvingId === `${e.source}-${e.id}`

//   const sourceLabel = e.source === 'hod'
//     ? 'HOD → Admin'
//     : SOURCE_LABELS[e.from_role] || `${e.escalated_by_role?.replace(/_/g, ' ')} → Admin`

//   return (
//     <div className="bg-white rounded-2xl border border-rose-100 flex flex-col overflow-hidden shadow-sm">
//       <div className={`h-1 ${isResolved ? 'bg-emerald-400' : 'bg-rose-500'}`} />
//       <div className="p-5 flex flex-col gap-3 flex-1">
//         {/* Title + status */}
//         <div className="flex items-start justify-between gap-3">
//           <h3 className="font-display font-semibold text-slate-800 text-sm line-clamp-2">{e.complaint_title}</h3>
//           <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
//             {status.label}
//           </span>
//         </div>

//         {/* Source badge */}
//         <span className="self-start text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full">
//           {sourceLabel}
//         </span>

//         {/* Reason + message */}
//         <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1.5">
//           <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
//             <AlertTriangle className="w-3.5 h-3.5" />
//             {REASON_LABELS[e.reason] || e.reason?.replace(/_/g, ' ')}
//           </p>
//           <p className="text-xs text-rose-800 italic line-clamp-2">"{e.message}"</p>
//         </div>

//         {/* Meta */}
//         <div className="space-y-1 text-xs text-slate-500">
//           <p>Escalated by: <span className="font-medium text-slate-700">{e.escalated_by_name}</span></p>
//           {e.department && <p>Dept: <span className="font-medium text-slate-700">{e.department}</span></p>}
//         </div>

//         <div className="flex items-center gap-2 text-xs text-slate-400">
//           <Tag className="w-3 h-3" />{e.category}
//           <Calendar className="w-3 h-3 ml-2" />
//           {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//         </div>
//       </div>

//       <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
//         {isResolved ? (
//           <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
//             <CheckCircle2 className="w-4 h-4" /> Resolved by Admin
//           </div>
//         ) : (
//           <button onClick={() => onResolve(e)} disabled={isResolving}
//             className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition disabled:opacity-50 w-full justify-center">
//             {isResolving
//               ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Resolving...</>
//               : <><CheckCircle2 className="w-3.5 h-3.5" />Mark as Resolved</>}
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }







import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import {
  AlertCircle, AlertTriangle, Tag, Calendar,
  Loader2, CheckCircle2, X, User, ArrowRight, ThumbsUp, Clock
} from 'lucide-react'

const REASON_LABELS = {
  STAFF_NOT_RESPONDING: 'Staff not responding',
  OUT_OF_SCOPE:         'Out of scope',
  URGENT:               'Urgent',
  REPEATED_ISSUE:       'Repeated issue',
  UNRESOLVED_LONG:      'Unresolved for too long',
  NEEDS_HIGHER_AUTH:    'Needs higher authority',
  OTHER:                'Other',
}

const STATUS_MAP = {
  OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400' },
  ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
}

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
  Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
  Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
}

const SOURCE_LABELS = {
  5:  'Warden → Admin',
  6:  'Hostel Manager → Admin',
  9:  'Librarian → Admin',
  10: 'Transport Manager → Admin',
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

// ── Detail Modal ──────────────────────────────────────────────
function EscalationModal({ e, onClose, onResolve, resolving }) {
  const status      = STATUS_MAP[e.complaint_status] || STATUS_MAP['ESCALATED']
  const isResolved  = e.complaint_status === 'RESOLVED'
  const sourceLabel = e.source === 'hod'
    ? 'HOD → Admin'
    : SOURCE_LABELS[e.from_role] || `${e.escalated_by_role?.replace(/_/g, ' ')} → Admin`

  useEffect(() => {
    const h = (ev) => { if (ev.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className={`h-1.5 w-full ${isResolved ? 'bg-emerald-400' : 'bg-rose-500'}`} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">{e.complaint_title}</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">#{e.complaint_id?.toString().padStart(4, '0')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>{status.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Complaint Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {e.complaint_description }
            </p>
          </div>

          {/* Escalation details */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Escalation Details
            </p>
            <p className="text-xs text-rose-600">
              <span className="font-semibold">Source:</span> {sourceLabel}
            </p>
            <p className="text-xs text-rose-600">
              <span className="font-semibold">Reason:</span> {REASON_LABELS[e.reason] || e.reason?.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-rose-800 italic">"{e.message}"</p>
            <p className="text-xs text-rose-600">
              <span className="font-semibold">Escalated by:</span> {e.escalated_by_name}
            </p>
            <p className="text-xs text-rose-500">
              <span className="font-semibold">Escalated:</span> {timeAgo(e.created_at)}
            </p>
          </div>

          {/* Complaint details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] || 'bg-slate-100 text-slate-600'}`}>
                <Tag className="w-3 h-3" />{e.category}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Upvotes</p>
              <p className="text-sm font-medium text-slate-700">👍 {e.upvote_count || 0}</p>
            </div>

            {e.student_name && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Submitted by</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />{e.student_name}
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Submitted on</p>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(e.complaint_created_at || e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {e.department && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</p>
                <p className="text-sm font-medium text-slate-700">{e.department}</p>
              </div>
            )}

            {e.assigned_to_name && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Assigned to</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />{e.assigned_to_name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
            Close
          </button>
          {!isResolved && (
            <button onClick={() => onResolve(e)} disabled={resolving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition">
              {resolving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Resolving...</>
                : <><CheckCircle2 className="w-4 h-4" />Mark as Resolved</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Compact Card ──────────────────────────────────────────────
function EscalationCard({ e, onOpen }) {
  const status      = STATUS_MAP[e.complaint_status] || STATUS_MAP['ESCALATED']
  const isResolved  = e.complaint_status === 'RESOLVED'
  const sourceLabel = e.source === 'hod'
    ? 'HOD → Admin'
    : SOURCE_LABELS[e.from_role] || `${e.escalated_by_role?.replace(/_/g, ' ')} → Admin`

  return (
    <div onClick={() => onOpen(e)}
      className="bg-white rounded-2xl border border-rose-100 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className={`h-1 ${isResolved ? 'bg-emerald-400' : 'bg-rose-500'}`} />
      <div className="p-4 flex flex-col gap-2.5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition">
            {e.complaint_title}
          </h3>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Category + date */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[e.category] || 'bg-slate-100 text-slate-600'}`}>
            <Tag className="w-3 h-3" />{e.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Source badge */}
        <span className="self-start text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full">
          {sourceLabel}
        </span>

        <p className="text-xs text-slate-400 italic">Click to view details & resolve</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function EscalationsPage() {
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [selected, setSelected]       = useState(null)
  const [resolving, setResolving]     = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [chainData, hodData] = await Promise.all([
        api.get('/admin/chain-escalations'),
        api.get('/admin/hod-escalations'),
      ])
      const chain = (chainData.escalations || []).map(e => ({ ...e, source: 'chain' }))
      const hod   = (hodData.escalations   || []).map(e => ({ ...e, source: 'hod' }))
      const combined = [...chain, ...hod].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setEscalations(combined)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const resolve = async (e) => {
    setResolving(true)
    try {
      await api.put(`/admin/complaints/${e.complaint_id}/resolve`)
      setEscalations(prev => prev.map(x =>
        x.id === e.id && x.source === e.source
          ? { ...x, complaint_status: 'RESOLVED' }
          : x
      ))
      // Update selected so modal reflects resolved state
      setSelected(prev => prev ? { ...prev, complaint_status: 'RESOLVED' } : null)
    } catch (err) { alert(err.message) }
    finally { setResolving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
  if (error)   return <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700"><AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p></div>

  const pending  = escalations.filter(e => e.complaint_status !== 'RESOLVED')
  const resolved = escalations.filter(e => e.complaint_status === 'RESOLVED')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          {escalations.length} escalation{escalations.length !== 1 ? 's' : ''} to Admin
          {pending.length > 0 && (
            <span className="ml-2 text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          )}
        </p>
        <button onClick={fetchAll}
          className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {escalations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No escalations to Admin</p>
          <p className="text-sm mt-1">Complaints escalated to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                Pending Action ({pending.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pending.map(e => <EscalationCard key={`${e.source}-${e.id}`} e={e} onOpen={setSelected} />)}
              </div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Resolved ({resolved.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {resolved.map(e => <EscalationCard key={`${e.source}-${e.id}`} e={e} onOpen={setSelected} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <EscalationModal
          e={selected}
          onClose={() => setSelected(null)}
          onResolve={resolve}
          resolving={resolving}
        />
      )}
    </div>
  )
}