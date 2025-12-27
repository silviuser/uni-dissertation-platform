import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ProfessorDashboard = ({ user, onLogout }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionRequests, setSelectedSessionRequests] = useState(null); // null sau array
  const [activeSessionId, setActiveSessionId] = useState(null); // ID-ul sesiunii expandate
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state pentru creare sesiune
  const [newSession, setNewSession] = useState({
    startTime: '',
    endTime: '',
    maxSpots: 5
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await apiService.getProfessorSessions(user.id);
      setSessions(data);
    } catch (err) {
      console.error("Eroare la încărcare sesiuni", err);
    }
  };

  // Gestionare Formular Creare
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await apiService.createSession({
        ...newSession,
        professorId: user.id
      });
      setMessage({ type: 'success', text: 'Sesiune creată cu succes!' });
      setShowCreateForm(false);
      loadSessions(); // Reîmprospătăm lista
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la creare sesiune' });
    }
  };

  // Gestionare Vizualizare Cereri pentru o Sesiune
  const handleViewRequests = async (sessionId) => {
    if (activeSessionId === sessionId) {
      // Dacă e deja deschisă, o închidem
      setActiveSessionId(null);
      setSelectedSessionRequests(null);
      return;
    }

    try {
      setActiveSessionId(sessionId);
      const requests = await apiService.getSessionRequests(sessionId);
      setSelectedSessionRequests(requests);
    } catch (err) {
      console.error(err);
    }
  };

  // Gestionare Aprobare/Respingere
  const handleRequestAction = async (requestId, status) => {
    let reason = null;
    if (status === 'REJECTED') {
      reason = prompt("Motivul respingerii (obligatoriu):");
      if (!reason) return; // Dacă dă cancel, nu facem nimic
    }

    try {
      await apiService.updateRequestStatus(requestId, status, reason);
      // Reîncărcăm cererile pentru a vedea statusul actualizat
      const updatedRequests = await apiService.getSessionRequests(activeSessionId);
      setSelectedSessionRequests(updatedRequests);
      setMessage({ type: 'success', text: `Cerere ${status === 'APPROVED' ? 'aprobată' : 'respinsă'}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la actualizare' });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>👨‍🏫 Panou Profesor</h2>
          <p>Prof. <strong>{user.fullName || user.email}</strong></p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Deconectare</button>
      </header>

      {/* Mesaje */}
      {message.text && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
          color: message.type === 'error' ? '#721c24' : '#155724'
        }}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
        </div>
      )}

      {/* Buton Toggle Formular */}
      <button 
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={styles.primaryBtn}
      >
        {showCreateForm ? 'Anulează Crearea' : '+ Creează Sesiune Nouă'}
      </button>

      {/* Formular Creare Sesiune */}
      {showCreateForm && (
        <div style={styles.formContainer}>
          <h3>Detalii Sesiune Nouă</h3>
          <form onSubmit={handleCreateSession}>
            <div style={styles.inputGroup}>
              <label>Început:</label>
              <input 
                type="datetime-local" 
                required
                value={newSession.startTime}
                onChange={e => setNewSession({...newSession, startTime: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Sfârșit:</label>
              <input 
                type="datetime-local" 
                required
                value={newSession.endTime}
                onChange={e => setNewSession({...newSession, endTime: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Număr Locuri:</label>
              <input 
                type="number" 
                min="1"
                required
                value={newSession.maxSpots}
                onChange={e => setNewSession({...newSession, maxSpots: e.target.value})}
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.successBtn}>Salvează Sesiunea</button>
          </form>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {/* Lista Sesiuni */}
      <h3>Sesiunile Mele de Înscriere</h3>
      {sessions.length === 0 ? <p>Nu aveți nicio sesiune creată.</p> : (
        <div style={styles.grid}>
          {sessions.map(session => (
            <div key={session.id} style={{ ...styles.card, border: activeSessionId === session.id ? '2px solid #007bff' : '1px solid #ddd' }}>
              <h4>Sesiune #{session.id.toString().slice(0, 4)}...</h4>
              <p><strong>Perioada:</strong> {new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleDateString()}</p>
              <p><strong>Locuri:</strong> {session.maxSpots}</p>
              
              <button 
                onClick={() => handleViewRequests(session.id)}
                style={styles.outlineBtn}
              >
                {activeSessionId === session.id ? 'Ascunde Cereri' : 'Vezi Cereri'}
              </button>

              {/* Zona Cereri (Expandată) */}
              {activeSessionId === session.id && selectedSessionRequests && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <h5>Cereri Studenți ({selectedSessionRequests.length})</h5>
                  {selectedSessionRequests.length === 0 ? <p style={{ fontSize: '0.9rem' }}>Nicio cerere.</p> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {selectedSessionRequests.map(req => (
                        <li key={req.id} style={styles.requestItem}>
                          <div>
                            <strong>Student ID:</strong> {req.studentId} <br/>
                            <span style={getStatusStyle(req.status)}>{req.status}</span>
                          </div>
                          {req.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                              <button onClick={() => handleRequestAction(req.id, 'APPROVED')} style={styles.smallBtnApprove}>✓</button>
                              <button onClick={() => handleRequestAction(req.id, 'REJECTED')} style={styles.smallBtnReject}>X</button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STILURI (CSS-in-JS) ---
const styles = {
  logoutBtn: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  primaryBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' },
  successBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  outlineBtn: { backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', width: '100%' },
  
  formContainer: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', maxWidth: '500px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  requestItem: { backgroundColor: '#f1f1f1', padding: '8px', borderRadius: '4px', marginBottom: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  smallBtnApprove: { backgroundColor: '#28a745', color: 'white', border: 'none', width: '25px', height: '25px', borderRadius: '50%', cursor: 'pointer' },
  smallBtnReject: { backgroundColor: '#dc3545', color: 'white', border: 'none', width: '25px', height: '25px', borderRadius: '50%', cursor: 'pointer' }
};

const getStatusStyle = (status) => {
  const base = { fontSize: '0.8rem', fontWeight: 'bold' };
  if (status === 'APPROVED') return { ...base, color: '#28a745' };
  if (status === 'REJECTED') return { ...base, color: '#dc3545' };
  return { ...base, color: '#856404' };
};

export default ProfessorDashboard;