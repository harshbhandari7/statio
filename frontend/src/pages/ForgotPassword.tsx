import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { auth } from '../services/api';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await auth.forgotPassword(email);
      setIsSuccess(true);
      setMessage(response.data.message);
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        
        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
            
            <div className="form-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        ) : (
          <div className="success-container">
            <p>If your email is registered, you will receive a password reset link shortly.</p>
            <Link to="/login" className="back-to-login">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
