import React from 'react';

const ProfessorDashboard = ({ user, onLogout }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panou Profesor</h1>
      <p>Bine ai venit, Domnule Profesor {user.fullName || user.email}!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Sesiunile mele</h3>
        <p>Aici vor apărea sesiunile create (urmează să implementăm).</p>
        <button style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          + Creează Sesiune Nouă
        </button>
      </div>

      <button 
        onClick={onLogout}
        style={{ marginTop: '40px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Deconectare
      </button>
    </div>
  );
};

export default ProfessorDashboard;