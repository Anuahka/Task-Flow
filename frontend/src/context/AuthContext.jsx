import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bootstrap: restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('tf_token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await authService.getMe();
        dispatch({
          type: 'SET_AUTH',
          payload: { user: res.data.user, token },
        });
      } catch {
        localStorage.removeItem('tf_token');
        dispatch({ type: 'LOGOUT' });
      }
    };
    restoreSession();
  }, []);

  // Sync dark mode class whenever user preference changes
  useEffect(() => {
    const theme = state.user?.preferences?.theme || 'light';
    applyTheme(theme);
  }, [state.user?.preferences?.theme]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { token, user } = res.data;
    localStorage.setItem('tf_token', token);
    dispatch({ type: 'SET_AUTH', payload: { user, token } });
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token, user } = res.data;
    localStorage.setItem('tf_token', token);
    dispatch({ type: 'SET_AUTH', payload: { user, token } });
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tf_token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const toggleTheme = useCallback(async () => {
    const currentTheme = state.user?.preferences?.theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Optimistic update — apply immediately so UI responds instantly
    applyTheme(newTheme);
    dispatch({ type: 'UPDATE_USER', payload: { preferences: { theme: newTheme } } });

    try {
      const res = await authService.updatePreferences({ theme: newTheme });
      dispatch({ type: 'UPDATE_USER', payload: { preferences: res.data.user.preferences } });
    } catch {
      // Rollback on failure
      applyTheme(currentTheme);
      dispatch({ type: 'UPDATE_USER', payload: { preferences: { theme: currentTheme } } });
    }
  }, [state.user?.preferences?.theme]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
