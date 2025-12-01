const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const path = require('path');

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

app.post('/register', async (req, res) => {
    const { username, password, sensitive_note } = req.body;
    
    try {
        // VULNERABLE: String concatenation
        const note = sensitive_note || '';
        const query = `INSERT INTO users (username, password, sensitive_note) VALUES ('${username}', '${password}', '${note}')`;
        await pool.query(query);
        res.redirect('/?registered=true');
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.render('register', { error: error.stack || error.message });
    }
});

app.post('/login', async (req, res) => {
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
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.render('login', { error: error.stack || error.message });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.get('/profile', requireAuth, async (req, res) => {
    try {
        // VULNERABLE: String concatenation - but using session user.id for basic security
        const userId = req.user.id;
        const sqlQuery = `SELECT username, sensitive_note FROM users WHERE id = ${userId}`;
        const result = await pool.query(sqlQuery);
        
        if (result.rows.length === 0) {
            return res.render('profile', { 
                user: req.user, 
                profile: null,
                error: 'User not found.' 
            });
        }
        
        res.render('profile', { 
            user: req.user, 
            profile: result.rows[0],
            error: null
        });
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.render('profile', { 
            user: req.user, 
            profile: null,
            error: error.stack || error.message 
        });
    }
});

app.get('/search', requireAuth, async (req, res) => {
    const query = req.query.q || '';
    
    try {
        // VULNERABLE: String concatenation - SQL Injection point for UNION attacks
        const sqlQuery = `SELECT * FROM users WHERE username LIKE '%${query}%'`;
        const result = await pool.query(sqlQuery);
        
        res.render('search', { 
            user: req.user, 
            users: result.rows, 
            query: query,
            error: null
        });
    } catch (error) {
        // VULNERABLE: Display full error stack
        res.render('search', { 
            user: req.user, 
            users: [], 
            query: query, 
            error: error.stack || error.message 
        });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Vulnerable app running on http://localhost:${port}`);
});

