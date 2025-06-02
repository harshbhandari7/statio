import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Incidents from './pages/Incidents';
import StatusPage from './pages/StatusPage';
import Users from './pages/Users';
import Organizations from './pages/Organizations';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Check for token directly as a fallback
  const hasToken = localStorage.getItem('token') !== null;
  
  // Don't redirect while still loading or if token exists
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (user || hasToken) ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Public Status page */}
          <Route path="/status" element={<StatusPage />} />

          {/* Make root path redirect to status page for public users */}
          <Route path="/" element={<StatusPage />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/users" element={<Users />} />
            <Route path="/organizations" element={<Organizations />} />
            {/* Add a route for admin to access dashboard from status page */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
