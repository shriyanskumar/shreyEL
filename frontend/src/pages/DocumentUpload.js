import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/upload.css';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    categoryId: null,
    expiryDate: '',
    file: null,
    fileUrl: ''
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#757575', icon: '◻' });

  const solidColors = [
    '#E8544A', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
    '#00BCD4', '#E91E63', '#757575', '#000000', '#FFFFFF'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        file: files[0],
        fileUrl: files[0]?.name || ''
      }));
    } else {
      if (name === 'category') {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const catId = selectedOption?.getAttribute('data-id') || null;
        setFormData(prev => ({ ...prev, category: value, categoryId: catId }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
    setError('');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Could not load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Document title is required');
      return false;
    }

    if (!formData.category) {
      setError('Please select a category');
      return false;
    }

    if (formData.category === 'other' && !formData.categoryId) {
      setError('Please create a custom category or choose another category');
      return false;
    }

    if (!formData.file) {
      setError('Please select a file to upload');
      return false;
    }

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate < new Date()) {
        setError('Expiry date must be in the future');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const payload = {
        title: formData.title,
        description: formData.description,
        expiryDate: formData.expiryDate || undefined,
        fileUrl: formData.file?.name || `documents/${Date.now()}`
      };
      if (formData.categoryId) payload.categoryId = formData.categoryId;
      else payload.category = formData.category;

      const response = await axios.post('http://localhost:5000/api/documents', payload);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccessMessage('Document uploaded successfully! Redirecting...');

      setTimeout(() => {
        navigate(`/documents/${response.data._id}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to upload document';
      setError(errorMessage);
      setUploadProgress(0);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/categories', newCategory);
      const created = res.data.category;
      setCategories(prev => [created, ...prev]);
      setFormData(prev => ({ ...prev, categoryId: created._id, category: created.name }));
      setShowAddCategory(false);
      setNewCategory({ name: '', color: '#757575', icon: '◻' });
    } catch (err) {
      console.error('Create category error', err);
      setError(err.response?.data?.error || 'Failed to create category');
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      expiryDate: '',
      file: null,
      fileUrl: ''
    });
    setError('');
    setSuccessMessage('');
    setUploadProgress(0);
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Document</h1>
        <p>Add a new document to your collection</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Upload Zone */}
        <div className="upload-zone">
          <div className="zone-icon">◻</div>
          <h3>Drop your document here or click to browse</h3>
          <p>Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX</p>
          <label htmlFor="file-input" className="file-input-label">
            {formData.file ? `✓ Selected: ${formData.file.name}` : '◻ Click to select or drag & drop'}
          </label>
          <input
            type="file"
            id="file-input"
            name="file"
            onChange={handleInputChange}
            className="file-input"
            disabled={loading}
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(uploadProgress)}% uploaded</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="form-section">
          <h2>Document Details</h2>

          <div className="form-group">
            <label htmlFor="title">
              Document Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Driving License Renewal"
              disabled={loading}
              required
            />
            <p className="helper-text">Give your document a clear, descriptive title</p>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any notes or details about this document"
              rows="4"
              disabled={loading}
            ></textarea>
            <p className="helper-text">Optional: Help yourself remember what this document is for</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <div className="category-row">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <option value="all">All Categories</option>
                  <option value="license">License</option>
                  <option value="certificate">Certificate</option>
                  <option value="permit">Permit</option>
                  <option value="insurance">Insurance</option>
                  <option value="contract">Contract</option>
                  <option value="bank">Bank</option>
                  <option value="medical">Medical</option>
                  <option value="miscellaneous">Miscellaneous</option>
                  <option value="other">⊕ Other (create)</option>

                  {categories && categories.length > 0 && categories.map(cat => {
                    const nameLower = (cat.name || '').toLowerCase();
                    const isDefault = ['license', 'certificate', 'permit', 'insurance', 'contract', 'bank', 'medical', 'miscellaneous', 'other'].includes(nameLower);
                    if (isDefault) return null;
                    return (
                      <option key={cat._id} value={cat.name} data-id={cat._id}>{cat.icon || '◻'} {cat.name}</option>
                    );
                  })}
                </select>
                {formData.category === 'other' && (
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(prev => !prev)} disabled={loading}>+ Add</button>
                )}
              </div>
              {showAddCategory && formData.category === 'other' && (
                <div className="add-category-form">
                  <div className="form-row">
                    <input className="new-cat-name" placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))} />
                  </div>

                  <div className="color-picker-section">
                    <label>Select Color</label>

                    {/* Solid Colors */}
                    <div className="solid-colors">
                      {solidColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-preset ${newCategory.color === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                          title={color}
                        />
                      ))}
                    </div>

                    {/* Color Wheel / Custom Color */}
                    <div className="color-wheel-section">
                      <label htmlFor="color-input">Custom Color</label>
                      <div className="color-wheel-wrapper">
                        <input
                          id="color-input"
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        />
                        <div className="color-preview" style={{ backgroundColor: newCategory.color }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <input className="new-cat-icon" placeholder="Icon (e.g., ◻, ⊕, ◉)" value={newCategory.icon} onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))} />
                  </div>

                  <div className="form-actions-inline">
                    <button type="button" className="btn btn-primary" onClick={handleCreateCategory}>Create Category</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date (Optional)</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                disabled={loading}
              />
              <p className="helper-text">Set a reminder for document expiration</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <h4>📌 What happens next?</h4>
          <ul>
            <li>Your document will be safely stored in our system</li>
            <li>Our AI will automatically analyze and summarize the document</li>
            <li>You'll get reminders before the expiry date (if set)</li>
            <li>All your documents are encrypted and secure</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-icon">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <span>↑</span>
                Upload Document
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={loading}
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Back to Documents
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;