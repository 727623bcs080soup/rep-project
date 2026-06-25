// src/context/AuthContext.js
import React, { createContext, useReducer, useCallback } from 'react';
import { authReducer } from './authReducer';
import { API } from '../App'; 

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = useCallback(async () => {
    if (localStorage.getItem('token')) {
      try {
        const res = await API.get('/auth');
        dispatch({ type: 'USER_LOADED', payload: res.data });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      loadUser();
      return true;
    } catch (err) {
      dispatch({ type: 'REGISTER_FAIL' });
      return false; // <-- Return false on failure
    }
  };

  // --- UPDATED LOGIN FUNCTION ---
  const login = async (formData) => {
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      loadUser();
      return true; // <-- Return true on success
    } catch (err) { 
      dispatch({ type: 'LOGIN_FAIL' });
      return false; // <-- Return false on failure
    }
  };
  // --- END UPDATE ---

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loadUser,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };