import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/tasks', icon: '📋', label: 'My Tasks' },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>⚡ TaskFlow AI</h2>
        <span>AI Powered</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)',
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 4 }}>v2.0 — AI Powered</div>
          AI Analysis · Async Processing · JWT Auth · RBAC
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Member'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">↪</button>
        </div>
      </div>
    </aside>
  );
}
