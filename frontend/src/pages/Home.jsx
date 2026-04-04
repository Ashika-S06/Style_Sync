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
      
      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
        <h2>Welcome to Style Hub</h2>
        <p>A platform for discovering and sharing the latest trends.</p>
      </div>
    </div>
  );
}

export default Home;
