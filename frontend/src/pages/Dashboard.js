import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingSummaries: 0,
    upcomingReminders: 0,
  });

  const [error, setError] = useState("");
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/documents");
        const documents = res.data.documents || [];

        const totalDocs = documents.length;
        const pendingSums = documents.filter((d) => !d.summary).length;

        const upcomingRems = documents.filter((d) => {
          if (!d.expiryDate) return false;
          const exp = new Date(d.expiryDate);
          const limit = new Date();
          limit.setDate(limit.getDate() + 30);
          return exp <= limit && exp > new Date();
        }).length;

        setStats({
          totalDocuments: totalDocs,
          pendingSummaries: pendingSums,
          upcomingReminders: upcomingRems,
        });

        const sorted = [...documents]
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
          .slice(0, 4);
        setRecentDocs(sorted);
      } catch (err) {
        setError("Failed to load statistics");
      }
    };

    fetchStats();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      verified: { class: "ft-badge-success", label: "✓ Verified" },
      pending: { class: "ft-badge-warning", label: "⏳ Pending" },
      expired: { class: "ft-badge-error", label: "✕ Expired" },
      submitted: { class: "ft-badge-info", label: "📄 Submitted" },
    };
    const s = statusMap[status?.toLowerCase()] || {
      class: "ft-badge-neutral",
      label: status,
    };
    return <span className={`ft-badge ${s.class}`}>{s.label}</span>;
  };

  return (
    <div className="ft-page fade-in">
      {/* Page Header */}
      <div className="ft-page-header">
        <div className="ft-page-header-row">
          <div>
            <h1>👋 Welcome back, {user?.username}!</h1>
            <p>Track, manage, and summarize your important documents</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="ft-btn ft-btn-primary ft-btn-lg"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {error && <div className="ft-alert ft-alert-error">{error}</div>}

      {/* Section 1: Overview Stats */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">1</div>
          <div className="section-content">
            <h2>Document Overview</h2>
            <p>YOUR DOCUMENT STATISTICS</p>
          </div>
        </div>

        <div className="ft-grid-3">
          <div
            className="ft-stat-card ft-card-clickable"
            onClick={() => navigate("/documents")}
          >
            <span className="ft-stat-label">Total Documents</span>
            <span className="ft-stat-value">{stats.totalDocuments}</span>
            <span className="ft-stat-description">All uploaded documents</span>
          </div>

          <div
            className="ft-stat-card ft-card-clickable"
            onClick={() => navigate("/documents")}
          >
            <span className="ft-stat-label">Pending Summaries</span>
            <span className="ft-stat-value warning">
              {stats.pendingSummaries}
            </span>
            <span className="ft-stat-description">
              Documents awaiting AI summary
            </span>
          </div>

          <div
            className="ft-stat-card ft-card-clickable"
            onClick={() => navigate("/reminders")}
          >
            <span className="ft-stat-label">Upcoming Reminders</span>
            <span className="ft-stat-value error">
              {stats.upcomingReminders}
            </span>
            <span className="ft-stat-description">Expiring within 30 days</span>
          </div>
        </div>
      </div>

      {/* Section 2: Recent Documents */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">2</div>
          <div className="section-content">
            <h2>Recent Documents</h2>
            <p>RECENTLY UPDATED</p>
          </div>
        </div>

        {recentDocs.length === 0 ? (
          <div className="ft-empty-state">
            <div className="ft-empty-icon">📄</div>
            <h3 className="ft-empty-title">No documents yet</h3>
            <p className="ft-empty-description">
              Start by uploading your first document to get started with
              tracking
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="ft-btn ft-btn-primary"
            >
              + Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="ft-card">
            <table className="ft-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr
                    key={doc._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/documents/${doc._id}`)}
                  >
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div className="section-icon">📄</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{doc.title}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {doc.fileType?.toUpperCase() || "PDF"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ft-badge ft-badge-info">
                        {doc.category}
                      </span>
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td style={{ color: "var(--text-tertiary)" }}>
                      {new Date(
                        doc.updatedAt || doc.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="ft-btn ft-btn-secondary"
                        style={{ padding: "8px 12px" }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Quick Actions */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge success">3</div>
          <div className="section-content">
            <h2>Quick Actions</h2>
            <p>GET STARTED</p>
          </div>
        </div>

        <div className="ft-grid-3">
          <div
            className="ft-card ft-card-clickable"
            onClick={() => navigate("/documents")}
          >
            <div
              className="ft-card-body"
              style={{ textAlign: "center", padding: "32px 24px" }}
            >
              <div
                className="section-icon"
                style={{
                  margin: "0 auto 16px",
                  background: "var(--primary-blue-bg)",
                  color: "var(--primary-blue)",
                }}
              >
                📋
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>
                View All Documents
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-tertiary)",
                }}
              >
                Browse and manage your complete document library
              </p>
            </div>
          </div>

          <div
            className="ft-card ft-card-clickable"
            onClick={() => navigate("/upload")}
          >
            <div
              className="ft-card-body"
              style={{ textAlign: "center", padding: "32px 24px" }}
            >
              <div
                className="section-icon"
                style={{
                  margin: "0 auto 16px",
                  background: "var(--success-green-bg)",
                  color: "var(--success-green)",
                }}
              >
                ⬆️
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>
                Upload Document
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-tertiary)",
                }}
              >
                Add new documents with AI-powered summarization
              </p>
            </div>
          </div>

          <div
            className="ft-card ft-card-clickable"
            onClick={() => navigate("/reminders")}
          >
            <div
              className="ft-card-body"
              style={{ textAlign: "center", padding: "32px 24px" }}
            >
              <div
                className="section-icon"
                style={{
                  margin: "0 auto 16px",
                  background: "var(--warning-orange-bg)",
                  color: "var(--warning-orange)",
                }}
              >
                ⏰
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>
                View Reminders
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-tertiary)",
                }}
              >
                Track expiry dates and upcoming renewals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="ft-info-box info" style={{ marginTop: "24px" }}>
        <span className="ft-info-box-icon">💡</span>
        <div>
          <strong>Pro Tip:</strong> Upload your documents to automatically
          generate AI summaries and set up expiry reminders to never miss
          important deadlines.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
