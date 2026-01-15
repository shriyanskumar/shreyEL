import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/documents.css";

const DocumentList = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
  });

  const [viewMode, setViewMode] = useState(
    () => sessionStorage.getItem("docViewMode") || "grid"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents && documents.length >= 0) {
      applyFilters();
    } else {
      setFilteredDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, filters, searchTerm, sortBy]);

  useEffect(() => {
    sessionStorage.setItem("docViewMode", viewMode);
  }, [viewMode]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/documents");
      setDocuments(response.data.documents || []);
    } catch (err) {
      setError("Failed to load documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = documents;

    if (filters.status !== "all") {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    const defaultCategories = new Set([
      "license",
      "certificate",
      "permit",
      "insurance",
      "contract",
      "bank",
      "medical",
      "miscellaneous",
      "other",
    ]);
    if (filters.category !== "all") {
      if (filters.category === "other") {
        filtered = filtered.filter((doc) => {
          const catName = (doc.category || "").toLowerCase();
          const isDefault = defaultCategories.has(catName);
          return !!doc.categoryId || !isDefault;
        });
      } else {
        filtered = filtered.filter((doc) => {
          const catMatch = (doc.category || "") === filters.category;
          const linkedMatch =
            doc.categoryId && doc.categoryId.name === filters.category;
          return catMatch || linkedMatch;
        });
      }
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.uploadedAt || b.createdAt) -
          new Date(a.uploadedAt || a.createdAt)
      );
    } else if (sortBy === "expiry-soon") {
      filtered.sort((a, b) => {
        const aExpiry = a.expiryDate
          ? new Date(a.expiryDate)
          : new Date("2099-12-31");
        const bExpiry = b.expiryDate
          ? new Date(b.expiryDate)
          : new Date("2099-12-31");
        return aExpiry - bExpiry;
      });
    }

    setFilteredDocuments(filtered);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const formatExpiryContext = (expiryDate) => {
    if (!expiryDate) return { text: "No expiry date", status: "normal" };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntil = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    const formatted = formatDate(expiryDate);

    if (daysUntil < 0)
      return { text: `Expired: ${formatted}`, status: "expired" };
    if (daysUntil <= 30)
      return { text: `Expires: ${formatted}`, status: "warning" };
    return { text: `Expires: ${formatted}`, status: "normal" };
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/api/documents/${documentId}`);
      setSuccessMessage("Document deleted successfully");
      fetchDocuments();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete document");
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { class: "ft-badge-success", icon: "✓", label: "Approved" },
      verified: { class: "ft-badge-success", icon: "✓", label: "Verified" },
      pending: { class: "ft-badge-warning", icon: "⏳", label: "Pending" },
      "in-progress": {
        class: "ft-badge-info",
        icon: "🔄",
        label: "In Progress",
      },
      submitted: { class: "ft-badge-info", icon: "📄", label: "Submitted" },
      expiring: {
        class: "ft-badge-warning",
        icon: "⚠️",
        label: "Expiring Soon",
      },
      expired: { class: "ft-badge-error", icon: "✕", label: "Expired" },
    };
    const s = statusMap[status?.toLowerCase()] || {
      class: "ft-badge-neutral",
      icon: "•",
      label: status,
    };
    return (
      <span className={`ft-badge ${s.class}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const totalPages = Math.ceil(
    (filteredDocuments?.length || 0) / pagination.itemsPerPage
  );
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const paginatedDocuments = (filteredDocuments || []).slice(
    startIndex,
    startIndex + pagination.itemsPerPage
  );

  if (loading) {
    return (
      <div className="ft-page">
        <div className="ft-loading">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="ft-page fade-in">
      {/* Page Header */}
      <div className="ft-page-header">
        <div className="ft-page-header-row">
          <div>
            <h1>📋 My Documents</h1>
            <p>Manage and track all your important documents</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="ft-tabs" style={{ marginBottom: 0 }}>
              <button
                className={`ft-tab ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                ⊞ Grid
              </button>
              <button
                className={`ft-tab ${viewMode === "compact" ? "active" : ""}`}
                onClick={() => setViewMode("compact")}
              >
                ☰ List
              </button>
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="ft-btn ft-btn-primary"
            >
              + Upload
            </button>
          </div>
        </div>
      </div>

      {error && <div className="ft-alert ft-alert-error">{error}</div>}
      {successMessage && (
        <div className="ft-alert ft-alert-success">{successMessage}</div>
      )}

      {/* Filters Section */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">1</div>
          <div className="section-content">
            <h2>Filters & Search</h2>
            <p>REFINE YOUR DOCUMENTS</p>
          </div>
        </div>

        <div className="ft-card">
          <div className="ft-card-body">
            <div className="ft-grid-4" style={{ alignItems: "end" }}>
              <div>
                <label className="ft-label" htmlFor="status-filter">
                  Status
                </label>
                <select
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="ft-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="expiring">Expiring</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="ft-label" htmlFor="category-filter">
                  Category
                </label>
                <select
                  id="category-filter"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="ft-select"
                >
                  <option value="all">All Categories</option>
                  <option value="license">License</option>
                  <option value="certificate">Certificate</option>
                  <option value="permit">Permit</option>
                  <option value="insurance">Insurance</option>
                  <option value="contract">Contract</option>
                  <option value="bank">Bank</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="ft-label" htmlFor="sort-filter">
                  Sort by
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ft-select"
                >
                  <option value="newest">Newest first</option>
                  <option value="expiry-soon">Expiry soon</option>
                </select>
              </div>

              <div>
                <label className="ft-label" htmlFor="search-input">
                  Search
                </label>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ft-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">2</div>
          <div className="section-content">
            <h2>Documents ({filteredDocuments.length})</h2>
            <p>YOUR DOCUMENT LIBRARY</p>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="ft-empty-state">
            <div className="ft-empty-icon">📄</div>
            <h3 className="ft-empty-title">No documents found</h3>
            <p className="ft-empty-description">
              {searchTerm ||
              filters.status !== "all" ||
              filters.category !== "all"
                ? "Try adjusting your filters or search term"
                : "Start by uploading your first document!"}
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="ft-btn ft-btn-primary"
            >
              + Upload Document
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="doc-grid">
                {paginatedDocuments.map((doc) => {
                  const expiryContext = formatExpiryContext(doc.expiryDate);

                  return (
                    <div
                      key={doc._id}
                      className="ft-card ft-card-clickable doc-card-new"
                      onClick={() => navigate(`/documents/${doc._id}`)}
                    >
                      <div className="ft-card-body">
                        <div className="doc-card-icon">📄</div>
                        <h3 className="doc-card-title">{doc.title}</h3>
                        <div className="doc-card-badges">
                          {getStatusBadge(doc.status)}
                          <span className="ft-badge ft-badge-info">
                            {doc.category}
                          </span>
                        </div>
                        <div
                          className={`doc-card-expiry ${
                            expiryContext.status === "expired"
                              ? "expiry-error"
                              : expiryContext.status === "warning"
                              ? "expiry-warning"
                              : ""
                          }`}
                        >
                          {expiryContext.text}
                        </div>
                        <div className="doc-card-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/documents/${doc._id}`);
                            }}
                            className="ft-btn ft-btn-secondary"
                            style={{ flex: 1 }}
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc._id);
                            }}
                            className="ft-btn"
                            style={{
                              background: "var(--error-red-bg)",
                              color: "var(--error-red)",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ft-card">
                <table className="ft-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((doc) => {
                      const expiryContext = formatExpiryContext(doc.expiryDate);

                      return (
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
                              <span style={{ fontWeight: 500 }}>
                                {doc.title}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="ft-badge ft-badge-info">
                              {doc.category}
                            </span>
                          </td>
                          <td>{getStatusBadge(doc.status)}</td>
                          <td>
                            <span
                              className={
                                expiryContext.status === "expired"
                                  ? "text-error"
                                  : expiryContext.status === "warning"
                                  ? "text-warning"
                                  : ""
                              }
                            >
                              {expiryContext.text}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/documents/${doc._id}`);
                                }}
                                className="ft-btn ft-btn-secondary"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "13px",
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc._id);
                                }}
                                className="ft-btn"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "13px",
                                  background: "var(--error-red-bg)",
                                  color: "var(--error-red)",
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="doc-pagination">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="ft-btn ft-btn-secondary"
                >
                  ← Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(totalPages, prev.currentPage + 1),
                    }))
                  }
                  disabled={pagination.currentPage === totalPages}
                  className="ft-btn ft-btn-secondary"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
