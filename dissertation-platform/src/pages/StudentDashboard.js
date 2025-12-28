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
      alert('Please enter an application message');
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
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Error submitting application');
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
      alert('Please select a PDF to upload.');
      return;
    }

    if (signedFormFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    if (!approvedRequest) {
      alert('No approved request found.');
      return;
    }

    try {
      setUploadingSignedForm(true);
      const formData = new FormData();
      formData.append('file', signedFormFile);
      await apiService.uploadSignedRequest(approvedRequest.id, formData);

      const updatedRequests = await apiService.getStudentRequests(user.id);
      setMyRequests(updatedRequests);

      alert('File uploaded successfully.');
      setSignedFormFile(null);
    } catch (err) {
      console.error('Error uploading signed form:', err);
      const message = err?.response?.data?.message || 'Error uploading file';
      alert(message);
    } finally {
      setUploadingSignedForm(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      await apiService.deleteRequest(requestId);
      
      // Refresh requests
      const updatedRequests = await apiService.getStudentRequests(user.id);
      setMyRequests(updatedRequests);
      
      alert('Request deleted successfully!');
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Error deleting request');
    }
  };

  const handleDeleteSignedFile = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete the uploaded file? You can upload a new one afterwards.')) {
      return;
    }

    try {
      await apiService.deleteSignedFile(requestId);
      
      // Refresh requests
      const updatedRequests = await apiService.getStudentRequests(user.id);
      setMyRequests(updatedRequests);
      
      alert('File deleted successfully!');
    } catch (err) {
      console.error('Error deleting file:', err);
      const message = err?.response?.data?.message || 'Error deleting file';
      alert(message);
    }
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Student Dashboard" user={user} />

      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} onNavigate={(key) => {
          if (key === 'profile') navigate('/student/profile');
          if (key === 'dashboard') navigate('/student');
        }} />
        <section className="content">
          <h1 className="login-title">Welcome back, {user.fullName?.split(' ')[0] || 'Student'}</h1>
          <p className="login-subtitle">Here is an overview of your thesis application status.</p>
          <StatusCards latestRequest={latestRequest} />

          {hasApprovedRequest ? (
            <ApprovedUploadSection
              approvedRequest={approvedRequest}
              signedFormFile={signedFormFile}
              setSignedFormFile={setSignedFormFile}
              uploadingSignedForm={uploadingSignedForm}
              onUpload={handleUploadSignedForm}
              onDelete={handleDeleteSignedFile}
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
    </div>
  );
};

export default StudentDashboard;