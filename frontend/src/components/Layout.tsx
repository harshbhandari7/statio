import { Fragment, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import './Layout.css';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Services', href: '/services', icon: WrenchScrewdriverIcon },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  return (
    <div className="app-container">
      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:hidden`}>
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        <div className={`sidebar-container ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">Statio</h1>
            <button
              type="button"
              className="sidebar-close-button"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <item.icon className="nav-link-icon" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="user-profile">
              <UserCircleIcon className="user-icon" />
              <div className="user-info">
                <p className="user-name">
                  {user?.full_name || user?.email}
                </p>
                <button
                  onClick={logout}
                  className="signout-button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`desktop-sidebar ${desktopSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="desktop-sidebar-inner">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Statio</h1>
          </div>
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <item.icon className="nav-link-icon" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="user-profile">
              <UserCircleIcon className="user-icon" />
              <div className="user-info">
                <p className="user-name">
                  {user?.full_name || user?.email}
                </p>
                <button
                  onClick={logout}
                  className="signout-button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`main-content-wrapper ${desktopSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="top-navbar">
          <div>
            {/* Mobile menu button */}
            {/* <button
              type="button"
              className="mobile-menu-button lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button> */}
            
            {/* Desktop menu button */}
            <button
              type="button"
              className="desktop-menu-button"
              onClick={toggleDesktopSidebar}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <main className="main-container">
          <div className="content-container">
            <div className="fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}