// import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Students from "./pages/students";

// Redirect old /dashboard route based on stored role
function DashboardRedirect() {
  const isStaff = localStorage.getItem("is_staff") === "true";
  return <Navigate to={isStaff ? "/staff-dashboard" : "/student-dashboard"} replace />;
}

// Protect any route that requires authentication
function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/login" replace />;
}

// Protect staff-only routes
function StaffRoute({ children }) {
  const token = localStorage.getItem("access");
  const isStaff = localStorage.getItem("is_staff") === "true";
  if (!token) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/student-dashboard" replace />;
  return children;
}

// Protect student-only routes — staff get redirected to their own dashboard
function StudentRoute({ children }) {
  const token = localStorage.getItem("access");
  const isStaff = localStorage.getItem("is_staff") === "true";
  if (!token) return <Navigate to="/login" replace />;
  if (isStaff) return <Navigate to="/staff-dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
        <Route path="/student-dashboard" element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } />
        <Route path="/staff-dashboard" element={
          <StaffRoute>
            <StaffDashboard />
          </StaffRoute>
        } />
        <Route path="/students" element={<Students />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;