import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, ChevronLeft, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const { login, sendOtp, verifyOtpAndReset, authError, setAuthError } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [forgotStep, setForgotStep] = useState('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [stepError, setStepError] = useState('')
  const [stepMessage, setStepMessage] = useState('')

  // BUG FIX 1: removed duplicate/broken else blocks, clean role-based redirect
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      if (result.role_id === 1) {
        navigate('/dashboard')
      } else if ([2, 5, 8].includes(result.role_id)) {
        navigate('/staff/dashboard')
      } else if (result.role_id === 6) {
        navigate('/hostel-manager/dashboard')
      } else if (result.role_id === 9) {
        navigate('/librarian/dashboard')
      } else if (result.role_id === 10) {
        navigate('/transport-manager/dashboard')
      } else if (result.role_id === 3) {
        navigate('/coordinator/dashboard')
      } else if (result.role_id === 4) {
        navigate('/hod/dashboard')
      } else if (result.role_id === 7) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    }
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setStepError('')
    setLoading(true)
    const result = await sendOtp(forgotEmail)
    setLoading(false)
    if (result.success) { setStepMessage(result.message); setForgotStep('otp') }
    else setStepError(result.message)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setStepError('')
    if (otp.length !== 6) { setStepError('Please enter the 6-digit OTP.'); return }
    setForgotStep('newpass')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setStepError('')
    if (newPassword.length < 6) { setStepError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const result = await verifyOtpAndReset(forgotEmail, otp, newPassword)
    setLoading(false)
    if (result.success) setForgotStep('done')
    else { setStepError(result.message); if (result.message.toLowerCase().includes('otp')) setForgotStep('otp') }
  }

  const switchToForgot = () => {
    setAuthError('')
    setForgotStep('email')
    setForgotEmail('')
    setOtp('')
    setNewPassword('')
    setStepError('')
    setStepMessage('')
    setMode('forgot')
  }

  // BUG FIX 2: removed setForgotStatus(null) which was undefined, just setMode
  const switchToLogin = () => {
    setAuthError('')
    setMode('login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border-4 border-white -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">CV</span>
            </div>
            <span className="text-white font-display font-semibold text-lg">CampusVoice</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">Your voice<br />shapes campus life.</h1>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">Submit complaints, track their progress, and upvote issues that matter to the whole community.</p>
          <div className="space-y-4">
            {[
              { icon: '📋', title: 'Submit & Track', desc: 'Lodge complaints and monitor real-time status updates' },
              { icon: '📣', title: 'Community Upvotes', desc: 'Amplify important issues with collective support' },
              { icon: '✅', title: 'Transparent Resolution', desc: 'See how and when complaints get resolved' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold font-display text-sm">{f.title}</p>
                  <p className="text-primary-100 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-primary-200 text-sm">© 2025 CampusVoice · All rights reserved</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">CV</span>
            </div>
            <span className="text-slate-800 font-display font-semibold">CampusVoice</span>
          </div>

          {mode === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500">Sign in to your account</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {authError && (
                  <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{authError}</span>
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="button" onClick={switchToForgot} className="text-sm text-primary-600 hover:text-primary-700 font-medium transition">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm">
                  {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <button onClick={switchToLogin} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition">
                <ChevronLeft className="w-4 h-4" /> Back to sign in
              </button>

              {forgotStep !== 'done' && (
                <div className="flex items-center gap-2 mb-8">
                  {['email', 'otp', 'newpass'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        forgotStep === step ? 'bg-primary-600 text-white' :
                        ['email','otp','newpass'].indexOf(forgotStep) > i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {['email','otp','newpass'].indexOf(forgotStep) > i ? '✓' : i + 1}
                      </div>
                      {i < 2 && <div className={`h-0.5 w-8 rounded ${['email','otp','newpass'].indexOf(forgotStep) > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-slate-400">
                    {forgotStep === 'email' && 'Enter your email'}
                    {forgotStep === 'otp' && 'Verify OTP'}
                    {forgotStep === 'newpass' && 'Set new password'}
                  </span>
                </div>
              )}

              {forgotStep === 'email' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">Forgot password?</h2>
                    <p className="text-slate-500 text-sm">We'll send a 6-digit OTP to your registered email.</p>
                  </div>
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@college.edu"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
                      </div>
                    </div>
                    {stepError && <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{stepError}</span></div>}
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                      {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
                    </button>
                  </form>
                </>
              )}

              {forgotStep === 'otp' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">Enter OTP</h2>
                    <p className="text-slate-500 text-sm">We sent a 6-digit code to <strong>{forgotEmail}</strong>. It expires in 10 minutes.</p>
                  </div>
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">6-digit OTP</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm tracking-widest font-mono" />
                      </div>
                    </div>
                    {stepError && <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{stepError}</span></div>}
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition text-sm">Verify OTP</button>
                    <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium transition text-center">
                      {loading ? 'Resending...' : "Didn't receive it? Resend OTP"}
                    </button>
                  </form>
                </>
              )}

              {forgotStep === 'newpass' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">Set new password</h2>
                    <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showNewPassword ? 'text' : 'password'} required minLength={6}
                          value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm" />
                        <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {stepError && <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{stepError}</span></div>}
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                      {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                    </button>
                  </form>
                </>
              )}

              {forgotStep === 'done' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Password Reset!</h2>
                  <p className="text-slate-500 text-sm mb-6">Your password has been updated. You can now sign in.</p>
                  <button onClick={switchToLogin} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">Back to Sign In</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}