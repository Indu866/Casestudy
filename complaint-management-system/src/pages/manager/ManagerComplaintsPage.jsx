// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react'
// import ManagerComplaintCard from '../../components/manager/ManagerComplaintCard'

// // endpoint   : e.g. '/hostel-manager/complaints'
// // escalateLabel: e.g. 'Escalate to Admin'
// // resolvedOnly : only show resolved complaints
// export default function ManagerComplaintsPage({ endpoint, escalateLabel, resolvedOnly = false }) {
//   const [complaints, setComplaints] = useState([])
//   const [loading, setLoading]       = useState(true)
//   const [error, setError]           = useState('')

//   useEffect(() => { fetchComplaints() }, [endpoint])

//   const fetchComplaints = async () => {
//     try {
//       setLoading(true)
//       const data = await api.get(endpoint)
//       setComplaints(data.complaints || [])
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleResolved = (id) => {
//     setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c))
//   }

//   const handleEscalated = (id) => {
//     // mark as escalated optimistically — refetch to get chain_escalation_id
//     fetchComplaints()
//   }

//   const displayed = resolvedOnly
//     ? complaints.filter(c => c.status === 'RESOLVED')
//     : complaints.filter(c => c.status !== 'RESOLVED')

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

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <p className="text-slate-500 text-sm">
//           {displayed.length === 0
//             ? 'No complaints.'
//             : `${displayed.length} complaint${displayed.length !== 1 ? 's' : ''}`}
//         </p>
//         <button onClick={fetchComplaints}
//           className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
//           Refresh
//         </button>
//       </div>

//       {displayed.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-slate-400">
//           <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
//           <p className="font-display font-semibold text-lg text-slate-500">
//             {resolvedOnly ? 'No resolved complaints yet' : 'No active complaints'}
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {displayed.map(c => (
//             <ManagerComplaintCard
//               key={c.id}
//               complaint={c}
//               onResolved={handleResolved}
//               onEscalated={handleEscalated}
//               escalateLabel={escalateLabel}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }









import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react'
import ManagerComplaintCard from '../../components/manager/ManagerComplaintCard'
import SortBar from '../../components/complaints/SortBar'
import { sortComplaints } from '../../utils/sortComplaints'

// endpoint   : e.g. '/hostel-manager/complaints'
// escalateLabel: e.g. 'Escalate to Admin'
// resolvedOnly : only show resolved complaints
export default function ManagerComplaintsPage({ endpoint, escalateLabel, resolvedOnly = false }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [sortBy, setSortBy] = useState('');
  
  useEffect(() => { fetchComplaints() }, [endpoint])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await api.get(endpoint)
      setComplaints(data.complaints || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResolved = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c))
  }

  const handleEscalated = (id) => {
    // mark as escalated optimistically — refetch to get chain_escalation_id
    fetchComplaints()
  }

  // Conditionally filter complaints based on sortBy
  const filtered = sortBy === 'priority'
  ? complaints.filter(c => c.status !== 'RESOLVED') // Exclude resolved complaints for priority sorting
  : complaints; // Show all complaints for other sorting options

  // Sort the filtered complaints
  const displayed = sortComplaints(filtered, sortBy);

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-slate-500 text-sm">
          {displayed.length === 0
            ? 'No complaints.'
            : `${displayed.length} complaint${displayed.length !== 1 ? 's' : ''}`}
        </p>
        <SortBar value={sortBy} onChange={setSortBy} count={displayed.length} />
        <button onClick={fetchComplaints}
          className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">
            {resolvedOnly ? 'No resolved complaints yet' : 'No active complaints'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(c => (
            <ManagerComplaintCard
              key={c.id}
              complaint={c}
              onResolved={handleResolved}
              onEscalated={handleEscalated}
              escalateLabel={escalateLabel}
            />
          ))}
        </div>
      )}
    </div>
  )
}