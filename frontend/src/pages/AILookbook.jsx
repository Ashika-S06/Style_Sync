import { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, RefreshCw, ArrowLeft, Bookmark, CheckCircle, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function AILookbook() {
  const [lookbook, setLookbook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/collections');
        setCollections(res.data);
      } catch (err) {
        console.error('Failed to fetch collections', err);
      }
    };
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      }
    };
    fetchCollections();
    fetchRecommendations();
  }, []);

  const generateLookbook = async () => {
    if (!selectedCollection) {
      alert("Please select an outfit to generate a lookbook.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/generate-lookbook', { 
        collectionId: selectedCollection._id,
        collectionName: selectedCollection.name
      });
      setLookbook(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to generate lookbook. Make sure the outfit has at least 2 items.');
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

          {recommendations && (
            <div style={{ background: '#fdf5f3', borderRadius: '16px', padding: '24px', marginBottom: '40px', border: '1px solid #fbd9d3', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} /> Pre-styling Insights
              </h3>
              <p style={{ fontSize: '1rem', color: '#444', lineHeight: 1.5, margin: 0 }}>{recommendations.advice}</p>
            </div>
          )}

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontFamily: 'Lora', marginBottom: '16px', fontSize: '1.2rem' }}>
              Select an Outfit to style
            </h3>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '10px 0', justifyContent: 'center' }}>
              {collections.map(collection => (
                <div 
                  key={collection._id}
                  onClick={() => setSelectedCollection(collection)}
                  style={{
                    minWidth: '120px', padding: '16px', borderRadius: '16px',
                    background: selectedCollection?._id === collection._id ? 'var(--accent-color)' : '#fff',
                    color: selectedCollection?._id === collection._id ? '#fff' : '#333',
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                    transition: 'all 0.2s ease',
                    transform: selectedCollection?._id === collection._id ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedCollection?._id === collection._id ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>{collection.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{collection.items?.length || 0} items</div>
                </div>
              ))}
              {collections.length === 0 && <p style={{ color: '#888' }}>No outfits found. Go to Collections to create one.</p>}
            </div>
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
          <div className="magazine-layout-spread" style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '40px' }}>
            {(() => {
              const paras = lookbook.description ? lookbook.description.split('\n\n') : [];
              const items = lookbook.items || [];
              const maxRows = Math.max(paras.length, items.length);
              const rows = [];
              
              for (let i = 0; i < maxRows; i++) {
                const isEven = i % 2 === 0;
                rows.push(
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    {isEven ? (
                      <>
                        <div style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#333' }}>
                          {paras[i] || ""}
                        </div>
                        {items[i] && (
                          <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <img src={`http://localhost:5000${items[i].image}`} style={{ width: '100%', height: '500px', objectFit: 'contain' }} alt="look" />
                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>STYLING NO. {i+1}</div>
                            <div className="editorial-caption" style={{ marginTop: '5px' }}>
                              {items[i].brand ? <strong>{items[i].brand.toUpperCase()}</strong> : 'ARCHIVAL'} / {items[i].category.toUpperCase()}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {items[i] && (
                          <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <img src={`http://localhost:5000${items[i].image}`} style={{ width: '100%', height: '500px', objectFit: 'contain' }} alt="look" />
                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>STYLING NO. {i+1}</div>
                            <div className="editorial-caption" style={{ marginTop: '5px' }}>
                              {items[i].brand ? <strong>{items[i].brand.toUpperCase()}</strong> : 'ARCHIVAL'} / {items[i].category.toUpperCase()}
                            </div>
                          </div>
                        )}
                        <div style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#333' }}>
                          {paras[i] || ""}
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              
              if (items.length > paras.length) {
                const leftovers = items.slice(paras.length);
                if (leftovers.length > 0) {
                  rows.push(
                    <div key="leftovers" style={{ display: 'grid', gridTemplateColumns: `repeat(${leftovers.length}, 1fr)`, gap: '20px' }}>
                      {leftovers.map((item, idx) => (
                        <div key={idx} style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                           <img src={`http://localhost:5000${item.image}`} style={{ width: '100%', height: '300px', objectFit: 'contain' }} alt="look" />
                        </div>
                      ))}
                    </div>
                  );
                }
              }
              
              return rows;
            })()}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
                <button className="btn-secondary" onClick={generateLookbook} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                  <RefreshCw size={18} /> REGENERATE SPREAD
                </button>
                <button 
                className="btn-primary" 
                onClick={handlePublish} 
                disabled={publishing}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                  <Globe size={18} /> {publishing ? 'PUBLISHING...' : 'PUBLISH TO FEED'}
                </button>
            </div>
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
