import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import PrintInvoice from './pages/PrintInvoice';
import ReturnsList from './pages/ReturnsList';
import ProcessReturn from './pages/ProcessReturn';
import NotFound404 from './pages/NotFound404';
import ErrorPage from './pages/ErrorPage';
import EmployeeManagement from './pages/EmployeeManagement';
import Reports from './pages/Reports';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Function to decode JWT and check expiration
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if current time is less than expiration time
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

// Read user from localStorage synchronously and validate token
const getStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    
    // If token is expired or invalid, auto-logout
    if (!isTokenValid(token)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }

    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

function App() {
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token || localStorage.getItem('token'));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
      </Route>

      {/* Main App Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        {/* Render different dashboard based on role */}
        <Route index element={user?.role === 'owner' ? <Dashboard /> : <EmployeeDashboard />} />
        
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="returns" element={<ReturnsList />} />
        <Route path="returns/new" element={<ProcessReturn />} />
        {/* You can add more routes here for Customers, Products etc. */}
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="customers" element={<div className="p-6">Customers Page Content</div>} />
        <Route path="products" element={<div className="p-6">Products Page Content</div>} />
        <Route path="purchases" element={<div className="p-6">Purchases Page Content</div>} />
        <Route path="settings" element={<div className="p-6">Settings Page Content</div>} />
      </Route>
      
      {/* Print route doesn't need the Sidebar layout */}
      <Route 
        path="/print-invoice" 
        element={
          <ProtectedRoute>
            <PrintInvoice />
          </ProtectedRoute>
        } 
      />
      <Route path="/error" element={<ErrorPage />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}

export default App;
