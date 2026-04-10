import { useState, useEffect } from 'react';
import api from '../services/api';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creating a new collection
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingCollection, setEditingCollection] = useState(null); // New state for editing

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, wardrobeRes] = await Promise.all([
          api.get('/collections'),
          api.get('/wardrobe')
        ]);
        setCollections(collectionsRes.data);
        setWardrobe(wardrobeRes.data);
      } catch (error) {
        console.error('Failed to string collections', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      if (editingCollection) {
        await api.put(`/collections/${editingCollection._id}`, { name, items: selectedItems });
        alert("Outfit updated!");
      } else {
        await api.post('/collections', { name, items: selectedItems });
        alert("Outfit created!");
      }
      const collectionsRes = await api.get('/collections');
      setCollections(collectionsRes.data);
      setShowForm(false);
      setName('');
      setSelectedItems([]);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to save collection', error);
      alert("Failed to save outfit.");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this outfit?")) return;
    try {
      await api.delete(`/collections/${id}`);
      setCollections(collections.filter(c => c._id !== id));
      alert("Outfit deleted!");
    } catch (error) {
      console.error('Failed to delete collection', error);
      alert("Failed to delete outfit.");
    }
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setName(collection.name);
    setSelectedItems(collection.items.map(i => i._id));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h1 className="page-title">My <span>Outfits</span></h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Curated collections and looks.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditingCollection(null);
            setName('');
            setSelectedItems([]);
          }
        }}>
          {showForm ? 'Cancel' : 'Create Outfit'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3>{editingCollection ? 'Edit Outfit Collection' : 'New Outfit Collection'}</h3>
          <form onSubmit={handleCreateCollection} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Summer Vacation, Work Wear" />
            </div>
            <div className="form-group">
              <label className="form-label">Select Items from Wardrobe</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                {wardrobe.map(item => (
                  <div 
                    key={item._id} 
                    onClick={() => toggleItemSelection(item._id)}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '8px', cursor: 'pointer',
                      border: selectedItems.includes(item._id) ? '3px solid var(--accent-color)' : '1px solid transparent',
                      backgroundImage: `url(http://localhost:5000${item.image})`,
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>{selectedItems.length} items selected</p>
            </div>
            <button type="submit" className="btn-primary">{editingCollection ? 'Update Outfit' : 'Save Outfit'}</button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading outfits...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {collections.map(collection => (
            <div key={collection._id} className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>{collection.name}</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditCollection(collection)} style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>Edit</button>
                  <button onClick={() => handleDeleteCollection(collection._id)} style={{ background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {collection.items.map(item => (
                  <div key={item._id} style={{ textAlign: 'center' }}>
                    <div style={{ width: '140px', height: '140px', borderRadius: '16px', backgroundImage: `url(http://localhost:5000${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}></div>
                    <span style={{ fontSize: '0.9rem', textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: '500' }}>{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {collections.length === 0 && <p>You haven't created any outfits yet.</p>}
        </div>
      )}
    </div>
  );
}

export default Collections;
