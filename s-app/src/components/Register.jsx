import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sensitiveNote, setSensitiveNote] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/auth/register', {
        username,
        password,
        sensitive_note: sensitiveNote,
      });

      if (response.ok) {
        navigate('/?registered=true');
      } else {
        const data = await response.json();
        setError(data.error || 'System Error: Registration failed.');
      }
    } catch (err) {
      setError('System Error: Registration failed.');
    }
  };

  return (
    <>
      <div className="security-banner">SECURE VERSION</div>
      <div className="form-container">
        <h1>Register</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sensitive_note">Sensitive Note</label>
            <textarea
              id="sensitive_note"
              value={sensitiveNote}
              onChange={(e) => setSensitiveNote(e.target.value)}
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>

        <div className="text-center mt-24">
          <Link to="/" className="link-secondary">
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default Register;

