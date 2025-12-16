import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Search, User, LogOut, ShieldCheck, Database, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Search, label: 'Search Users', path: '/search' },
    { icon: Database, label: 'SQLi Test', path: '/sqli-test' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-secure-black text-secure-light font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secure-dark border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-secure-primary" />
          <span className="text-xl font-bold text-white tracking-tight">Secure<span className="text-secure-primary">Guard</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path || '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                ? 'bg-secure-primary/10 text-secure-primary border border-secure-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Authenticated As</div>
            <div className="flex items-center gap-2 text-white font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              {user?.username}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secure-primary via-blue-500 to-indigo-500"></div>

        <div className="p-8">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
              <p className="text-slate-400">Real-time threat monitoring and defense status.</p>
            </div>
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> System Secured
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-secure-dark border border-slate-800 rounded-xl hover:border-secure-primary/50 transition-colors group cursor-pointer"
              onClick={() => navigate('/search')}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure Search</h3>
              <p className="text-sm text-slate-400 mb-4">Query user database using parameterized statements to prevent SQLi.</p>
              <span className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Execute Safe Query <CheckCircle size={14} />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-secure-dark border border-slate-800 rounded-xl hover:border-secure-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Encrypted Vault</h3>
              <p className="text-sm text-slate-400 mb-4">Data at rest is secured. Access control policies enforced.</p>
              <div className="flex gap-2 mt-4">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">AES-256</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">TLS 1.3</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-secure-dark border border-slate-800 rounded-xl hover:border-secure-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Attack Surface</h3>
              <p className="text-sm text-slate-400 mb-4">Zero vulnerabilities detected in scan.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                OPTIMAL
              </div>
            </motion.div>
          </div>

          {/* Code Snippet Comparison */}
          <div className="bg-secure-dark border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-500" />
              Defense Mechanism: Parameterized Queries
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/40 p-4 rounded-lg border border-red-900/30">
                <div className="text-xs text-red-400 font-bold mb-2 uppercase flex justify-between">
                  <span>Unsafe (Vulnerable)</span>
                  <span className="bg-red-900/50 px-2 rounded text-[10px]">Do Not Use</span>
                </div>
                <code className="text-sm font-mono text-slate-400 block break-all">
                  const query = "SELECT * FROM users WHERE name = '" + <span className="text-red-400">username</span> + "'";
                </code>
              </div>
              <div className="bg-green-900/10 p-4 rounded-lg border border-green-900/30">
                <div className="text-xs text-green-400 font-bold mb-2 uppercase flex justify-between">
                  <span>Safe (Secure)</span>
                  <span className="bg-green-900/50 px-2 rounded text-[10px]">Recommended</span>
                </div>
                <code className="text-sm font-mono text-slate-400 block break-all">
                  const query = "SELECT * FROM users WHERE name = <span className="text-green-400">$1</span>";
                  <br />
                  pool.query(query, [<span className="text-green-400">username</span>]);
                </code>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
