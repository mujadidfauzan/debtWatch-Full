import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
  currentUser: User | null;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 