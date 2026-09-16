export function sortComplaints(complaints, sortBy) {
    const arr = [...complaints]
    if (sortBy === 'newest') {
      return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    if (sortBy === 'oldest') {
      return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    if (sortBy === 'priority') {
      return arr.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    }
    return arr
  }