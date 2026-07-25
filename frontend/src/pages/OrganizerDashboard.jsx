import { useState, useEffect } from 'react'
import ChatbotWidget from '../components/ChatbotWidget';
import Sidebar from '../components/Sidebar'
import { apiGetMyEvents, apiCreateEvent, apiUpdateEvent, apiDeleteEvent } from '../services/eventApi.js'
import { apiEventRegistrations } from '../services/registrationApi.js'
import { apiGetFeedback } from '../services/feedbackApi.js'
import '../App.css'

const TABS = ['Overview', 'My Events', 'Create Event', 'Registrations', 'Feedback', 'Profile']
const CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Workshop', 'Seminar', 'Social', 'Technical', 'Other']

// Helper function to get tomorrow's date
const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

const EMPTY = { 
    title: '', 
    description: '', 
    date: getTomorrowDate(),
    time: '09:00',
    venue: '', 
    category: 'Academic', 
    capacity: '' 
}

export default function OrganizerDashboard() {
  const [active, setActive]     = useState('Overview')
  const [events, setEvents]     = useState([])
  const [regsMap, setRegsMap]   = useState({})
  const [feedbacks, setFbs]     = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editId, setEditId]     = useState(null)
  const [alert, setAlert]       = useState(null)
  const [loading, setLoading]   = useState(true)

  const u = JSON.parse(localStorage.getItem('loggedInUser') || '{}')

  const load = async () => {
    setLoading(true)
    try {
      // Get events first
      let ev = { events: [] };
      try {
        ev = await apiGetMyEvents();
      } catch (err) {
        console.error('Failed to get events:', err);
        ev = { events: [] };
      }
      
      const list = ev.events || ev || [];
      setEvents(list)
      
      // Get registrations for each event - handle gracefully
      const map = {}
      if (list.length > 0) {
        // Process registrations in parallel but don't let failures stop everything
        await Promise.all(list.map(async (e) => {
          try {
            const r = await apiEventRegistrations(e.id)
            map[e.id] = r.registrations || r || []
          } catch (err) {
            // Silent fail - just set empty array
            map[e.id] = []
          }
        }))
      }
      setRegsMap(map)
      
      // Get feedback - handle gracefully
      try {
        const fb = await apiGetFeedback()
        setFbs(fb.feedbacks || fb || [])
      } catch (err) {
        console.error('Failed to get feedback:', err)
        setFbs([])
      }
    } catch (err) {
      console.error('Load error:', err)
      setEvents([])
      setRegsMap({})
      setFbs([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3500)
  }

  const totalRegs = Object.values(regsMap).reduce((s, r) => s + r.length, 0)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const saveEvent = async (e) => {
    e.preventDefault()
    
    if (!form.time) {
      showAlert('Please select a time for the event', 'error')
      return
    }
    
    const selectedDate = new Date(form.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      showAlert('Event date must be in the future (tomorrow or later)', 'error')
      return
    }
    
    try {
      console.log('📤 Sending event data:', form)
      
      if (editId) {
        await apiUpdateEvent(editId, form)
        showAlert('Event updated successfully!')
      } else {
        await apiCreateEvent(form)
        showAlert('Event created! Awaiting admin approval.')
      }
      setForm(EMPTY)
      setEditId(null)
      setActive('My Events')
      load()
    } catch (err) { 
      console.error('❌ Save event error:', err)
      showAlert(err.message || 'Failed to save event', 'error') 
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event? All registrations will also be removed.')) return
    try {
      await apiDeleteEvent(id)
      showAlert('Event deleted.')
      load()
    } catch (err) { 
      showAlert(err.message, 'error') 
    }
  }

  const startEdit = (ev) => {
    setForm({ 
      title: ev.title, 
      description: ev.description, 
      date: ev.date, 
      time: ev.time || '09:00',
      venue: ev.venue, 
      category: ev.category, 
      capacity: ev.capacity || '' 
    })
    setEditId(ev.id)
    setActive('Create Event')
  }

  const stats = [
    ['Events', events.length],
    ['Registered', totalRegs],
    ['Feedback', feedbacks.filter(f => events.find(e => e.id === (f.eventId || f.event_id))).length],
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontFamily: 'Space Grotesk', fontSize: 13 }}>
      Loading organizer dashboard...
    </div>
  )

  const statusBadge = (status) => {
    const map = { approved: 'green', pending: 'amber', rejected: 'red', draft: 'gray' }
    return <span className={`badge badge--${map[status] || 'gray'}`}>{status || 'pending'}</span>
  }

  const myFeedbacks = feedbacks.filter(f => events.find(e => e.id === (f.eventId || f.event_id)))

  return (
    <div className='layout'>
      <Sidebar tabs={TABS} active={active} setActive={(tab) => { if (tab === 'Create Event') { setForm(EMPTY); setEditId(null) } setActive(tab) }} user={u} stats={stats} role='organizer' />

      <div className='main'>
        <div className='topbar'>
          <div>
            <div className='topbar__eyebrow'>University Event Management System</div>
            <div className='topbar__title'>{editId && active === 'Create Event' ? 'Edit Event' : active}</div>
          </div>
          <div className='topbar__badge'>
            <div className='topbar__dot' />
            <span className='topbar__status'>Organizer Portal</span>
          </div>
        </div>

        <div className='content'>
          {alert && <div className={`alert alert--${alert.type}`}>{alert.msg}</div>}

          {/* ── OVERVIEW ── */}
          {active === 'Overview' && (
            <div>
              <div className='stat-grid'>
                {[
                  ['My Events', events.length, 'Total created', 'accent'],
                  ['Total Registrations', totalRegs, 'Across all events', 'green'],
                  ['Upcoming', events.filter(e => new Date(e.date) >= new Date()).length, 'Events scheduled', 'blue'],
                  ['Avg Rating', myFeedbacks.length ? (myFeedbacks.reduce((s,f)=>s+f.rating,0)/myFeedbacks.length).toFixed(1) : '—', 'From feedback', 'amber'],
                ].map(([label, val, sub, color]) => (
                  <div key={label} className={`card stat-card card--accent-${color}`}>
                    <div className='stat-card__label'>{label}</div>
                    <div className='stat-card__value'>{val}</div>
                    <div className='stat-card__sub'>{sub}</div>
                  </div>
                ))}
              </div>

              <div className='grid-2' style={{ marginBottom: 16 }}>
                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-header'>
                    <span className='section-title'>Recent Events</span>
                    <button className='btn btn--primary btn--sm' onClick={() => { setForm(EMPTY); setEditId(null); setActive('Create Event') }}>+ New Event</button>
                  </div>
                  {events.length === 0 ? (
                    <div className='empty'>
                      <div className='empty__title'>No events created</div>
                      <div className='empty__desc'>Create your first event to get started.</div>
                      <button className='btn btn--primary btn--sm' onClick={() => setActive('Create Event')}>Create Event</button>
                    </div>
                  ) : events.slice(0, 5).map(ev => (
                    <div key={ev.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{ev.date} · {regsMap[ev.id]?.length || 0} registered</div>
                      </div>
                      {statusBadge(ev.status)}
                    </div>
                  ))}
                </div>

                <div className='card' style={{ padding: '1.25rem' }}>
                  <div className='section-title' style={{ marginBottom: '0.75rem' }}>Registration Activity</div>
                  {events.filter(ev => (regsMap[ev.id]?.length || 0) > 0).slice(0, 5).map(ev => (
                    <div key={ev.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{ev.title}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'Space Grotesk', fontWeight: 700 }}>{regsMap[ev.id]?.length || 0}{ev.capacity ? `/${ev.capacity}` : ''}</span>
                      </div>
                      {ev.capacity && (
                        <div className='progress'>
                          <div className='progress__bar' style={{ width: `${Math.min(100, ((regsMap[ev.id]?.length || 0) / ev.capacity) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                  {events.every(ev => !(regsMap[ev.id]?.length)) && (
                    <p style={{ fontSize: 12, color: 'var(--text-4)' }}>No registrations yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MY EVENTS ── */}
          {active === 'My Events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className='btn btn--primary' onClick={() => { setForm(EMPTY); setEditId(null); setActive('Create Event') }}>+ Create New Event</button>
              </div>
              {events.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>No events yet</div>
                  <div className='empty__desc'>Create your first event and start getting registrations.</div>
                  <button className='btn btn--primary' onClick={() => setActive('Create Event')}>Create Event</button>
                </div></div>
              ) : events.map(ev => (
                <div key={ev.id} className='event-card'>
                  <div className='event-card__body'>
                    <div className='event-card__meta'>
                      <span className='event-card__title'>{ev.title}</span>
                      {ev.category && <span className='badge badge--gray'>{ev.category}</span>}
                      {statusBadge(ev.status)}
                    </div>
                    <div className='event-card__desc'>{ev.description}</div>
                    <div className='event-card__info'>
                      <span className='event-card__info-item'>Date: <span>{ev.date}</span></span>
                      <span className='event-card__info-item'>Time: <span>{ev.time || 'TBD'}</span></span>
                      <span className='event-card__info-item'>Venue: <span>{ev.venue}</span></span>
                      <span className='event-card__info-item'>Registered: <span>{regsMap[ev.id]?.length || 0}{ev.capacity ? `/${ev.capacity}` : ''}</span></span>
                    </div>
                  </div>
                  <div className='event-card__actions'>
                    <button className='btn btn--ghost btn--sm' onClick={() => startEdit(ev)}>Edit</button>
                    <button className='btn btn--danger btn--sm' onClick={() => deleteEvent(ev.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CREATE EVENT ── */}
          {active === 'Create Event' && (
            <div style={{ maxWidth: 600 }}>
              <div className='card' style={{ padding: '1.75rem' }}>
                <div className='section-title' style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Event' : 'Create New Event'}</div>
                <form onSubmit={saveEvent}>
                  <div className='form-group'>
                    <label className='form-label'>Event Title</label>
                    <input 
                      className='form-input' 
                      value={form.title} 
                      onChange={set('title')} 
                      placeholder='e.g. Annual Tech Fest 2025' 
                      required 
                    />
                  </div>
                  
                  <div className='grid-2'>
                    <div className='form-group'>
                      <label className='form-label'>Date (must be in future)</label>
                      <input 
                        className='form-input' 
                        type='date' 
                        value={form.date} 
                        onChange={set('date')} 
                        min={getTomorrowDate()}
                        required 
                      />
                      <small style={{ color: 'var(--text-4)', fontSize: 11 }}>
                        Must be tomorrow or later
                      </small>
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Time</label>
                      <input 
                        className='form-input' 
                        type='time' 
                        value={form.time} 
                        onChange={set('time')} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className='grid-2'>
                    <div className='form-group'>
                      <label className='form-label'>Category</label>
                      <select 
                        className='form-input form-select' 
                        value={form.category} 
                        onChange={set('category')}
                      >
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Venue</label>
                      <input 
                        className='form-input' 
                        value={form.venue} 
                        onChange={set('venue')} 
                        placeholder='e.g. Main Auditorium' 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className='form-group'>
                    <label className='form-label'>Capacity (optional)</label>
                    <input 
                      className='form-input' 
                      type='number' 
                      value={form.capacity} 
                      onChange={set('capacity')} 
                      placeholder='Max attendees' 
                      min={1} 
                    />
                  </div>
                  
                  <div className='form-group'>
                    <label className='form-label'>Description</label>
                    <textarea 
                      className='form-input form-textarea' 
                      value={form.description} 
                      onChange={set('description')} 
                      placeholder='Describe the event in detail...' 
                      required 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type='submit' className='btn btn--primary btn--lg' style={{ flex: 1 }}>
                      {editId ? 'Update Event' : 'Submit for Approval'}
                    </button>
                    {editId && (
                      <button 
                        type='button' 
                        className='btn btn--ghost btn--lg' 
                        onClick={() => { setForm(EMPTY); setEditId(null) }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── REGISTRATIONS ── */}
          {active === 'Registrations' && (
            <div>
              {events.length === 0 ? (
                <div className='card'><div className='empty'>
                  <div className='empty__title'>No events yet</div>
                  <div className='empty__desc'>Create events to see their registrations here.</div>
                </div></div>
              ) : events.map(ev => {
                const regs = regsMap[ev.id] || []
                return (
                  <div key={ev.id} className='card' style={{ marginBottom: 12 }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{ev.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 10 }}>{ev.date}</span>
                      </div>
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>{regs.length} registered</span>
                    </div>
                    {regs.length === 0 ? (
                      <p style={{ padding: '1rem 1.25rem', fontSize: 12, color: 'var(--text-4)' }}>No registrations yet.</p>
                    ) : (
                      <table className='table' style={{ width: '100%' }}>
                        <thead>
                          <tr><th>Student Name</th><th>Email</th><th>Registered On</th></tr>
                        </thead>
                        <tbody>
                          {regs.map((r, i) => (
                            <tr key={i}>
                              <td style={{ color: 'var(--text)' }}>{r.studentName || r.student_name || '—'}</td>
                              <td>{r.studentEmail || r.student_email || '—'}</td>
                              <td style={{ fontSize: 11 }}>{r.registeredAt || r.registered_at ? new Date(r.registeredAt || r.registered_at).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {active === 'Feedback' && (
            <div>
              {!myFeedbacks || myFeedbacks.length === 0 ? (
                <div className='card'>
                  <div className='empty'>
                    <div className='empty__title'>No feedback yet</div>
                    <div className='empty__desc'>Students will submit feedback after your events.</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className='stat-grid' style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
                    <div className='card stat-card card--accent-amber'>
                      <div className='stat-card__label'>Average Rating</div>
                      <div className='stat-card__value'>{(myFeedbacks.reduce((s,f)=>s+f.rating,0)/myFeedbacks.length).toFixed(1)}</div>
                      <div className='stat-card__sub'>Out of 5</div>
                    </div>
                    <div className='card stat-card card--accent-green'>
                      <div className='stat-card__label'>Total Reviews</div>
                      <div className='stat-card__value'>{myFeedbacks.length}</div>
                      <div className='stat-card__sub'>From students</div>
                    </div>
                    <div className='card stat-card card--accent-blue'>
                      <div className='stat-card__label'>5-Star Reviews</div>
                      <div className='stat-card__value'>{myFeedbacks.filter(f=>f.rating===5).length}</div>
                      <div className='stat-card__sub'>Excellent ratings</div>
                    </div>
                  </div>

                  {myFeedbacks.map((f, i) => {
                    const ev = events.find(e => e.id === (f.eventId || f.event_id))
                    return (
                      <div key={i} className='card' style={{ padding: '1.25rem', marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div>
                            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{f.studentName || f.student_name || 'Student'}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>on {ev?.title || '—'}</span>
                          </div>
                          <div>
                            <span className='stars'>{'★'.repeat(f.rating)}</span>
                            <span className='stars-empty'>{'★'.repeat(5-f.rating)}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: f.suggestion ? 8 : 0 }}>{f.review}</p>
                        {f.suggestion && <p style={{ fontSize: 12, color: 'var(--text-4)', fontStyle: 'italic' }}>Suggestion: {f.suggestion}</p>}
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
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {(u.fullName?.[0] || 'O').toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 4 }}>{u.fullName}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{u.email}</p>
                  <span className='badge badge--purple'>Organizer</span>
                </div>
              </div>
              <div className='card' style={{ padding: '1.25rem' }}>
                {[
                  ['Full Name', u.fullName],
                  ['Email Address', u.email],
                  ['Role', 'Event Organizer'],
                  ['Events Created', events.length],
                  ['Total Registrations', totalRegs],
                  ['Feedback Received', myFeedbacks.length],
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