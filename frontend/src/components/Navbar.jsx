import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">STYLE HUB</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="btn-secondary" style={{ marginRight: '16px' }}>Home</Link>
              <Link to="/profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <User size={20} />
                  <span>{user.username}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px', display: 'flex', borderRadius: '50%' }}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log In</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
