import axios from 'axios';

// Configurăm URL-ul de bază. Fiind setat proxy-ul în package.json, 
// putem folosi rute relative (ex: /api).
const API_URL = "/api"; 

// Funcția de login
const login = async (email, password, role) => {
  try {
    // Trimitem email, parolă și rol către server
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      role
    });

    // Dacă login-ul are succes, serverul returnează un token și datele user-ului
    if (response.data.token) {
      // Salvăm token-ul în LocalStorage pentru a rămâne logați la refresh
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    // Returnăm mesajul de eroare primit de la server sau unul generic
    const message = 
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      "Eroare la autentificare";
    throw new Error(message);
  }
};

// Funcția de logout
const logout = () => {
  localStorage.removeItem("user");
};

// Funcție pentru a obține userul curent (dacă există în storage)
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const authService = {
  login,
  logout,
  getCurrentUser
};

export default authService;