import express from 'express';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Database connection - VULNERABLE: Using admin credentials
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Session storage (in-memory, for demo purposes)
const sessions = {};

// Helper function to generate session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
        req.user = sessions[sessionId];
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// API Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, password, sensitive_note } = req.body;
    
    try {
        // VULNERABLE: String concatenation
        const note = sensitive_note || '';
        const query = `INSERT INTO users (username, password, sensitive_note, role) VALUES ('${username}', '${password}', '${note}', 'user')`;
        await pool.query(query);
        res.json({ success: true });
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.status(400).json({ error: error.stack || error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // VULNERABLE: String concatenation - SQL Injection point
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const sessionId = generateSessionId();
            sessions[sessionId] = user;
            res.cookie('sessionId', sessionId);
            res.json({ success: true, user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.status(500).json({ error: error.stack || error.message });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: { id: req.user.id, username: req.user.username } });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
});

app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        // VULNERABLE: String concatenation - but using session user.id for basic security
        const userId = req.user.id;
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = ${userId}`;
        const result = await pool.query(sqlQuery);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'User not found.' 
            });
        }
        
        res.json({ 
            profile: result.rows[0]
        });
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.status(500).json({ 
            error: error.stack || error.message 
        });
    }
});

app.get('/api/search', requireAuth, async (req, res) => {
    const query = req.query.q || '';
    
    try {
        // VULNERABLE: String concatenation - SQL Injection point for UNION attacks
        const sqlQuery = `SELECT * FROM users WHERE username LIKE '%${query}%'`;
        const result = await pool.query(sqlQuery);
        
        res.json({ 
            users: result.rows
        });
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.status(500).json({ 
            error: error.stack || error.message 
        });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Vulnerable app running on http://localhost:${port}`);
});
