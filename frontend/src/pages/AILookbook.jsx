import { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, RefreshCw, ArrowLeft, Bookmark, CheckCircle, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function AILookbook() {
  const [lookbook, setLookbook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        const res = await api.get('/wardrobe');
        setWardrobe(res.data);
      } catch (err) {
        console.error('Failed to fetch wardrobe', err);
      }
    };
    fetchWardrobe();
  }, []);

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const generateLookbook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/generate-lookbook', { 
        selectedItemIds: selectedItems 
      });
      setLookbook(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to generate lookbook. Make sure you have at least 2 items in your wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!lookbook) return;
    setPublishing(true);
    try {
      // Phase 3: Send to lookbooks endpoint
      await api.post('/lookbooks', {
        title: lookbook.title,
        description: lookbook.description,
        items: lookbook.items.map(i => i._id),
        tags: [lookbook.season],
        image: lookbook.items[0].image // Fallback main image
      });
      alert('Published to feed successfully!');
      navigate('/');
    } catch (err) {
      console.error('Failed to publish', err);
      alert('Failed to publish to feed.');
    } finally {
      setPublishing(false);
    }
  };

  if (!lookbook && !loading) {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span className="magazine-brand" style={{ display: 'block', marginBottom: '20px' }}>Digital Stylist v2.0</span>
          <h1 className="magazine-title" style={{ fontSize: '5rem', marginBottom: '30px' }}>THE<br /><span>EDITORIAL</span><br />EDIT</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: '#666' }}>
            Transform your personal wardrobe into a high-fashion digital editorial. 
            Select items or let our AI analyze your entire collection.
          </p>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontFamily: 'Lora', marginBottom: '16px', fontSize: '1.2rem' }}>
              Select pieces to style (Optional)
            </h3>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 0', justifyContent: 'center' }}>
              {wardrobe.map(item => (
                <div 
                  key={item._id}
                  onClick={() => toggleItemSelection(item._id)}
                  style={{
                    minWidth: '80px', height: '80px', borderRadius: '50%',
                    backgroundImage: `url(http://localhost:5000${item.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    cursor: 'pointer',
                    border: selectedItems.includes(item._id) ? '4px solid var(--accent-color)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    transform: selectedItems.includes(item._id) ? 'scale(1.1)' : 'scale(1)',
                    position: 'relative'
                  }}
                >
                  {selectedItems.includes(item._id) && (
                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%' }}>
                      <CheckCircle size={16} color="var(--accent-color)" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
              {selectedItems.length > 0 ? `${selectedItems.length} items picked` : 'Or just click curate for a surprise'}
            </p>
          </div>

          <button className="btn-primary" onClick={generateLookbook} style={{ padding: '20px 40px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
             <Sparkles size={20} /> CURATE MY LOOKBOOK
          </button>
          {error && (
            <div style={{ 
              marginTop: '40px', 
              padding: '20px', 
              background: '#fff0f0', 
              color: '#d32f2f', 
              borderRadius: '12px',
              border: '1px solid #ffcdd2'
            }}>
              <p style={{ margin: 0 }}>{error}</p>
              <Link to="/wardrobe" style={{ color: '#d32f2f', fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px', display: 'block' }}>
                 Go to Wardrobe &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="magazine-container">
      {/* Magazine Header Section */}
      <div className="magazine-header">
        <div>
          <h1 className="magazine-title">{lookbook ? lookbook.title : 'STYLE'}</h1>
          <span className="magazine-brand">{lookbook ? lookbook.season : '2026 EDITION'}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
           <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>ISSUE NO. 04</p>
           <p style={{ margin: 0, color: '#aaa' }}>APRIL 2026</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <RefreshCw className="animate-spin" size={64} color="var(--accent-color)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'Lora', fontSize: '2rem' }}>Curating Editorial Content...</h2>
          <p>Analyzing color palettes and silhouette trends from your wardrobe.</p>
        </div>
      ) : (
        <>
          <div className="magazine-grid">
            {/* The Main Editorial Copy */}
            <div className="magazine-description">
               <p style={{ fontStyle: 'italic', color: '#000', marginBottom: '30px', fontSize: '1.4rem' }}>
                  "{lookbook.description}"
               </p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <button className="btn-secondary" onClick={generateLookbook} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                   <RefreshCw size={18} /> REGENERATE SPREAD
                 </button>
                 <button 
                  className="btn-primary" 
                  onClick={handlePublish} 
                  disabled={publishing}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                 >
                   <Globe size={18} /> {publishing ? 'PUBLISHING...' : 'PUBLISH TO FEED'}
                 </button>
               </div>
            </div>

            {/* Asymmetric Grid Items */}
            {lookbook.items.map((item, index) => (
              <div 
                key={item._id} 
                className={`editorial-item ${
                  index % 3 === 0 ? 'col-span-8 row-span-3' : 'col-span-4 row-span-2'
                }`}
                style={{ 
                  height: index % 3 === 0 ? '800px' : '450px',
                  marginTop: index === 1 ? '100px' : '0'
                }}
              >
                <img src={`http://localhost:5000${item.image}`} alt={item.category} />
                <span className="editorial-label">STYLING NO. {index + 1}</span>
                <div className="editorial-caption">
                  {item.brand ? <strong>{item.brand.toUpperCase()}</strong> : 'ARCHIVAL'} / {item.category.toUpperCase()}
                  <div style={{ color: '#888', fontStyle: 'normal', fontSize: '0.85rem' }}>Core Essential in {item.color}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '100px 0', textAlign: 'center', borderTop: '1px solid #eee', marginTop: '100px' }}>
             <p style={{ letterSpacing: '8px', textTransform: 'uppercase', color: '#ccc', marginBottom: '20px' }}>End of Issue</p>
             <Link to="/wardrobe" className="btn-secondary">
               VIEW FULL COLLECTION
             </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default AILookbook;
