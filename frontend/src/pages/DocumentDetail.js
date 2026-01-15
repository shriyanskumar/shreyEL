import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/document-detail.css";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError("");

      const docResponse = await api.get(`/api/documents/${id}`);
      setDocument(docResponse.data);

      try {
        const summaryResponse = await api.get(`/api/documents/${id}/summary`);
        setSummary(summaryResponse.data);
      } catch (err) {
        setSummary(null);
      }
    } catch (err) {
      setError("Failed to load document");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      setError("");

      await api.post("/api/summaries/generate", {
        documentId: id,
      });

      setSuccessMessage("Summary generated successfully!");
      setTimeout(() => {
        fetchDocument();
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      setError("Failed to generate summary");
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/api/documents/${id}`);
      setSuccessMessage("Document deleted successfully");
      setTimeout(() => {
        navigate("/documents");
      }, 1500);
    } catch (err) {
      setError("Failed to delete document");
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { class: 'ft-badge-info', label: '📄 Submitted' },
      'in-progress': { class: 'ft-badge-warning', label: '🔄 In Progress' },
      approved: { class: 'ft-badge-success', label: '✓ Approved' },
      verified: { class: 'ft-badge-success', label: '✓ Verified' },
      expiring: { class: 'ft-badge-warning', label: '⚠️ Expiring' },
      expired: { class: 'ft-badge-error', label: '✕ Expired' },
    };
    const s = statusMap[status?.toLowerCase()] || { class: 'ft-badge-neutral', label: status };
    return <span className={`ft-badge ${s.class}`}>{s.label}</span>;
  };

  const getImportanceBadge = (importance) => {
    const importanceMap = {
      low: { class: 'ft-badge-success', label: 'Low' },
      medium: { class: 'ft-badge-warning', label: 'Medium' },
      high: { class: 'ft-badge-error', label: 'High' },
      critical: { class: 'ft-badge-error', label: '🔴 Critical' },
    };
    const i = importanceMap[importance?.toLowerCase()] || { class: 'ft-badge-neutral', label: importance || 'Medium' };
    return <span className={`ft-badge ${i.class}`}>{i.label}</span>;
  };

  if (loading) {
    return (
      <div className="ft-page">
        <div className="ft-loading">Loading document details...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="ft-page">
        <div className="ft-empty-state">
          <div className="ft-empty-icon">📄</div>
          <h3 className="ft-empty-title">Document not found</h3>
          <p className="ft-empty-description">This document may have been deleted or doesn't exist.</p>
          <button onClick={() => navigate("/documents")} className="ft-btn ft-btn-primary">
            ← Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const isExpired = document.expiryDate && new Date(document.expiryDate) < new Date();
  const isExpiring =
    document.expiryDate &&
    new Date(document.expiryDate) > new Date() &&
    (new Date(document.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;

  return (
    <div className="ft-page fade-in">
      {/* Header */}
      <div className="ft-page-header">
        <div className="ft-page-header-row">
          <div>
            <button onClick={() => navigate("/documents")} className="ft-btn ft-btn-secondary" style={{ marginBottom: '12px' }}>
              ← Back to Documents
            </button>
            <h1>📄 {document.title}</h1>
            <p>Document Details & AI Analysis</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate(`/documents/${id}/edit`)} className="ft-btn ft-btn-secondary">
              ✏️ Edit
            </button>
            <button onClick={handleDelete} className="ft-btn" style={{ background: 'var(--error-red-bg)', color: 'var(--error-red)' }}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {error && <div className="ft-alert ft-alert-error">{error}</div>}
      {successMessage && <div className="ft-alert ft-alert-success">{successMessage}</div>}

      <div className="detail-layout">
        {/* Main Content */}
        <div className="detail-main-content">
          {/* Document Info Section */}
          <div className="ft-section">
            <div className="section-header">
              <div className="section-badge">1</div>
              <div className="section-content">
                <h2>Document Information</h2>
                <p>BASIC DETAILS</p>
              </div>
            </div>

            <div className="ft-card">
              <div className="ft-card-body">
                <div className="info-grid-new">
                  <div className="info-item-new">
                    <span className="info-label">Category</span>
                    <span className="ft-badge ft-badge-info">{document.category}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label">Status</span>
                    {getStatusBadge(document.status)}
                  </div>
                  <div className="info-item-new">
                    <span className="info-label">Uploaded</span>
                    <span className="info-value">{formatDate(document.uploadedAt || document.createdAt)}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label">Last Updated</span>
                    <span className="info-value">{formatDate(document.updatedAt)}</span>
                  </div>
                  {document.expiryDate && (
                    <div className="info-item-new">
                      <span className="info-label">Expiry Date</span>
                      <span className={`info-value ${isExpired ? 'text-error' : isExpiring ? 'text-warning' : ''}`}>
                        {formatDate(document.expiryDate)}
                        {isExpired && <span className="ft-badge ft-badge-error" style={{ marginLeft: '8px' }}>Expired</span>}
                        {isExpiring && <span className="ft-badge ft-badge-warning" style={{ marginLeft: '8px' }}>Expiring Soon</span>}
                      </span>
                    </div>
                  )}
                </div>

                {document.description && (
                  <div className="description-box">
                    <h4>Description</h4>
                    <p>{document.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="ft-section">
            <div className="section-header">
              <div className="section-badge">2</div>
              <div className="section-content">
                <h2>AI Summary & Analysis</h2>
                <p>INTELLIGENT INSIGHTS</p>
              </div>
            </div>

            <div className="ft-card">
              <div className="ft-card-body">
                {!summary && (
                  <div className="generate-summary-box">
                    <p>No AI summary generated yet for this document.</p>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={generatingSummary}
                      className="ft-btn ft-btn-primary ft-btn-lg"
                    >
                      {generatingSummary ? "⏳ Generating..." : "✨ Generate AI Summary"}
                    </button>
                  </div>
                )}

                {summary && (
                  <div className="summary-content">
                    {/* Metrics Row */}
                    <div className="ft-grid-2" style={{ marginBottom: '24px' }}>
                      <div className="metric-box">
                        <span className="metric-label">Readability Score</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill"
                            style={{ width: `${isNaN(summary.readabilityScore) ? 0 : summary.readabilityScore}%` }}
                          ></div>
                        </div>
                        <span className="metric-value">
                          {isNaN(summary.readabilityScore) ? "N/A" : Math.round(summary.readabilityScore)}/100
                        </span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">Importance Level</span>
                        <div style={{ marginTop: '8px' }}>
                          {getImportanceBadge(summary.importance)}
                        </div>
                      </div>
                    </div>

                    {/* Summary Text */}
                    {summary.summary && (
                      <div className="summary-text-box">
                        <h4>📝 Summary</h4>
                        <p>{summary.summary}</p>
                      </div>
                    )}

                    {/* Key Points */}
                    {summary.keyPoints && summary.keyPoints.length > 0 && (
                      <div className="key-points-box">
                        <h4>🔑 Key Points</h4>
                        <ul>
                          {summary.keyPoints.map((point, index) => (
                            <li key={index}>✓ {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {summary.suggestedActions && summary.suggestedActions.length > 0 && (
                      <div className="actions-box">
                        <h4>📋 Suggested Actions</h4>
                        <ul>
                          {summary.suggestedActions.map((action, index) => (
                            <li key={index}>→ {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="summary-meta-new">
                      Generated on {formatDate(summary?.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar-content">
          {/* Quick Stats */}
          <div className="ft-card">
            <div className="ft-card-header">
              <div className="ft-card-header-icon">📊</div>
              <div>
                <div className="ft-card-title">Quick Stats</div>
                <div className="ft-card-subtitle">Document Info</div>
              </div>
            </div>
            <div className="ft-card-body">
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">File Size</span>
                <span className="sidebar-stat-value">
                  {document.fileSize && document.fileSize > 0
                    ? `${Math.round(document.fileSize / 1024)} KB`
                    : "N/A"}
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Pages</span>
                <span className="sidebar-stat-value">{document.pages || "N/A"}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Language</span>
                <span className="sidebar-stat-value">{document.language || "English"}</span>
              </div>
            </div>
          </div>

          {/* Expiry Alert */}
          {(isExpired || isExpiring) && (
            <div className={`ft-info-box ${isExpired ? 'error' : 'warning'}`} style={{ marginTop: '16px' }}>
              <span className="ft-info-box-icon">{isExpired ? '⚠️' : '⏰'}</span>
              <div>
                <strong>{isExpired ? 'Document Expired' : 'Expiring Soon'}</strong>
                <br />
                {isExpired 
                  ? 'This document has expired. Consider renewing it.'
                  : 'This document will expire within 30 days.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
