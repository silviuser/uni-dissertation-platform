import React from 'react';

const Sidebar = ({ open, onClose, onNavigate, user, onLogout, active = 'dashboard' }) => {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="avatar-lg">{user?.fullName?.[0] || 'S'}</div>
        <div className="sidebar-user">
          <div className="name">{user?.fullName || user?.email}</div>
          <div className="role">{user?.role === 'PROFESSOR' ? 'Professor' : 'Student'}</div>
        </div>
        <button className="sidebar-close" aria-label="Close menu" onClick={onClose}>✕</button>
      </div>

      <nav className="sidebar-nav">
        <button className={`nav-item ${active === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate?.('dashboard')}>
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </button>
        <button className={`nav-item ${active === 'profile' ? 'active' : ''}`} onClick={() => onNavigate?.('profile')}>
          <span className="nav-icon">👤</span>
          <span>Profil</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item danger" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
};

export default Sidebar;
