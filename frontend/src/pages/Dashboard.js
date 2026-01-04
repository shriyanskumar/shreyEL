import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingSummaries: 0,
    upcomingReminders: 0
  });

  const [error, setError] = useState('');
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/documents');
        const documents = res.data.documents || [];

        const totalDocs = documents.length;
        const pendingSums = documents.filter(d => !d.summary).length;

        const upcomingRems = documents.filter(d => {
          if (!d.expiryDate) return false;
          const exp = new Date(d.expiryDate);
          const limit = new Date();
          limit.setDate(limit.getDate() + 30);
          return exp <= limit && exp > new Date();
        }).length;

        setStats({
          totalDocuments: totalDocs,
          pendingSummaries: pendingSums,
          upcomingReminders: upcomingRems
        });

        const sorted = [...documents]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 4);
        setRecentDocs(sorted);
      } catch (err) {
        setError('Failed to load statistics');
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header-wrapper">
        <div className="page-header-left">
          <h1>Welcome back, {user?.username}!</h1>
          <p>Track, manage, and summarize your important documents</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">◻</div>
          <div className="stat-content">
            <span className="stat-label">Total Documents</span>
            <span className="stat-value">{stats.totalDocuments}</span>
          </div>
          <button onClick={() => navigate('/documents')} className="stat-action">→</button>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">⌛</div>
          <div className="stat-content">
            <span className="stat-label">Pending Summaries</span>
            <span className="stat-value">{stats.pendingSummaries}</span>
          </div>
          <button onClick={() => navigate('/documents')} className="stat-action">→</button>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-label">Upcoming Reminders</span>
            <span className="stat-value">{stats.upcomingReminders}</span>
          </div>
          <button onClick={() => navigate('/reminders')} className="stat-action">→</button>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="recent-section">
        <h2>Recent Documents</h2>
        {recentDocs.length === 0 ? (
          <div className="empty-recent">
            <p>No documents yet. Start by uploading your first document!</p>
            <button onClick={() => navigate('/upload')} className="btn btn-primary">
              ↑ Upload Document
            </button>
          </div>
        ) : (
          <div className="recent-list glass-card">
            {recentDocs.map(doc => (
              <div
                key={doc._id}
                className="recent-item"
                onClick={() => navigate(`/documents/${doc._id}`)}
              >
                <div className="recent-icon">◻</div>
                <div className="recent-info">
                  <div className="recent-title">{doc.title}</div>
                  <div className="recent-meta">
                    <span className="recent-category">{doc.category}</span>
                    <span className="recent-status">{doc.status}</span>
                  </div>
                </div>
                <span className="recent-arrow">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/documents')} className="action-card glass-card">
            <div className="action-icon-wrapper">
              <span className="action-icon">≡</span>
            </div>
            <span className="action-label">View All Documents</span>
          </button>
          <button onClick={() => navigate('/upload')} className="action-card glass-card">
            <div className="action-icon-wrapper">
              <span className="action-icon">↑</span>
            </div>
            <span className="action-label">Upload Document</span>
          </button>
          <button onClick={() => navigate('/reminders')} className="action-card glass-card">
            <div className="action-icon-wrapper">
              <span className="action-icon">⏱</span>
            </div>
            <span className="action-label">View Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;