import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'User not found.');
      }
    } catch (err) {
      setError('Failed to retrieve profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <div className="vulnerability-banner">VULNERABLE VERSION</div>
        <div className="container">
          <div className="text-center mt-24">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="vulnerability-banner">VULNERABLE VERSION</div>
      <div className="container">
        <div className="dashboard-header">
          <h1>User Profile</h1>
          <div className="header-actions">
            <div className="user-info">
              Logged in as: <strong>{user?.username}</strong>
            </div>
            <Link to="/dashboard" className="profile-link">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {profile && (
          <div className="profile-container">
            <div className="profile-section">
              <h2>Account Information</h2>
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{profile.username}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Sensitive Note</h2>
              <div className="note-container">
                {profile.sensitive_note ? (
                  <div className="note-content">
                    <p>{profile.sensitive_note}</p>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No sensitive note found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

export default Profile;

