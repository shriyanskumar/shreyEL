import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DocumentList from "./pages/DocumentList";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail";
import DocumentEdit from "./pages/DocumentEdit";
import Reminders from "./pages/Reminders";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/documents/:id/edit" element={<DocumentEdit />} />
        <Route path="/upload" element={<DocumentUpload />} />
        <Route path="/reminders" element={<Reminders />} />
      </Route>

      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
