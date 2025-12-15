import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { LayoutDashboard, Search as SearchIcon, User, LogOut, ShieldCheck, Database, Terminal, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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

  const sqlStatement = `SELECT * FROM users WHERE username LIKE $1`;
  const paramBinding = `$1 = '%${searchQuery}%'`;

  return (
    <div className="min-h-screen bg-secure-black text-secure-light font-sans flex text-sm">
      <aside className="w-16 lg:w-64 bg-secure-dark border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-center lg:justify-start gap-3">
          <ShieldCheck className="w-8 h-8 text-secure-primary" />
          <span className="hidden lg:block text-xl font-bold text-white tracking-tight">Secure<span className="text-secure-primary">Guard</span></span>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
            <LayoutDashboard size={20} /> <span className="hidden lg:block">Overview</span>
          </Link>
          <Link to="/search" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secure-primary/10 text-secure-primary border border-secure-primary/20 justify-center lg:justify-start">
            <SearchIcon size={20} /> <span className="hidden lg:block">Secure Search</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
            <User size={20} /> <span className="hidden lg:block">My Profile</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col h-screen">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secure-primary via-blue-500 to-indigo-500"></div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <header className="mb-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Secure User Search</h1>
            <p className="text-slate-400">Safely query the database using <span className="text-secure-primary">prepared statements</span>.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative group" autoComplete="off">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secure-primary transition-colors" />
                <input
                  type="text"
                  name="search-query-secure"
                  autoComplete="off"
                  className="w-full bg-secure-dark border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-primary/50 focus:border-secure-primary outline-none transition-all shadow-lg"
                  placeholder="Enter username (try injected code like ' OR '1'='1)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? '...' : 'Search'}
                </button>
              </form>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                <p className="flex items-start gap-2">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Tip: Try entering SQL injection payloads like <code className="bg-black/30 px-1 py-0.5 rounded text-white font-mono">' OR '1'='1</code>.
                    Notice how they are treated as literal strings, not executing as code.
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-black border border-slate-700 rounded-xl p-4 font-mono text-sm relative overflow-hidden shadow-xl">

              <div className="text-xs text-slate-500 mb-2 border-b border-slate-700 pb-2 flex justify-between">
                <span>PARAMETERIZED QUERY MONITOR</span>
                <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10} /> SECURE</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-600 block text-xs mb-1">Prepared Statement</span>
                  <div className="text-blue-300">
                    {sqlStatement.replace('$1', '<span class="text-green-400 font-bold">$1</span>')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600 block text-xs mb-1">Parameter Binding</span>
                  <div className="text-green-400">
                    {paramBinding}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/90 border border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col shadow-lg">
            <div className="p-4 border-b border-slate-800 bg-black/20 flex justify-between items-center">
              <h3 className="font-semibold text-white">Results</h3>
              <span className="text-xs text-slate-500">{users.length} matches</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-slate-800">ID</th>
                    <th className="p-4 font-medium border-b border-slate-800">Username</th>
                    <th className="p-4 font-medium border-b border-slate-800 w-1/2">Sensitive Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-slate-500 font-mono">{user.id}</td>
                        <td className="p-4 text-white font-medium">{user.username}</td>
                        <td className="p-4 text-slate-400">
                          {user.sensitive_note ? (
                            <span className="flex items-center gap-2">
                              <Lock size={12} className="text-green-500" />
                              [Encrypted Content]
                            </span>
                          ) : <span className="italic opacity-30">Null</span>}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-slate-500">
                        {searchQuery ? 'No matching records found (safe behavior).' : 'Enter a username to search safely.'}
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
