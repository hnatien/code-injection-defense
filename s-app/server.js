const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session storage (in-memory, for demo purposes)
const sessions = {};

// Helper function to generate session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
            return res.status(400).render('error', { 
                message: 'System Error: Invalid input detected.' 
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
    const sessionId = req.cookies?.sessionId || req.query.sessionId;
    if (sessionId && sessions[sessionId]) {
        req.user = sessions[sessionId];
        return next();
    }
    res.redirect('/');
}

// Routes
app.get('/', (req, res) => {
    const registered = req.query.registered === 'true';
    res.render('login', { error: null, registered: registered });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', validateInput, async (req, res) => {
    const { username, password, sensitive_note } = req.body;
    
    try {
        // DEFENSE 2: Parameterized query
        // DEFENSE 7: Password hashing with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const note = sensitive_note || '';
        const query = `INSERT INTO users (username, password, sensitive_note) VALUES ($1, $2, $3)`;
        await fullPool.query(query, [username, hashedPassword, note]);
        res.redirect('/?registered=true');
    } catch (error) {
        // DEFENSE 3: Generic error message (no stack trace)
        console.error('Registration error:', error);
        res.render('register', { error: 'System Error: Registration failed.' });
    }
});

app.post('/login', validateInput, async (req, res) => {
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
                sessions[sessionId] = user;
                res.cookie('sessionId', sessionId);
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid credentials' });
            }
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Login error:', error);
        res.render('login', { error: 'System Error: Authentication failed.' });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.get('/profile', requireAuth, async (req, res) => {
    try {
        // DEFENSE 2: Parameterized query
        // Get user profile including sensitive_note for the currently logged-in user
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = $1`;
        const result = await readonlyPool.query(sqlQuery, [req.user.id]);
        
        if (result.rows.length === 0) {
            return res.render('profile', { 
                user: req.user, 
                profile: null,
                error: 'System Error: User not found.' 
            });
        }
        
        res.render('profile', { 
            user: req.user, 
            profile: result.rows[0],
            error: null
        });
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Profile error:', error);
        res.render('profile', { 
            user: req.user, 
            profile: null,
            error: 'System Error: Failed to retrieve profile.' 
        });
    }
});

app.get('/search', requireAuth, validateInput, async (req, res) => {
    const query = req.query.q || '';
    
    // Only perform search if query is not empty
    if (!query || query.trim() === '') {
        return res.render('search', { 
            user: req.user, 
            users: [], 
            query: '', 
            error: null
        });
    }
    
    try {
        // DEFENSE 2: Parameterized query
        // Only select safe fields (exclude password and sensitive_note)
        const sqlQuery = `SELECT id, username FROM users WHERE username LIKE $1`;
        const result = await readonlyPool.query(sqlQuery, [`%${query}%`]);
        
        res.render('search', { 
            user: req.user, 
            users: result.rows, 
            query: query,
            error: null
        });
    } catch (error) {
        // DEFENSE 3: Generic error message
        console.error('Search error:', error);
        res.render('search', { 
            user: req.user, 
            users: [], 
            query: query, 
            error: 'System Error: Search operation failed.' 
        });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Secure app running on http://localhost:${port}`);
});

