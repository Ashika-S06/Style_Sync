import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Sparkles } from 'lucide-react';

function Wardrobe() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('tops');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // New state for editing

  const categories = ['All', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'other'];

  const fetchItems = async () => {
    try {
      const res = await api.get('/wardrobe');
      setItems(res.data);
    } catch (error) {
      console.error('Failed to load wardrobe', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/recommendations');
      setRecommendations(res.data);
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchRecommendations();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image.");
      return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append('category', category);
    formData.append('color', color);
    formData.append('brand', brand);
    if (image) formData.append('image', image);

    try {
      await api.post('/wardrobe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowForm(false);
      // Reset form
      setColor('');
      setBrand('');
      setImage(null);
      alert("Successfully added to your wardrobe!");
      fetchItems();
    } catch (error) {
      console.error('Failed to add item', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;

      if (status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(`Failed to add item: ${msg}\n\n(If this is a timeout, check your database password in backend/.env)`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/wardrobe/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item', error);
      alert("Failed to delete item.");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setCategory(item.category);
    setColor(item.color || '');
    setBrand(item.brand || '');
    setShowForm(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/wardrobe/${editingItem._id}`, {
        category,
        color,
        brand
      });
      setEditingItem(null);
      setShowForm(false);
      setColor('');
      setBrand('');
      setImage(null);
      fetchItems();
      alert("Item updated!");
    } catch (error) {
      console.error('Failed to update item', error);
      alert("Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = filter === 'All' ? items : items.filter(i => i.category === filter);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h1 className="page-title">My <span>Wardrobe</span></h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage your personal collection.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add Item
        </button>
      </div>

      {recommendations && (
        <div style={{ background: '#fdf5f3', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #fbd9d3' }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} /> AI Stylist Advice
          </h3>
          <p style={{ fontSize: '1rem', color: '#444', lineHeight: 1.5, marginBottom: '16px' }}>{recommendations.advice}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666', alignSelf: 'center' }}>Missing Pieces:</span>
            {recommendations.missingPieces?.map((piece, i) => (
              <span key={i} style={{ background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, border: '1px solid #fbd9d3' }}>+ {piece}</span>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3>{editingItem ? 'Edit Clothing Item' : 'Add New Clothing Item'}</h3>
          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} style={{ marginTop: '16px' }}>
            {!editingItem && (
              <div className="form-group">
                <label className="form-label">Image</label>
                <input type="file" className="form-input" onChange={(e) => setImage(e.target.files[0])} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Color</label>
                <input type="text" className="form-input" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Brand</label>
                <input type="text" className="form-input" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Save Item')}
            </button>
            {editingItem && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ marginLeft: '12px' }}
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(false);
                  setColor('');
                  setBrand('');
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setFilter(c)} 
            className={filter === c ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem' }}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading wardrobe...</p>
      ) : (
        <div className="grid-gallery">
          {filteredItems.map(item => (
            <div key={item._id} className="glass-card" style={{ padding: '0' }}>
              <div style={{ width: '100%', height: '280px', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 'var(--radius-card)', borderTopRightRadius: 'var(--radius-card)' }}>
                <img 
                  src={`http://localhost:5000${item.image}`} 
                  alt={item.category} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image' }}
                />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '1.1rem', color: 'var(--accent-color)' }}>{item.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>{item.color}</span>
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '500' }}>{item.brand}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <button onClick={() => handleEditItem(item)} style={{ background: 'none', color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDeleteItem(item._id)} style={{ background: 'none', color: '#ff4d4d', fontSize: '0.9rem', fontWeight: 'bold' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No items found in this category.</p>}
        </div>
      )}
    </div>
  );
}

export default Wardrobe;
