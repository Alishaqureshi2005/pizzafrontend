import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - User Role:', user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    console.log('AdminRoute - Access Denied:', { userExists: !!user, role: user?.role });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute; 