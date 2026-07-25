import { useState, useEffect, useRef } from 'react'
import ChatbotWidget from '../components/ChatbotWidget';
import Sidebar from '../components/Sidebar'
import { apiGetEvents } from '../services/eventApi.js'
import { apiRegister, apiCancelRegistration, apiMyRegistrations } from '../services/registrationApi.js'
import { apiSubmitFeedback, apiMyFeedback } from '../services/feedbackApi.js'
import { apiUpdateProfile } from '../services/authApi.js'
import '../App.css'

const TABS = ['Overview', 'Browse Events', 'My Registrations', 'Feedback', 'Profile']

export default function StudentDashboard() {
  const [active, setActive]           = useState('Overview')
  const [events, setEvents]           = useState([])
  const [registrations, setRegs]      = useState([])
  const [feedbacks, setFeedbacks]     = useState([])
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('All')
  const [fbForm, setFbForm]           = useState({ eventId: '', rating: 5, review: '', suggestion: '' })
  const [fbSent, setFbSent]           = useState(false)
  const [fbError, setFbError]         = useState('')
  const [alert, setAlert]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const fileRef = useRef()

  const u = JSON.parse(localStorage.getItem('loggedInUser') || '{}')
  const [user, setUser] = useState(u)

  const load = async () => {
    setLoading(true)
    try {
      const [ev, regs, fbs] = await Promise.all([apiGetEvents(), apiMyRegistrations(), apiMyFeedback()])
      setEvents(ev.events || ev)
      setRegs(regs.registrations || regs)
      setFeedbacks(fbs.feedbacks || fbs)
    } catch { /* silently handle */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3500)
  }

  const myEventIds = registrations.map(r => r.eventId || r.event_id)

  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))]
  const filteredEvents = events.filter(ev => {
    const s = search.toLowerCase()
    return (ev.title?.toLowerCase().includes(s) || ev.description?.toLowerCase().includes(s))
      && (filterCat === 'All' || ev.category === filterCat)
  })

  const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length

  const register = async (eventId) => {
    try {
      await apiRegister(eventId)
      showAlert('Registered successfully!')
      load()
    } catch (e) { showAlert(e.message, 'error') }
  }

  const cancel = async (eventId) => {
    if (!window.confirm('Cancel this registration?')) return
    try {
      await apiCancelRegistration(eventId)
      showAlert('Registration cancelled.')
      load()
    } catch (e) { showAlert(e.message, 'error') }
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    setFbError('')
    try {
      await apiSubmitFeedback(fbForm)
      setFbSent(true)
      setFbForm({ eventId: '', rating: 5, review: '', suggestion: '' })
      load()
    } catch (err) { setFbError(err.message) }
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const updated = { ...user, profilePhoto: ev.target.result }
      setUser(updated)
      localStorage.setItem('loggedInUser', JSON.stringify(updated))
    }
    reader.readAsDataURL(file)
  }

  const stats = [
    ['Events', events.length],
    ['Registered', registrations.length],
    ['Feedback', feedbacks.length],
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontFamily: 'Space Grotesk', fontSize: 13 }}>
      Loading your dashboard...
    </div>
  )

  return (
    <div className='layout'>
      <Sidebar tabs={TABS} active={active} setActive={setActive} user={user} stats={stats} role='student' />

      <div className='main'>
        <div className='topbar'>
          <div>
            <div className='topbar__eyebrow'>University Event Management System</div>
            <div className='topbar__title'>{active}</div>
          </div>
          <div className='topbar__badge'>
            <div className='topbar__dot' />
            <span className='topbar__status'>Student Portal</span>
          </div>
        </div>

        <div className='content'>
          {alert && (
            <div className={`alert alert--${alert.type}`}>{alert.msg}</div>
          )}

          {/* ── OVERVIEW ── */}
          {active === 'Overview' && (
            <div>
              <div className='stat-grid'>
                {[
                  ['Total Events', events.length, 'Available to join', 'blue'],
                  ['Registered', registrations.length, 'My registrations', 'purple'],
                  ['Upcoming', upcomingCount, 'Events this season', 'amber'],
                  ['Feedback Given', feedbacks.length, 'Reviews submitted', 'green'],
                ].map(([label, val, sub, color]) => (
                  <div key={label} className={`card stat-card card--accent-${color}`}>
                    <div className='stat-card__label'>{label}</div>
                    <div className='stat-card__value'>{val}</div>
                    <div className='stat-card__sub'>{sub}</div>
                  </div>
                ))}
              </div>

              <div className='grid-sidebar'>
                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-header'>
                    <span className='section-title'>Upcoming Events</span>
                    <button className='btn btn--ghost btn--sm' onClick={() => setActive('Browse Events')}>Browse All</button>
                  </div>
                  {events.length === 0 ? (
                    <div className='empty'>
                      <div className='empty__title'>No events yet</div>
                      <div className='empty__desc'>Organizers will post events soon.</div>
                    </div>
                  ) : events.slice(0, 6).map(ev => (
                    <div key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{ev.date} · {ev.venue}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {ev.category && <span className='badge badge--gray'>{ev.category}</span>}
                        {myEventIds.includes(ev.id)
                          ? <span className='badge badge--green'>Registered</span>
                          : <button className='btn btn--primary btn--sm' onClick={() => register(ev.id)}>Register</button>
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className='card' style={{ padding: '1.25rem' }}>
                    <div className='section-title' style={{ marginBottom: '0.75rem' }}>Quick Actions</div>
                    {[
                      ['Browse & Register', 'Browse Events'],
                      ['My Registrations', 'My Registrations'],
                      ['Submit Feedback', 'Feedback'],
                      ['View Profile', 'Profile'],
                    ].map(([label, tab]) => (
                      <button key={tab} className='btn btn--ghost' style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }} onClick={() => setActive(tab)}>
                        {label} →
                      </button>
                    ))}
                  </div>

                  <div className='card' style={{ padding: '1.25rem' }}>
                    <div className='section-title' style={{ marginBottom: '0.75rem' }}>My Registrations</div>
                    {registrations.length === 0
                      ? <p style={{ fontSize: 12, color: 'var(--text-4)' }}>None yet</p>
                      : registrations.slice(0, 3).map((r, i) => {
                          const ev = events.find(e => e.id === (r.eventId || r.event_id))
                          return ev ? (
                            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{ev.date}</div>
                            </div>
                          ) : null
                        })
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BROWSE EVENTS ── */}
          {active === 'Browse Events' && (
            <div>
              <div className='search-row'>
                <input className='form-input' value={search} onChange={e => setSearch(e.target.value)} placeholder='Search events by title or description...' />
                <select className='form-input form-select' value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ flex: '0 0 180px' }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</p>

              {filteredEvents.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>{events.length === 0 ? 'No events posted yet' : 'No results found'}</div>
                  <div className='empty__desc'>{events.length === 0 ? 'Organizers will post events soon.' : 'Try a different search or category filter.'}</div>
                </div></div>
              ) : filteredEvents.map(ev => (
                <div key={ev.id} className='event-card'>
                  <div className='event-card__body'>
                    <div className='event-card__meta'>
                      <span className='event-card__title'>{ev.title}</span>
                      {ev.category && <span className='badge badge--gray'>{ev.category}</span>}
                      {ev.status === 'approved' && <span className='badge badge--green'>Approved</span>}
                    </div>
                    <div className='event-card__desc'>{ev.description}</div>
                    <div className='event-card__info'>
                      <span className='event-card__info-item'>Date: <span>{ev.date}</span></span>
                      <span className='event-card__info-item'>Venue: <span>{ev.venue}</span></span>
                      {ev.organizer && <span className='event-card__info-item'>By: <span>{ev.organizer}</span></span>}
                      {ev.capacity && <span className='event-card__info-item'>Capacity: <span>{ev.capacity}</span></span>}
                    </div>
                  </div>
                  <div className='event-card__actions'>
                    {myEventIds.includes(ev.id) ? (
                      <>
                        <span className='badge badge--green'>Registered</span>
                        <button className='btn btn--danger btn--sm' onClick={() => cancel(ev.id)}>Cancel</button>
                      </>
                    ) : (
                      <button className='btn btn--primary' onClick={() => register(ev.id)}>Register</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MY REGISTRATIONS ── */}
          {active === 'My Registrations' && (
            <div>
              {registrations.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>No registrations yet</div>
                  <div className='empty__desc'>Browse available events and register to participate.</div>
                  <button className='btn btn--primary' onClick={() => setActive('Browse Events')}>Browse Events</button>
                </div></div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
                  {registrations.map((r, i) => {
                    const ev = events.find(e => e.id === (r.eventId || r.event_id))
                    return ev ? (
                      <div key={i} className='event-card' style={{ flexDirection: 'row' }}>
                        <div className='event-card__body'>
                          <div className='event-card__title' style={{ marginBottom: 4 }}>{ev.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Date: {ev.date} &nbsp;·&nbsp; Venue: {ev.venue}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>
                            Registered {r.registeredAt || r.registered_at ? new Date(r.registeredAt || r.registered_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <div className='event-card__actions'>
                          <span className='badge badge--green'>Registered</span>
                          <button className='btn btn--danger btn--sm' onClick={() => cancel(ev.id)}>Cancel</button>
                        </div>
                      </div>
                    ) : null
                  })}
                </>
              )}
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {active === 'Feedback' && (
            <div style={{ maxWidth: 640 }}>
              {fbSent && <div className='alert alert--success'>Feedback submitted successfully!</div>}
              {fbError && <div className='alert alert--error'>{fbError}</div>}

              {registrations.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>No registered events</div>
                  <div className='empty__desc'>Register for an event first before submitting feedback.</div>
                  <button className='btn btn--primary' onClick={() => setActive('Browse Events')}>Browse Events</button>
                </div></div>
              ) : (
                <div className='card' style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div className='section-title' style={{ marginBottom: '1.25rem' }}>Share Your Experience</div>
                  <form onSubmit={submitFeedback}>
                    <div className='form-group'>
                      <label className='form-label'>Select Event</label>
                      <select className='form-input form-select' value={fbForm.eventId}
                        onChange={e => setFbForm(f => ({ ...f, eventId: e.target.value }))} required>
                        <option value=''>Choose an event...</option>
                        {events.filter(ev => myEventIds.includes(ev.id)).map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className='form-group'>
                      <label className='form-label'>Rating: {fbForm.rating} / 5</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type='button'
                            className={`rating-btn${n <= fbForm.rating ? ' active' : ''}`}
                            onClick={() => setFbForm(f => ({ ...f, rating: n }))}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className='form-group'>
                      <label className='form-label'>Review</label>
                      <textarea className='form-input form-textarea' value={fbForm.review}
                        onChange={e => setFbForm(f => ({ ...f, review: e.target.value }))}
                        placeholder='Share your experience with this event...' required />
                    </div>

                    <div className='form-group'>
                      <label className='form-label'>Suggestions (Optional)</label>
                      <textarea className='form-input' rows={2} value={fbForm.suggestion}
                        onChange={e => setFbForm(f => ({ ...f, suggestion: e.target.value }))}
                        placeholder='Any improvements you would suggest...' />
                    </div>

                    <button type='submit' className='btn btn--primary btn--full btn--lg'>Submit Feedback</button>
                  </form>
                </div>
              )}

              {feedbacks.length > 0 && (
                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-title' style={{ marginBottom: '1rem' }}>My Previous Feedback</div>
                  {feedbacks.map((f, i) => {
                    const ev = events.find(e => e.id === (f.eventId || f.event_id))
                    return (
                      <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{ev?.title || 'Event'}</div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                          <span className='stars'>{'★'.repeat(f.rating)}</span>
                          <span className='stars-empty'>{'★'.repeat(5 - f.rating)}</span>
                          <span style={{ color: 'var(--text-3)', marginLeft: 6, fontSize: 11 }}>{f.rating}/5</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.review}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {active === 'Profile' && (
            <div style={{ maxWidth: 560 }}>
              <div className='card' style={{ padding: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 800, color: '#fff' }}>
                    {user.profilePhoto ? <img src={user.profilePhoto} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.fullName?.[0] || 'S').toUpperCase()}
                  </div>
                  <label style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 9, fontWeight: 700, fontFamily: 'Space Grotesk', padding: '3px 7px', cursor: 'pointer', borderRadius: 2 }}>
                    Edit
                    <input ref={fileRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={handlePhoto} />
                  </label>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 4 }}>{user.fullName}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{user.email}</p>
                  <span className='badge badge--blue'>Student</span>
                </div>
              </div>

              <div className='card' style={{ padding: '1.25rem' }}>
                {[
                  ['Full Name', user.fullName],
                  ['Email Address', user.email],
                  ['Role', 'Student'],
                  ['Events Registered', registrations.length],
                  ['Feedback Submitted', feedbacks.length],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'Space Grotesk' }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatbotWidget />
    </div>
  )
}