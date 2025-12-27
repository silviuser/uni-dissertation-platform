import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../App.css'; // Putem folosi stilurile globale sau un CSS dedicat

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STUDENT' // Rolul implicit
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const { email, password, role } = formData;

  // Verifică la montare dacă utilizatorul este deja logat
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setShowLogoutConfirm(true);
    }
  }, []);

  // Gestionează logout-ul și permite login nou
  const handleLogout = () => {
    authService.logout();
    setShowLogoutConfirm(false);
    if (onLogin) {
      onLogin(null); // Notifică App.js că utilizatorul s-a delogat
    }
  };

  // Redirecționează la dashboard dacă utilizatorul decide să rămână logat
  const handleStayLoggedIn = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role === 'PROFESSOR') {
      navigate('/professor');
    } else if (currentUser && currentUser.role === 'STUDENT') {
      navigate('/student');
    }
  };

  // Actualizează starea când utilizatorul scrie în inputuri
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Gestionarea trimiterii formularului
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Apelăm serviciul de login
      const data = await authService.login(email, password, role);
      
      // Notificăm componenta părinte (App.js) că login-ul a reușit
      // `data` conține { token, id, email, role, ... }
      if (onLogin) {
        onLogin(data);
      }

      // Redirecționăm utilizatorul în funcție de rol
      if (data.role === 'PROFESSOR') {
        navigate('/professor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dacă utilizatorul este deja logat, afișează confirmarea de logout
  if (showLogoutConfirm) {
    return (
      <div className="login-container" style={styles.container}>
        <div className="login-card" style={styles.card}>
          <h2 style={styles.title}>Ești deja autentificat</h2>
          <p style={styles.confirmText}>
            Ești deja logat în sistem. Dorești să te deloghezi pentru a te autentifica cu alt cont?
          </p>
          <div style={styles.buttonGroup}>
            <button 
              onClick={handleLogout} 
              style={{ ...styles.button, ...styles.logoutButton }}
            >
              Deloghează-mă
            </button>
            <button 
              onClick={handleStayLoggedIn} 
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Rămâi logat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={styles.container}>
      <div className="login-card" style={styles.card}>
        <h2 style={styles.title}>Autentificare Platformă Disertație</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={onSubmit}>
          {/* Selector Rol */}
          <div className="form-group" style={styles.inputGroup}>
            <label style={styles.label}>Autentificare ca:</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === 'STUDENT'}
                  onChange={onChange}
                />
                Student
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="PROFESSOR"
                  checked={role === 'PROFESSOR'}
                  onChange={onChange}
                />
                Profesor
              </label>
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              style={styles.input}
              placeholder="ex: student@facultate.ro"
            />
          </div>

          {/* Parolă */}
          <div className="form-group" style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Parolă</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              style={styles.input}
              placeholder="******"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Se încarcă...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Stiluri simple inline pentru a arăta decent rapid (poți muta în CSS)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box', // Important pentru padding
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  radioLabel: {
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.5rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  confirmText: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#555',
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
  },
};

export default Login;