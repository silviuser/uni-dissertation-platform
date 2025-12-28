import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import apiService from '../services/apiService';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';

const ProfessorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionRequests, setSelectedSessionRequests] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingTeacherFile, setUploadingTeacherFile] = useState(null);
  const [teacherFileMap, setTeacherFileMap] = useState({});

  // Download handlers
  const handleDownloadStudentFile = async (requestId) => {
    try {
      const url = apiService.downloadStudentFile(requestId);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `student-request-${requestId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  const handleDownloadTeacherFile = async (requestId) => {
    try {
      const url = apiService.downloadTeacherFile(requestId);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `teacher-signed-${requestId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };
  
  // Form state pentru criere sesiune
  const [newSession, setNewSession] = useState({
    startTime: '',
    endTime: '',
    maxSpots: 5,
    universitySessionId: ''
  });

  const [universitySessions, setUniversitySessions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSessions();
    loadUniversitySessions();
  }, []);

  const loadUniversitySessions = async () => {
    try {
      const data = await apiService.getUniversitySessions();
      setUniversitySessions(data);
    } catch (err) {
      console.error("Eroare la încărcare sesiuni universitare", err);
    }
  };

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

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
      if (!reason) return;
    }

    try {
      await apiService.updateRequestStatus(requestId, status, reason);
      const updatedRequests = await apiService.getSessionRequests(activeSessionId);
      setSelectedSessionRequests(updatedRequests);
      setMessage({ type: 'success', text: `Cerere ${status === 'APPROVED' ? 'aprobată' : 'respinsă'}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la actualizare' });
    }
  };

  const handleUploadTeacherFile = async (requestId) => {
    const fileInput = document.getElementById(`teacher-file-${requestId}`);
    if (!fileInput?.files[0]) {
      alert('Selectează un fișier PDF');
      return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
      alert('Doar fișierele PDF sunt acceptate');
      return;
    }

    try {
      setUploadingTeacherFile(requestId);
      const formData = new FormData();
      formData.append('file', file);
      await apiService.uploadTeacherFile(requestId, formData);
      
      const updatedRequests = await apiService.getSessionRequests(activeSessionId);
      setSelectedSessionRequests(updatedRequests);
      setTeacherFileMap(prev => ({ ...prev, [requestId]: null }));
      setMessage({ type: 'success', text: 'Fișierul semnat a fost încărcat cu succes!' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Eroare la upload';
      setMessage({ type: 'error', text: message });
    } finally {
      setUploadingTeacherFile(null);
    }
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Professor Dashboard" user={user} />

      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} />
        <section className="content">
          <h1 className="login-title">Welcome back, {user.fullName?.split(' ')[0] || 'Professor'}</h1>
          <p className="login-subtitle">Manage your thesis sessions and review student applications.</p>

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
            <div style={styles.inputGroup}>
              <label>University Session:</label>
              <select 
                required
                value={newSession.universitySessionId}
                onChange={e => setNewSession({...newSession, universitySessionId: e.target.value})}
                style={styles.input}
              >
                <option value="">Select University Session</option>
                {universitySessions.map(us => (
                  <option key={us.id} value={us.id}>{us.name}</option>
                ))}
              </select>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedSessionRequests.map(req => (
                        <div key={req.id} style={{ ...styles.requestCard, backgroundColor: req.status === 'APPROVED' ? '#f0f8ff' : '#fff' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Student ID:</strong> {req.studentId.slice(0, 8)}... <br/>
                            <span style={getStatusStyle(req.status)}>{req.status}</span>
                          </div>

                          {req.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                              <button onClick={() => handleRequestAction(req.id, 'APPROVED')} style={styles.smallBtnApprove}>✓ Aprobă</button>
                              <button onClick={() => handleRequestAction(req.id, 'REJECTED')} style={styles.smallBtnReject}>X Respinge</button>
                            </div>
                          )}

                          {req.status === 'APPROVED' && (
                            <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                              {req.studentFile ? (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong>📄 Cerere Student:</strong>
                                  <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button onClick={() => handleDownloadStudentFile(req.id)} style={styles.downloadLink}>
                                      Descarcă
                                    </button>
                                    <span style={{ fontSize: '12px', color: '#666' }}>Încarcată de student</span>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '12px', color: '#dc3545', marginBottom: '8px' }}>
                                  ⏳ În așteptare ca studentul să încarce cererea...
                                </div>
                              )}

                              {req.studentFile && (
                                <div style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                                  {req.teacherFile ? (
                                    <div>
                                      <strong>✓ Fișier Semnat Încărcat</strong>
                                      <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button onClick={() => handleDownloadTeacherFile(req.id)} style={styles.downloadLink}>
                                          Descarcă Copie
                                        </button>
                                        <span style={{ fontSize: '12px', color: '#28a745' }}>✓ Semnat</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <strong>Încarc Cererea Semnată:</strong>
                                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        <input
                                          id={`teacher-file-${req.id}`}
                                          type="file"
                                          accept="application/pdf"
                                          style={{ fontSize: '12px', flex: 1, minWidth: '150px' }}
                                        />
                                        <button
                                          onClick={() => handleUploadTeacherFile(req.id)}
                                          disabled={uploadingTeacherFile === req.id}
                                          style={styles.uploadBtn}
                                        >
                                          {uploadingTeacherFile === req.id ? 'Se încarcă...' : 'Încarc'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
        </section>
      </main>
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
  
  requestCard: { backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #ddd' },
  smallBtnApprove: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  smallBtnReject: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  downloadLink: { padding: '4px 8px', backgroundColor: '#0066cc', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' },
  uploadBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

const getStatusStyle = (status) => {
  const base = { fontSize: '0.8rem', fontWeight: 'bold' };
  if (status === 'APPROVED') return { ...base, color: '#28a745' };
  if (status === 'REJECTED') return { ...base, color: '#dc3545' };
  return { ...base, color: '#856404' };
};

export default ProfessorDashboard;