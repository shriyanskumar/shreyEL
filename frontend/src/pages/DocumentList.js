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

  const categoryColors = {
    insurance: "#E8544A",
    license: "#4CAF50",
    certificate: "#2196F3",
    permit: "#FF9800",
    contract: "#9C27B0",
    bank: "#00BCD4",
    medical: "#E91E63",
    other: "#757575",
  };

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

  const getCategoryColor = (category) => {
    return categoryColors[category?.toLowerCase()] || categoryColors["other"];
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
      <div className="documents-container">
        <div className="loading-spinner">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      {/* Page Header */}
      <div className="documents-header">
        <div>
          <h1>My Documents</h1>
          <p>Manage and track all your important documents</p>
        </div>
        <div className="documents-header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              ≡
            </button>
            <button
              className={`toggle-btn ${viewMode === "compact" ? "active" : ""}`}
              onClick={() => setViewMode("compact")}
              title="List view"
            >
              ☰
            </button>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="btn btn-primary"
          >
            ↑ Upload
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
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

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort by</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest first</option>
            <option value="expiry-soon">Expiry soon</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <p>No documents found. Start by uploading your first document!</p>
          <button
            onClick={() => navigate("/upload")}
            className="btn btn-primary"
          >
            ↑ Upload Document
          </button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="documents-grid">
              {paginatedDocuments.map((doc) => {
                const expiryContext = formatExpiryContext(doc.expiryDate);
                const catColor =
                  doc.categoryId?.color || getCategoryColor(doc.category);
                const catIcon = doc.categoryId?.icon || "";
                const catLabel = doc.categoryId?.name || doc.category;

                return (
                  <div key={doc._id} className="doc-card">
                    <div
                      className="card-clickable"
                      onClick={() => navigate(`/documents/${doc._id}`)}
                    >
                      <div className="card-thumb">◻</div>
                      <div className="card-title">{doc.title}</div>
                      <div className="card-meta">
                        <span className={`badge badge-${doc.status}`}>
                          {doc.status}
                        </span>
                        <span
                          className="badge"
                          style={{ backgroundColor: catColor, color: "#fff" }}
                        >
                          {catIcon} {catLabel}
                        </span>
                      </div>
                      <div
                        className={`card-expiry expiry-${expiryContext.status}`}
                      >
                        {expiryContext.text}
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc._id}`);
                        }}
                        className="btn-action"
                        title="View document"
                      >
                        ◉
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        className="btn-action btn-delete"
                        title="Delete document"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="documents-list">
              {paginatedDocuments.map((doc) => {
                const expiryContext = formatExpiryContext(doc.expiryDate);
                const catColor =
                  doc.categoryId?.color || getCategoryColor(doc.category);
                const catIcon = doc.categoryId?.icon || "";
                const catLabel = doc.categoryId?.name || doc.category;

                return (
                  <div key={doc._id} className="list-item">
                    <div
                      className="list-main"
                      onClick={() => navigate(`/documents/${doc._id}`)}
                    >
                      <div className="list-title">◻ {doc.title}</div>
                      <div className="list-meta">
                        <span className={`badge badge-${doc.status}`}>
                          {doc.status}
                        </span>
                        <span
                          className="badge"
                          style={{ backgroundColor: catColor, color: "#fff" }}
                        >
                          {catIcon} {catLabel}
                        </span>
                        <span
                          className={`meta-expiry expiry-${expiryContext.status}`}
                        >
                          {expiryContext.text}
                        </span>
                      </div>
                    </div>
                    <div className="list-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc._id}`);
                        }}
                        className="btn-action"
                        title="View document"
                      >
                        ◉
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        className="btn-action btn-delete"
                        title="Delete document"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
                disabled={pagination.currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {pagination.currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(totalPages, prev.currentPage + 1),
                  }))
                }
                disabled={pagination.currentPage === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
