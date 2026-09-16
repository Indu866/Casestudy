import { ClipboardList, Archive, AlertTriangle } from 'lucide-react'
import ManagerLayout from './ManagerLayout'

const navItems = [
  { to: '/hostel-manager/dashboard/complaints', icon: ClipboardList, label: 'All Complaints' },
  { to: '/hostel-manager/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
  { to: '/hostel-manager/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
]

const pageTitles = {
  '/hostel-manager/dashboard/complaints': 'Hostel Complaints',
  '/hostel-manager/dashboard/resolved':   'Resolved Complaints',
  '/hostel-manager/dashboard/escalated':  'Escalated to Admin',
}

export default function HostelManagerLayout() {
  return <ManagerLayout navItems={navItems} pageTitles={pageTitles} portalLabel="Hostel Manager" endpoints={{
    complaints: '/hostel-manager/complaints',
    resolved: '/hostel-manager/resolved-complaints',
    escalated: '/hostel-manager/escalated-complaints',
  }}
  escalateLabel="Escalate to Admin"/>
}


// import { ClipboardList, Archive, AlertTriangle } from 'lucide-react'
// import ManagerLayout from './ManagerLayout'

// const navItems = [
//   { to: '/hostel-manager/dashboard/complaints', icon: ClipboardList, label: 'All Complaints' },
//   { to: '/hostel-manager/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
//   { to: '/hostel-manager/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
// ]

// const pageTitles = {
//   '/hostel-manager/dashboard/complaints': 'Hostel Complaints',
//   '/hostel-manager/dashboard/resolved':   'Resolved Complaints',
//   '/hostel-manager/dashboard/escalated':  'Escalated to Admin',
// }

// // Configuration for different complaint views
// const complaintConfig = {
//   '/hostel-manager/dashboard/complaints': {
//     endpoint: '/hostel-manager/complaints',
//     resolvedEndpoint: '/hostel-manager/resolved-complaints',
//     escalateLabel: 'Escalate to Admin',
//     showTabs: true,
//   },
//   '/hostel-manager/dashboard/resolved': {
//     endpoint: '/hostel-manager/complaints',
//     resolvedEndpoint: '/hostel-manager/resolved-complaints',
//     escalateLabel: 'Escalate to Admin',
//     showTabs: false,
//     activeTab: 'resolved',
//   },
//   '/hostel-manager/dashboard/escalated': {
//     endpoint: '/hostel-manager/complaints',
//     resolvedEndpoint: '/hostel-manager/resolved-complaints',
//     escalateLabel: 'Escalate to Admin',
//     showTabs: false,
//     activeTab: 'escalated',
//   },
// }

// export default function HostelManagerLayout() {
//   return (
//     <ManagerLayout 
//       navItems={navItems} 
//       pageTitles={pageTitles} 
//       portalLabel="Hostel Manager"
//       complaintConfig={complaintConfig}
//       endpoint="/hostel-manager/complaints"
//       resolvedEndpoint="/hostel-manager/resolved-complaints"
//       escalateLabel="Escalate to Admin"
//     />
//   )
// }
