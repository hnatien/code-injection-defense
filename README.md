# SQL Injection Defense - PoC

A Proof of Concept demonstrating SQL Injection vulnerabilities and Defense-in-Depth security strategies. Compare a vulnerable application with a secure implementation side-by-side.

## 🎯 What This Demonstrates

- **SQL Injection Vulnerabilities**: Auth bypass, data exfiltration via UNION attacks
- **Defense-in-Depth**: Input validation, parameterized queries, least privilege, security logging
- **Real-world Comparison**: Side-by-side vulnerable vs. secure implementations

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Ports: `3000`, `3001`, `5432`, `5555`

### Installation

```bash
# Clone and navigate to project
cd code-injection-defense

# Start all services
docker-compose up --build
```

### Access

- **Vulnerable App**: http://localhost:3000
- **Secure App**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (Database viewer)

### Stop Services

```bash
# Stop services
docker-compose down

# Reset database (remove all data)
docker-compose down -v
```

## 📋 Project Structure

```
code-injection-defense/
├── v-app/          # Vulnerable application (Port 3000)
├── s-app/          # Secure application (Port 3001)
├── database/       # Database initialization
├── prisma/         # Prisma Studio setup
└── docker-compose.yml
```

## 🔓 Vulnerable Application

**Port**: `3000`

### Vulnerabilities

| Endpoint | Issue | Attack Example |
|----------|-------|----------------|
| `POST /login` | String concatenation | `admin'--` (auth bypass) |
| `GET /search` | String concatenation | `' UNION SELECT id, username, password, sensitive_note FROM users--` |
| `POST /register` | String concatenation | SQL injection via `sensitive_note` |
| All endpoints | Error disclosure | Full stack traces exposed |

### Testing

1. **Register a user** at http://localhost:3000
2. **Auth Bypass**: Login with `username: testuser'--`, `password: anything`
3. **Data Exfiltration**: Search with `' UNION SELECT id, username, password, sensitive_note FROM users--`

## 🔒 Secure Application

**Port**: `3001`

### Defense Mechanisms

1. ✅ **Input Validation** - Blocks SQL injection patterns
2. ✅ **Parameterized Queries** - All queries use `$1, $2, ...` placeholders
3. ✅ **Least Privilege** - Separate DB roles (`app_readonly`, `app_full`)
4. ✅ **Security Logging** - Suspicious attempts logged to console/file
5. ✅ **Generic Errors** - No stack traces exposed
6. ✅ **Data Minimization** - Search only returns safe fields

### Testing

1. Try the same attacks at http://localhost:3001
2. All attacks blocked with: `"System Error: Invalid input detected."`
3. Check console for `[ALERT]` security logs

## 🗄️ Database

**Schema**: `users` table
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `sensitive_note` (TEXT)

Database starts empty. Users must register through the application.

**Database Roles**:
- `app_readonly`: SELECT-only (used by secure app)
- `app_full`: Full CRUD (used for registration)

## ⚠️ Security Notice

**This is an educational PoC. DO NOT deploy to production.**

The vulnerable application intentionally contains security flaws for demonstration. The secure application implements defense mechanisms but may require additional security measures for production use.
