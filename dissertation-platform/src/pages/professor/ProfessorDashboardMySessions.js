import React from 'react';

const ProfessorDashboardMySessions = ({
  sessions,
  expandedSessionId,
  sessionRequests,
  onViewChange,
  onSessionClick,
  onRequestAction,
  getApprovedCount,
  groupByUniversitySession
}) => {
  return (
    <div>
      <button 
        onClick={() => onViewChange('overview')}
        style={{
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: '1px solid #007bff',
          color: '#007bff',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Înapoi
      </button>
      
      <h2 style={{ marginBottom: '20px' }}>Sesiunile Mele</h2>
      
      {groupByUniversitySession(sessions).map(group => (
        <div key={group.id} style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            padding: '12px 16px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '18px'
          }}>
            {group.name} ({group.items.length} {group.items.length === 1 ? 'sesiune' : 'sesiuni'})
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {group.items.map(session => {
              const approvedCount = getApprovedCount(session.id);
              const isExpanded = expandedSessionId === session.id;
              
              return (
                <div 
                  key={session.id} 
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    border: isExpanded ? '2px solid #007bff' : '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Perioada:</strong> {new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}>
                      {approvedCount}/{session.maxSpots}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onSessionClick(session.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isExpanded ? '#dc3545' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {isExpanded ? 'Ascunde Cereri Pending' : 'Vezi Cereri Pending'}
                  </button>

                  {/* Expanded - Pending Requests */}
                  {isExpanded && sessionRequests[session.id] && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                      <h5 style={{ marginBottom: '12px', fontSize: '15px' }}>
                        Cereri în Așteptare ({sessionRequests[session.id].length})
                      </h5>
                      
                      {sessionRequests[session.id].length === 0 ? (
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          Nu există cereri în așteptare.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {sessionRequests[session.id].map(req => (
                            <div 
                              key={req.id}
                              style={{
                                padding: '16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                              }}
                            >
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '14px' }}>
                                  {req.student?.fullName || `Student ID: ${req.studentId.slice(0, 8)}...`}
                                </strong>
                                {req.student && (
                                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                    {req.student.faculty} • {req.student.specialization} • Grupa {req.student.group}
                                  </div>
                                )}
                                {req.applicationMessage && (
                                  <div style={{ 
                                    fontSize: '13px', 
                                    color: '#495057', 
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    fontStyle: 'italic'
                                  }}>
                                    "{req.applicationMessage}"
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => onRequestAction(req.id, 'APPROVED')}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                >
                                  ✓ Aprobă
                                </button>
                                <button 
                                  onClick={() => onRequestAction(req.id, 'REJECTED')}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                >
                                  ✗ Respinge
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sessions.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Nu există sesiuni pentru filtrele selectate.
        </p>
      )}
    </div>
  );
};

export default ProfessorDashboardMySessions;
