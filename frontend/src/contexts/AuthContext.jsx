import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL - assuming backend runs on port 8080 as per .env.example
  const API_URL = 'http://localhost:8080/api/auth';

  useEffect(() => {
    // Check if user is logged in via token in localStorage
    const checkUser = async () => {
      const token = localStorage.getItem('itqan_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('itqan_token');
        }
      } catch (err) {
        console.error("Check user failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  async function signup(name, email, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Signup failed');
    
    localStorage.setItem('itqan_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');

    localStorage.setItem('itqan_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function resetPassword(email) {
    // Custom password reset logic would go here
    console.log("Password reset requested for:", email);
    alert("Password reset is not implemented in this demo. Please contact support.");
  }

  async function logout() {
    localStorage.removeItem('itqan_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
