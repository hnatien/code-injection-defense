import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function Search() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query);
    } else {
      setUsers([]);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const data = await response.json();
        setError(data.error || 'System Error: Search operation failed.');
        setUsers([]);
      }
    } catch (err) {
      setError('System Error: Search operation failed.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className="security-banner">SECURE VERSION</div>
      <div className="container">
        <div className="dashboard-header">
          <h1>Search Results</h1>
          <div className="header-actions">
            <div className="user-info">
              Logged in as: <strong>{user?.username}</strong>
            </div>
            <Link to="/profile" className="profile-link">
              User Profile
            </Link>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Enter username to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {users.length > 0 ? (
          <table className="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : searchQuery.trim() && !loading ? (
          <div className="empty-state">
            <p>No users found matching "{searchQuery}"</p>
          </div>
        ) : null}

        <div className="text-center mt-24">
          <Link to="/dashboard" className="link-secondary">
            Back to Dashboard
          </Link>
        </div>

        <div className="text-center mt-24">
          <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">
            Logout
          </a>
        </div>
      </div>
    </>
  );
}

export default Search;

