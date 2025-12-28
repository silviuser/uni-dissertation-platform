import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/actions/authActions';
import apiService from '../services/apiService';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import ProfessorDashboardOverview from './professor/ProfessorDashboardOverview';
import ProfessorDashboardApprovedStudents from './professor/ProfessorDashboardApprovedStudents';
import ProfessorDashboardMySessions from './professor/ProfessorDashboardMySessions';
import ProfessorDashboardCreateSession from './professor/ProfessorDashboardCreateSession';

const ProfessorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  
  // State pentru cele 3 secțiuni principale
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'approved', 'sessions', 'create'
  const [sessions, setSessions] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [universitySessions, setUniversitySessions] = useState([]);
  
  // State pentru filtrare
  const [selectedUniversitySession, setSelectedUniversitySession] = useState('all');
  
  // State pentru My Sessions
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionRequests, setSessionRequests] = useState({});
  
  // State pentru Create Session
  const [newSession, setNewSession] = useState({
    startTime: '',
    endTime: '',
    maxSpots: 5,
    universitySessionId: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingTeacherFile, setUploadingTeacherFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, approvedData, uniSessionsData] = await Promise.all([
        apiService.getProfessorSessions(user.id),
        apiService.getApprovedStudents(user.id),
        apiService.getUniversitySessions()
      ]);
      
      setSessions(sessionsData);
      setApprovedStudents(approvedData);
      setUniversitySessions(uniSessionsData);
    } catch (err) {
      console.error("Eroare la încărcare date", err);
      setMessage({ type: 'error', text: 'Eroare la încărcare date' });
    }
  };

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // Filtrare approved students după university session
  const getFilteredApprovedStudents = () => {
    if (selectedUniversitySession === 'all') return approvedStudents;
    return approvedStudents.filter(req => {
      const uniSessionId = req.session?.universitySession?.id || req.session?.universitySessionId;
      return String(uniSessionId) === String(selectedUniversitySession);
    });
  };

  // Filtrare sessions după university session
  const getFilteredSessions = () => {
    if (selectedUniversitySession === 'all') return sessions;
    return sessions.filter(session => 
      String(session.universitySessionId) === String(selectedUniversitySession)
    );
  };

  // Grupare după university session
  const groupByUniversitySession = (items) => {
    const grouped = {};
    items.forEach(item => {
      // Determină universitySessionId în funcție de tip de item
      // Pentru sessions: item.universitySessionId
      // Pentru requests: item.session.universitySession.id SAU item.session.universitySessionId
      const uniSessionId = item.universitySessionId || 
                          item.session?.universitySession?.id || 
                          item.session?.universitySessionId;
      
      // Găsește university session-ul din lista pentru a obține name-ul
      const uniSession = universitySessions.find(us => String(us.id) === String(uniSessionId));
      const uniSessionName = uniSession?.name || `Session ${uniSessionId}`;
      
      if (!grouped[uniSessionId]) {
        grouped[uniSessionId] = {
          id: uniSessionId,
          name: uniSessionName,
          items: []
        };
      }
      grouped[uniSessionId].items.push(item);
    });
    return Object.values(grouped);
  };

  // Calculare status student
  const getStudentStatus = (request) => {
    if (request.studentFile && request.teacherFile) {
      return { label: 'Complet', color: '#28a745' };
    }
    if (request.studentFile && !request.teacherFile) {
      return { label: 'Așteaptă semnare profesor', color: '#ffc107' };
    }
    if (!request.studentFile) {
      return { label: 'Așteaptă cerere student', color: '#dc3545' };
    }
    return { label: 'În proces', color: '#6c757d' };
  };

  // Calculare număr studenți aprobați pentru sesiune
  const getApprovedCount = (sessionId) => {
    return approvedStudents.filter(req => req.sessionId === sessionId).length;
  };

  // Handle click pe sesiune - load PENDING requests
  const handleSessionClick = async (sessionId) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    
    try {
      const requests = await apiService.getSessionRequests(sessionId);
      const pendingRequests = requests.filter(req => req.status === 'PENDING');
      setSessionRequests({ ...sessionRequests, [sessionId]: pendingRequests });
      setExpandedSessionId(sessionId);
    } catch (err) {
      console.error("Eroare la încărcare cereri", err);
      setMessage({ type: 'error', text: 'Eroare la încărcare cereri' });
    }
  };

  // Handle approve/reject
  const handleRequestAction = async (requestId, status) => {
    let reason = null;
    if (status === 'REJECTED') {
      reason = prompt("Motivul respingerii (obligatoriu):");
      if (!reason) return;
    }

    try {
      await apiService.updateRequestStatus(requestId, status, reason);
      setMessage({ type: 'success', text: `Cerere ${status === 'APPROVED' ? 'aprobată' : 'respinsă'}!` });
      // Reload data
      await loadData();
      if (expandedSessionId) {
        const requests = await apiService.getSessionRequests(expandedSessionId);
        const pendingRequests = requests.filter(req => req.status === 'PENDING');
        setSessionRequests({ ...sessionRequests, [expandedSessionId]: pendingRequests });
      }
      // Auto-switch to approved students view if approved
      if (status === 'APPROVED') {
        setActiveView('approved');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la actualizare' });
    }
  };

  // Handle create session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await apiService.createSession({
        ...newSession,
        professorId: user.id
      });
      setMessage({ type: 'success', text: 'Sesiune creată cu succes!' });
      setActiveView('sessions');
      setNewSession({ startTime: '', endTime: '', maxSpots: 5, universitySessionId: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la creare sesiune' });
    }
  };

  // Handle upload teacher file
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
      
      setMessage({ type: 'success', text: 'Fișierul semnat a fost încărcat cu succes!' });
      loadData();
    } catch (err) {
      const message = err?.response?.data?.message || 'Eroare la upload';
      setMessage({ type: 'error', text: message });
    } finally {
      setUploadingTeacherFile(null);
    }
  };

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

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Professor Dashboard" user={user} />

      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} onNavigate={(key) => {
          setActiveSidebarItem(key);
          if (key === 'profile') navigate('/professor/profile');
          if (key === 'dashboard') navigate('/professor');
        }} active={activeSidebarItem} />
        <section className="content">
          <h1 className="login-title">Welcome back, {user.fullName?.split(' ')[0] || 'Professor'}</h1>
          <p className="login-subtitle">Manage your thesis sessions and review student applications.</p>

          {/* Mesaje */}
          {message.text && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '20px', 
              borderRadius: '8px',
              backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
              color: message.type === 'error' ? '#721c24' : '#155724',
              border: `1px solid ${message.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{message.text}</span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })} 
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontSize: '18px',
                  color: message.type === 'error' ? '#721c24' : '#155724'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Filtre University Session */}
          {activeView !== 'create' && (
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontWeight: '500' }}>Filtrează după sesiune:</label>
              <select 
                value={selectedUniversitySession}
                onChange={(e) => setSelectedUniversitySession(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="all">Toate sesiunile</option>
                {universitySessions.map(us => (
                  <option key={us.id} value={us.id}>{us.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Views */}
          {activeView === 'overview' && (
            <ProfessorDashboardOverview 
              approvedStudentsCount={getFilteredApprovedStudents().length}
              sessionsCount={getFilteredSessions().length}
              onViewChange={setActiveView}
            />
          )}

          {activeView === 'approved' && (
            <ProfessorDashboardApprovedStudents 
              approvedStudents={getFilteredApprovedStudents()}
              universitySessions={universitySessions}
              onViewChange={setActiveView}
              onDownloadStudentFile={handleDownloadStudentFile}
              onDownloadTeacherFile={handleDownloadTeacherFile}
              onUploadTeacherFile={handleUploadTeacherFile}
              uploadingTeacherFile={uploadingTeacherFile}
              groupByUniversitySession={groupByUniversitySession}
              getStudentStatus={getStudentStatus}
            />
          )}

          {activeView === 'sessions' && (
            <ProfessorDashboardMySessions 
              sessions={getFilteredSessions()}
              expandedSessionId={expandedSessionId}
              sessionRequests={sessionRequests}
              onViewChange={setActiveView}
              onSessionClick={handleSessionClick}
              onRequestAction={handleRequestAction}
              getApprovedCount={getApprovedCount}
              groupByUniversitySession={groupByUniversitySession}
            />
          )}

          {activeView === 'create' && (
            <ProfessorDashboardCreateSession 
              newSession={newSession}
              universitySessions={universitySessions}
              onSessionChange={(field, value) => setNewSession({...newSession, [field]: value})}
              onViewChange={setActiveView}
              onCreateSession={handleCreateSession}
            />
          )}
        </section>
      </main>
    </div>
  );
};
export default ProfessorDashboard;