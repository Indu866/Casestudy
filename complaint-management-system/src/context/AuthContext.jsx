import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API_BASE = 'http://localhost:5001' // change port if needed

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [authError, setAuthError] = useState('')

  const login = async (email, password) => {
    setAuthError('')
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
  
      if (!res.ok) {
        setAuthError(data.error || 'Login failed. Please try again.')
        return { success: false }
      }
  
      localStorage.setItem('token', data.token)
      const loggedInUser = {
        id: data.user.id,
        role_id: data.user.role_id,
        email: data.user.email,
        name: data.user.name,
        department_id: data.user.department_id,
        avatar: data.user.name?.slice(0, 2).toUpperCase() || data.user.email.slice(0, 2).toUpperCase(),
      }
      setUser(loggedInUser)
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      return { success: true, role_id: data.user.role_id }  // ← LoginPage needs this
  
    } catch (err) {
      setAuthError('Cannot connect to server. Make sure your backend is running.')
      return { success: false }
    }
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // STEP 1 - Send OTP to email
  const sendOtp = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      return { success: res.ok, message: data.message || data.error }
    } catch (err) {
      return { success: false, message: 'Cannot connect to server.' }
    }
  }

  // STEP 2 - Verify OTP and set new password
  const verifyOtpAndReset = async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      return { success: res.ok, message: data.message || data.error }
    } catch (err) {
      return { success: false, message: 'Cannot connect to server.' }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, sendOtp, verifyOtpAndReset, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)