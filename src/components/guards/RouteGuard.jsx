import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';

const RouteGuard = ({ children, requiredRoles, requiredPages }) => {
  const user = useAppSelector((state) => state.auth?.user);
  const location = useLocation();

  console.log("User:", user);
  console.log("Required Roles:", requiredRoles);
  console.log("Required Pages:", requiredPages);

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  const hasRequiredRole = requiredRoles.includes(user.role);
  const hasRequiredPage = requiredPages.some((page) => user.pages && user.pages.includes(page));

  console.log("Has Required Role:", hasRequiredRole);
  console.log("Has Required Page:", hasRequiredPage);

  if (!hasRequiredRole || !hasRequiredPage) {
    return <Navigate to="/auth/Page500" replace />;
  }

  return children;
};

export default RouteGuard;
