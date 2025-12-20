import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, Terminal, AlertTriangle, Eye, EyeOff, Key } from 'lucide-react';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Only call a special method to SET user, not to login again.
        // But the context only exposes `login` which does the fetch.
        // We probably need to refresh the auth state manually or expose a setUser.
        // Or wait... better idea. Just use the context login, but I suspect utils/api.js is the culprit.
        // I'll check utils/api.js first.
        // For now, let's keep using the manual fetch but reload the page or call checkAuth() to update state if I can't access setUser.
        // Actually, calling checkAuth() after manual login is a valid strategy.
        // Let's modify the code to:
        // 1. Manual fetch.
        // 2. If success, call checkAuth() from context (which hits /me).
        // 3. Navigate.
        await checkAuth();
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SQL Injection Visualization Text
  const sqlPreview = `SELECT * FROM users \nWHERE username = '${formData.username}' \nAND password = '${formData.password}'`;

  return (
    <div className="min-h-screen w-full bg-cyber-black flex text-cyber-light font-sans overflow-hidden">

      {/* Left Side - Visual/Art */}
      <div className="hidden lg:flex w-1/2 relative bg-cyber-dark items-center justify-center p-12 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>

        {/* Animated Orbs/Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-accent/10 rounded-full blur-[100px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="p-4 bg-cyber-primary/10 rounded-2xl border border-cyber-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,65,0.2)]">
              <Shield className="w-12 h-12 text-cyber-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Secure
              <span className="text-cyber-primary">Defense</span>
            </h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Master the art of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary">
                Secure Coding
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Explore vulnerabilities in a safe, controlled environment.
              Understand how SQL injection works to prevent it in real-world applications.
            </p>

            {/* Terminal Preview of SQL */}
            <div className="mt-8 bg-black/80 rounded-lg border border-cyber-gray p-6 font-mono text-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent"></div>
              <div className="flex items-center gap-2 mb-4 opacity-50">
                <Terminal size={14} />
                <span className="text-xs uppercase tracking-widest">Live Query Monitor</span>
              </div>

              <div className="space-y-2">
                <span className="text-gray-500">// Real-time SQL query construction</span>
                <div className="text-cyber-primary break-all whitespace-pre-wrap leading-relaxed">
                  {sqlPreview.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-4 text-gray-700 select-none">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/'(.*?)'/g, '<span class="text-yellow-400">\'$1\'</span>')
                          .replace(/(SELECT|FROM|WHERE|AND)/g, '<span class="text-purple-400">$1</span>')
                      }} />
                    </div>
                  ))}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-4 bg-cyber-primary ml-1 align-middle"
                  />
                </div>
              </div>

              {/* Warning if sensitive characters detected */}
              {(formData.username.includes("'") || formData.password.includes("'")) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="text-xs text-red-400">
                    <span className="font-bold">VULNERABILITY DETECTED:</span>
                    Possible string escaping attempt found in input. The current query uses string concatenation which is unsafe.
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_40%)]"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Enter your credentials to access the secure vault.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
              >
                <AlertTriangle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyber-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-cyber-dark border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-cyber-primary/50 focus:border-cyber-primary transition-all outline-none"
                    placeholder="admin"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyber-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 bg-cyber-dark border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-cyber-primary/50 focus:border-cyber-primary transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : (
                  <>
                    <Key size={18} />
                    Access Vault
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary via-white to-cyber-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="text-cyber-primary hover:text-cyber-secondary hover:underline font-medium transition-colors">
                Initialize new ID
              </Link>
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-gray-900 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest">
              Restricted Access • Unauthorized access prohibited
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
