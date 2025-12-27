import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const StudentDashboard = ({ user, onLogout }) => {
  const [sessions, setSessions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' sau 'requests'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Încărcăm datele la montarea componentei
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Luăm toate sesiunile
      const sessionsData = await apiService.getSessions();
      setSessions(sessionsData);

      // 2. Luăm cererile studentului curent
      const requestsData = await apiService.getStudentRequests(user.id);
      setMyRequests(requestsData);
    } catch (err) {
      console.error("Eroare la încărcare date", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (sessionId) => {
    try {
      // Verificăm dacă a aplicat deja la această sesiune (frontend check rapid)
      const alreadyApplied = myRequests.some(r => r.sessionId === sessionId);
      if (alreadyApplied) {
        setMessage({ type: 'error', text: 'Ai aplicat deja la această sesiune!' });
        return;
      }

      await apiService.createRequest(user.id, sessionId);
      setMessage({ type: 'success', text: 'Cerere trimisă cu succes!' });
      
      // Reîncărcăm datele pentru a vedea noua cerere în listă
      fetchData();
      setActiveTab('requests'); // Mutăm utilizatorul pe tab-ul cu cereri
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la aplicare' });
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>🎓 Panou Student</h2>
          <p>Bun venit, <strong>{user.fullName || user.email}</strong></p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Deconectare</button>
      </header>

      {/* Mesaje de notificare (Succes/Eroare) */}
      {message.text && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
          color: message.type === 'error' ? '#721c24' : '#155724'
        }}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
        </div>
      )}

      {/* Meniu Tab-uri */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button 
          style={activeTab === 'sessions' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('sessions')}
        >
          Sesiuni Disponibile
        </button>
        <button 
          style={activeTab === 'requests' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('requests')}
        >
          Cererile Mele ({myRequests.length})
        </button>
      </div>

      {loading ? <p>Se încarcă datele...</p> : (
        <div className="tab-content">
          
          {/* TAB 1: LISTA SESIUNI */}
          {activeTab === 'sessions' && (
            <div>
              <h3>Sesiuni de Înscriere Deschise</h3>
              {sessions.length === 0 ? <p>Nu există sesiuni active momentan.</p> : (
                <div style={styles.grid}>
                  {sessions.map(session => (
                    <div key={session.id} style={styles.card}>
                      <h4>Profesor ID: {session.professorId}</h4> 
                      {/* Notă: Ideal ar fi să avem numele profesorului, nu ID-ul. Vom rezolva asta ulterior. */}
                      <p><strong>Interval:</strong> {new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleDateString()}</p>
                      <p><strong>Locuri:</strong> {session.maxSpots}</p>
                      <button 
                        onClick={() => handleApply(session.id)}
                        style={styles.primaryBtn}
                      >
                        Aplică Acum
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LISTA CERERI */}
          {activeTab === 'requests' && (
            <div>
              <h3>Istoricul Cererilor</h3>
              {myRequests.length === 0 ? <p>Nu ai trimis nicio cerere.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Sesiune (ID)</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Dată</th>
                      <th style={{ padding: '10px' }}>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map(req => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{req.sessionId}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={getStatusStyle(req.status)}>{req.status}</span>
                          {req.status === 'REJECTED' && req.rejectionReason && (
                             <div style={{ fontSize: '0.85rem', color: 'red' }}>Motiv: {req.rejectionReason}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>
                          {req.status === 'APPROVED' && (
                            <button style={styles.secondaryBtn}>Încarcă Fișier</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- STILURI DE BAZĂ (CSS-in-JS rapid) ---
const styles = {
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '16px',
    color: '#666'
  },
  activeTab: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid #007bff',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#007bff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  primaryBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  secondaryBtn: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

const getStatusStyle = (status) => {
  const base = { fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' };
  switch (status) {
    case 'APPROVED': return { ...base, backgroundColor: '#d4edda', color: '#155724' };
    case 'REJECTED': return { ...base, backgroundColor: '#f8d7da', color: '#721c24' };
    default: return { ...base, backgroundColor: '#fff3cd', color: '#856404' };
  }
};

export default StudentDashboard;