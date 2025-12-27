import React from 'react';

const StudentDashboard = ({ user, onLogout }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panou Student</h1>
      <p>Bine ai venit, {user.fullName || user.email}!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Cererile mele</h3>
        <p>Nu ai nicio cerere momentan (urmează să implementăm).</p>
      </div>

      <button 
        onClick={onLogout}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Deconectare
      </button>
    </div>
  );
};

export default StudentDashboard;