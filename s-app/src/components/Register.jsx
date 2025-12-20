import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, User, Lock, FileText, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="min-h-screen w-full bg-secure-black flex text-secure-light font-sans overflow-hidden">

      {/* Left Side */}
      <div className="hidden lg:flex w-5/12 relative bg-secure-dark items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-shield-pattern opacity-10 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 rounded-full border border-blue-500/30 mb-6 text-sm text-blue-300">
              <ShieldCheck size={14} />
              Secure Registration
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              Create Your <br />
              <span className="text-secure-secondary">Secure Identity</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Your data will be protected using industry-standard encryption and parameterized queries to prevent SQL injection.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: "Input Validation", desc: "Rigorous checking of all user inputs" },
              { title: "Password Hashing", desc: "Bcrypt encryption for credentials" },
              { title: "Prepared Statements", desc: "SQL logic separated from data" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-secure-secondary/20 flex items-center justify-center text-secure-secondary text-sm font-bold shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
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
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">New Account</h2>
              <p className="text-slate-400">Join the secure platform.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/40 p-8 rounded-2xl border border-slate-800">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
              >
                <CheckCircle size={18} className="rotate-45" />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-secure-secondary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-secondary/50 focus:border-secure-secondary transition-all outline-none"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-secure-secondary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-secondary/50 focus:border-secure-secondary transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex justify-between">
                <span>Sensitive Note</span>
                <span className="text-xs text-green-500 flex items-center gap-1"><ShieldCheck size={12} /> Protected storage</span>
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-500 group-focus-within:text-secure-secondary transition-colors">
                  <FileText size={18} />
                </div>
                <textarea
                  name="sensitive_note"
                  required
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-secure-secondary/50 focus:border-secure-secondary transition-all outline-none resize-none"
                  placeholder="Your secret note will be safely stored."
                  value={formData.sensitive_note}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Creating Account...' : (
                  <>
                    <UserPlus size={20} />
                    Create Secure Account
                  </>
                )}
              </span>
            </button>

            <div className="text-center mt-6">
              <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors group">
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
