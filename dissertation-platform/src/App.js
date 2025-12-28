import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ProfessorDashboard from './pages/ProfessorDashboard';
import authService from './services/authService';

function App() {

  const [user, setUser] = useState(authService.getCurrentUser());

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route 
            path="/login" 
            element={<Login onLogin={(userData) => setUser(userData)} />} 
          />
          
          <Route 
            path="/student" 
            element={user && user.role === 'STUDENT' ? <StudentDashboard user={user.user || user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/profile" 
            element={user && user.role === 'STUDENT' ? <StudentProfile user={user.user || user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/professor" 
            element={user && user.role === 'PROFESSOR' ? <ProfessorDashboard user={user.user || user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;