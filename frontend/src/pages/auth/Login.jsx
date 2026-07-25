import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../../services/authApi.js" // Changed from '../api'
import "../../App.css";                 // Changed from '../App.css'

const roles = [
  { value: 'student',   icon: '🎓', label: 'Student',   desc: 'Browse & register for university events' },
  { value: 'organizer', icon: '📋', label: 'Organizer', desc: 'Create & manage events for your club/dept' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin({ email, password })
      localStorage.setItem('loggedInUser', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      const role = data.user.role
      if (role === 'student')   navigate('/student/dashboard')
      else if (role === 'organizer') navigate('/organizer/dashboard')
      else if (role === 'admin')     navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-layout'>
      {/* ── LEFT ── */}
      <div className='auth-left'>
        <div className='auth-left__grid' />
        <div className='auth-left__content'>
          <p className='auth-eyebrow'>Welcome Back</p>
          <h1 className='auth-headline'>
            Manage events.<br /><span>Connect campus.</span>
          </h1>
          <p className='auth-desc'>
            Sign in to access your personalized dashboard. Students discover events,
            organizers manage them, and admins oversee the entire platform.
          </p>
          {roles.map(r => (
            <div key={r.value} className='auth-role-card'>
              <span className='auth-role-card__icon'>{r.icon}</span>
              <div>
                <div className='auth-role-card__name'>{r.label}</div>
                <div className='auth-role-card__desc'>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className='auth-right'>
        <div className='auth-box'>
          <p className='auth-box__eyebrow'>Sign In</p>
          <h2 className='auth-box__title'>Welcome back</h2>
          <p className='auth-box__sub'>
            No account? <Link to='/signup'>Create one</Link>
          </p>

          {error && <div className='auth-error'>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label className='auth-form-label'>Email Address</label>
              <input
                type='email' value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@university.edu'
                required className='auth-form-input'
              />
            </div>
            <div className='form-group' style={{ marginBottom: '1.5rem' }}>
              <label className='auth-form-label'>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Your password'
                  required className='auth-form-input' style={{ paddingRight: 52 }}
                />
                <button type='button' onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '10px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type='submit' className='auth-submit' disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}