import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: '◉', label: 'Dashboard' },
    { path: '/documents', icon: '◻', label: 'Documents' },
    { path: '/upload', icon: '↑', label: 'Upload' },
    { path: '/reminders', icon: '⚠', label: 'Reminders' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* Logo/Brand */}
          <div className="sidebar-header">
            <div className="brand">
              <span className="brand-icon">◻</span>
              <span className="brand-text">DocTracker</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.username || 'User'}</div>
                <div className="user-email">{user?.email || ''}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button" title="Logout">
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;