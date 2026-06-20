import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Auth from './pages/Auth';
import ZakatCalculator from './pages/ZakatCalculator';
import ComplianceChecker from './pages/ComplianceChecker';
import Goals from './pages/Goals';
import Education from './pages/Education';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">ITQAN AI</div>
        {user && (
          <div className="navbar-user">
            <span className="navbar-user-name">{user.displayName || user.email}</span>
          </div>
        )}
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Financial Profile</NavLink>
        <NavLink to="/goals" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Financial Goals</NavLink>
        <NavLink to="/chatbot" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>AI Advisor</NavLink>
        <NavLink to="/zakat" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Zakat Calculator</NavLink>
        <NavLink to="/compliance" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Compliance Checker</NavLink>
        <NavLink to="/education" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Financial Literacy</NavLink>
        {user && user.userType === 'Admin' && (
          <NavLink to="/admin" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Admin Portal</NavLink>
        )}
        <div style={{ marginTop: 'auto' }}>
          <button
            className="btn nav-link"
            style={{width: '100%', textAlign: 'left', background: 'transparent'}}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner-large" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;
  return <Layout>{children}</Layout>;
}

function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner-large" />
        <p>Loading...</p>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/dashboard" />;
  return <Auth />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/zakat" element={<ProtectedRoute><ZakatCalculator /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceChecker /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
