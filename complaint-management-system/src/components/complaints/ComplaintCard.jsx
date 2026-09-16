// import { useState } from 'react'
// import { ThumbsUp, Calendar, Tag, User } from 'lucide-react'
// import { api } from '../../utils/api'

// const STATUS_MAP = {
//   OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',        bar: 'bg-amber-400' },
//   IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',           bar: 'bg-blue-500' },
//   PROGRESS:    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',           bar: 'bg-blue-500' },
//   RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',  bar: 'bg-emerald-500' },
//   ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',           bar: 'bg-rose-500' },
//   open:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',        bar: 'bg-amber-400' },
//   progress:    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',           bar: 'bg-blue-500' },
//   resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',  bar: 'bg-emerald-500' },
//   escalated:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',           bar: 'bg-rose-500' },
// }

// const CATEGORY_COLORS = {
//   Hostel:       'bg-orange-50 text-orange-700',
//   Transport:    'bg-indigo-50 text-indigo-700',
//   Library:      'bg-teal-50 text-teal-700',
//   Electrical:   'bg-yellow-50 text-yellow-700',
//   Plumbing:     'bg-sky-50 text-sky-700',
//   Carpentry:    'bg-amber-50 text-amber-700',
//   Civil:        'bg-violet-50 text-violet-700',
//   'IT Support': 'bg-cyan-50 text-cyan-700',
// }

// export default function ComplaintCard({ complaint, currentUserId }) {
//   const [upvotes, setUpvotes] = useState(Number(complaint.upvote_count) || 0)
//   const [voted, setVoted] = useState(false)
//   const [voteLoading, setVoteLoading] = useState(false)

//   const toggleVote = async () => {
//     if (voteLoading) return
//     setVoteLoading(true)
//     try {
//       // Wait for server response FIRST, then update UI
//       const data = await api.post(`/complaints/${complaint.id}/toggle-upvote`, {})
//       // Update state based on what server actually did
//       setVoted(data.upvoted)
//       setUpvotes(v => data.upvoted ? v + 1 : v - 1)
//     } catch (err) {
//       console.error('Upvote failed:', err.message)
//     } finally {
//       setVoteLoading(false)
//     }
//   }

//   const statusKey = complaint.status || 'open'
//   const { label, color, bar } = STATUS_MAP[statusKey] || STATUS_MAP['open']
//   const categoryName = complaint.category || 'General'
//   const isOwn = complaint.student_id === currentUserId || complaint.userId === currentUserId

//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden animate-slide-up group">
//       <div className={`h-1 w-full ${bar}`} />

//       <div className="p-5 flex flex-col gap-3 flex-1">
//         <div className="flex items-start justify-between gap-3">
//           <h3 className="font-display font-semibold text-slate-800 text-base leading-snug group-hover:text-primary-700 transition line-clamp-2">
//             {complaint.title}
//           </h3>
//           <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
//             {label}
//           </span>
//         </div>

//         <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
//           {complaint.description}
//         </p>

//         <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
//           <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[categoryName] || 'bg-slate-100 text-slate-600'}`}>
//             <Tag className="w-3 h-3" />
//             {categoryName}
//           </span>
//           {isOwn && (
//             <span className="flex items-center gap-1.5 text-primary-600 font-medium">
//               <User className="w-3 h-3" /> You
//             </span>
//           )}
//           <span className="flex items-center gap-1.5">
//             <Calendar className="w-3 h-3" />
//             {new Date(complaint.created_at || complaint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//           </span>
//         </div>
//       </div>

//       <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
//         <button
//           onClick={toggleVote}
//           disabled={voteLoading}
//           className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 select-none ${
//             voteLoading
//               ? 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
//               : voted
//               ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
//               : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
//           }`}>
//           {voteLoading
//             ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
//             : <ThumbsUp className={`w-4 h-4 transition-transform duration-150 ${voted ? 'scale-110' : ''}`} />
//           }
//           <span>{upvotes}</span>
//           <span className="text-xs opacity-70">
//             {voteLoading ? '...' : voted ? 'Voted' : 'Upvote'}
//           </span>
//         </button>
//         <span className="text-xs text-slate-400 font-mono">#{complaint.id?.toString().padStart(4, '0')}</span>
//       </div>
//     </div>
//   )
//}

import { useState } from 'react'
import { ThumbsUp, Calendar, Tag, User } from 'lucide-react'
import { api } from '../../utils/api'
import ComplaintDetailModal from './ComplaintDetailModal'

const STATUS_MAP = {
  OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  PROGRESS:    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  ESCALATED:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
  open:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  progress:    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  escalated:   { label: 'Escalated',   color: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500' },
}

const CATEGORY_COLORS = {
  Hostel:       'bg-orange-50 text-orange-700',
  Transport:    'bg-indigo-50 text-indigo-700',
  Library:      'bg-teal-50 text-teal-700',
  Electrical:   'bg-yellow-50 text-yellow-700',
  Plumbing:     'bg-sky-50 text-sky-700',
  Carpentry:    'bg-amber-50 text-amber-700',
  Civil:        'bg-violet-50 text-violet-700',
  'IT Support': 'bg-cyan-50 text-cyan-700',
}

export default function ComplaintCard({ complaint, currentUserId }) {
  const [upvotes, setUpvotes]       = useState(Number(complaint.upvote_count) || 0)
  const [voted, setVoted]           = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const [showModal, setShowModal]   = useState(false)

  const toggleVote = async (e) => {
    e.stopPropagation()
    if (voteLoading) return
    setVoteLoading(true)
    try {
      const data = await api.post(`/complaints/${complaint.id}/toggle-upvote`, {})
      setVoted(data.upvoted)
      setUpvotes(v => data.upvoted ? v + 1 : v - 1)
    } catch (err) {
      console.error('Upvote failed:', err.message)
    } finally {
      setVoteLoading(false)
    }
  }

  const statusKey    = complaint.status || 'open'
  const { label, color, bar } = STATUS_MAP[statusKey] || STATUS_MAP['open']
  const categoryName = complaint.category || 'General'
  const isOwn        = complaint.student_id === currentUserId || complaint.userId === currentUserId

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group">
        <div className={`h-1 w-full ${bar}`} />

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-slate-800 text-base leading-snug group-hover:text-primary-700 transition line-clamp-2">
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
            {isOwn && (
              <span className="flex items-center gap-1.5 text-primary-600 font-medium">
                <User className="w-3 h-3" /> You
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(complaint.created_at || complaint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic">Click to view details</p>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={toggleVote}
            disabled={voteLoading}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 select-none ${
              voteLoading
                ? 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
                : voted
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
            }`}>
            {voteLoading
              ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              : <ThumbsUp className={`w-4 h-4 transition-transform duration-150 ${voted ? 'scale-110' : ''}`} />}
            <span>{upvotes}</span>
            <span className="text-xs opacity-70">{voteLoading ? '...' : voted ? 'Voted' : 'Upvote'}</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">#{complaint.id?.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {showModal && (
        <ComplaintDetailModal
          complaint={{ ...complaint, upvote_count: upvotes }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}