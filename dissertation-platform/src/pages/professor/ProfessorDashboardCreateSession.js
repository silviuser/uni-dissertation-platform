import React from 'react';

const ProfessorDashboardCreateSession = ({
  newSession,
  universitySessions,
  onSessionChange,
  onViewChange,
  onCreateSession
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
      
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Creează Sesiune Nouă</h2>
        
        <form onSubmit={onCreateSession}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Început:
            </label>
            <input 
              type="datetime-local" 
              required
              value={newSession.startTime}
              onChange={e => onSessionChange('startTime', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Sfârșitul:
            </label>
            <input 
              type="datetime-local" 
              required
              value={newSession.endTime}
              onChange={e => onSessionChange('endTime', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Număr Locuri:
            </label>
            <input 
              type="number" 
              min="1"
              required
              value={newSession.maxSpots}
              onChange={e => onSessionChange('maxSpots', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              University Session:
            </label>
            <select 
              required
              value={newSession.universitySessionId}
              onChange={e => onSessionChange('universitySessionId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select University Session</option>
              {universitySessions.map(us => (
                <option key={us.id} value={us.id}>{us.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Salvează Sesiunea
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfessorDashboardCreateSession;
