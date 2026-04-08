import { useState, useEffect } from 'react';
import api from '../services/api';

function Home() {
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchLookbooks();
  }, []);

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
              <div key={post._id} className="glass-card" style={{ padding: '0', cursor: 'pointer' }}>
                {post.items && post.items.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '160px 160px', gap: '4px', height: '320px', overflow: 'hidden' }}>
                    <div style={{ gridRow: 'span 2' }}>
                      <img
                        src={`http://localhost:5000${post.items[0].image}`}
                        alt="main"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    {post.items[1] && (
                      <img
                        src={`http://localhost:5000${post.items[1].image}`}
                        alt="side 1"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    {post.items[2] ? (
                      <img
                        src={`http://localhost:5000${post.items[2].image}`}
                        alt="side 2"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        STYLE
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    style={{ width: '100%', height: '320px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image' }}
                  />
                )}
                <div style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.4rem' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>{post.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '600' }}>
                      @{post.user?.username || 'user'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>♥ {post.likes?.length || 0}</span>
                    </div>
                  </div>
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
    </div>
  );
}

export default Home;
