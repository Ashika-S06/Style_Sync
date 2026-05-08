import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Star, X, MessageCircle, Send, TrendingUp, Trash2 } from 'lucide-react';

function Home() {
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLookbook, setSelectedLookbook] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [expandedCommentsId, setExpandedCommentsId] = useState(null);
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

  const fetchTrends = async () => {
    try {
      setLoadingTrends(true);
      const res = await api.get('/trends');
      setTrendsData(res.data);
    } catch (error) {
      console.error('Failed to fetch trends', error);
    } finally {
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    fetchLookbooks();
    if (user) {
      fetchTrends();
    }
  }, [user]);

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

  const handleComment = async (e, id) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment.");
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/lookbooks/${id}/comment`, { text: commentText });
      setLookbooks(lookbooks.map(lb => lb._id === id ? { ...lb, comments: res.data } : lb));
      if (selectedLookbook && selectedLookbook._id === id) {
        setSelectedLookbook({ ...selectedLookbook, comments: res.data });
      }
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLookbook = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lookbook?")) return;
    try {
      await api.delete(`/lookbooks/${id}`);
      setLookbooks(lookbooks.filter(lb => lb._id !== id));
      if (selectedLookbook && selectedLookbook._id === id) {
        setSelectedLookbook(null);
      }
    } catch (err) {
      console.error('Failed to delete lookbook', err);
      alert('Failed to delete lookbook');
    }
  };

  const getAvgRating = (ratings = []) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const toggleComments = (e, id) => {
    e.stopPropagation();
    setExpandedCommentsId(prev => prev === id ? null : id);
  };

  const renderFeedback = (lb, isMagazineView = false) => {
    const avg = getAvgRating(lb.ratings);
    const myRating = user ? lb.ratings?.find(r => r.user === user._id || r.user?._id === user._id)?.score : null;
    const showComments = isMagazineView || expandedCommentsId === lb._id;

    return (
      <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', cursor: 'pointer', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '20px' }} onClick={(e) => toggleComments(e, lb._id)}>
            <MessageCircle size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{lb.comments?.length || 0} Comments</span>
          </div>
        </div>

        {showComments && (
          <div style={{ marginTop: '16px' }} onClick={e => e.stopPropagation()}>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lb.comments && lb.comments.length > 0 ? (
                lb.comments.map((comment, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-main)' }}>@{comment.user?.username || 'user'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#444' }}>{comment.text}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</div>
              )}
            </div>
            <form onSubmit={(e) => handleComment(e, lb._id)} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
              />
              <button type="submit" disabled={!commentText.trim()} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'not-allowed', opacity: commentText.trim() ? 1 : 0.5 }}>
                <Send size={18} style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discover <span>New Styles</span></h1>
        <p className="page-subtitle">Curated fashion lookbooks from our community.</p>
      </div>

      {user && trendsData && (
        <div style={{ background: 'linear-gradient(135deg, #111, #333)', borderRadius: '24px', padding: '32px', marginBottom: '40px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--accent-color)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Live Trends & Insights</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trendsData.trends?.map((trend, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {trend.colorHex && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: trend.colorHex }}></div>}
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>{trend.name}</h3>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{trend.engagementScore}% Popularity</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>{trend.description}</div>
                
                {/* Bar Graph */}
                <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${trend.engagementScore || 50}%`, 
                    background: trend.colorHex || 'var(--accent-color)',
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
                    {user && user._id === post.user?._id && (
                      <Trash2 
                        size={18} 
                        color="#ff4d4d" 
                        style={{ cursor: 'pointer' }} 
                        onClick={(e) => handleDeleteLookbook(e, post._id)} 
                      />
                    )}
                  </div>
                  {renderFeedback(post, false)}
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

              <div className="magazine-layout-spread" style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                {(() => {
                  const paras = selectedLookbook.description ? selectedLookbook.description.split('\n\n') : [];
                  const items = selectedLookbook.items || [];
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
                              <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
                                <img src={`http://localhost:5000${items[i].image}`} style={{ width: '100%', height: '500px', objectFit: 'contain' }} alt="look" />
                                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>STYLING NO. {i+1}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {items[i] && (
                              <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
                                <img src={`http://localhost:5000${items[i].image}`} style={{ width: '100%', height: '500px', objectFit: 'contain' }} alt="look" />
                                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>STYLING NO. {i+1}</div>
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
                  
                  // If there are leftover items, show them side by side
                  if (items.length > paras.length) {
                    const leftovers = items.slice(paras.length);
                    if (leftovers.length > 0) {
                      rows.push(
                        <div key="leftovers" style={{ display: 'grid', gridTemplateColumns: `repeat(${leftovers.length}, 1fr)`, gap: '20px' }}>
                          {leftovers.map((item, idx) => (
                            <div key={idx} style={{ background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
                               <img src={`http://localhost:5000${item.image}`} style={{ width: '100%', height: '300px', objectFit: 'contain' }} alt="look" />
                            </div>
                          ))}
                        </div>
                      );
                    }
                  }
                  
                  return rows;
                })()}
                
                <div style={{ background: '#fdf5f3', padding: '32px', borderRadius: '24px', marginTop: '40px' }}>
                  <h4 style={{ marginBottom: '20px', fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.5rem' }}>Community Feedback</h4>
                  {renderFeedback(selectedLookbook, true)}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default Home;
