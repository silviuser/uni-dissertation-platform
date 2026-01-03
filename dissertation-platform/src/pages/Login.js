import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../store/actions/authActions';
import { reset } from '../store/reducers/authReducer';
import authService from '../services/authService';
import '../App.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const { email, password, role } = formData;

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setShowLogoutConfirm(true);
    }
  }, []);

  useEffect(() => {
    if (isError) {
      setError(message || 'Autentificare eșuată');
    }
    if (isSuccess || user) {
      if (user?.role === 'PROFESSOR') navigate('/professor');
      else if (user?.role === 'STUDENT') navigate('/student');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowLogoutConfirm(false);
  };

  const handleStayLoggedIn = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role === 'PROFESSOR') {
      navigate('/professor');
    } else if (currentUser && currentUser.role === 'STUDENT') {
      navigate('/student');
    }
  };

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({ ...prev, role: newRole }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(loginUser({ email, password, role }));
  };

  if (showLogoutConfirm) {
    return (
      <div className="login-shell">
        <div className="login-form-panel">
          <div className="login-form-box">
            <div className="brand-row">
              <div className="brand-mark">TP</div>
              <span className="brand-name">ThesisPortal</span>
            </div>
            <h2 className="login-title">Ești deja autentificat</h2>
            <p className="login-subtitle">Dorești să te deconectezi pentru a folosi alt cont?</p>
            <div className="action-row">
              <button className="btn ghost" type="button" onClick={handleStayLoggedIn}>Rămâi conectat</button>
              <button className="btn primary" type="button" onClick={handleLogout}>Deconectează-mă</button>
            </div>
          </div>
        </div>
        <HeroPanel />
      </div>
    );
  }

  return (
    <div className="login-shell">
      <div className="login-form-panel">
        <div className="login-form-box">
          <div className="brand-row">
            <div className="brand-mark">TP</div>
            <span className="brand-name">ThesisPortal</span>
          </div>

          <div className="welcome-copy">
            <h1 className="login-title">Bine ai revenit</h1>
            <p className="login-subtitle">Introdu datele tale pentru a te autentifica.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <div className="role-toggle" role="group" aria-label="Selectează rolul">
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
              placeholder="••••••••"
              required
            />

            <div className="form-meta">
              <a className="link subtle" href="#">Ai uitat parola?</a>
            </div>

            <button className="btn primary full" type="submit" disabled={isLoading}>
              {isLoading ? 'Se autentifică...' : 'Autentificare'}
            </button>
          </form>

          <p className="footer-note">
            Nu ai un cont? <Link className="link" to="/register">Înregistrează-te</Link>
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
      <h2 className="hero-title">Simplifică-ți Parcursul Academic</h2>
      <p className="hero-text">
        Platforma centralizată pentru gestionarea cererilor de licență, aprobări și urmărirea progresului pentru studenți și profesori.
      </p>
      <div className="hero-features">
        <span>Acces Securizat</span>
        <span>Actualizări în Timp Real</span>
      </div>
    </div>
  </div>
);

export default Login;