import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { User, FileText, Terminal, ArrowLeft, ShieldAlert, LogOut, Skull } from 'lucide-react';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock ID for visualization since we don't always get it from /me endpoint immediately or it might differ
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

  const vulnerableQuery = `SELECT username, sensitive_note \nFROM users \nWHERE id = ${currentUserId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black text-cyber-light flex items-center justify-center font-mono">
        <div className="animate-pulse flex flex-col items-center">
          <Terminal className="w-12 h-12 text-cyber-primary mb-4" />
          <div className="text-xl">ACCESSING MAINFRAME...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-light font-sans relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none fixed"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyber-primary/5 blur-[120px] rounded-full pointer-events-none fixed"></div>

      {/* Warning Banner */}
      <div className="bg-red-500/10 border-b border-red-500/20 py-2 px-4 flex items-center justify-center gap-2 text-red-500 text-xs tracking-widest uppercase font-mono sticky top-0 z-50 backdrop-blur-md">
        <ShieldAlert size={14} />
        <span>System Vulnerable: IDOR & SQL Injection Risks Detected</span>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-cyber-primary transition-colors group">
            <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-cyber-primary/50 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Return to Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span>Disconnect</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-cyber-dark/80 backdrop-blur-md rounded-xl border border-cyber-gray p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary to-blue-500"></div>

              <div className="flex justify-center mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-cyber-gray/50 flex items-center justify-center border-2 border-cyber-primary/30 relative z-10">
                  <User size={48} className="text-cyber-light/70" />
                </div>
                <div className="absolute inset-0 bg-cyber-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-white">{profile?.username || 'Unknown User'}</h2>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary text-xs font-mono">
                  ID: #{user?.id || '???'}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Status</div>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active Session
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Data & Vulnerabilities */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sensitive Note Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-cyber-dark/80 backdrop-blur-md rounded-xl border border-cyber-gray p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-cyber-secondary/10 rounded-lg border border-cyber-secondary/20">
                    <FileText className="text-cyber-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Sensitive Note</h3>
                    <p className="text-sm text-gray-400">Encrypted personal vault data</p>
                  </div>
                </div>

                {error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="p-6 bg-black/50 rounded-lg border border-gray-800 font-mono text-gray-300 relative group">
                    <div className="absolute top-2 right-2 text-xs text-gray-600">RAW_DATA</div>
                    {profile?.sensitive_note ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{profile.sensitive_note}</p>
                    ) : (
                      <p className="italic text-gray-500">No sensitive data found in this sector.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vulnerability Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black rounded-xl border border-gray-800 p-6 relative overflow-hidden group"
            >
              {/* Glitch Effect Border */}
              <div className="absolute inset-0 border border-transparent group-hover:border-red-500/30 transition-colors pointer-events-none rounded-xl"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-gray-400" />
                  <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">Query Monitor</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-red-500 font-bold px-2 py-1 bg-red-500/10 rounded">
                  <Skull size={12} />
                  UNSAFE EXECUTION
                </div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="text-gray-500">// The application uses string concatenation to fetch your profile</div>
                <div className="p-4 bg-gray-900 rounded border border-gray-800 break-all">
                  {vulnerableQuery.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-700 select-none w-6 text-right mr-4">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/(SELECT|FROM|WHERE)/g, '<span class="text-purple-400">$1</span>')
                          .replace(/users/, '<span class="text-yellow-200">users</span>')
                          .replace(` ${currentUserId}`, ` <span class="text-red-400 underline decoration-wavy decoration-red-500/50" title="Injected Directly">${currentUserId}</span>`)
                      }} />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-red-400 flex items-start gap-2">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <span>Risk: Attacker could manipulate the ID parameter to access other users' data (IDOR) or inject SQL because the input is not sanitized.</span>
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

