import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import StaffComplaintCard from '../../components/staff/StaffComplaintCard'
import { ClipboardList, AlertCircle } from 'lucide-react'
import SortBar from '../../components/complaints/SortBar'
import { sortComplaints } from '../../utils/sortComplaints'

export default function OpenComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await api.get('/staff/complaints')
      // Show only OPEN complaints on this page
      setComplaints((data.complaints || []).filter(c => c.status === 'OPEN'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // When a complaint is accepted, remove it from this list immediately
  const handleAccept = (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id))
  }

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <SortBar value={sortBy} onChange={setSortBy} count={complaints.length} />
        <button onClick={fetchComplaints}
          className="text-sm text-primary-600 font-medium bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">All clear!</p>
          <p className="text-sm mt-1">No open complaints for your department right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortComplaints(complaints, sortBy).map((c, i) => (
            <div key={c.id} style={{ animationDelay: `${i * 60}ms` }}>
              <StaffComplaintCard complaint={c} onAccept={handleAccept} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}