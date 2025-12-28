// src/store/actions/authActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async Thunk pentru login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
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

// Async Thunk pentru logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});
