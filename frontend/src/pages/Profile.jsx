import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { User } from 'lucide-react';

function Profile() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [userLookbooks, setUserLookbooks] = useState([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, lookbooksRes, wardrobeRes, collectionsRes] = await Promise.all([
          api.get(`/users/${user._id}`),
          api.get('/lookbooks'),
          api.get('/wardrobe'),
          api.get('/collections')
        ]);
        
        setProfileData(profileRes.data);
        setUserLookbooks(lookbooksRes.data.filter(lb => lb.user._id === user._id));
        setWardrobeCount(wardrobeRes.data.length);
        setCollectionsCount(collectionsRes.data.length);

      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) return <div>Loading profile...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={64} color="var(--text-muted)" />
        </div>
        <div>
          <h1 className="page-title">{profileData?.username}</h1>
          <p className="page-subtitle">{profileData?.bio || 'No bio yet.'}</p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div><strong>{userLookbooks.length}</strong> Lookbooks</div>
            <div><strong>{wardrobeCount}</strong> Items in Wardrobe</div>
            <div><strong>{collectionsCount}</strong> Collections</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2>My Lookbooks</h2>
        <div className="grid-gallery">
          {userLookbooks.length > 0 ? (
            userLookbooks.map((post) => (
              <div key={post._id} className="glass-card" style={{ padding: '16px' }}>
                <img 
                  src={`http://localhost:5000${post.image}`} 
                  alt={post.title} 
                  style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image' }}
                />
                <h3 style={{ marginBottom: '8px' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{post.description}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>You haven't posted any lookbooks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
