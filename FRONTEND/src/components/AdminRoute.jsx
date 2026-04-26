import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, token } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/auth" />;
  
  const isSuperAdmin = user?.email === 'ujjwalprakashrc11.22@gmail.com';
  const isAdmin = isSuperAdmin || user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute;
