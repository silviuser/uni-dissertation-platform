// src/store/reducers/authReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from '../actions/authActions';

// Initial State
const userFromStorage = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: userFromStorage ? { ...(userFromStorage.user || null), role: userFromStorage?.role } : null,
  token: userFromStorage ? userFromStorage.token : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Slice-ul cu reducer și actions
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
        state.user = { ...action.payload.user, role: action.payload.role }; 
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
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
