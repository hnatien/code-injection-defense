import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
          <h1>Dashboard</h1>
          <div className="header-actions">
            <div className="user-info">
              Logged in as: <strong>{user?.username}</strong>
            </div>
            <Link to="/profile" className="profile-link">
              User Profile
            </Link>
          </div>
        </div>

        <div className="search-section">
          <h2>Search Users</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Enter username to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        </div>

        <div className="text-center">
          <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">
            Logout
          </a>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

