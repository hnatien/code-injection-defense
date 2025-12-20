import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, Terminal, CheckCircle, Eye, EyeOff, FileKey } from 'lucide-react';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
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

  // Secure Parameterized Query Visualization
  const sqlPreview = `SELECT * FROM users \nWHERE username = $1 \nAND password = $2`;
  const paramsPreview = `\n$1 = '${formData.username}'\n$2 = '[HASHED_PASSWORD]'`;

  return (
    <div className="min-h-screen w-full bg-secure-black flex text-secure-light font-sans overflow-hidden">

      {/* Left Side - Secure Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-secure-dark items-center justify-center p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[length:24px_24px] opacity-20"></div>

        {/* Glowing Shield Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secure-primary/5 rounded-full blur-[80px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="p-4 bg-secure-primary/10 rounded-2xl border border-secure-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-shield">
              <ShieldCheck className="w-12 h-12 text-secure-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Secure
              <span className="text-secure-primary">Guard</span>
            </h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Fortified Against <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secure-primary to-secure-secondary">
                SQL Injection Attacks
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              This application utilizes <strong className="text-white">Parameterized Queries</strong> (Prepared Statements)
              to ensure user input is never interpreted as SQL commands.
            </p>

            {/* Secure Query Preview */}
            <div className="mt-8 bg-black/80 rounded-lg border border-slate-700 p-6 font-mono text-sm relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secure-primary to-secure-secondary"></div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-slate-400" />
                  <span className="text-xs uppercase tracking-widest text-slate-400">Secure Query Builder</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
                  <CheckCircle size={12} /> SAFE
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 block mb-1">// Query Template (Immutable)</span>
                  <div className="text-blue-300 break-all whitespace-pre-wrap leading-relaxed opacity-80">
                    {sqlPreview}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-1">// Bound Parameters (Data only)</span>
                  <div className="text-green-400 break-all whitespace-pre-wrap">
                    {paramsPreview}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-secure-dark to-secure-black pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Secure Login</h2>
            <p className="text-slate-400">Enter your credentials to access the protected dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
              >
                <CheckCircle size={18} className="rotate-45" /> {/* Just an icon reuse */}
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-secure-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-primary/50 focus:border-secure-primary transition-all outline-none"
                    placeholder="admin"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-secure-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-primary/50 focus:border-secure-primary transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-secure-primary hover:bg-secure-safe text-white font-bold py-3 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-secure-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Verifying...' : (
                  <>
                    <FileKey size={18} />
                    Authenticate
                  </>
                )}
              </span>
            </button>

            <div className="text-center text-sm">
              <span className="text-slate-500">Need an account? </span>
              <Link to="/register" className="text-secure-primary hover:text-secure-secondary hover:underline font-medium transition-colors">
                Register Securely
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center gap-4 text-xs text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> Encrypted</span>
            <span className="flex items-center gap-1"><Lock size={12} /> Secure</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
