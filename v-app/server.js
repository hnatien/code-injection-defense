import express from 'express';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// VULNERABLE: Using admin/root credentials
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

const sessions = {};

function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
        req.user = sessions[sessionId];
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/auth/register', async (req, res) => {
    const { username, password, sensitive_note } = req.body;

    try {
        const note = sensitive_note || '';
        // VULNERABLE: Direct string concatenation
        const query = `INSERT INTO users (username, password, sensitive_note, role) VALUES ('${username}', '${password}', '${note}', 'user')`;
        await pool.query(query);
        res.json({ success: true });
    } catch (error) {
        // VULNERABLE: Exposing stack trace
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(400).json({ error: error.stack || error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // VULNERABLE: Classic SQL Injection point
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
        res.status(500).json({ error: error.stack || error.message });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: { id: req.user.id, username: req.user.username } });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) delete sessions[sessionId];
    res.clearCookie('sessionId');
    res.json({ success: true });
});

app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        // VULNERABLE: Concatenation even with IDs
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = ${userId}`;
        const result = await pool.query(sqlQuery);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ profile: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.stack || error.message });
    }
});

app.get('/api/search', requireAuth, async (req, res) => {
    const query = req.query.q || '';

    try {
        // VULNERABLE: UNION-Based Injection point
        const sqlQuery = `SELECT * FROM users WHERE username LIKE '%${query}%'`;
        const result = await pool.query(sqlQuery);

        res.json({ users: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.stack || error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Vulnerable app running on http://localhost:${port}`);
});
