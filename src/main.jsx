import './index.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './features/auth/Login.jsx';
import Dashboard from './features/dashboard/dashboard.jsx';
import Home from './features/home/Home.jsx';
import ProjectDetail from './features/projects/detail/ProjectDetail.jsx';
import ProtectedRoute from './features/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      {/* Root: redirect to /home if logged in */}
      <Route
        path="/"
        element={
          localStorage.getItem('isLoggedIn') === 'true' ? (
            <Navigate to="/home" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-detail"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    <ToastContainer />
  </Router>
);
