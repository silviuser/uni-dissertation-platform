import React from 'react';

const ProfessorDashboardApprovedStudents = ({
  approvedStudents,
  universitySessions,
  onViewChange,
  onDownloadStudentFile,
  onDownloadTeacherFile,
  onUploadTeacherFile,
  uploadingTeacherFile,
  groupByUniversitySession,
  getStudentStatus
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
      
      <h2 style={{ marginBottom: '20px' }}>Studenți Aprobați</h2>
      
      {groupByUniversitySession(approvedStudents).map(group => (
        <div key={group.id} style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            padding: '12px 16px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '18px'
          }}>
            {group.name} ({group.items.length} {group.items.length === 1 ? 'student' : 'studenți'})
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {group.items.map(request => {
              const status = getStudentStatus(request);
              return (
                <div 
                  key={request.id} 
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
                        {request.student?.fullName || 'Student necunoscut'}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Facultate:</strong> {request.student?.faculty || 'N/A'}</div>
                        <div><strong>Specializare:</strong> {request.student?.specialization || 'N/A'}</div>
                        <div><strong>Grupă:</strong> {request.student?.group || 'N/A'}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: status.color,
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'center',
                      minWidth: '160px'
                    }}>
                      {status.label}
                    </div>
                  </div>

                  {/* Actions pentru fișiere */}
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                    {request.studentFile ? (
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '14px' }}>📄 Cerere Student:</strong>
                        <button 
                          onClick={() => onDownloadStudentFile(request.id)}
                          style={{
                            marginLeft: '12px',
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Descarcă
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#dc3545', marginBottom: '12px' }}>
                        ⏳ În așteptare ca studentul să încarce cererea...
                      </div>
                    )}

                    {request.studentFile && !request.teacherFile && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                          Încarcă Cererea Semnată:
                        </strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            id={`teacher-file-${request.id}`}
                            type="file"
                            accept="application/pdf"
                            style={{ fontSize: '13px', flex: 1 }}
                          />
                          <button
                            onClick={() => onUploadTeacherFile(request.id)}
                            disabled={uploadingTeacherFile === request.id}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            {uploadingTeacherFile === request.id ? 'Se încarcă...' : 'Încarcă'}
                          </button>
                        </div>
                      </div>
                    )}

                    {request.teacherFile && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ fontSize: '14px' }}>✓ Fișier Semnat:</strong>
                        <button 
                          onClick={() => onDownloadTeacherFile(request.id)}
                          style={{
                            marginLeft: '12px',
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Descarcă Copie
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {approvedStudents.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Nu există studenți aprobați pentru filtrele selectate.
        </p>
      )}
    </div>
  );
};

export default ProfessorDashboardApprovedStudents;
