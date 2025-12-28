import React from 'react';

const ProfessorDashboardOverview = ({ 
  approvedStudentsCount, 
  sessionsCount, 
  onViewChange 
}) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '20px',
      marginTop: '24px'
    }}>
      {/* Card 1: Approved Students */}
      <div 
        onClick={() => onViewChange('approved')}
        style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#333' }}>Studenți Aprobați</h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
          {approvedStudentsCount}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Vezi detalii complete
        </p>
      </div>

      {/* Card 2: My Sessions */}
      <div 
        onClick={() => onViewChange('sessions')}
        style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#333' }}>Sesiunile Mele</h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
          {sessionsCount}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Gestionează cererile
        </p>
      </div>

      {/* Card 3: Create Session */}
      <div 
        onClick={() => onViewChange('create')}
        style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>➕</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#333' }}>Creează Sesiune</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#666', marginTop: '12px' }}>
          Adaugă o nouă sesiune de înscriere
        </p>
      </div>
    </div>
  );
};

export default ProfessorDashboardOverview;
