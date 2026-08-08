import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiSignup } from "../../services/authApi.js"// Changed from '../api'
import "../../App.css";                // Changed from '../App.css'

const roles = [
  { value: 'student',   icon: '🎓', label: 'Student' },
  { value: 'organizer', icon: '📋', label: 'Organizer' },

]

export default function Signup() {
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '', role: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.role)                         return setError('Please select your role.')
    if (form.password !== form.confirm)      return setError('Passwords do not match.')
    if (form.password.length < 8)           return setError('Password must be at least 8 characters.')
      
      // 5. At least one uppercase letter
    if (!/[A-Z]/.test(form.password)) {
        return setError('Password must contain at least one uppercase letter.');
    }

      // 6. At least one lowercase letter
    if (!/[a-z]/.test(form.password)) {
        return setError('Password must contain at least one lowercase letter.');
    }

      // 7. At least one number
    if (!/[0-9]/.test(form.password)) {
        return setError('Password must contain at least one number.');
    }

      // 8. At least one special character
    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(form.password)) {
        return setError('Password must contain at least one special character.');
    }
    
    setLoading(true)
    try {
      await apiSignup({ fullName: form.fullName, email: form.email, password: form.password, role: form.role })
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed.')
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
          <p className='auth-eyebrow'>Get Started</p>
          <h1 className='auth-headline'>
            Your university.<br /><span>Your events.</span>
          </h1>
          <p className='auth-desc'>
            Join the University Event Management System. Discover events, connect
            with your campus community, and make your university experience richer.
          </p>
          {roles.map(r => (
            <div key={r.value} className='auth-role-card'>
              <span className='auth-role-card__icon'>{r.icon}</span>
              <div>
                <div className='auth-role-card__name'>{r.label}</div>
                <div className='auth-role-card__desc'>
                  {r.value === 'student'   && 'Browse, register & give feedback on events'}
                  {r.value === 'organizer' && 'Create and manage events for the university'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className='auth-right'>
        <div className='auth-box'>
          <p className='auth-box__eyebrow'>Create Account</p>
          <h2 className='auth-box__title'>Join Tamasha</h2>
          <p className='auth-box__sub'>
            Already have an account? <Link to='/login'>Sign in</Link>
          </p>

          {error && <div className='auth-error'>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label className='auth-form-label'>Full Name</label>
              <input type='text' value={form.fullName} onChange={set('fullName')} placeholder='Jane Smith' required className='auth-form-input' />
            </div>
            <div className='form-group'>
              <label className='auth-form-label'>Email Address</label>
              <input type='email' value={form.email} onChange={set('email')} placeholder='you@university.edu' required className='auth-form-input' />
            </div>

            <div className='form-group'>
              <label className='auth-form-label'>I am a...</label>
              <div className='auth-role-select'>
                {roles.map(r => (
                  <button key={r.value} type='button'
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`auth-role-btn${form.role === r.value ? ' selected' : ''}`}>
                    <span>{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className='form-group'>
              <label className='auth-form-label'>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder='Min. 8 characters' required className='auth-form-input' style={{ paddingRight: 52 }} />
                <button type='button' onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '10px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className='form-group' style={{ marginBottom: '1.5rem' }}>
              <label className='auth-form-label'>Confirm Password</label>
              <input type='password' value={form.confirm} onChange={set('confirm')} placeholder='Re-enter password' required
                className='auth-form-input'
                style={{ borderColor: form.confirm && form.password !== form.confirm ? '#e00' : '' }}
              />
              {form.confirm && form.password !== form.confirm && (
                <p style={{ color: '#e00', fontSize: '11px', marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>

            <button type='submit' className='auth-submit' disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}