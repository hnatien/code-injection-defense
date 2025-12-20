
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Search as SearchIcon, User, ShieldCheck, Database, Copy, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

function SQLiTest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = React.useState(null);

    const payloads = [
        {
            title: "Authentication Bypass",
            description: "Attempts to bypass login. Secure logic should prevent this.",
            code: "' OR '1'='1",
            context: "Login Form"
        },
        {
            title: "Union-Based Extraction",
            description: "Attempts to extract extra data. Secure queries won't execute this.",
            code: "' UNION SELECT 1, username, password, sensitive_note, 'role' FROM users--",
            context: "Search Field"
        },
        {
            title: "Comment Truncation",
            description: "Attempts to ignore password check.",
            code: "admin' --",
            context: "Login Form"
        },
        {
            title: "Wildcard Abuse",
            description: "Standard wildcard. Secure app escapes this literal.",
            code: "%",
            context: "Search Field"
        },
        {
            title: "Error Probing",
            description: "Attempts to trigger SQL syntax errors.",
            code: "'",
            context: "Any Input"
        },
        {
            title: "Stacked Queries",
            description: "Attempts to drop tables. Parameterized queries treat this as a string.",
            code: "'; DROP TABLE users; --",
            context: "Input Fields"
        },
        {
            title: "Boolean-Based Blind",
            description: "Attempts boolean inference. Secure app treats this as a literal.",
            code: "' AND (SELECT 1)=1 --",
            context: "Any Input"
        },
        {
            title: "Time-Based Blind",
            description: "Attempts to sleep DB. Secure app won't execute function calls.",
            code: "'; SELECT pg_sleep(5); --",
            context: "Any Input"
        }
    ];

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-secure-black text-secure-light font-sans flex text-sm">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 bg-secure-dark border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-center lg:justify-start gap-3">
                    <ShieldCheck className="w-8 h-8 text-secure-primary" />
                    <span className="hidden lg:block text-xl font-bold text-white tracking-tight">Secure<span className="text-secure-primary">Guard</span></span>
                </div>
                <nav className="flex-1 p-2 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <LayoutDashboard size={20} /> <span className="hidden lg:block">Overview</span>
                    </Link>
                    <Link to="/search" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <SearchIcon size={20} /> <span className="hidden lg:block">Secure Search</span>
                    </Link>
                    <Link to="/sqli-test" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secure-primary/10 text-secure-primary border border-secure-primary/20 justify-center lg:justify-start">
                        <Database size={20} /> <span className="hidden lg:block">SQLi Test</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <User size={20} /> <span className="hidden lg:block">My Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative flex flex-col h-screen">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secure-primary via-blue-500 to-indigo-500"></div>

                <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex-1 flex flex-col">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Defense Verification</h1>
                        <p className="text-slate-400">Use these payloads to verify that the application is immune to common attacks.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {payloads.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-secure-dark border border-slate-800 rounded-xl p-6 group hover:border-secure-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    <Lock size={16} className="text-green-500" />
                                </div>

                                <p className="text-slate-400 text-sm mb-4 h-10">{item.description}</p>

                                <div className="bg-black/40 p-3 rounded-lg border border-slate-800 relative group-hover:border-secure-primary/30 transition-colors">
                                    <code className="text-slate-300 font-mono text-sm break-all">{item.code}</code>
                                    <button
                                        onClick={() => handleCopy(item.code, idx)}
                                        className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white hover:bg-slate-700 transition-colors"
                                        title="Copy Payload"
                                    >
                                        {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm flex gap-3 items-start">
                        <ShieldCheck className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <strong>Safe Zone:</strong> This application uses parameterized queries and input validation.
                            These payloads will be treated as literal strings and should NOT execute.
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default SQLiTest;
