import axios from 'axios';
import authService from './authService';

const API_URL = "/api";

// Configurare automată a token-ului pentru fiecare cerere
// Astfel nu trebuie să punem manual header-ul "Authorization" de fiecare dată
axios.interceptors.request.use(
  config => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers['Authorization'] = 'Bearer ' + user.token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// --- API Sesiuni ---
const getSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
};

// --- API Cereri ---
const createRequest = async (studentId, sessionId) => {
  const response = await axios.post(`${API_URL}/requests`, {
    studentId,
    sessionId
  });
  return response.data;
};

const getStudentRequests = async (studentId) => {
  const response = await axios.get(`${API_URL}/requests/student/${studentId}`);
  return response.data;
};

// --- API Profesori (opțional, pentru a afișa nume) ---
// Dacă ai ruta implementată, altfel ne bazăm pe datele din sesiune
const getProfessors = async () => {
    // Presupunând că ai o rută GET /professors. Dacă nu, o vom adăuga.
    // Deocamdată returnăm o listă goală sau implementăm ruta în backend.
    return []; 
};

// funcție nouă
const getProfessorSessions = async (professorId) => {
  const response = await axios.get(`${API_URL}/sessions/professor/${professorId}`);
  return response.data;
};

// funcție nouă
const createSession = async (sessionData) => {
  // sessionData trebuie să conțină: professorId, startTime, endTime, maxSpots
  const response = await axios.post(`${API_URL}/sessions`, sessionData);
  return response.data;
};

// --- API Cereri (UPDATE) ---
// ... (createRequest, getStudentRequests existente)

// funcție nouă
const getSessionRequests = async (sessionId) => {
  const response = await axios.get(`${API_URL}/requests/session/${sessionId}`);
  return response.data;
};

// funcție nouă
const updateRequestStatus = async (requestId, status, rejectionReason = null) => {
  const payload = { status };
  if (rejectionReason) payload.rejectionReason = rejectionReason;
  
  const response = await axios.put(`${API_URL}/requests/${requestId}`, payload);
  return response.data;
};

// --- API Sesiuni Universitare ---
const getUniversitySessions = async () => {
  const response = await axios.get(`${API_URL}/university-sessions`);
  return response.data;
};

const apiService = {
  getSessions,
  getProfessorSessions, // exportăm
  createSession,        // exportăm
  createRequest,
  getStudentRequests,
  getSessionRequests,   // exportăm
  updateRequestStatus,  // exportăm
  getProfessors,
  getUniversitySessions // exportăm
};

export default apiService;