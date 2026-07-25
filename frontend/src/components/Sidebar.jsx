import { useNavigate } from 'react-router-dom';

const Sidebar = ({ tabs, active, setActive, user, stats, role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const badgeClass = `sidebar__user-badge sidebar__user-badge--${role}`;

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">
          <span>EM</span>
        </div>
        <div>
          <div className="sidebar__logo-text">EventManage</div>
          <div className="sidebar__logo-sub">{role} portal</div>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">
          {user?.profilePhoto
            ? <img src={user.profilePhoto} alt="" />
            : (user?.fullName?.[0] || 'U').toUpperCase()
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar__user-name">{user?.fullName || 'User'}</div>
          <span className={badgeClass}>{role}</span>
        </div>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="sidebar__stats">
          {stats.map(([label, val]) => (
            <div key={label} className="sidebar__stat">
              <div className="sidebar__stat-val">{val}</div>
              <div className="sidebar__stat-lbl">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__section-label">Navigation</div>
        {tabs && tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`sidebar__btn${active === tab ? ' active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar__footer">
        <button className="sidebar__signout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;