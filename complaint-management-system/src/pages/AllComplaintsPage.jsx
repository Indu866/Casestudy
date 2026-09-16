// import { useState, useEffect } from 'react'
// import { api } from '../utils/api'
// import ComplaintCard from '../components/complaints/ComplaintCard'
// import { useAuth } from '../context/AuthContext'
// import { LayoutGrid, AlertCircle } from 'lucide-react'
// import { Search, SlidersHorizontal } from 'lucide-react'

// export default function AllComplaintsPage() {
//   const { user } = useAuth()
//   const [complaints, setComplaints] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [search, setSearch] = useState('')
//   const [statusFilter, setStatusFilter] = useState('')

//   useEffect(() => {
//     const fetchComplaints = async () => {
//       try {
//         setLoading(true)
//         const data = await api.get('/complaints')
//         setComplaints(data)
//       } catch (err) {
//         setError(err.message)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchComplaints()
//   }, [])

//   const filtered = complaints.filter(c => {
//     const matchSearch = !search ||
//       c.title.toLowerCase().includes(search.toLowerCase()) ||
//       c.description.toLowerCase().includes(search.toLowerCase())
//     const matchStatus = !statusFilter || c.status.toLowerCase() === statusFilter
//     return matchSearch && matchStatus
//   })

//   const statusCounts = complaints.reduce((acc, c) => {
//     const s = c.status.toLowerCase()
//     acc[s] = (acc[s] || 0) + 1
//     return acc
//   }, {})

//   if (loading) return (
//     <div className="flex items-center justify-center py-24">
//       <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
//     </div>
//   )

//   if (error) return (
//     <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
//       <AlertCircle className="w-5 h-5 shrink-0" />
//       <p className="text-sm">{error}</p>
//     </div>
//   )

//   return (
//     <div>
//       {/* Stats strip */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//         {[
//           { label: 'Total', count: complaints.length, color: 'text-slate-700', bg: 'bg-slate-100' },
//           { label: 'Open', count: statusCounts.open || 0, color: 'text-amber-700', bg: 'bg-amber-50' },
//           { label: 'In Progress', count: statusCounts.progress || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
//           { label: 'Resolved', count: statusCounts.resolved || 0, color: 'text-emerald-700', bg: 'bg-emerald-50' },
//         ].map(s => (
//           <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3.5`}>
//             <p className="text-xs font-medium text-slate-500 mb-0.5">{s.label}</p>
//             <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <div className="relative flex-1">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
//         </div>
//         <div className="relative">
//           <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//           <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
//             className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm appearance-none cursor-pointer min-w-[150px]">
//             <option value="">All Statuses</option>
//             <option value="open">Open</option>
//             <option value="progress">In Progress</option>
//             <option value="resolved">Resolved</option>
//             <option value="escalated">Escalated</option>
//           </select>
//         </div>
//       </div>

//       {filtered.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
//           <LayoutGrid className="w-10 h-10 mb-3 opacity-30" />
//           <p className="font-display font-semibold text-lg">No complaints found</p>
//           <p className="text-sm mt-1">Try adjusting your filters</p>
//         </div>
//       ) : (
//         <>
//           <p className="text-sm text-slate-400 mb-4">Showing {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}</p>
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             {filtered.map((c, i) => (
//               <div key={c.id} style={{ animationDelay: `${i * 60}ms` }}>
//                 <ComplaintCard complaint={c} currentUserId={user?.id} />
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import ComplaintCard from '../components/complaints/ComplaintCard'
import { useAuth } from '../context/AuthContext'
import { LayoutGrid, AlertCircle } from 'lucide-react'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function AllComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        const data = await api.get('/complaints')
        setComplaints(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const filtered = complaints.filter(c => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status.toLowerCase() === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = complaints.reduce((acc, c) => {
    const s = c.status.toLowerCase()
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <p className="text-sm">{error}</p>
    </div>
  )

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',       count: complaints.length,             color: 'text-slate-700',   bg: 'bg-slate-100' },
          { label: 'Open',        count: statusCounts.open || 0,        color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'In Progress', count: statusCounts.in_progress || 0, color: 'text-blue-700',    bg: 'bg-blue-50' },
          { label: 'Escalated',   count: statusCounts.escalated || 0,   color: 'text-rose-700',    bg: 'bg-rose-50' },
          { label: 'Resolved',    count: statusCounts.resolved || 0,    color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3.5`}>
            <p className="text-xs font-medium text-slate-500 mb-0.5">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm appearance-none cursor-pointer min-w-[150px]">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <LayoutGrid className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg">No complaints found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-4">Showing {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <div key={c.id} style={{ animationDelay: `${i * 60}ms` }}>
                <ComplaintCard complaint={c} currentUserId={user?.id} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}