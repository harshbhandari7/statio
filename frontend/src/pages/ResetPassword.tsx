import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { auth } from '../services/api';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      setError(''); // Clear any error if token is found
    } else {
      setError('No reset token provided. Please request a new password reset link.');
    }
  }, [location]);

  const validateForm = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await auth.resetPassword(token, password);
      
      setIsSuccess(true);
      setMessage(response.data.message || 'Password has been reset successfully');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setIsSuccess(false);
      setError(error.response?.data?.detail || 'An error occurred. Please try again or request a new reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        
        {message && (
          <div className="message success">
            {message}
          </div>
        )}
        
        {error && !isSuccess && (
          <div className="message error">
            {error}
          </div>
        )}
        
        {!token && !isSuccess ? (
          <div className="error-container">
            <p>No reset token provided. Please request a new password reset link.</p>
            <Link to="/forgot-password" className="request-link">Request Password Reset</Link>
          </div>
        ) : !isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
            
            <div className="form-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        ) : (
          <div className="success-container">
            <p>{message}</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
