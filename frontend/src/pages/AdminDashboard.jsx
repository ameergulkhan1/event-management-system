import { useState, useEffect } from 'react'
import ChatbotWidget from '../components/ChatbotWidget';
import Sidebar from '../components/Sidebar'
import { apiGetUsers, apiDeleteUser, apiGetStats } from '../services/adminApi.js'
import { apiGetEvents, apiDeleteEvent, apiApproveEvent, apiRejectEvent } from '../services/eventApi.js'
import { apiGetFeedback } from '../services/feedbackApi.js'
import '../App.css'

const TABS = ['Overview', 'Users', 'Events', 'Approvals', 'Reports', 'Profile']

export default function AdminDashboard() {
  const [active, setActive]     = useState('Overview')
  const [users, setUsers]       = useState([])
  const [events, setEvents]     = useState([])
  const [feedbacks, setFbs]     = useState([])
  const [stats, setStats]       = useState({})
  const [userFilter, setUF]     = useState('all')
  const [evSearch, setEvSearch] = useState('')
  const [alert, setAlert]       = useState(null)
  const [loading, setLoading]   = useState(true)

  const u = JSON.parse(localStorage.getItem('loggedInUser') || '{}')

  const load = async () => {
    setLoading(true)
    try {
      const [us, ev, fb, st] = await Promise.all([apiGetUsers(), apiGetEvents(), apiGetFeedback(), apiGetStats()])
      setUsers(us.users || us)
      setEvents(ev.events || ev)
      setFbs(fb.feedbacks || fb)
      setStats(st)
    } catch { /* handle */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3500)
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return
    try { await apiDeleteUser(id); showAlert('User deleted.'); load() }
    catch (e) { showAlert(e.message, 'error') }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try { await apiDeleteEvent(id); showAlert('Event deleted.'); load() }
    catch (e) { showAlert(e.message, 'error') }
  }

  const approveEvent = async (id) => {
    try { await apiApproveEvent(id); showAlert('Event approved!'); load() }
    catch (e) { showAlert(e.message, 'error') }
  }

  const rejectEvent = async (id) => {
    try { await apiRejectEvent(id); showAlert('Event rejected.'); load() }
    catch (e) { showAlert(e.message, 'error') }
  }

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter)
  const filteredEvents = events.filter(ev =>
    ev.title?.toLowerCase().includes(evSearch.toLowerCase()) ||
    ev.organizer?.toLowerCase().includes(evSearch.toLowerCase())
  )
  const pendingEvents = events.filter(e => !e.status || e.status === 'pending')

  const sidebarStats = [
    ['Users', users.length],
    ['Events', events.length],
    ['Pending', pendingEvents.length],
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontFamily: 'Space Grotesk', fontSize: 13 }}>
      Loading admin dashboard...
    </div>
  )

  const roleBadge = (role) => {
    const m = { student: 'blue', organizer: 'purple', admin: 'red' }
    return <span className={`badge badge--${m[role] || 'gray'}`}>{role}</span>
  }

  const statusBadge = (status) => {
    const m = { approved: 'green', pending: 'amber', rejected: 'red' }
    return <span className={`badge badge--${m[status] || 'amber'}`}>{status || 'pending'}</span>
  }

  return (
    <div className='layout'>
      <Sidebar tabs={TABS} active={active} setActive={setActive} user={u} stats={sidebarStats} role='admin' />

      <div className='main'>
        <div className='topbar'>
          <div>
            <div className='topbar__eyebrow'>Tamasha</div>
            <div className='topbar__title'>{active}</div>
          </div>
          <div className='topbar__badge'>
            {pendingEvents.length > 0 && (
              <span className='badge badge--amber' style={{ marginRight: 10 }}>{pendingEvents.length} Pending</span>
            )}
            <div className='topbar__dot' style={{ background: 'var(--red)' }} />
            <span className='topbar__status'>Admin Portal</span>
          </div>
        </div>

        <div className='content'>
          {alert && <div className={`alert alert--${alert.type}`}>{alert.msg}</div>}

          {/* ── OVERVIEW ── */}
          {active === 'Overview' && (
            <div>
              <div className='stat-grid' style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                {[
                  ['Total Users', users.length, 'Registered accounts', 'blue'],
                  ['Total Events', events.length, 'On platform', 'accent'],
                  ['Pending Approvals', pendingEvents.length, 'Need review', 'amber'],
                  ['Students', users.filter(u=>u.role==='student').length, 'Accounts', 'green'],
                  ['Organizers', users.filter(u=>u.role==='organizer').length, 'Accounts', 'purple'],
                  ['Feedback', feedbacks.length, 'Reviews submitted', 'amber'],
                ].map(([label, val, sub, color]) => (
                  <div key={label} className={`card stat-card card--accent-${color}`}>
                    <div className='stat-card__label'>{label}</div>
                    <div className='stat-card__value'>{val}</div>
                    <div className='stat-card__sub'>{sub}</div>
                  </div>
                ))}
              </div>

              <div className='grid-2'>
                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-header'>
                    <span className='section-title'>Recent Users</span>
                    <button className='btn btn--ghost btn--sm' onClick={() => setActive('Users')}>View All</button>
                  </div>
                  {users.slice(-5).reverse().map((usr, i) => (
                    <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'Space Grotesk' }}>{usr.fullName || usr.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{usr.email}</div>
                      </div>
                      {roleBadge(usr.role)}
                    </div>
                  ))}
                  {users.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-4)' }}>No users yet.</p>}
                </div>

                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-header'>
                    <span className='section-title'>Pending Approvals</span>
                    {pendingEvents.length > 0 && <button className='btn btn--ghost btn--sm' onClick={() => setActive('Approvals')}>Review All</button>}
                  </div>
                  {pendingEvents.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text-4)' }}>No pending events.</p>
                  ) : pendingEvents.slice(0, 4).map(ev => (
                    <div key={ev.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'Space Grotesk' }}>{ev.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 8 }}>{ev.organizer} · {ev.date}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className='btn btn--success btn--sm' onClick={() => approveEvent(ev.id)}>Approve</button>
                        <button className='btn btn--danger btn--sm' onClick={() => rejectEvent(ev.id)}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {active === 'Users' && (
            <div>
              <div className='filter-tabs'>
                {['all', 'student', 'organizer', 'admin'].map(f => (
                  <button key={f} className={`filter-tab${userFilter === f ? ' active' : ''}`} onClick={() => setUF(f)}>
                    {f === 'all' ? 'All Users' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                    <span style={{ marginLeft: 5, opacity: 0.6 }}>
                      ({f === 'all' ? users.length : users.filter(u => u.role === f).length})
                    </span>
                  </button>
                ))}
              </div>
              <div className='card'>
                <table className='table'>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-4)' }}>No users found.</td></tr>
                    ) : filteredUsers.map((usr, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{usr.fullName || usr.full_name}</td>
                        <td>{usr.email}</td>
                        <td>{roleBadge(usr.role)}</td>
                        <td>{usr.createdAt || usr.created_at ? new Date(usr.createdAt || usr.created_at).toLocaleDateString() : '—'}</td>
                        <td>
                          {(usr.email !== u.email && usr.role !== 'admin') ? (
                            <button className='btn btn--danger btn--sm' onClick={() => deleteUser(usr.id)}>Delete</button>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{usr.email === u.email ? 'You' : 'Protected'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── EVENTS ── */}
          {active === 'Events' && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <input className='form-input' value={evSearch} onChange={e => setEvSearch(e.target.value)} placeholder='Search events by title or organizer...' style={{ maxWidth: 400 }} />
              </div>
              <div className='card'>
                <table className='table'>
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Organizer</th><th>Date</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-4)' }}>No events found.</td></tr>
                    ) : filteredEvents.map(ev => (
                      <tr key={ev.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 600, maxWidth: 200 }}>{ev.title}</td>
                        <td><span className='badge badge--gray'>{ev.category}</span></td>
                        <td>{ev.organizer}</td>
                        <td style={{ fontSize: 12 }}>{ev.date}</td>
                        <td>{statusBadge(ev.status)}</td>
                        <td><button className='btn btn--danger btn--sm' onClick={() => deleteEvent(ev.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {active === 'Approvals' && (
            <div>
              {pendingEvents.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>All caught up!</div>
                  <div className='empty__desc'>No events are pending approval right now.</div>
                </div></div>
              ) : pendingEvents.map(ev => (
                <div key={ev.id} className='event-card'>
                  <div className='event-card__body'>
                    <div className='event-card__meta'>
                      <span className='event-card__title'>{ev.title}</span>
                      {ev.category && <span className='badge badge--gray'>{ev.category}</span>}
                      <span className='badge badge--amber'>Pending Review</span>
                    </div>
                    <div className='event-card__desc'>{ev.description}</div>
                    <div className='event-card__info'>
                      <span className='event-card__info-item'>Date: <span>{ev.date}</span></span>
                      <span className='event-card__info-item'>Venue: <span>{ev.venue}</span></span>
                      <span className='event-card__info-item'>Organizer: <span>{ev.organizer}</span></span>
                      {ev.capacity && <span className='event-card__info-item'>Capacity: <span>{ev.capacity}</span></span>}
                    </div>
                  </div>
                  <div className='event-card__actions'>
                    <button className='btn btn--success' onClick={() => approveEvent(ev.id)}>✓ Approve</button>
                    <button className='btn btn--danger' onClick={() => rejectEvent(ev.id)}>✗ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── REPORTS ── */}
          {active === 'Reports' && (
            <div>
              <div className='grid-2' style={{ marginBottom: 16 }}>
                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-title' style={{ marginBottom: '1rem' }}>User Breakdown</div>
                  {[
                    ['Students', users.filter(u=>u.role==='student').length, 'blue'],
                    ['Organizers', users.filter(u=>u.role==='organizer').length, 'purple'],
                    ['Admins', users.filter(u=>u.role==='admin').length, 'red'],
                  ].map(([role, count, color]) => (
                    <div key={role} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{role}</span>
                        <span style={{ fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--text)' }}>{count} <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>({users.length ? Math.round(count/users.length*100) : 0}%)</span></span>
                      </div>
                      <div className='progress'>
                        <div className='progress__bar' style={{ width: `${users.length ? count/users.length*100 : 0}%`, background: `var(--${color})` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-title' style={{ marginBottom: '1rem' }}>Events by Category</div>
                  {['Academic','Sports','Cultural','Workshop','Seminar','Social','Technical','Other'].map(cat => {
                    const count = events.filter(e => e.category === cat).length
                    if (!count) return null
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{cat}</span>
                          <span style={{ fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--text)' }}>{count}</span>
                        </div>
                        <div className='progress'>
                          <div className='progress__bar' style={{ width: `${events.length ? count/events.length*100 : 0}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {events.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-4)' }}>No events yet.</p>}
                </div>
              </div>

              <div className='card' style={{ padding: '1.25rem' }}>
                <div className='section-title' style={{ marginBottom: '1rem' }}>Recent Feedback</div>
                {feedbacks.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>No feedback submitted yet.</p>
                ) : feedbacks.slice(-5).reverse().map((f, i) => {
                  const ev = events.find(e => e.id === (f.eventId || f.event_id))
                  return (
                    <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--text)' }}>
                          {f.studentName || f.student_name} <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>on {ev?.title || '—'}</span>
                        </span>
                        <span>
                          <span className='stars'>{'★'.repeat(f.rating)}</span>
                          <span className='stars-empty'>{'★'.repeat(5-f.rating)}</span>
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.review}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {active === 'Profile' && (
            <div style={{ maxWidth: 560 }}>
              <div className='card' style={{ padding: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {(u.fullName?.[0] || 'A').toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 4 }}>{u.fullName}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{u.email}</p>
                  <span className='badge badge--red'>Administrator</span>
                </div>
              </div>
              <div className='card' style={{ padding: '1.25rem' }}>
                {[
                  ['Full Name', u.fullName],
                  ['Email Address', u.email],
                  ['Role', 'System Administrator'],
                  ['Total Users', users.length],
                  ['Total Events', events.length],
                  ['Pending Approvals', pendingEvents.length],
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