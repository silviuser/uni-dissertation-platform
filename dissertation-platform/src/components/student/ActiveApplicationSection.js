import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ActiveApplicationSection = ({
  canApply,
  selectedUniversitySession,
  onSelectUniversitySession,
  universitySessions,
  filteredSessions,
  appliedSessionIds,
  onApplyClick,
  selectedSessionForApplication,
  applicationMessage,
  setApplicationMessage,
  onCancelApplication,
  onSubmitApplication,
  submittingApplication
}) => {
  return (
    <>
      <h2 className="section-title">Active Application</h2>
      <Card>
        <div>
          <div className="meta">Browse sessions and apply.</div>
          <div style={{ height: 12 }} />

          {canApply && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="university-session-filter" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Filter by University Session:
                </label>
                <select
                  id="university-session-filter"
                  value={selectedUniversitySession}
                  onChange={(e) => onSelectUniversitySession(e.target.value)}
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
                      {us.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filteredSessions.map((s) => {
                  const availableSpots = s.availableSpots ?? 0;
                  const isFull = availableSpots <= 0;
                  const alreadyApplied = appliedSessionIds.includes(s.id);
                  const isDisabled = alreadyApplied || isFull;
                  
                  return (
                    <Card key={s.id} style={{ opacity: isFull ? 0.6 : 1 }}>
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
                      <div className="meta" style={{ marginBottom: 12, color: isFull ? '#dc3545' : '#28a745', fontWeight: '600' }}>
                        {isFull ? '🔴 Complet (0 locuri)' : `✓ ${availableSpots} ${availableSpots === 1 ? 'loc disponibil' : 'locuri disponibile'}`}
                      </div>
                      <Button
                        onClick={() => onApplyClick(s)}
                        disabled={isDisabled}
                        style={{ opacity: isDisabled ? 0.6 : 1 }}
                      >
                        {alreadyApplied ? 'Already Applied' : isFull ? 'Full - No Spots' : 'Apply'}
                      </Button>
                    </Card>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <div className="meta">No sessions available for the selected university session.</div>
                )}
              </div>

              {selectedSessionForApplication && (
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
                  <Card style={{ maxWidth: 500, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                    <div className="title" style={{ marginBottom: 16 }}>Apply to Session</div>

                    <div style={{ marginBottom: 12 }}>
                      <div className="meta"><strong>Professor:</strong> {selectedSessionForApplication.professor?.fullName}</div>
                      <div className="meta"><strong>Period:</strong> {new Date(selectedSessionForApplication.startTime).toLocaleString()} - {new Date(selectedSessionForApplication.endTime).toLocaleString()}
                      </div>
                    </div>

                    <label htmlFor="application-message" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                      Application Message:
                    </label>
                    <textarea
                      id="application-message"
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      placeholder="Enter your application message..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        minHeight: '120px',
                        boxSizing: 'border-box',
                        marginBottom: 16
                      }}
                    />

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" onClick={onCancelApplication} disabled={submittingApplication}>
                        Cancel
                      </Button>
                      <Button onClick={onSubmitApplication} disabled={submittingApplication}>
                        {submittingApplication ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
};

export default ActiveApplicationSection;
