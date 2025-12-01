# Code Injection Defense - SQL Injection PoC

A Proof of Concept (PoC) project demonstrating SQL Injection vulnerabilities and Defense-in-Depth strategies. This monorepo contains two Node.js applications: a vulnerable version and a secure version, both connecting to a PostgreSQL database.

## Project Overview

This project demonstrates:
- **SQL Injection Vulnerabilities**: Auth bypass and data exfiltration via UNION attacks
- **Defense-in-Depth Strategies**: Input validation, parameterized queries, Principle of Least Privilege (PoLP), and security logging

## Project Structure

```
sql-injection-defense/
├── v-app/              # Vulnerable Application (Port 3000)
│   ├── server.js
│   ├── views/
│   ├── public/
│   └── Dockerfile
├── s-app/              # Secure Application (Port 3001)
│   ├── server.js
│   ├── views/
│   ├── public/
│   └── Dockerfile
├── database/
│   └── init.sql        # Database initialization script
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Ports 3000, 3001, and 5432 available

### Running the Project

1. **Clone/Navigate to the project directory**

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - **Vulnerable App**: http://localhost:3000
   - **Secure App**: http://localhost:3001

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Reset database (remove all data):**
   ```bash
   docker-compose down -v
   ```
   This removes volumes and resets the database to initial empty state.

## Database Setup

The database is automatically initialized with:

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (VARCHAR)
- `sensitive_note` (TEXT)

### Initial State
- Database starts empty (no seed data)
- Users must be registered through the registration form
- Registration form includes a **Sensitive Note** field for storing sensitive information

### Database Roles
- `app_readonly`: SELECT-only permissions (used by secure app)
- `app_full`: Full CRUD permissions (used for registration in secure app)

## Vulnerable Application (V-App)

**Port**: 3000  
**Banner**: Black "VULNERABLE VERSION" (monochrome design)

### Vulnerabilities

1. **SQL Injection in Login** (`POST /login`)
   - Uses string concatenation: `"SELECT * FROM users WHERE username = '" + user + "' AND password = '" + pass + "'"`
   - **Attack Example**: `admin'--` (bypasses password check)

2. **SQL Injection in Search** (`GET /search`)
   - Uses string concatenation: `"SELECT * FROM users WHERE username LIKE '%" + query + "%'"`
   - **Attack Example**: `' UNION SELECT id, username, password, role, sensitive_note FROM users--` (data exfiltration)

3. **SQL Injection in Registration** (`POST /register`)
   - Uses string concatenation for all fields including `sensitive_note`
   - **Attack Example**: Can inject SQL through sensitive_note field: `'test', role='admin'--`
   - **Privilege Escalation**: Users can select "admin" role during registration

4. **Privilege Escalation**
   - Registration form allows users to select "admin" role
   - No validation prevents users from self-assigning elevated privileges

5. **Error Disclosure**
   - Full SQL error stack traces displayed to users

### Test Attacks

**Auth Bypass:**
```
Username: <any_existing_username>'--
Password: (anything)
```
Note: You must first register a user, then use this payload to bypass authentication.

**Data Exfiltration:**
```
Search Query: ' UNION SELECT id, username, password, role, sensitive_note FROM users--
```
This will display all registered users including their sensitive notes.

**Registration SQL Injection:**
```
Sensitive Note: 'test', role='admin'--
```
This can be used to escalate privileges during registration (v-app only).

## Secure Application (S-App)

**Port**: 3001  
**Banner**: Black "SECURE VERSION" (monochrome design)

### Defense Mechanisms

#### Defense 1: Input Validation
- Middleware that rejects input containing SQL injection patterns:
  - Single quotes (`'`)
  - SQL comments (`--`, `/*`, `*/`)
  - Statement terminators (`;`)
  - SQL keywords (`UNION`, `SELECT`, `INSERT`, etc.)
- Applied to all input fields including registration form (username, password, sensitive_note)
- Note: Role field is removed from registration form to prevent privilege escalation

#### Defense 2: Parameterized Queries
- All database queries use parameterized statements:
  ```javascript
  pool.query('SELECT * FROM users WHERE username = $1', [username])
  ```

#### Defense 3: Principle of Least Privilege (PoLP)
- Application uses `app_readonly` role for SELECT operations
- Separate `app_full` role only for INSERT operations (registration)
- Database-level access control prevents unauthorized modifications
- **Privilege Escalation Prevention**: Registration always sets role to 'user' - users cannot self-assign admin role

#### Defense 4: Security Logging
- Suspicious input attempts are logged with:
  - Timestamp
  - IP address
  - Parameter name and value
  - Request path and method
- Logs appear in console and `security.log` file

#### Defense 5: Generic Error Messages
- No stack traces or detailed errors exposed to users
- Generic "System Error" messages prevent information leakage

#### Defense 6: Data Minimization in Search
- Search results only display safe fields (id, username, role)
- Password and sensitive_note are excluded from search results
- Empty search queries return no results (prevents accidental data exposure)

## Design System

Both applications implement a **Minimalist & Swiss Style** design:

- **Typography**: Inter/Helvetica/Arial (Sans-serif)
- **Color Palette**: Strictly Monochromatic (Black, White, Grey only - no accent colors)
- **Layout**: Grid-based, spacious, high contrast
- **Components**: Sharp corners, flat design, subtle hover effects
- **No shadows, gradients, or excessive border-radius**

## Technology Stack

- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Express.js
- **View Engine**: EJS (Server-side rendering)
- **Database**: PostgreSQL (Alpine)
- **Database Client**: `pg` (node-postgres) - No ORM
- **Containerization**: Docker & Docker Compose

## Application Flow

1. **Landing Page**: User can Login or Register
2. **Registration**: 
   - V-App: User can create account with username, password, role (can choose admin), and **sensitive_note** field
   - S-App: User can create account with username, password, and **sensitive_note** field (role is automatically set to 'user' - prevents privilege escalation)
3. **Dashboard**: After login, user sees "Search Users" feature and "View My Sensitive Note" option
4. **Search**: Query users by username (vulnerable to UNION attacks in v-app)
5. **My Note**: View your own sensitive note (secure in s-app, vulnerable in v-app)
6. **Login**: Authentication (vulnerable to auth bypass in v-app)

## Testing Scenarios

### Vulnerable App Testing

1. **Setup (First Time):**
   - Go to http://localhost:3000
   - Register a new user (e.g., username: `testuser`, password: `test123`)
   - Optionally add sensitive note: `Flag: SECRET_KEY_123`

2. **Test Auth Bypass:**
   - Login with: `<registered_username>'--` / `anything`
   - Should successfully bypass authentication

3. **Test Data Exfiltration:**
   - Login to dashboard
   - Search with: `' UNION SELECT id, username, password, role, sensitive_note FROM users--`
   - Should display all registered users including sensitive notes

4. **Test Registration SQL Injection:**
   - Register new user with sensitive_note: `'test', role='admin'--`
   - May allow privilege escalation (depending on query structure)

5. **Test Privilege Escalation:**
   - Register new user and select "admin" role from dropdown
   - User will be created with admin privileges

### Secure App Testing

1. **Test Input Validation:**
   - Try the same attacks as above
   - Should be blocked with "System Error: Invalid input detected."

2. **Test Privilege Escalation Prevention:**
   - Try to register with admin role
   - Registration form does not include role field
   - All new users are automatically assigned 'user' role

3. **Test Data Protection:**
   - Search for users - only safe fields (id, username, role) are displayed
   - Password and sensitive_note are never shown in search results
   - Use "View My Sensitive Note" to see only your own note

4. **Check Security Logs:**
   - View console output or `security.log` file
   - Should see `[ALERT]` entries for blocked attempts

## Security Notice

**This is an educational PoC project. DO NOT deploy to production environments.**

The vulnerable application intentionally contains security flaws for demonstration purposes. The secure application implements defense mechanisms but may not be production-ready without additional security measures (e.g., password hashing, rate limiting, CSRF protection, etc.).

## Learning Objectives

After exploring this project, you should understand:

1. How SQL Injection vulnerabilities occur
2. Common SQL Injection attack vectors (Auth Bypass, UNION attacks)
3. Defense-in-Depth security strategies
4. The importance of input validation
5. Parameterized queries vs. string concatenation
6. Principle of Least Privilege in database design
7. Security logging and monitoring

## Contributing

This is a university project for educational purposes. Feel free to extend it with additional vulnerabilities and defenses.

## License

Educational use only.