// // import { useState, useEffect } from 'react'
// // import { api } from '../../utils/api'
// // import { AlertCircle, Loader2 } from 'lucide-react'

// // export default function TrendsPage() {
// //   const [trends, setTrends] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState('')

// //   useEffect(() => { fetchTrends() }, [])

// //   const fetchTrends = async () => {
// //     try {
// //       setLoading(true)
// //       const data = await api.get('/admin/trends')
// //       setTrends(data.trends || [])
// //     } catch (err) {
// //       setError(err.message)
// //     } finally {
// //       setLoading(false)
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

// //   const maxVal = Math.max(...trends.map(t => Math.max(t.submitted, t.resolved)), 1)
// //   const totalSubmitted = trends.reduce((a, t) => a + t.submitted, 0)
// //   const totalResolved = trends.reduce((a, t) => a + t.resolved, 0)

// //   // Show every 5th label to avoid crowding
// //   const formatDate = (d) => {
// //     const date = new Date(d)
// //     return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex items-center justify-between">
// //         <p className="text-slate-500 text-sm">Last 30 days complaint activity</p>
// //         <button onClick={fetchTrends}
// //           className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
// //           Refresh
// //         </button>
// //       </div>

// //       {/* Summary pills */}
// //       <div className="flex gap-4 flex-wrap">
// //         <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
// //           <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
// //           <span className="text-sm text-slate-600">Submitted: <strong className="text-slate-800">{totalSubmitted}</strong></span>
// //         </div>
// //         <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
// //           <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
// //           <span className="text-sm text-slate-600">Resolved: <strong className="text-slate-800">{totalResolved}</strong></span>
// //         </div>
// //         <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
// //           <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
// //           <span className="text-sm text-slate-600">Backlog: <strong className="text-slate-800">{totalSubmitted - totalResolved}</strong></span>
// //         </div>
// //       </div>

// //       {/* Chart */}
// //       <div className="bg-white rounded-2xl border border-slate-100 p-6">
// //         <div className="flex items-end gap-1 h-48">
// //           {trends.map((t, i) => (
// //             <div key={t.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
// //               {/* Tooltip */}
// //               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
// //                 <p className="font-semibold">{formatDate(t.date)}</p>
// //                 <p className="text-blue-300">Submitted: {t.submitted}</p>
// //                 <p className="text-emerald-300">Resolved: {t.resolved}</p>
// //               </div>
// //               <div className="w-full flex items-end gap-0.5 h-40">
// //                 {/* Submitted bar */}
// //                 <div
// //                   className="flex-1 bg-blue-400 hover:bg-blue-500 rounded-t transition-all duration-200"
// //                   style={{ height: `${(t.submitted / maxVal) * 100}%`, minHeight: t.submitted > 0 ? '2px' : '0' }}
// //                 />
// //                 {/* Resolved bar */}
// //                 <div
// //                   className="flex-1 bg-emerald-400 hover:bg-emerald-500 rounded-t transition-all duration-200"
// //                   style={{ height: `${(t.resolved / maxVal) * 100}%`, minHeight: t.resolved > 0 ? '2px' : '0' }}
// //                 />
// //               </div>
// //               {/* X-axis label every 5 days */}
// //               {i % 5 === 0 && (
// //                 <p className="text-xs text-slate-400 mt-1 rotate-0 whitespace-nowrap" style={{ fontSize: '10px' }}>
// //                   {formatDate(t.date)}
// //                 </p>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //         <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
// //           <div className="flex items-center gap-2">
// //             <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
// //             <span className="text-xs text-slate-500">Submitted</span>
// //           </div>
// //           <div className="flex items-center gap-2">
// //             <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
// //             <span className="text-xs text-slate-500">Resolved</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Daily table - last 7 days */}
// //       <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
// //         <div className="px-6 py-4 border-b border-slate-50">
// //           <h3 className="font-display font-semibold text-slate-700 text-sm">Last 7 Days Detail</h3>
// //         </div>
// //         <table className="w-full text-sm">
// //           <thead>
// //             <tr className="bg-slate-50 text-left">
// //               <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
// //               <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
// //               <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</th>
// //               <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y divide-slate-50">
// //             {trends.slice(-7).reverse().map(t => (
// //               <tr key={t.date} className="hover:bg-slate-50 transition">
// //                 <td className="px-6 py-3 font-medium text-slate-700">{formatDate(t.date)}</td>
// //                 <td className="px-6 py-3 text-blue-600 font-semibold">{t.submitted}</td>
// //                 <td className="px-6 py-3 text-emerald-600 font-semibold">{t.resolved}</td>
// //                 <td className={`px-6 py-3 font-semibold ${t.submitted - t.resolved > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
// //                   {t.submitted - t.resolved > 0 ? '+' : ''}{t.submitted - t.resolved}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   )
// // }




// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { AlertCircle, Loader2 } from 'lucide-react'

// const BAR_COLORS = {
//   submitted: { bar: 'bg-blue-400 hover:bg-blue-500',   dot: 'bg-blue-500',   text: 'text-blue-600' },
//   resolved:  { bar: 'bg-emerald-400 hover:bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' },
//   pending:   { bar: 'bg-amber-400 hover:bg-amber-500',  dot: 'bg-amber-400',  text: 'text-amber-600' },
// }

// export default function TrendsPage() {
//   const [trends, setTrends] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError]     = useState('')
//   // Which metrics to show on chart
//   const [show, setShow] = useState({ submitted: true, resolved: true, pending: true })

//   useEffect(() => { fetchTrends() }, [])

//   const fetchTrends = async () => {
//     try {
//       setLoading(true)
//       const data = await api.get('/admin/trends')
//       setTrends(data.trends || [])
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
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

//   const visibleKeys = Object.keys(show).filter(k => show[k])
//   const maxVal = Math.max(...trends.map(t => Math.max(
//     show.submitted ? t.submitted : 0,
//     show.resolved  ? t.resolved  : 0,
//     show.pending   ? t.pending   : 0,
//   )), 1)

//   const totalSubmitted = trends.reduce((a, t) => a + t.submitted, 0)
//   const totalResolved  = trends.reduce((a, t) => a + t.resolved, 0)
//   const latestPending  = trends.length > 0 ? trends[trends.length - 1].pending : 0

//   const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

//   const METRICS = [
//     { key: 'submitted', label: 'Submitted', value: totalSubmitted, desc: 'last 30 days' },
//     { key: 'resolved',  label: 'Resolved',  value: totalResolved,  desc: 'last 30 days' },
//     { key: 'pending',   label: 'Pending now', value: latestPending, desc: 'currently unresolved' },
//   ]

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <p className="text-slate-500 text-sm">Last 30 days complaint activity</p>
//         <button onClick={fetchTrends}
//           className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
//           Refresh
//         </button>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-3 gap-4">
//         {METRICS.map(({ key, label, value, desc }) => (
//           <button key={key} onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
//             className={`rounded-2xl border p-4 text-left transition ${
//               show[key] ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
//             }`}>
//             <div className="flex items-center gap-2 mb-2">
//               <span className={`w-3 h-3 rounded-full ${BAR_COLORS[key].dot}`} />
//               <span className="text-xs font-semibold text-slate-500">{label}</span>
//             </div>
//             <p className={`text-3xl font-display font-bold ${BAR_COLORS[key].text}`}>{value}</p>
//             <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
//             <p className="text-xs text-slate-400 mt-1">{show[key] ? 'Click to hide' : 'Click to show'}</p>
//           </button>
//         ))}
//       </div>

//       {/* Bar chart */}
//       <div className="bg-white rounded-2xl border border-slate-100 p-6">
//         <div className="flex items-end gap-0.5 h-48">
//           {trends.map((t, i) => (
//             <div key={t.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
//               {/* Tooltip */}
//               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
//                 <p className="font-semibold mb-1">{formatDate(t.date)}</p>
//                 <p className="text-blue-300">Submitted: {t.submitted}</p>
//                 <p className="text-emerald-300">Resolved: {t.resolved}</p>
//                 <p className="text-amber-300">Pending: {t.pending}</p>
//               </div>

//               {/* Bars */}
//               <div className="w-full flex items-end gap-px h-40">
//                 {show.submitted && (
//                   <div className={`flex-1 ${BAR_COLORS.submitted.bar} rounded-t transition-all duration-200`}
//                     style={{ height: `${(t.submitted / maxVal) * 100}%`, minHeight: t.submitted > 0 ? '2px' : '0' }} />
//                 )}
//                 {show.resolved && (
//                   <div className={`flex-1 ${BAR_COLORS.resolved.bar} rounded-t transition-all duration-200`}
//                     style={{ height: `${(t.resolved / maxVal) * 100}%`, minHeight: t.resolved > 0 ? '2px' : '0' }} />
//                 )}
//                 {show.pending && (
//                   <div className={`flex-1 ${BAR_COLORS.pending.bar} rounded-t transition-all duration-200`}
//                     style={{ height: `${(t.pending / maxVal) * 100}%`, minHeight: t.pending > 0 ? '2px' : '0' }} />
//                 )}
//               </div>

//               {/* X-axis label every 5 days */}
//               {i % 5 === 0 && (
//                 <p className="text-slate-400 mt-1 whitespace-nowrap" style={{ fontSize: '10px' }}>
//                   {formatDate(t.date)}
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Legend */}
//         <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 flex-wrap">
//           {METRICS.map(({ key, label }) => (
//             <div key={key} className={`flex items-center gap-2 transition ${show[key] ? '' : 'opacity-40'}`}>
//               <span className={`w-3 h-3 rounded-sm ${BAR_COLORS[key].dot}`} />
//               <span className="text-xs text-slate-500">{label}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Last 7 days table */}
//       <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
//         <div className="px-6 py-4 border-b border-slate-50">
//           <h3 className="font-display font-semibold text-slate-700 text-sm">Last 7 Days Detail</h3>
//         </div>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-slate-50 text-left">
//               {['Date', 'Submitted', 'Resolved', 'Pending'].map(h => (
//                 <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {trends.slice(-7).reverse().map(t => (
//               <tr key={t.date} className="hover:bg-slate-50 transition">
//                 <td className="px-6 py-3 font-medium text-slate-700">{formatDate(t.date)}</td>
//                 <td className="px-6 py-3 text-blue-600 font-semibold">{t.submitted}</td>
//                 <td className="px-6 py-3 text-emerald-600 font-semibold">{t.resolved}</td>
//                 <td className={`px-6 py-3 font-semibold ${t.pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
//                   {t.pending}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }






import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { AlertCircle, Loader2 } from 'lucide-react'

const BAR_COLORS = {
  submitted: { bar: 'bg-blue-400 hover:bg-blue-500',   dot: 'bg-blue-500',   text: 'text-blue-600' },
  resolved:  { bar: 'bg-emerald-400 hover:bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  pending:   { bar: 'bg-amber-400 hover:bg-amber-500',  dot: 'bg-amber-400',  text: 'text-amber-600' },
}

export default function TrendsPage() {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  // Which metrics to show on chart
  const [show, setShow] = useState({ submitted: true, resolved: true, pending: true })

  useEffect(() => { fetchTrends() }, [])

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const data = await api.get('/admin/trends')
      setTrends(data.trends || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  const visibleKeys = Object.keys(show).filter(k => show[k])
  const maxVal = Math.max(...trends.map(t => Math.max(
    show.submitted ? t.submitted : 0,
    show.resolved  ? t.resolved  : 0,
    show.pending   ? t.pending   : 0,
  )), 1)

  const totalSubmitted = trends.reduce((a, t) => a + t.submitted, 0)
  const totalResolved  = trends.reduce((a, t) => a + t.resolved, 0)
  const latestPending  = trends.length > 0 ? trends[trends.length - 1].pending : 0

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const METRICS = [
    { key: 'submitted', label: 'Submitted', value: totalSubmitted, desc: 'last 30 days' },
    { key: 'resolved',  label: 'Resolved',  value: totalResolved,  desc: 'last 30 days' },
    { key: 'pending',   label: 'Pending now', value: latestPending, desc: 'currently unresolved' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">Last 30 days complaint activity</p>
        <button onClick={fetchTrends}
          className="text-sm text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {METRICS.map(({ key, label, value, desc }) => (
          <button key={key} onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
            className={`rounded-2xl border p-4 text-left transition ${
              show[key] ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${BAR_COLORS[key].dot}`} />
              <span className="text-xs font-semibold text-slate-500">{label}</span>
            </div>
            <p className={`text-3xl font-display font-bold ${BAR_COLORS[key].text}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            <p className="text-xs text-slate-400 mt-1">{show[key] ? 'Click to hide' : 'Click to show'}</p>
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        {/* Bars — fixed height, all start from same baseline */}
        <div className="flex items-end gap-0.5 h-40">
          {trends.map((t, i) => (
            <div key={t.date} className="flex-1 flex items-end gap-px h-full group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                <p className="font-semibold mb-1">{formatDate(t.date)}</p>
                <p className="text-blue-300">Submitted: {t.submitted}</p>
                <p className="text-emerald-300">Resolved: {t.resolved}</p>
                <p className="text-amber-300">Pending: {t.pending}</p>
              </div>
              {show.submitted && (
                <div className={`flex-1 ${BAR_COLORS.submitted.bar} rounded-t transition-all duration-200`}
                  style={{ height: `${(t.submitted / maxVal) * 100}%`, minHeight: t.submitted > 0 ? '2px' : '0' }} />
              )}
              {show.resolved && (
                <div className={`flex-1 ${BAR_COLORS.resolved.bar} rounded-t transition-all duration-200`}
                  style={{ height: `${(t.resolved / maxVal) * 100}%`, minHeight: t.resolved > 0 ? '2px' : '0' }} />
              )}
              {show.pending && (
                <div className={`flex-1 ${BAR_COLORS.pending.bar} rounded-t transition-all duration-200`}
                  style={{ height: `${(t.pending / maxVal) * 100}%`, minHeight: t.pending > 0 ? '2px' : '0' }} />
              )}
            </div>
          ))}
        </div>

        {/* X-axis labels — completely separate row, same width as bars above */}
        <div className="flex gap-0.5 mt-1">
          {trends.map((t, i) => (
            <div key={t.date} className="flex-1 flex justify-center">
              {i % 5 === 0 && (
                <p className="text-slate-400 whitespace-nowrap" style={{ fontSize: '10px' }}>
                  {formatDate(t.date)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 flex-wrap">
          {METRICS.map(({ key, label }) => (
            <div key={key} className={`flex items-center gap-2 transition ${show[key] ? '' : 'opacity-40'}`}>
              <span className={`w-3 h-3 rounded-sm ${BAR_COLORS[key].dot}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last 7 days table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-display font-semibold text-slate-700 text-sm">Last 7 Days Detail</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Date', 'Submitted', 'Resolved', 'Pending'].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {trends.slice(-7).reverse().map(t => (
              <tr key={t.date} className="hover:bg-slate-50 transition">
                <td className="px-6 py-3 font-medium text-slate-700">{formatDate(t.date)}</td>
                <td className="px-6 py-3 text-blue-600 font-semibold">{t.submitted}</td>
                <td className="px-6 py-3 text-emerald-600 font-semibold">{t.resolved}</td>
                <td className={`px-6 py-3 font-semibold ${t.pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {t.pending}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}