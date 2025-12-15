import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { LayoutDashboard, Search as SearchIcon, User, LogOut, Shield, Terminal, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
        setError(data.error || 'Search operation failed.');
        setUsers([]);
      }
    } catch (err) {
      setError('Search operation failed.');
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

  // SQL Injection Visualization
  const sqlPreview = `SELECT * FROM users WHERE username LIKE '%${searchQuery}%'`;

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-light font-sans flex text-sm">
      {/* Sidebar (Simplified) */}
      <aside className="w-16 lg:w-64 bg-cyber-dark border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 lg:p-6 border-b border-gray-800 flex items-center justify-center lg:justify-start gap-3">
          <Shield className="w-8 h-8 text-cyber-primary" />
          <span className="hidden lg:block text-xl font-bold text-white tracking-tight">Secure<span className="text-cyber-primary">Defense</span></span>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
            <LayoutDashboard size={20} /> <span className="hidden lg:block">Overview</span>
          </Link>
          <Link to="/search" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20 justify-center lg:justify-start">
            <SearchIcon size={20} /> <span className="hidden lg:block">Search Users</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
            <User size={20} /> <span className="hidden lg:block">My Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col h-screen">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary via-blue-500 to-purple-500"></div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <header className="mb-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">User Database Search</h1>
            <p className="text-gray-400">Query the user directory. <span className="text-red-400 font-mono text-xs px-2 py-0.5 bg-red-500/10 rounded ml-2">INJECTION VULNERABLE</span></p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Search Box */}
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                <input
                  type="text"
                  className="w-full bg-cyber-dark border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-cyber-primary/50 focus:border-cyber-primary outline-none transition-all shadow-lg"
                  placeholder="Enter username (try 'admin' or %)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyber-gray hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? '...' : 'Exec'}
                </button>
              </form>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex gap-3 items-center">
                  <AlertTriangle size={18} />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Live SQL Monitor */}
            <div className="bg-black border border-gray-800 rounded-xl p-4 font-mono text-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-30">
                <Terminal size={40} />
              </div>
              <div className="text-xs text-gray-500 mb-2 border-b border-gray-800 pb-2 flex justify-between">
                <span>BACKEND QUERY MONITOR</span>
                <span className="text-green-500">LIVE</span>
              </div>
              <div className="text-cyber-primary break-all">
                <div dangerouslySetInnerHTML={{
                  __html: sqlPreview
                    .replace(/'(.*?)'/g, '<span class="text-yellow-400">\'$1\'</span>')
                    .replace(/LIKE/g, '<span class="text-purple-400">LIKE</span>')
                    .replace(/(SELECT|FROM|WHERE)/g, '<span class="text-blue-400">$1</span>')
                }} />
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-cyber-dark border border-gray-800 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-black/20 flex justify-between items-center">
              <h3 className="font-semibold text-white">Query Results</h3>
              <span className="text-xs text-gray-500">{users.length} records found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-gray-800">ID</th>
                    <th className="p-4 font-medium border-b border-gray-800">Username</th>
                    <th className="p-4 font-medium border-b border-gray-800 w-1/2">Sensitive Note (Leaked)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-gray-500 font-mono">{user.id}</td>
                        <td className="p-4 text-white font-medium">{user.username}</td>
                        <td className="p-4 text-gray-400">{user.sensitive_note || <span className="italic opacity-30">Null</span>}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-gray-500">
                        {searchQuery ? 'No records found matching criteria.' : 'Enter a search term to begin.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Search;
