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

  const getStatusColor = (status) => {
    const colors = {
      submitted: "#2196f3",
      "in-progress": "#ff9800",
      approved: "#4caf50",
      expiring: "#ff9800",
      expired: "#f44336",
    };
    return colors[status] || "#666";
  };

  const getImportanceColor = (importance) => {
    const colors = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336",
      critical: "#8b0000",
    };
    return colors[importance] || "#666";
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading-spinner">Loading document details...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="detail-container">
        <div className="error-page">
          <h2>Document not found</h2>
          <button
            onClick={() => navigate("/documents")}
            className="btn btn-primary"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const isExpired =
    document.expiryDate && new Date(document.expiryDate) < new Date();
  const isExpiring =
    document.expiryDate &&
    new Date(document.expiryDate) > new Date() &&
    (new Date(document.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;

  return (
    <div className="detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <button onClick={() => navigate("/documents")} className="back-btn">
            ← Back
          </button>
          <div>
            <h1>{document.title}</h1>
            <p className="breadcrumb">Documents / {document.title}</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="detail-grid">
        {/* Main Content */}
        <div className="detail-main">
          {/* Document Info Card */}
          <div className="info-card glass-card">
            <h2>◻ Document Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Category</label>
                <p className="category-badge">{document.category}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(document.status) }}
                  >
                    {document.status}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Uploaded</label>
                <p>{formatDate(document.uploadedAt || document.createdAt)}</p>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <p>{formatDate(document.updatedAt)}</p>
              </div>
              {document.expiryDate && (
                <div className="info-item">
                  <label>Expiry Date</label>
                  <p
                    className={
                      isExpired
                        ? "text-expired"
                        : isExpiring
                        ? "text-expiring"
                        : ""
                    }
                  >
                    {formatDate(document.expiryDate)}
                    {isExpired && " (Expired)"}
                    {isExpiring && " (Expiring Soon)"}
                  </p>
                </div>
              )}
            </div>

            {document.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{document.description}</p>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="summary-card glass-card">
            <div className="summary-header">
              <h2>⌛ AI Summary & Analysis</h2>
              {!summary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="btn btn-primary"
                >
                  {generatingSummary
                    ? "⏳ Generating..."
                    : "✨ Generate Summary"}
                </button>
              )}
            </div>

            {summary ? (
              <>
                {/* Readability Score */}
                <div className="metric-card">
                  <h4>Readability Score</h4>
                  <div className="score-display">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${
                            isNaN(summary.readabilityScore)
                              ? 0
                              : summary.readabilityScore
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="score-text">
                      {isNaN(summary.readabilityScore)
                        ? "N/A"
                        : Math.round(summary.readabilityScore)}
                      /100
                    </span>
                  </div>
                </div>

                {/* Importance Level */}
                <div className="metric-card">
                  <h4>Importance Level</h4>
                  <p>
                    <span
                      className="importance-badge"
                      style={{ color: getImportanceColor(summary.importance) }}
                    >
                      {summary.importance
                        ? summary.importance.toUpperCase()
                        : "MEDIUM"}
                    </span>
                  </p>
                </div>

                {/* Summary Text */}
                {summary.summary && (
                  <div className="summary-text-card">
                    <h3>Summary</h3>
                    <p>{summary.summary}</p>
                  </div>
                )}

                {/* Key Points */}
                {summary.keyPoints && summary.keyPoints.length > 0 && (
                  <div className="key-points-card">
                    <h3>Key Points</h3>
                    <ul>
                      {summary.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Actions */}
                {summary.suggestedActions &&
                  summary.suggestedActions.length > 0 && (
                    <div className="actions-card">
                      <h3>Suggested Actions</h3>
                      <ul className="actions-list">
                        {summary.suggestedActions.map((action, index) => (
                          <li key={index}>
                            <span className="action-icon">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Summary Metadata */}
                <div className="summary-meta">
                  <p className="summary-time">
                    Generated on {formatDate(summary?.createdAt)}
                  </p>
                </div>
              </>
            ) : (
              <div className="empty-summary">
                <p>
                  No summary generated yet. Click the button above to generate
                  one!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Actions Card */}
          <div className="actions-sidebar glass-card">
            <h3>Actions</h3>
            <div className="action-list">
              <button
                onClick={() => navigate(`/documents/${id}/edit`)}
                className="action-btn"
              >
                ✎ Edit Document
              </button>
              <button onClick={handleDelete} className="action-btn danger">
                ✕ Delete Document
              </button>
            </div>
          </div>

          {/* Document Stats */}
          <div className="stats-sidebar glass-card">
            <h3>Quick Stats</h3>
            <div className="stat">
              <label>File Size</label>
              <p>
                {document.fileSize && document.fileSize > 0
                  ? `${Math.round(document.fileSize / 1024)} KB`
                  : "N/A"}
              </p>
            </div>
            <div className="stat">
              <label>Pages</label>
              <p>{document.pages ? document.pages : "N/A"}</p>
            </div>
            <div className="stat">
              <label>Language</label>
              <p>{document.language || "English"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
