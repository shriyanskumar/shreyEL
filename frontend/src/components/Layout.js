import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: "🏠", label: "Dashboard" },
    { path: "/documents", icon: "📋", label: "Documents" },
    { path: "/upload", icon: "⬆️", label: "Upload" },
    { path: "/reminders", icon: "⏰", label: "Reminders" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-inner">
          {/* Logo/Brand */}
          <div className="sidebar-brand">
            <div className="brand-logo">📄</div>
            <span className="brand-name">DocTracker</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span className="nav-link-text">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="sidebar-user">
            <div className="user-card">
              <div className="user-avatar-circle">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <div className="user-display-name">
                  {user?.username || "User"}
                </div>
                <div className="user-email-text">{user?.email || ""}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
