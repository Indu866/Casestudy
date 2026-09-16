import { ClipboardList, Archive, AlertTriangle } from 'lucide-react'
import ManagerLayout from './ManagerLayout'

const navItems = [
  { to: '/librarian/dashboard/complaints', icon: ClipboardList, label: 'Library Complaints' },
  { to: '/librarian/dashboard/resolved',   icon: Archive,       label: 'Resolved' },
  { to: '/librarian/dashboard/escalated',  icon: AlertTriangle, label: 'Escalated to Admin' },
]

const pageTitles = {
  '/librarian/dashboard/complaints': 'Library Complaints',
  '/librarian/dashboard/resolved':   'Resolved Complaints',
  '/librarian/dashboard/escalated':  'Escalated to Admin',
}

export default function LibrarianLayout() {
  return <ManagerLayout navItems={navItems} pageTitles={pageTitles} portalLabel="Librarian" />
}