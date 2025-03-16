import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const location = useLocation();

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check if user is accessing the correct dashboard based on their role
  const isTeacherPath = location.pathname.startsWith('/teacher');
  const isParentPath = location.pathname.startsWith('/parent');
  const isClassroomPath = location.pathname.startsWith('/classroom');

  if (userRole === 'teacher') {
    // Teachers can access teacher dashboard and classroom paths
    if (isParentPath) {
      return <Navigate to="/teacher/dashboard" />;
    }
  } else if (userRole === 'parent') {
    // Parents can only access parent dashboard and their children's paths
    if (isTeacherPath || isClassroomPath) {
      return <Navigate to="/parent/dashboard" />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
