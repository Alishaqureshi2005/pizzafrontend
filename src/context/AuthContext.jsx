import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Login credentials:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        const userData = {
          ...response.user,
          role: response.user.role || 'user' // Ensure role is set
        };
        setUser(userData);
        toast.success('Login successful!');
        return userData;
      } else {
        throw new Error(response.message || 'Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      toast.error(error.message || 'Login failed');
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserDetails = async (userData) => {
    try {
      setError(null);
      const response = await authService.updateUserDetails(userData);
      if (response.success) {
        setUser(response.user);
        toast.success('Profile updated successfully!');
        return true;
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to update profile');
      return false;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await authService.updatePassword(passwordData);
      if (response.success) {
        localStorage.setItem('token', response.token);
        toast.success('Password updated successfully!');
        return true;
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to update password');
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUserDetails,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
