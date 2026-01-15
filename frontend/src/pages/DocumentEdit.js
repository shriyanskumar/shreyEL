import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/upload.css";

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    categoryId: null,
    expiryDate: "",
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#757575",
    icon: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, docRes] = await Promise.all([
          api.get("/api/categories"),
          api.get(`/api/documents/${id}`),
        ]);
        setCategories(catsRes.data.categories || []);
        const doc = docRes.data;
        setFormData({
          title: doc.title || "",
          description: doc.description || "",
          category: doc.category || "other",
          categoryId: doc.categoryId?._id || null,
          expiryDate: doc.expiryDate
            ? new Date(doc.expiryDate).toISOString().slice(0, 10)
            : "",
        });
      } catch (err) {
        console.error("Failed to load document or categories", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const catId = selectedOption?.getAttribute("data-id") || null;
      setFormData((prev) => ({ ...prev, category: value, categoryId: catId }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        expiryDate: formData.expiryDate || undefined,
      };
      if (formData.categoryId) payload.categoryId = formData.categoryId;
      else payload.category = formData.category;

      await api.put(`/api/documents/${id}`, payload);
      setSuccessMessage("Document updated successfully!");
      setTimeout(() => navigate(`/documents/${id}`), 1000);
    } catch (err) {
      console.error("Update error", err);
      setError(err.response?.data?.error || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const res = await api.post("/api/categories", newCategory);
      const created = res.data.category;
      setCategories((prev) => [created, ...prev]);
      setFormData((prev) => ({
        ...prev,
        categoryId: created._id,
        category: created.name,
      }));
      setShowAddCategory(false);
      setNewCategory({ name: "", color: "#757575", icon: "" });
    } catch (err) {
      console.error("Create category error", err);
      setError(err.response?.data?.error || "Failed to create category");
    }
  };

  if (loading) {
    return (
      <div className="ft-page">
        <div className="ft-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ft-page fade-in">
      {/* Header */}
      <div className="upload-header">
        <button onClick={() => navigate(`/documents/${id}`)} className="ft-btn ft-btn-secondary" style={{ marginBottom: '12px' }}>
           Back to Document
        </button>
        <h1> Edit Document</h1>
        <p>Update document details and metadata</p>
      </div>

      {error && <div className="ft-alert ft-alert-error">{error}</div>}
      {successMessage && <div className="ft-alert ft-alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <div className="section-header">
            <div className="section-badge">1</div>
            <div className="section-content">
              <h2>Document Details</h2>
              <p>BASIC INFORMATION</p>
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter document title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add a description for this document..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <div className="section-badge">2</div>
            <div className="section-content">
              <h2>Classification</h2>
              <p>CATEGORY & EXPIRY</p>
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ flex: 1 }}
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name} data-id={cat._id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ft-btn ft-btn-secondary"
                      onClick={() => setShowAddCategory((prev) => !prev)}
                    >
                      + Add
                    </button>
                  </div>
                  {showAddCategory && (
                    <div className="add-category-inline">
                      <input
                        placeholder="Category name"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                      />
                      <input
                        placeholder="Icon (emoji)"
                        value={newCategory.icon}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="ft-btn ft-btn-primary"
                        onClick={handleCreateCategory}
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    name="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="ft-btn ft-btn-primary ft-btn-lg" disabled={loading} type="submit">
            {loading ? " Saving..." : " Save Changes"}
          </button>
          <button
            type="button"
            className="ft-btn ft-btn-secondary"
            onClick={() => navigate(`/documents/${id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentEdit;
