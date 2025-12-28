import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import apiService from '../services/apiService';
import authService from '../services/authService';

const StudentProfile = ({ user }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    faculty: user.faculty || '',
    specialization: user.specialization || '',
    group: user.group || '',
    email: user.email || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getStudentById(user.id);
        setProfile({
          fullName: data.fullName || '',
          faculty: data.faculty || '',
          specialization: data.specialization || '',
          group: data.group || '',
          email: data.email || ''
        });
      } catch (err) {
        console.error('Eroare la încărcare profil', err);
      }
    };
    load();
  }, [user.id]);

  const onLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const onNavigate = (key) => {
    if (key === 'dashboard') navigate('/student');
    if (key === 'profile') navigate('/student/profile');
  };

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await apiService.updateStudentProfile(user.id, {
        fullName: profile.fullName,
        faculty: profile.faculty,
        specialization: profile.specialization,
        group: profile.group
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
    navigate('/student');
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Edit Profile" user={user} />
      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} onNavigate={onNavigate} active={'profile'} />
        <section className="content">
          <div className="breadcrumbs"><span className="crumb">Home</span><span className="sep">/</span><span className="crumb">Profile</span></div>
          <h1 className="login-title">Edit Profile</h1>
          <p className="login-subtitle">Manage your personal and academic information for your thesis application.</p>

          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-xl">{profile.fullName?.[0] || 'S'}</div>
              <div>
                <div className="profile-title">{profile.fullName || 'Student'}</div>
                <div className="profile-role">Computer Science Student</div>
                <div className="profile-id">ID: {user.id?.slice(0, 8)}</div>
                <button className="link-btn" style={{ marginTop: 6 }} disabled>Change Profile Photo</button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-item">
                <label>Nume Prenume</label>
                <div className="input-wrap">
                  <input className="input" type="text" value={profile.fullName} onChange={handleChange('fullName')} />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-item full">
                <label>Facultate</label>
                <input className="input" type="text" value={profile.faculty} onChange={handleChange('faculty')} />
              </div>

              <div className="form-row">
                <div className="form-item">
                  <label>Specializare</label>
                  <input className="input" type="text" value={profile.specialization} onChange={handleChange('specialization')} />
                </div>
                <div className="form-item">
                  <label>Grupa</label>
                  <input className="input" type="text" value={profile.group} onChange={handleChange('group')} />
                </div>
              </div>

              <div className="form-item full">
                <label>Institutional Email (Read-only)</label>
                <div className="input-wrap">
                  <input className="input" type="email" value={profile.email} readOnly />
                  <span className="input-lock">🔒</span>
                </div>
              </div>
            </div>

            <div className="actions">
              <button className="secondary-btn" onClick={handleCancel}>Cancel</button>
              <button className="primary-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;
