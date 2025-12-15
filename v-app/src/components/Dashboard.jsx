import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Search, User, LogOut, Shield, Database, Terminal } from 'lucide-react';
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
    { icon: User, label: 'My Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-light font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-cyber-dark border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyber-primary" />
          <span className="text-xl font-bold text-white tracking-tight">Secure<span className="text-cyber-primary">Defense</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path || '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                  ? 'bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20 shadow-[0_0_10px_rgba(0,255,65,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Session</div>
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {user?.username}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary via-blue-500 to-purple-500"></div>

        <div className="p-8">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Security Overview</h1>
              <p className="text-gray-400">System status and vulnerability monitoring</p>
            </div>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs font-bold text-red-400 uppercase tracking-widest animate-pulse">
              System Vulnerable
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-cyber-dark border border-gray-800 rounded-xl hover:border-cyber-primary/50 transition-colors group cursor-pointer"
              onClick={() => navigate('/search')}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">User Database Search</h3>
              <p className="text-sm text-gray-400 mb-4">Search for users. Vulnerable to SQL Injection via search query concatenation.</p>
              <span className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Access Module <Terminal size={14} />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-cyber-dark border border-gray-800 rounded-xl hover:border-cyber-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Data Vault</h3>
              <p className="text-sm text-gray-400 mb-4">Sensitive notes storage. Currently exposed due to lack of row-level security?</p>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 w-3/4 h-full"></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>Storage</span>
                <span>75% Used</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-cyber-dark border border-gray-800 rounded-xl hover:border-cyber-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Defense Status</h3>
              <p className="text-sm text-gray-400 mb-4">Current implementation uses string concatenation. Protection level: Critical.</p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                VULNERABILITIES ACTIVE
              </div>
            </motion.div>
          </div>

          <div className="bg-cyber-dark border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Terminal size={18} className="text-gray-400" />
              System Logs
            </h3>
            <div className="font-mono text-sm space-y-2 text-gray-400">
              <p><span className="text-green-500">[10:42:12]</span> User {user?.username} authenticated successfully.</p>
              <p><span className="text-blue-500">[10:42:15]</span> Session token generated: {Math.random().toString(36).substring(7)}...</p>
              <p><span className="text-yellow-500">[INFO]</span> Database connection established (PostgreSQL).</p>
              <p className="text-gray-600">...</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
