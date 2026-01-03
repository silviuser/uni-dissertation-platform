import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const API_URL = "https://dissertation-platform-api-gshqgae2c0fcc2ar.spaincentral-01.azurewebsites.net/api";

const Register = () => {
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    // Student fields
    faculty: '',
    specialization: '',
    group: '',
    // Professor fields
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password, confirmPassword, fullName, faculty, specialization, group, department } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const validateForm = () => {
    if (!email || !password || !fullName) {
      setError('Email, parolă și nume complet sunt obligatorii');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Parolele nu coincid');
      return false;
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere');
      return false;
    }

    if (role === 'STUDENT') {
      if (!faculty || !specialization || !group) {
        setError('Facultatea, specializarea și grupa sunt obligatorii pentru studenți');
        return false;
      }
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = role === 'STUDENT' ? `${API_URL}/students` : `${API_URL}/professors`;
      
      const payload = role === 'STUDENT' 
        ? { email, password, fullName, faculty, specialization, group }
        : { email, password, fullName, department };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la înregistrare');
      }

      setSuccess('Cont creat cu succes! Vei fi redirecționat către pagina de autentificare...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Eroare la înregistrare');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-form-panel" style={{ overflowY: 'auto' }}>
        <div className="login-form-box">
          <div className="brand-row">
            <div className="brand-mark">TP</div>
            <span className="brand-name">ThesisPortal</span>
          </div>

          <div className="welcome-copy">
            <h1 className="login-title">Creează un cont</h1>
            <p className="login-subtitle">Completează datele pentru a te înregistra.</p>
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success" style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>{success}</div>}

          <div className="role-toggle" role="group" aria-label="Select role">
            <button
              type="button"
              className={`toggle-btn ${role === 'STUDENT' ? 'active' : ''}`}
              onClick={() => handleRoleChange('STUDENT')}
            >
              Student
            </button>
            <button
              type="button"
              className={`toggle-btn ${role === 'PROFESSOR' ? 'active' : ''}`}
              onClick={() => handleRoleChange('PROFESSOR')}
            >
              Profesor
            </button>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="form-label" htmlFor="fullName">Nume Complet</label>
            <input
              className="form-input"
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={onChange}
              placeholder="ex: Ion Popescu"
              required
            />

            <label className="form-label" htmlFor="email">Email Instituțional</label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="ex: ion.popescu@university.edu"
              required
            />

            <label className="form-label" htmlFor="password">Parolă</label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Minim 6 caractere"
              required
            />

            <label className="form-label" htmlFor="confirmPassword">Confirmă Parola</label>
            <input
              className="form-input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Repetă parola"
              required
            />

            {role === 'STUDENT' && (
              <>
                <label className="form-label" htmlFor="faculty">Facultate</label>
                <input
                  className="form-input"
                  type="text"
                  id="faculty"
                  name="faculty"
                  value={faculty}
                  onChange={onChange}
                  placeholder="ex: Facultatea de Informatică"
                  required
                />

                <label className="form-label" htmlFor="specialization">Specializare</label>
                <input
                  className="form-input"
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={specialization}
                  onChange={onChange}
                  placeholder="ex: Informatică"
                  required
                />

                <label className="form-label" htmlFor="group">Grupa</label>
                <input
                  className="form-input"
                  type="text"
                  id="group"
                  name="group"
                  value={group}
                  onChange={onChange}
                  placeholder="ex: 1234"
                  required
                />
              </>
            )}

            {role === 'PROFESSOR' && (
              <>
                <label className="form-label" htmlFor="department">Departament</label>
                <input
                  className="form-input"
                  type="text"
                  id="department"
                  name="department"
                  value={department}
                  onChange={onChange}
                  placeholder="ex: Departamentul de Informatică"
                />
              </>
            )}

            <button className="btn primary full" type="submit" disabled={isLoading} style={{ marginTop: '16px' }}>
              {isLoading ? 'Se creează contul...' : 'Înregistrează-te'}
            </button>
          </form>

          <p className="footer-note">
            Ai deja un cont? <Link className="link" to="/login">Autentifică-te</Link>
          </p>
        </div>
      </div>
      <HeroPanel />
    </div>
  );
};

const HeroPanel = () => (
  <div className="login-hero">
    <div className="hero-overlay" />
    <div className="hero-content">
      <div className="hero-icon">🎓</div>
      <h2 className="hero-title">Alătură-te Comunității Academice</h2>
      <p className="hero-text">
        Creează-ți contul pentru a accesa platforma de gestionare a lucrărilor de licență.
      </p>
      <div className="hero-features">
        <span>Înregistrare Rapidă</span>
        <span>Acces Securizat</span>
      </div>
    </div>
  </div>
);

export default Register;
