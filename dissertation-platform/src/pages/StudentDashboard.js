import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import authService from '../services/authService';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const statusLabel = (s) => {
  switch (s) {
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    default: return 'Pending Approval';
  }
};

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [universitySessions, setUniversitySessions] = useState([]);
  const [selectedUniversitySession, setSelectedUniversitySession] = useState('');
  const [loading, setLoading] = useState(true);

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

  const onLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <AppHeader onMenuClick={() => setMenuOpen(!menuOpen)} title="Student Dashboard" user={user} />

      <main className="dashboard-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} />
        <section className="content">
          <h1 className="login-title">Welcome back, {user.fullName?.split(' ')[0] || 'Student'}</h1>
          <p className="login-subtitle">Here is an overview of your thesis application status.</p>

          <div className="dashboard-grid">
            <Card>
              <div className="title">Current Status</div>
              <div style={{ height: 8 }} />
              <span className={`status-pill ${latestRequest?.status === 'APPROVED' ? 'approved' : latestRequest?.status === 'REJECTED' ? 'rejected' : ''}`}>
                {statusLabel(latestRequest?.status)}
              </span>
              <div className="meta" style={{ marginTop: 8 }}>
                Last updated {latestRequest ? new Date(latestRequest.updatedAt).toLocaleString() : '—'}
              </div>
            </Card>

            <Card>
              <div className="title">Next Steps</div>
              <div className="meta" style={{ marginTop: 8 }}>
                {latestRequest?.status === 'APPROVED' && 'Upload your thesis file and follow professor instructions.'}
                {latestRequest?.status === 'REJECTED' && `Review feedback: ${latestRequest?.rejectionReason || 'No reason provided'}.`}
                {!latestRequest && 'Apply to a session to start your application.'}
                {latestRequest?.status === 'PENDING' && 'Your application has been submitted. You will receive an email notification once a decision has been made.'}
              </div>
            </Card>
          </div>

          <h2 className="section-title">Active Application</h2>
          <Card>
            {latestRequest ? (
              <div className="request-card">
                <div>
                  <div className="title">Request #{latestRequest.id.slice(0, 6).toUpperCase()}</div>
                  <div style={{ height: 6 }} />
                  <div style={{ fontWeight: 700 }}>Machine Learning in Healthcare</div>
                  <p className="meta" style={{ maxWidth: 760 }}>
                    Proposed thesis exploring the impact of predictive algorithms on patient diagnosis accuracy. Targeting the Department of Computer Science under supervision of Prof. Johnson.
                  </p>
                </div>
                <div className="request-actions">
                  <Button variant="ghost">View Full Details</Button>
                  <Button variant="ghost">Edit Draft</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="meta">No active requests. Browse sessions and apply.</div>
                <div style={{ height: 12 }} />
                
                {/* Filter for University Sessions */}
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="university-session-filter" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Filter by University Session:
                  </label>
                  <select
                    id="university-session-filter"
                    value={selectedUniversitySession}
                    onChange={(e) => setSelectedUniversitySession(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      minWidth: '250px'
                    }}
                  >
                    <option value="">All Sessions</option>
                    {universitySessions.map((us) => (
                      <option key={us.id} value={us.id}>
                        {us.name} ({new Date(us.startDate).toLocaleDateString()} - {new Date(us.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {filteredSessions.map((s) => (
                    <Card key={s.id}>
                      <div className="title" style={{ marginBottom: 8 }}>
                        {s.professor?.fullName || 'Unknown Professor'}
                      </div>
                      {s.professor?.department && (
                        <div className="meta" style={{ marginBottom: 8 }}>
                          {s.professor.department}
                        </div>
                      )}
                      <div className="meta" style={{ marginBottom: 4 }}>
                        <strong>Application Period:</strong>
                      </div>
                      <div className="meta" style={{ marginBottom: 8 }}>
                        {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}
                      </div>
                      {s.universitySession && (
                        <div className="meta" style={{ marginBottom: 8 }}>
                          <strong>University Session:</strong> {s.universitySession.name}
                        </div>
                      )}
                      <div className="meta" style={{ marginBottom: 12 }}>
                        Available Spots: {s.maxSpots}
                      </div>
                      <Button onClick={() => {/* hook up create request flow on future */}}>Apply</Button>
                    </Card>
                  ))}
                  {filteredSessions.length === 0 && (
                    <div className="meta">No sessions available for the selected university session.</div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;