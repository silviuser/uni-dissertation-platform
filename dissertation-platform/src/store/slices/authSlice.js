// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// 1. Initial State: Luăm userul din localStorage dacă există (pentru refresh)
const userFromStorage = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: userFromStorage ? { ...(userFromStorage.user || null), role: userFromStorage?.role } : null,
  token: userFromStorage ? userFromStorage.token : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// 2. Async Thunk: Aici facem legătura cu Backend-ul
// Aceasta funcție va fi apelată din Login.js
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      // Folosim serviciul tău existent
      return await authService.login(userData.email, userData.password, userData.role);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

// 3. Slice-ul propriu-zis (Reducer)
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // action.payload este ce returnează authService.login
        state.user = { ...action.payload.user, role: action.payload.role }; 
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Mesajul de eroare
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
