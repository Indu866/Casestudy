import { useOutletContext, useLocation } from 'react-router-dom'
import ManagerComplaintsPage from './ManagerComplaintsPage'

export default function HostelManagerComplaints() {
  const { endpoints, escalateLabel } = useOutletContext()
  const location = useLocation()

  // Determine which endpoint to use based on current route
  const getConfig = () => {
    if (location.pathname.includes('/resolved')) {
      return { endpoint: endpoints?.resolved, resolvedOnly: true }
    } else if (location.pathname.includes('/escalated')) {
      return { endpoint: endpoints?.escalated, resolvedOnly: false }
    } else {
      return { endpoint: endpoints?.complaints, resolvedOnly: false }
    }
  }

  const { endpoint, resolvedOnly } = getConfig()

  return (
    <ManagerComplaintsPage 
      endpoint={endpoint}
      escalateLabel={escalateLabel}
      resolvedOnly={resolvedOnly}
    />
  )
}