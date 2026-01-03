import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/actions/authActions';
import apiService from '../services/apiService';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import StatusCards from '../components/student/StatusCards';
import ApprovedUploadSection from '../components/student/ApprovedUploadSection';
import RequestsSection from '../components/student/RequestsSection';
import ActiveApplicationSection from '../components/student/ActiveApplicationSection';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [universitySessions, setUniversitySessions] = useState([]);
  const [selectedUniversitySession, setSelectedUniversitySession] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSessionForApplication, setSelectedSessionForApplication] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [signedFormFile, setSignedFormFile] = useState(null);
  const [uploadingSignedForm, setUploadingSignedForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, requestsData, universitySessionsData] = await Promise.all([
          apiService.getSessions(),
          apiService.getStudentRequests(user.id),
          apiService.getUniversitySessions()
        ]);
        setSessions(sessionsData);
        setMyRequests(requestsData);
        setUniversitySessions(universitySessionsData);
      } catch (err) {
        console.error('Eroare la încărcare date', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const latestRequest = useMemo(() => {
    if (!myRequests || myRequests.length === 0) return null;
    return [...myRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [myRequests]);

  const filteredSessions = useMemo(() => {
    if (!selectedUniversitySession) return sessions;
    return sessions.filter(s => s.universitySessionId === selectedUniversitySession);
  }, [sessions, selectedUniversitySession]);

  const hasApprovedRequest = useMemo(() => {
    return myRequests && myRequests.some(r => r.status === 'APPROVED');
  }, [myRequests]);

  const approvedRequest = useMemo(() => {
    if (!myRequests) return null;
    return myRequests.find(r => r.status === 'APPROVED') || null;
  }, [myRequests]);

  const appliedSessionIds = useMemo(() => {
    if (!myRequests) return [];
    return myRequests.map(r => r.sessionId);
  }, [myRequests]);

  const canApplyToMoreSessions = !hasApprovedRequest;

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleApplyClick = (session) => {
    setSelectedSessionForApplication(session);
    setApplicationMessage('');
  };

  const handleSubmitApplication = async () => {
    if (!applicationMessage.trim()) {
      setMessage({ type: 'error', text: 'Te rugăm să introduci un mesaj pentru cerere' });
      return;
    }

    try {
      setSubmittingApplication(true);
      await apiService.createRequest(user.id, selectedSessionForApplication.id, applicationMessage);
      
      // Refresh both requests and sessions to update UI
      const [updatedRequests, updatedSessions] = await Promise.all([
        apiService.getStudentRequests(user.id),
        apiService.getSessions()
      ]);
      
      setMyRequests(updatedRequests);
      setSessions(updatedSessions);
      
      // Close the form
      setSelectedSessionForApplication(null);
      setApplicationMessage('');
      setMessage({ type: 'success', text: 'Cererea a fost trimisă cu succes!' });
    } catch (err) {
      console.error('Error submitting application:', err);
      setMessage({ type: 'error', text: 'Eroare la trimiterea cererii' });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleCancelApplication = () => {
    setSelectedSessionForApplication(null);
    setApplicationMessage('');
  };

  const handleUploadSignedForm = async () => {
    if (!signedFormFile) {
      setMessage({ type: 'error', text: 'Te rugăm să selectezi un fișier PDF.' });
      return;
    }

    if (signedFormFile.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Doar fișierele PDF sunt acceptate.' });
      return;
    }

    if (!approvedRequest) {
      setMessage({ type: 'error', text: 'Nu a fost găsită o cerere aprobată.' });
      return;
    }

    try {
      setUploadingSignedForm(true);
      const formData = new FormData();
      formData.append('file', signedFormFile);
      await apiService.uploadSignedRequest(approvedRequest.id, formData);

      const updatedRequests = await apiService.getStudentRequests(user.id);
      setMyRequests(updatedRequests);

      setMessage({ type: 'success', text: 'Fișierul a fost încărcat cu succes.' });
      setSignedFormFile(null);
    } catch (err) {
      console.error('Error uploading signed form:', err);
      const msg = err?.response?.data?.message || 'Eroare la încărcarea fișierului';
      setMessage({ type: 'error', text: msg });
    } finally {
      setUploadingSignedForm(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmare Ștergere',
      message: 'Ești sigur că vrei să ștergi această cerere?',
      onConfirm: async () => {
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
        try {
          await apiService.deleteRequest(requestId);
          const updatedRequests = await apiService.getStudentRequests(user.id);
          setMyRequests(updatedRequests);
          setMessage({ type: 'success', text: 'Cererea a fost ștearsă cu succes!' });
        } catch (err) {
          console.error('Error deleting request:', err);
          setMessage({ type: 'error', text: 'Eroare la ștergerea cererii' });
        }
      }
    });
  };

  const handleDeleteSignedFile = async (requestId) => {
    setConfirmDialog({
      open: true,
      title: 'Confirmare Ștergere',
      message: 'Ești sigur că vrei să ștergi fișierul încărcat? Poți încărca unul nou după aceea.',
      onConfirm: async () => {
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
        try {
          await apiService.deleteSignedFile(requestId);
          const updatedRequests = await apiService.getStudentRequests(user.id);
          setMyRequests(updatedRequests);
          setMessage({ type: 'success', text: 'Fișierul a fost șters cu succes!' });
        } catch (err) {
          console.error('Error deleting file:', err);
          const msg = err?.response?.data?.message || 'Eroare la ștergerea fișierului';
          setMessage({ type: 'error', text: msg });
        }
      }
    });
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Panou Student" user={user} />

      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} onNavigate={(key) => {
          if (key === 'profile') navigate('/student/profile');
          if (key === 'dashboard') navigate('/student');
        }} />
        <section className="content">
          <h1 className="login-title">Bine ai revenit, {user.fullName || 'Student'}</h1>
          <p className="login-subtitle">Aici este o prezentare generală a stării cererii tale de licență.</p>

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

          <StatusCards latestRequest={latestRequest} />

          {hasApprovedRequest ? (
            <ApprovedUploadSection
              approvedRequest={approvedRequest}
              signedFormFile={signedFormFile}
              setSignedFormFile={setSignedFormFile}
              uploadingSignedForm={uploadingSignedForm}
              onUpload={handleUploadSignedForm}
              onDelete={handleDeleteSignedFile}
              onMessage={setMessage}
            />
          ) : (
            <>
              <RequestsSection myRequests={myRequests} onDelete={handleDeleteRequest} />
              <ActiveApplicationSection
                canApply={canApplyToMoreSessions}
                selectedUniversitySession={selectedUniversitySession}
                onSelectUniversitySession={setSelectedUniversitySession}
                universitySessions={universitySessions}
                filteredSessions={filteredSessions}
                appliedSessionIds={appliedSessionIds}
                onApplyClick={handleApplyClick}
                selectedSessionForApplication={selectedSessionForApplication}
                applicationMessage={applicationMessage}
                setApplicationMessage={setApplicationMessage}
                onCancelApplication={handleCancelApplication}
                onSubmitApplication={handleSubmitApplication}
                submittingApplication={submittingApplication}
              />
            </>
          )}
        </section>
      </main>
      {/* Modal de Confirmare */}
      {confirmDialog.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{confirmDialog.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Anulează
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default StudentDashboard;