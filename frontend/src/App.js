import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import DocumentUpload from './pages/DocumentUpload';
import DocumentDetail from './pages/DocumentDetail';
import DocumentEdit from './pages/DocumentEdit';
import Reminders from './pages/Reminders';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/documents/:id/edit" element={<DocumentEdit />} />
          <Route path="/upload" element={<DocumentUpload />} />
          <Route path="/reminders" element={<Reminders />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;