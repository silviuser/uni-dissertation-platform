// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Pe viitor poți adăuga aici: requests: requestReducer, etc.
  },
});