import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ComplaintCard from '../components/complaints/ComplaintCard'
import { FileText, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        setLoading(true)
        const data = await api.get('/api/my-complaints')
        setComplaints(data.complaints)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMyComplaints()
  }, [])

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
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">
          {complaints.length === 0
            ? "You haven't submitted any complaints yet."
            : `You have ${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} on record.`}
        </p>
        <Link to="/dashboard/submit"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition">
          + New Complaint
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <FileText className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No complaints yet</p>
          <p className="text-sm mt-1">Submit your first complaint to get started</p>
          <Link to="/dashboard/submit"
            className="mt-6 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition">
            Submit a Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {complaints.map((c, i) => (
            <div key={c.id} style={{ animationDelay: `${i * 60}ms` }}>
              <ComplaintCard complaint={c} currentUserId={user?.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}