import axios from 'axios';
import authService from './authService';
import { store } from '../store/store';
import { logoutUser } from '../store/actions/authActions';
import { reset } from '../store/reducers/authReducer';

const API_URL = "/api";

// Configurare automată a token-ului pentru fiecare cerere
// Astfel nu trebuie să punem manual header-ul "Authorization" de fiecare dată
axios.interceptors.request.use(
  config => {
    // Prefer token din Redux; fallback la localStorage pentru bootstrap timpuriu
    const state = store.getState?.();
    const tokenFromStore = state?.auth?.token;
    const user = authService.getCurrentUser();
    const token = tokenFromStore || user?.token;
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Logout automat pe 401/403
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        store.dispatch(logoutUser());
        store.dispatch(reset());
      } catch (_) {}
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// --- API Sesiuni ---
const getSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
};

// --- API Cereri ---
const createRequest = async (studentId, sessionId, applicationMessage = '') => {
  const response = await axios.post(`${API_URL}/requests`, {
    studentId,
    sessionId,
    applicationMessage
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

// funcție nouă pentru ștergere
const deleteRequest = async (requestId) => {
  const response = await axios.delete(`${API_URL}/requests/${requestId}`);
  return response.data;
};

const uploadSignedRequest = async (requestId, formData) => {
  const response = await axios.post(`${API_URL}/requests/${requestId}/upload-student-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const deleteSignedFile = async (requestId) => {
  const response = await axios.delete(`${API_URL}/requests/${requestId}/student-file`);
  return response.data;
};

const uploadTeacherFile = async (requestId, formData) => {
  const response = await axios.post(`${API_URL}/requests/${requestId}/upload-teacher-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const downloadStudentFile = (requestId) => {
  return `${API_URL}/requests/${requestId}/download-student-file`;
};

const downloadTeacherFile = (requestId) => {
  return `${API_URL}/requests/${requestId}/download-teacher-file`;
};

// --- API Sesiuni Universitare ---
const getUniversitySessions = async () => {
  const response = await axios.get(`${API_URL}/university-sessions`);
  return response.data;
};

// --- API Student Profile ---
const getStudentById = async (studentId) => {
  const response = await axios.get(`${API_URL}/students/${studentId}`);
  return response.data;
};

const updateStudentProfile = async (studentId, data) => {
  const response = await axios.put(`${API_URL}/students/${studentId}`, data);
  return response.data;
};

// --- API Professor Profile ---
const getProfessorById = async (professorId) => {
  const response = await axios.get(`${API_URL}/professors/${professorId}`);
  return response.data;
};

const updateProfessorProfile = async (professorId, data) => {
  const response = await axios.put(`${API_URL}/professors/${professorId}`, data);
  return response.data;
};

// --- API Approved Students ---
const getApprovedStudents = async (professorId) => {
  const response = await axios.get(`${API_URL}/requests/professor/${professorId}/approved`);
  return response.data;
};

const apiService = {
  getSessions,
  getProfessorSessions,
  createSession,
  createRequest,
  getStudentRequests,
  getSessionRequests,
  updateRequestStatus,
  deleteRequest,
  uploadSignedRequest,
  deleteSignedFile,
  uploadTeacherFile,
  downloadStudentFile,
  downloadTeacherFile,
  getProfessors,
  getUniversitySessions,
  getStudentById,
  updateStudentProfile,
  getApprovedStudents,
  getProfessorById,
  updateProfessorProfile
};

export default apiService;