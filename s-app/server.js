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

// Database connection pools
// Read-only pool for SELECT operations (PoLP)
const readonlyPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER || 'app_readonly',
    password: process.env.DB_PASSWORD || 'readonly_pass'
});

// Full access pool for INSERT operations (registration)
const fullPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'injection_db',
    user: process.env.DB_USER_FULL || 'app_full',
    password: process.env.DB_PASSWORD_FULL || 'full_pass'
});

// Middleware
// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow React to work properly
}));

// Request size limits to prevent DoS attacks
// 100kb is reasonable for forms (username, password, sensitive_note) while still preventing large payload attacks
app.use(express.json({ limit: '100kb' })); // JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '100kb' })); // URL-encoded payload limit
app.use(cookieParser());

// Rate limiting - General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts per windowMs
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply general rate limit to all API routes
app.use('/api/', generalLimiter);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Session storage (in-memory, for demo purposes)
// Structure: { sessionId: { user: {...}, expiresAt: timestamp } }
const sessions = {};

// Session expiration time (24 hours in milliseconds)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

// Cleanup expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
        if (sessionData.expiresAt && sessionData.expiresAt < now) {
            delete sessions[sessionId];
        }
    }
}, 60 * 60 * 1000); // Run cleanup every hour

// Helper function to generate secure session ID using crypto
function generateSessionId() {
    // Generate 32 random bytes and convert to hex string (64 characters)
    // This is cryptographically secure and unpredictable
    return crypto.randomBytes(32).toString('hex');
}

// DEFENSE 1: Input Validation Middleware
function validateInput(req, res, next) {
    const sqlInjectionPatterns = [
        /'/g,           // Single quote
        /--/g,          // SQL comment
        /;/g,           // Statement terminator
        /\/\*/g,        // Multi-line comment start
        /\*\//g,        // Multi-line comment end
        /xp_/gi,        // Extended stored procedures
        /exec/gi,       // EXEC command
        /union/gi,       // UNION attack
        /select/gi,     // SELECT (for some contexts)
        /insert/gi,     // INSERT
        /update/gi,     // UPDATE
        /delete/gi,     // DELETE
        /drop/gi,       // DROP
        /script/gi      // XSS prevention
    ];

    const checkValue = (value) => {
        if (typeof value !== 'string') return false;
        return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    // Check all body and query parameters
    const allParams = { ...req.body, ...req.query };
    for (const [key, value] of Object.entries(allParams)) {
        if (checkValue(value)) {
            // DEFENSE 4: Log suspicious activity
            logSuspiciousActivity(req, key, value);
            return res.status(400).json({
                error: 'System Error: Invalid input detected.'
            });
        }
    }

    next();
}

// DEFENSE 4: Logging suspicious queries
function logSuspiciousActivity(req, param, value) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const logEntry = `[ALERT] ${timestamp} - Suspicious input detected\n` +
        `  IP: ${ip}\n` +
        `  Parameter: ${param}\n` +
        `  Value: ${value}\n` +
        `  Path: ${req.path}\n` +
        `  Method: ${req.method}\n` +
        `---\n`;

    // Log to console
    console.error(logEntry);

    // Log to file (optional, for production)
    try {
        fs.appendFileSync('security.log', logEntry);
    } catch (err) {
        // Ignore file write errors in demo
    }
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
        const sessionData = sessions[sessionId];
        // Check if session has expired
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

// API Routes
// Apply stricter rate limit to authentication endpoints
app.post('/api/auth/register', authLimiter, validateInput, async (req, res) => {
    const { username, password, sensitive_note } = req.body;

    try {
        // DEFENSE 2: Parameterized query
        // DEFENSE 7: Password hashing with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const note = sensitive_note || '';
        const query = `INSERT INTO users (username, password, sensitive_note, role) VALUES ($1, $2, $3, $4)`;
        await fullPool.query(query, [username, hashedPassword, note, 'user']);
        res.json({ success: true });
    } catch (error) {
        // DEFENSE 3: Generic error message (no stack trace)
        console.error('Registration error:', error);

        // Handle unique constraint violation (duplicate username)
        if (error.code === '23505') { // Postgres error code for unique_violation
            return res.status(409).json({ error: 'Username already exists' });
        }

        res.status(400).json({ error: 'System Error: Registration failed.' });
    }
});

app.post('/api/auth/login', authLimiter, validateInput, async (req, res) => {
    const { username, password } = req.body;

    try {
        // DEFENSE 2: Parameterized query
        // DEFENSE 7: Password verification with bcrypt
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await readonlyPool.query(query, [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            let passwordMatch = false;

            // Check if password is hashed (starts with bcrypt hash prefix)
            // This allows backward compatibility with users registered in v-app (plain text)
            // but ensures users registered in s-app are protected (hashed)
            if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
                // Password is hashed (registered in s-app) - use bcrypt
                passwordMatch = await bcrypt.compare(password, user.password);
            } else {
                // Password is plain text (registered in v-app) - direct comparison
                // Note: This is for demo purposes to show the difference
                passwordMatch = (user.password === password);
            }

            if (passwordMatch) {
                const sessionId = generateSessionId();
                // Store session with expiration timestamp
                sessions[sessionId] = {
                    user: user,
                    expiresAt: Date.now() + SESSION_EXPIRY
                };
                // Set secure cookie with proper flags
                res.cookie('sessionId', sessionId, {
                    httpOnly: true,        // Prevents XSS attacks (JavaScript cannot access)
                    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                    sameSite: 'strict',    // Prevents CSRF attacks
                    maxAge: SESSION_EXPIRY // 24 hours expiration
                });
                res.json({ success: true, user: { id: user.id, username: user.username } });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Login error:', error);
        res.status(500).json({ error: 'System Error: Authentication failed.' });
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
    res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true });
});

app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        // DEFENSE 2: Parameterized query
        // Get user profile including sensitive_note for the currently logged-in user
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = $1`;
        const result = await readonlyPool.query(sqlQuery, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'System Error: User not found.'
            });
        }

        res.json({
            profile: result.rows[0]
        });
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'System Error: Failed to retrieve profile.'
        });
    }
});

app.get('/api/search', requireAuth, validateInput, async (req, res) => {
    const query = req.query.q || '';

    // Only perform search if query is not empty
    if (!query || query.trim() === '') {
        return res.json({
            users: []
        });
    }

    try {
        // DEFENSE 2: Parameterized query
        // Only select safe fields (exclude password and sensitive_note)
        const sqlQuery = `SELECT id, username FROM users WHERE username LIKE $1`;
        const result = await readonlyPool.query(sqlQuery, [`%${query}%`]);

        res.json({
            users: result.rows
        });
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Search error:', error);
        res.status(500).json({
            error: 'System Error: Search operation failed.'
        });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Secure app running on http://localhost:${port}`);
});
