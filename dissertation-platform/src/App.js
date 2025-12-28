import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProfessorProfile from './pages/ProfessorProfile';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/student" 
            element={user && user.role === 'STUDENT' ? <StudentDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/profile" 
            element={user && user.role === 'STUDENT' ? <StudentProfile user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/professor" 
            element={user && user.role === 'PROFESSOR' ? <ProfessorDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/professor/profile" 
            element={user && user.role === 'PROFESSOR' ? <ProfessorProfile user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;