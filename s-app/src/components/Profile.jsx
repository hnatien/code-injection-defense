import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { User, FileText, Terminal, ArrowLeft, ShieldCheck, LogOut, Lock, CheckCircle } from 'lucide-react';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock ID for visualization
  const currentUserId = user?.id || '1';

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
        setError(data.error || 'System Error: Failed to retrieve profile.');
      }
    } catch (err) {
      setError('System Error: Failed to retrieve profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const secureQuery = `SELECT username, sensitive_note \nFROM users \nWHERE id = $1`;
  const secureParams = `\n// Parameters bound separately\n$1 = ${currentUserId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-secure-black text-secure-light flex items-center justify-center font-mono">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-secure-primary mb-4" />
          <div className="text-xl">VERIFYING IDENTITY...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secure-black text-secure-light font-sans relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dotted-spacing-4 bg-dotted-secure-primary/10 fixed opacity-20"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secure-primary/5 blur-[100px] rounded-full pointer-events-none fixed"></div>

      {/* Safety Banner */}
      <div className="bg-secure-primary/10 border-b border-secure-primary/20 py-2 px-4 flex items-center justify-center gap-2 text-secure-primary text-xs tracking-widest uppercase font-bold sticky top-0 z-50 backdrop-blur-md">
        <ShieldCheck size={14} />
        <span>System Secured: Parameterized Queries Active</span>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-secure-primary transition-colors group">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-secure-primary/50 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Return to Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-secure-dark/80 backdrop-blur-md rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secure-primary to-secure-secondary"></div>

              <div className="flex justify-center mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-secure-dark shadow-2xl relative z-10">
                  <User size={40} className="text-secure-primary" />
                </div>
                <div className="absolute bottom-0 right-1/3 w-6 h-6 bg-secure-primary text-black rounded-full flex items-center justify-center border-2 border-secure-dark z-20">
                  <CheckCircle size={14} fill="currentColor" className="text-white" />
                </div>
              </div>

              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">{profile?.username || 'Authenticated User'}</h2>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secure-primary/10 text-secure-primary text-xs font-bold tracking-wide">
                  <ShieldCheck size={12} /> VERIFIED
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Account ID</span>
                  <span className="font-mono text-slate-300">#{user?.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Security Level</span>
                  <span className="text-green-400 font-medium">Standard</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Data & Security Features */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sensitive Note Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-secure-dark/80 backdrop-blur-md rounded-xl border border-slate-700 p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Lock className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Secure Data Vault</h3>
                    <p className="text-sm text-slate-400">Accessing protected personal information</p>
                  </div>
                </div>

                {error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-6 relative">
                    <div className="absolute -top-3 left-4 px-2 bg-secure-dark text-xs text-blue-400 font-medium border border-slate-800 rounded flex items-center gap-1">
                      <Lock size={10} /> ENCRYPTED STORAGE
                    </div>
                    {profile?.sensitive_note ? (
                      <p className="text-slate-300 leading-relaxed">{profile.sensitive_note}</p>
                    ) : (
                      <p className="italic text-slate-500">Vault appears empty.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Secure Query Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-slate-400" />
                  <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">Security Layer Info</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400 font-bold px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
                  <CheckCircle size={12} />
                  SAFE EXECUTION
                </div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="text-slate-500 text-xs">// Data access uses Prepared Statements (Parameterized Queries)</div>
                <div className="p-4 bg-slate-950 rounded border border-slate-800">
                  <div className="text-blue-300 break-all whitespace-pre-wrap mb-4">
                    {secureQuery.split('\n').map((line, i) => (
                      <div key={i}>
                        <span dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/(SELECT|FROM|WHERE)/g, '<span class="text-purple-400">$1</span>')
                            .replace(/users/, '<span class="text-yellow-200">users</span>')
                            .replace(/\$1/, '<span class="text-green-400 font-bold">$1</span>')
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 pt-3 text-green-400/80">
                    {secureParams.trim().split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="text-green-500 font-bold">Protection:</span> The ID is treated strictly as data, not executable code. Even if a user tries to inject SQL, it will fail harmlessly.
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

