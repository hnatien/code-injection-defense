import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Principle of Least Privilege: Separate pools for different operations
const readonlyPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER || 'app_readonly',
    password: process.env.DB_PASSWORD || 'readonly_pass'
});

const fullPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER_FULL || 'app_full',
    password: process.env.DB_PASSWORD_FULL || 'full_pass'
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use(express.static(path.join(__dirname, 'dist')));

const sessions = {};
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

// Cleanup expired sessions hourly
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
        if (sessionData.expiresAt && sessionData.expiresAt < now) {
            delete sessions[sessionId];
        }
    }
}, 60 * 60 * 1000);

function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

function validateInput(req, res, next) {
    const { username, password, sensitive_note } = req.body;
    const { q } = req.query;

    if (username !== undefined) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            logSuspiciousActivity(req, 'username', username);
            return res.status(400).json({ error: 'Invalid username format.' });
        }
    }

    if (password !== undefined) {
        if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
            return res.status(400).json({ error: 'Password must be 6-100 characters.' });
        }
    }

    if (sensitive_note !== undefined) {
        if (typeof sensitive_note !== 'string' || sensitive_note.length > 500) {
            return res.status(400).json({ error: 'Note exceeds 500 characters.' });
        }
    }

    if (q !== undefined) {
        if (typeof q !== 'string' || q.length > 100) {
            return res.status(400).json({ error: 'Search query too long.' });
        }
    }

    next();
}

function logSuspiciousActivity(req, param, value) {
    const logEntry = `[ALERT] ${new Date().toISOString()} - Suspicious input\n  IP: ${req.ip}\n  Param: ${param}\n  Value: ${value}\n---\n`;
    console.error(logEntry);
    try {
        fs.appendFileSync('security.log', logEntry);
    } catch (err) { /* ignore */ }
}

function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
        const sessionData = sessions[sessionId];
        if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
            delete sessions[sessionId];
            res.clearCookie('sessionId', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            return res.status(401).json({ error: 'Session expired' });
        }
        req.user = sessionData.user;
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/auth/register', authLimiter, validateInput, async (req, res) => {
    const { username, password, sensitive_note } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password, sensitive_note, role) VALUES ($1, $2, $3, $4)`;
        await fullPool.query(query, [username, hashedPassword, sensitive_note || '', 'user']);
        res.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(400).json({ error: 'Registration failed.' });
    }
});

app.post('/api/auth/login', authLimiter, validateInput, async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await readonlyPool.query(query, [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            let passwordMatch = false;

            // Support both legacy (plain) and secure (hashed) passwords for demo compatibility
            if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                passwordMatch = await bcrypt.compare(password, user.password);
            } else {
                passwordMatch = (user.password === password);
            }

            if (passwordMatch) {
                const sessionId = generateSessionId();
                sessions[sessionId] = {
                    user: user,
                    expiresAt: Date.now() + SESSION_EXPIRY
                };
                res.cookie('sessionId', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: SESSION_EXPIRY
                });
                res.json({ success: true, user: { id: user.id, username: user.username } });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed.' });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: { id: req.user.id, username: req.user.username } });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) delete sessions[sessionId];

    res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true });
});

app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = $1`;
        const result = await readonlyPool.query(sqlQuery, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ profile: result.rows[0] });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
});

app.get('/api/search', requireAuth, validateInput, async (req, res) => {
    const query = req.query.q || '';

    if (!query || query.trim() === '') {
        return res.json({ users: [] });
    }

    try {
        // Escape wildcards to ensure literal search behavior
        const escapedQuery = query.replace(/[%_]/g, '\\$&');

        const sqlQuery = `SELECT id, username FROM users WHERE username LIKE $1 LIMIT 50`;
        const result = await readonlyPool.query(sqlQuery, [`%${escapedQuery}%`]);

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search operation failed.' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Secure app running on http://localhost:${port}`);
});
