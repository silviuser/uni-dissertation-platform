import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/actions/authActions';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import apiService from '../services/apiService';
import authService from '../services/authService';

const ProfessorProfile = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('profile');
  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    department: user.department || '',
    email: user.email || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getProfessorById(user.id);
        setProfile({
          fullName: data.fullName || '',
          department: data.department || '',
          email: data.email || ''
        });
      } catch (err) {
        console.error('Eroare la încărcare profil', err);
      }
    };
    load();
  }, [user.id]);

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await apiService.updateProfessorProfile(user.id, {
        fullName: profile.fullName,
        department: profile.department
      });

      // Update local storage user info
      const current = authService.getCurrentUser();
      if (current) {
        const newUser = { ...current, user: { ...current.user, ...updated } };
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      alert('Profil actualizat cu succes');
    } catch (err) {
      console.error('Eroare la actualizare profil', err);
      const message = err?.response?.data?.message || 'Eroare la actualizare profil';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/professor');
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Edit Profile" user={user} />
      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} onNavigate={(key) => {
          setActiveSidebarItem(key);
          if (key === 'profile') navigate('/professor/profile');
          if (key === 'dashboard') navigate('/professor');
        }} active={activeSidebarItem} />
        <section className="content">
          <div className="breadcrumbs"><span className="crumb">Home</span><span className="sep">/</span><span className="crumb">Profile</span></div>
          <h1 className="login-title">Edit Profile</h1>
          <p className="login-subtitle">Manage your professional information and research profile.</p>

          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-xl">{profile.fullName?.[0] || 'P'}</div>
              <div>
                <div className="profile-title">{profile.fullName || 'Professor'}</div>
                <div className="profile-role">Academic Professor</div>
                <div className="profile-id">ID: {user.id?.slice(0, 8)}</div>
                <button className="link-btn" style={{ marginTop: 6 }} disabled>Change Profile Photo</button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-row">
                <div className="form-item">
                  <label htmlFor="fullName" style={{ fontWeight: 500, marginBottom: 8 }}>Full Name</label>
                  <div className="input-wrap">
                    <input 
                      id="fullName"
                      type="text" 
                      className="input" 
                      value={profile.fullName}
                      onChange={handleChange('fullName')}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-item">
                  <label htmlFor="department" style={{ fontWeight: 500, marginBottom: 8 }}>Department</label>
                  <div className="input-wrap">
                    <input 
                      id="department"
                      type="text" 
                      className="input" 
                      value={profile.department}
                      onChange={handleChange('department')}
                      placeholder="Enter your department"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-item">
                  <label htmlFor="email" style={{ fontWeight: 500, marginBottom: 8 }}>Email Address</label>
                  <div className="input-wrap">
                    <input 
                      id="email"
                      type="email" 
                      className="input" 
                      value={profile.email}
                      disabled
                      placeholder="Your email"
                    />
                    <span className="input-lock">🔒</span>
                  </div>
                  <small style={{ display: 'block', marginTop: 8, color: '#666' }}>Email cannot be changed</small>
                </div>
              </div>
            </div>

            <div className="actions">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="primary-btn"
                style={{ 
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancel}
                className="secondary-btn"
                disabled={saving}
                style={{ 
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessorProfile;
