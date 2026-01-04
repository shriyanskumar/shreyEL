import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/upload.css';

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    categoryId: null,
    expiryDate: ''
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#757575', icon: '📁' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catsRes, docRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get(`http://localhost:5000/api/documents/${id}`)
        ]);
        setCategories(catsRes.data.categories || []);
        const doc = docRes.data;
        setFormData({
          title: doc.title || '',
          description: doc.description || '',
          category: doc.category || 'other',
          categoryId: doc.categoryId?._id || null,
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().slice(0,10) : ''
        });
      } catch (err) {
        console.error('Failed to load document or categories', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'category') {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const catId = selectedOption?.getAttribute('data-id') || null;
      setFormData(prev => ({ ...prev, category: value, categoryId: catId }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        expiryDate: formData.expiryDate || undefined
      };
      if (formData.categoryId) payload.categoryId = formData.categoryId;
      else payload.category = formData.category;

      await axios.put(`http://localhost:5000/api/documents/${id}`, payload);
      setSuccessMessage('Document updated');
      setTimeout(() => navigate(`/documents/${id}`), 1000);
    } catch (err) {
      console.error('Update error', err);
      setError(err.response?.data?.error || 'Failed to update');
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
      setNewCategory({ name: '', color: '#757575', icon: '📁' });
    } catch (err) {
      console.error('Create category error', err);
      setError(err.response?.data?.error || 'Failed to create category');
    }
  };

  if (loading) return <div className="upload-container"><div className="loading-spinner">Loading...</div></div>;

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Edit Document</h1>
        <p>Update document details</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <h2>Document Details</h2>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <div style={{display: 'flex', gap:8, alignItems: 'center'}}>
                <select name="category" value={formData.category} onChange={handleInputChange} style={{flex:1}}>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name} data-id={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(prev => !prev)}>+ Add</button>
              </div>
              {showAddCategory && (
                <div className="add-category-inline">
                  <input placeholder="Name" value={newCategory.name} onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))} />
                  <input type="color" value={newCategory.color} onChange={(e) => setNewCategory(prev => ({...prev, color: e.target.value}))} />
                  <input placeholder="Icon (emoji)" value={newCategory.icon} onChange={(e) => setNewCategory(prev => ({...prev, icon: e.target.value}))} />
                  <button type="button" className="btn btn-primary" onClick={handleCreateCategory}>Create</button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={loading} type="submit">Save Changes</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/documents/${id}`)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DocumentEdit;
