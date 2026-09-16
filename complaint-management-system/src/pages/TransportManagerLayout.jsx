// import { ClipboardList, Archive, AlertTriangle } from 'lucide-react'
// import ManagerLayout from './ManagerLayout'

// const navItems = [
//   { to: '/transport-manager/dashboard/complaints', icon: ClipboardList, label: 'Transport Complaints' },
//   { to: '/transport-manager/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
//   { to: '/transport-manager/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
// ]

// const pageTitles = {
//   '/transport-manager/dashboard/complaints': 'Transport Complaints',
//   '/transport-manager/dashboard/resolved':   'Resolved Complaints',
//   '/transport-manager/dashboard/escalated':  'Escalated to Admin',
// }

// export default function TransportManagerLayout() {
//   return <ManagerLayout navItems={navItems} pageTitles={pageTitles} portalLabel="Transport Manager" />
// }

// import { Truck, Archive, AlertTriangle } from 'lucide-react'
// import ManagerLayout from './ManagerLayout'

// const navItems = [
//   { to: '/transport-manager/dashboard/complaints', icon: Truck, label: 'All Complaints' },
//   { to: '/transport-manager/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
//   { to: '/transport-manager/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
// ]

// const pageTitles = {
//   '/transport-manager/dashboard/complaints': 'Transport Complaints',
//   '/transport-manager/dashboard/resolved':   'Resolved Complaints',
//   '/transport-manager/dashboard/escalated':  'Escalated to Admin',
// }

// export default function TransportManagerLayout() {
//   return (
//     <ManagerLayout 
//       navItems={navItems} 
//       pageTitles={pageTitles} 
//       portalLabel="Transport Manager"
//       endpoints={{
//         complaints: '/transport-manager/complaints',
//         resolved: '/transport-manager/resolved-complaints',
//         escalated: '/transport-manager/escalated-complaints',
//       }}
//       escalateLabel="Escalate to Admin"
//     />
//   )
// }


import { ClipboardList, Archive, AlertTriangle } from 'lucide-react'
import ManagerLayout from './ManagerLayout'

const navItems = [
  { to: '/transport-manager/dashboard/complaints', icon: ClipboardList, label: 'All Complaints' },
  { to: '/transport-manager/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
  { to: '/transport-manager/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
]

const pageTitles = {
  '/transport-manager/dashboard/complaints': 'Transport Complaints',
  '/transport-manager/dashboard/resolved':   'Resolved Complaints',
  '/transport-manager/dashboard/escalated':  'Escalated to Admin',
}

export default function TransportManagerLayout() {
  return <ManagerLayout navItems={navItems} pageTitles={pageTitles} portalLabel="Transport Manager" />
}