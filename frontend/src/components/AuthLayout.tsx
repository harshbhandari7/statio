import { Fragment, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className="auth-container">
      {/* Animated gradient background */}
      <div className="gradient-background">
        {/* Animated grid pattern */}
        <div className="grid-pattern" />
        
        {/* Floating orbs with enhanced animations */}
        <div className="floating-orb orb-blue" />
        <div className="floating-orb orb-purple" />
        <div className="floating-orb orb-indigo" />
        
        {/* Additional smaller orbs for more dynamic feel */}
        <div className="floating-orb orb-cyan" />
        <div className="floating-orb orb-pink" />
        
        {/* Subtle shimmer overlay */}
        <div className="shimmer-overlay" />
      </div>

      {/* Content */}
      <div className={`content-container ${mounted ? 'mounted' : 'unmounted'}`}>
        {/* Logo and Header */}
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <svg 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
          </div>
          <h3 className="app-title">
            Statio
          </h3>
          <p className="app-subtitle">
            Modern Status & Incident Management
          </p>
        </div>

        {/* Main Content with glass effect */}
        <div className="main-content">
          <Outlet />
        </div>
        
        {/* Footer */}
        <div className="footer">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Statio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}