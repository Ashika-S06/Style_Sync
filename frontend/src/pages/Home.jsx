import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Star, X } from 'lucide-react';

function Home() {
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLookbook, setSelectedLookbook] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchLookbooks = async () => {
    try {
      const res = await api.get('/lookbooks');
      setLookbooks(res.data);
    } catch (error) {
      console.error('Failed to fetch lookbooks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookbooks();
  }, []);

  const handleRate = async (e, id, score) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to rate.");
    try {
      const res = await api.post(`/lookbooks/${id}/rate`, { score });
      setLookbooks(lookbooks.map(lb => lb._id === id ? { ...lb, ratings: res.data } : lb));
      if (selectedLookbook && selectedLookbook._id === id) {
        setSelectedLookbook({ ...selectedLookbook, ratings: res.data });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWear = async (e, id, answer) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to vote.");
    try {
      const res = await api.post(`/lookbooks/${id}/wear`, { answer });
      setLookbooks(lookbooks.map(lb => lb._id === id ? { ...lb, wouldWear: res.data } : lb));
      if (selectedLookbook && selectedLookbook._id === id) {
        setSelectedLookbook({ ...selectedLookbook, wouldWear: res.data });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAvgRating = (ratings = []) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getWearPercentage = (wouldWear = []) => {
    if (wouldWear.length === 0) return 0;
    const yesCount = wouldWear.filter(w => w.answer === true).length;
    return Math.round((yesCount / wouldWear.length) * 100);
  };

  const renderFeedback = (lb) => {
    const avg = getAvgRating(lb.ratings);
    const wearPct = getWearPercentage(lb.wouldWear);
    
    const myRating = user ? lb.ratings?.find(r => r.user === user._id || r.user?._id === user._id)?.score : null;
    const myWear = user ? lb.wouldWear?.find(w => w.user === user._id || w.user?._id === user._id)?.answer : null;

    return (
      <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1,2,3,4,5].map(star => (
                <Star 
                  key={star} 
                  size={18} 
                  onClick={(e) => handleRate(e, lb._id, star)}
                  fill={star <= (myRating || avg) ? "var(--accent-color)" : "none"}
                  color={star <= (myRating || avg) ? "var(--accent-color)" : "#e0e0e0"}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>{avg > 0 ? `${avg} / 5 (${lb.ratings?.length || 0})` : 'No ratings'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              👗 Would You Wear This?
            </span>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={(e) => handleWear(e, lb._id, true)}
                style={{ padding: '6px 14px', borderRadius: '12px', background: myWear === true ? 'var(--accent-color)' : '#f0f0f0', color: myWear === true ? 'white' : '#555', fontSize: '0.85rem', fontWeight: 'bold' }}>
                YES
              </button>
              <button 
                onClick={(e) => handleWear(e, lb._id, false)}
                style={{ padding: '6px 14px', borderRadius: '12px', background: myWear === false ? '#666' : '#f0f0f0', color: myWear === false ? 'white' : '#555', fontSize: '0.85rem', fontWeight: 'bold' }}>
                NO
              </button>
            </div>
            {wearPct > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>
                 {wearPct}% said yes
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discover <span>New Styles</span></h1>
        <p className="page-subtitle">Curated fashion lookbooks from our community.</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>Loading the latest trends...</div>
      ) : (
        <div className="grid-gallery">
          {lookbooks.length > 0 ? (
            lookbooks.map((post) => (
              <div key={post._id} className="glass-card" style={{ padding: '0', cursor: 'pointer' }} onClick={() => setSelectedLookbook(post)}>
                {post.items && post.items.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '160px 160px', gap: '4px', height: '320px', overflow: 'hidden', borderTopLeftRadius: 'var(--radius-card)', borderTopRightRadius: 'var(--radius-card)' }}>
                    <div style={{ gridRow: 'span 2' }}>
                      <img src={`http://localhost:5000${post.items[0].image}`} alt="main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {post.items[1] && <img src={`http://localhost:5000${post.items[1].image}`} alt="side 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {post.items[2] ? <img src={`http://localhost:5000${post.items[2].image}`} alt="side 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>STYLE</div>}
                  </div>
                ) : (
                  <img src={`http://localhost:5000${post.image}`} alt={post.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderTopLeftRadius: 'var(--radius-card)', borderTopRightRadius: 'var(--radius-card)' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image' }} />
                )}
                
                <div style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.4rem' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>{post.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '600' }}>
                      @{post.user?.username || 'user'}
                    </span>
                  </div>
                  {renderFeedback(post)}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '60px', color: 'var(--text-muted)' }}>
              <p>No lookbooks available yet. Be the first to share your style!</p>
            </div>
          )}
        </div>
      )}

      {selectedLookbook && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1000, overflowY: 'auto', background: 'white' }}>
           <div style={{ position: 'absolute', top: '24px', right: '32px', cursor: 'pointer', zIndex: 1001 }} onClick={() => setSelectedLookbook(null)}>
             <button className="btn-secondary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={20} /> CLOSE
             </button>
           </div>
           
           <div className="magazine-container" style={{ boxShadow: 'none' }}>
              <div className="magazine-header">
                <div>
                  <h1 className="magazine-title">{selectedLookbook.title || 'STYLE'}</h1>
                  <span className="magazine-brand">{selectedLookbook.tags?.[0] || '2026 EDITION'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>CURATED BY</p>
                   <p style={{ margin: 0, color: '#aaa', textTransform: 'uppercase' }}>@{selectedLookbook.user?.username || 'user'}</p>
                </div>
              </div>

              <div className="magazine-grid">
                <div className="magazine-description" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <p style={{ fontStyle: 'italic', color: '#000', fontSize: '1.4rem' }}>
                      "{selectedLookbook.description}"
                   </p>
                   
                   <div style={{ background: '#fdf5f3', padding: '24px', borderRadius: '16px', marginTop: '20px' }}>
                     <h4 style={{ marginBottom: '16px', fontFamily: 'Outfit', fontWeight: 600, fontSize: '1.2rem' }}>Feedback</h4>
                     {renderFeedback(selectedLookbook)}
                   </div>
                </div>

                {selectedLookbook.items && selectedLookbook.items.length > 0 ? (
                  selectedLookbook.items.map((item, index) => (
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
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <img src={`http://localhost:5000${item.image}`} alt={item.category || 'item'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <span className="editorial-label">STYLING NO. {index + 1}</span>
                      <div className="editorial-caption">
                        {item.brand ? <strong>{item.brand.toUpperCase()}</strong> : 'ARCHIVAL'} / {item.category?.toUpperCase() || 'ITEM'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-12" style={{ height: '800px', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={`http://localhost:5000${selectedLookbook.image}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Main Look" />
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default Home;
