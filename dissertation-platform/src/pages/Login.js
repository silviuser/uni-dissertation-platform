import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      setError(message || 'Login failed');
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
            <h2 className="login-title">Esti deja autentificat</h2>
            <p className="login-subtitle">Doresti sa te deloghezi pentru a folosi alt cont?</p>
            <div className="action-row">
              <button className="btn ghost" type="button" onClick={handleStayLoggedIn}>Ramai logat</button>
              <button className="btn primary" type="button" onClick={handleLogout}>Delogheaza-ma</button>
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
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Please enter your details to sign in.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

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
              Professor
            </button>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="form-label" htmlFor="email">Institutional Email or Username</label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="e.g. s123456@university.edu"
              required
            />

            <label className="form-label" htmlFor="password">Password</label>
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
              <a className="link subtle" href="#">Forgot password?</a>
            </div>

            <button className="btn primary full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <p className="footer-note">
            Do not have an account? <a className="link" href="#">Register now</a>
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
      <h2 className="hero-title">Streamline Your Academic Journey</h2>
      <p className="hero-text">
        The centralized platform for managing thesis requests, approvals, and tracking for students and faculty members.
      </p>
      <div className="hero-features">
        <span>Secure Access</span>
        <span>Real-time Updates</span>
      </div>
    </div>
  </div>
);

export default Login;