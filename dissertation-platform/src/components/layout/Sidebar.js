import React, { useState } from 'react';

const Sidebar = ({ open, onClose, onNavigate, user, onLogout, active = 'dashboard' }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="avatar-lg">{user?.fullName?.[0] || 'S'}</div>
          <div className="sidebar-user">
            <div className="name">{user?.fullName || user?.email}</div>
            <div className="role">{user?.role === 'PROFESSOR' ? 'Profesor' : 'Student'}</div>
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
          <button className="nav-item danger" onClick={handleLogoutClick}>Deconectare</button>
        </div>
      </aside>

      {/* Modal de confirmare logout */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Confirmare Deconectare</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              Ești sigur că vrei să te deconectezi din cont?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelLogout}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmLogout}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Deconectează-mă
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
