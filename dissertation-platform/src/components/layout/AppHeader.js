import React from 'react';

const AppHeader = ({ onMenuClick, title = 'Student Dashboard', user, onLogout }) => {
  return (
    <header className="app-header">
      <button className="menu-button" aria-label="Open menu" onClick={onMenuClick}>
        <span className="menu-line" />
        <span className="menu-line" />
        <span className="menu-line" />
      </button>
      <div className="brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-title">{title}</span>
      </div>
      <div className="header-actions">
        {user && (
          <div className="user-chip">
            <div className="avatar" aria-hidden> {user.fullName?.[0] || 'S'} </div>
            <div className="user-meta">
              <div className="user-name">{user.fullName || user.email}</div>
              <div className="user-role">{user.role === 'PROFESSOR' ? 'Professor' : 'Student'}</div>
            </div>
          </div>
        )}
        {onLogout && (
          <button className="btn ghost" onClick={onLogout}>Log out</button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
