// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { AlertCircle, Loader2, Tag, User, Calendar, ArrowRight, Clock, Search, X } from 'lucide-react'
// import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal'

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

// const CATEGORIES = ['Hostel', 'Transport', 'Library', 'Electrical', 'Plumbing', 'Carpentry', 'Civil', 'IT Support']
// const STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']

// function timeAgo(dateStr) {
//   const diff = Date.now() - new Date(dateStr).getTime()
//   const mins = Math.floor(diff / 60000)
//   if (mins < 1) return 'just now'
//   if (mins < 60) return `${mins}m ago`
//   const hrs = Math.floor(mins / 60)
//   if (hrs < 24) return `${hrs}h ago`
//   return `${Math.floor(hrs / 24)}d ago`
// }

// export default function ActivityPage() {
//   const [activity, setActivity]   = useState([])
//   const [loading, setLoading]     = useState(true)
//   const [error, setError]         = useState('')
//   const [selected, setSelected]   = useState(null)

//   // Filter state
//   const [category, setCategory]   = useState('')
//   const [status, setStatus]       = useState('')
//   const [fromDate, setFromDate]   = useState('')
//   const [toDate, setToDate]       = useState('')
//   const [search, setSearch]       = useState('')

//   useEffect(() => { fetchActivity() }, [])

//   const buildQuery = (cat, stat, from, to) => {
//     const params = new URLSearchParams()
//     if (cat)  params.set('category', cat)
//     if (stat) params.set('status',   stat)
//     if (from) params.set('from',     from)
//     if (to)   params.set('to',       to)
//     const qs = params.toString()
//     return `/admin/activity${qs ? `?${qs}` : ''}`
//   }

//   const fetchActivity = async (cat = category, stat = status, from = fromDate, to = toDate) => {
//     try {
//       setLoading(true)
//       const data = await api.get(buildQuery(cat, stat, from, to))
//       setActivity(data.activity || [])
//     } catch (err) { setError(err.message) }
//     finally { setLoading(false) }
//   }

//   const applyFilters = () => fetchActivity(category, status, fromDate, toDate)

//   const clearFilters = () => {
//     setCategory('')
//     setStatus('')
//     setFromDate('')
//     setToDate('')
//     setSearch('')
//     fetchActivity('', '', '', '')
//   }

//   const hasFilters = category || status || fromDate || toDate || search

//   // Client-side search on title/student name
//   const displayed = search
//     ? activity.filter(c =>
//         c.title.toLowerCase().includes(search.toLowerCase()) ||
//         c.student_name?.toLowerCase().includes(search.toLowerCase())
//       )
//     : activity

//   if (error) return (
//     <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
//       <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
//     </div>
//   )

//   return (
//     <div className="space-y-5">
//       {/* Filter bar */}
//       <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-end">

//         {/* Search */}
//         <div className="relative flex-1 min-w-48">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search title or student..."
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
//         </div>

//         {/* Category */}
//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">Category</label>
//           <select value={category} onChange={e => setCategory(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white min-w-36">
//             <option value="">All Categories</option>
//             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//           </select>
//         </div>

//         {/* Status */}
//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">Status</label>
//           <select value={status} onChange={e => setStatus(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white min-w-36">
//             <option value="">All Statuses</option>
//             {STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>)}
//           </select>
//         </div>

//         {/* From date */}
//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">From</label>
//           <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
//         </div>

//         {/* To date */}
//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">To</label>
//           <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-2">
//           <button onClick={applyFilters}
//             className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition">
//             Apply
//           </button>
//           {hasFilters && (
//             <button onClick={clearFilters}
//               className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
//               <X className="w-3.5 h-3.5" /> Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Results count */}
//       <div className="flex items-center justify-between">
//         <p className="text-slate-500 text-sm">
//           {loading ? 'Loading...' : `${displayed.length} complaint${displayed.length !== 1 ? 's' : ''}${hasFilters ? ' (filtered)' : ''}`}
//         </p>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-24">
//           <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
//         </div>
//       ) : displayed.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-slate-400">
//           <Clock className="w-10 h-10 mb-3 opacity-30" />
//           <p className="font-display font-semibold text-lg text-slate-500">No complaints found</p>
//           {hasFilters && <p className="text-sm mt-1">Try adjusting your filters</p>}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
//           {displayed.map(item => {
//             const s   = STATUS_MAP[item.status] || STATUS_MAP['OPEN']
//             const cat = item.category || 'General'
//             return (
//               <div key={item.id} onClick={() => setSelected(item)}
//                 className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group h-full">
//                 <div className={`h-1 w-full ${s.bar}`} />
//                 <div className="p-5 flex flex-col gap-3 flex-1">
//                   <div className="flex items-start justify-between gap-3">
//                     <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition">
//                       {item.title}
//                     </h3>
//                     <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
//                       {s.label}
//                     </span>
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
//                     <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600'}`}>
//                       <Tag className="w-3 h-3" />{cat}
//                     </span>
//                     <span className="flex items-center gap-1.5">
//                       <User className="w-3 h-3" />{item.student_name}
//                     </span>
//                     <span className="flex items-center gap-1.5">
//                       <Calendar className="w-3 h-3" />
//                       {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                     </span>
//                   </div>
//                   <p className="text-xs text-slate-400 italic">Click to view details</p>
//                 </div>
//                 <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
//                   <span className="text-xs text-slate-400 font-mono">#{item.id?.toString().padStart(4, '0')}</span>
//                   <div className="flex items-center gap-3 text-xs text-slate-400">
//                     {item.assigned_to_name && (
//                       <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" />{item.assigned_to_name}</span>
//                     )}
//                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.updated_at)}</span>
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} />}
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, Loader2, Tag, User, Calendar, ArrowRight, Clock, Search, X } from 'lucide-react'
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal'
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

const CATEGORIES = ['Hostel', 'Transport', 'Library', 'Electrical', 'Plumbing', 'Carpentry', 'Civil', 'IT Support']
const STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ActivityPage() {
  const [activity, setActivity]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)

  // Filter state
  const [category, setCategory]   = useState('')
  const [status, setStatus]       = useState('')
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy] = useState(''); 
  useEffect(() => { fetchActivity() }, [])

  const buildQuery = (cat, stat, from, to) => {
    const params = new URLSearchParams()
    if (cat)  params.set('category', cat)
    if (stat) params.set('status',   stat)
    if (from) params.set('from',     from)
    if (to)   params.set('to',       to)
    const qs = params.toString()
    return `/admin/activity${qs ? `?${qs}` : ''}`
  }

  const fetchActivity = async (cat = category, stat = status, from = fromDate, to = toDate) => {
    try {
      setLoading(true)
      const data = await api.get(buildQuery(cat, stat, from, to))
      setActivity(data.activity || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const applyFilters = () => fetchActivity(category, status, fromDate, toDate)

  const clearFilters = () => {
    setCategory('')
    setStatus('')
    setFromDate('')
    setToDate('')
    setSearch('')
    fetchActivity('', '', '', '')
  }

  const hasFilters = category || status || fromDate || toDate || search

  // Client-side search on title/student name
// Client-side search on title/student name
const searchFiltered = search
  ? activity.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.student_name?.toLowerCase().includes(search.toLowerCase())
    )
  : activity;

// Conditionally filter complaints based on sortBy
const filteredComplaints = sortBy === 'priority'
  ? searchFiltered.filter(c => c.status !== 'RESOLVED') // Exclude resolved complaints for priority sorting
  : searchFiltered; // Show all complaints for other sorting options

// Sort the filtered complaints
const displayed = sortComplaints(filteredComplaints, sortBy);

  if (error) return (
    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
      <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-end">

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search title or student..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white min-w-36">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white min-w-36">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>)}
          </select>
        </div>

        {/* From date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>

        {/* To date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={applyFilters}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition">
            Apply
          </button>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count + sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SortBar value={sortBy} onChange={setSortBy} count={displayed.length} label="complaint" />
        {hasFilters && <span className="text-xs text-slate-400">(filtered)</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Clock className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No complaints found</p>
          {hasFilters && <p className="text-sm mt-1">Try adjusting your filters</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {displayed.map(item => {
            const s   = STATUS_MAP[item.status] || STATUS_MAP['OPEN']
            const cat = item.category || 'General'
            return (
              <div key={item.id} onClick={() => setSelected(item)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group h-full">
                <div className={`h-1 w-full ${s.bar}`} />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition">
                      {item.title}
                    </h3>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600'}`}>
                      <Tag className="w-3 h-3" />{cat}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />{item.student_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic">Click to view details</p>
                </div>
                <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">#{item.id?.toString().padStart(4, '0')}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {item.assigned_to_name && (
                      <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" />{item.assigned_to_name}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.updated_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}