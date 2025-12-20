import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserPlus, User, Lock, FileText, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    sensitive_note: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cyber-black flex text-cyber-light font-sans overflow-hidden">

      {/* Left Side - Visual/Art (Same as Login for consistency) */}
      <div className="hidden lg:flex w-5/12 relative bg-cyber-dark items-center justify-center p-12 overflow-hidden border-r border-gray-900">
        <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>

        {/* Animated Orbs - Different colors for Register */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800 mb-6 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-cyber-primary animate-pulse"></span>
              Secure Registration Protocol
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              Join the <br />
              <span className="text-cyber-primary">Defense Grid</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Create a secure identity to demonstrate SQL injection vulnerabilities.
              Your "Sensitive Note" will be the target of our protection (or attack).
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: "Identity Creation", desc: "Set up your unique access credentials" },
              { title: "Secure Vault", desc: "Store sensitive information encrypted (simulated)" },
              { title: "Vulnerability Testing", desc: "Test your defense mechanisms" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/40 border border-gray-800/50"
              >
                <div className="w-8 h-8 rounded-full bg-cyber-primary/20 flex items-center justify-center text-cyber-primary text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">New Access ID</h2>
              <p className="text-gray-400">Please provide your details below.</p>
            </div>
            <Shield className="w-10 h-10 text-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/20 p-8 rounded-2xl border border-gray-800/50">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
              >
                <AlertTriangle size={18} />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
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
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password */}
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

            {/* Sensitive Note */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1 flex justify-between">
                <span>Sensitive Note</span>
                <span className="text-xs text-yellow-500/80">Stored in cleartext (Vulnerable)</span>
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-500 group-focus-within:text-cyber-primary transition-colors">
                  <FileText size={18} />
                </div>
                <textarea
                  name="sensitive_note"
                  required
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 bg-cyber-dark border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-cyber-primary/50 focus:border-cyber-primary transition-all outline-none resize-none"
                  placeholder="Enter a secret note here. In this vulnerable app, this might be accessed by others via SQL Injection."
                  value={formData.sensitive_note}
                  onChange={handleChange}
                />
                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-primary/30 rounded-br pointer-events-none"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyber-light text-black font-bold py-4 px-4 rounded-lg hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </span>
            </button>

            <div className="text-center mt-6">
              <Link to="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors group">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
