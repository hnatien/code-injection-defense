# 🛡️ SQL Injection Defense: Attack & Defense Lab

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Express.js-success.svg?logo=nodedotjs)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)]()

> A comprehensive Proof of Concept (PoC) demonstrating SQL Injection vulnerabilities side-by-side with modern defense strategies. Perfect for developers, students, and security enthusiasts to learn Defense-in-Depth.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [The Lab: How to Test](#-the-lab-how-to-test)
    - [🔴 The Vulnerable App](#-the-vulnerable-app-port-3000)
    - [🟢 The Secure App](#-the-secure-app-port-3001)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Troubleshooting](#-troubleshooting)
- [Disclaimer](#-disclaimer)

---

## 🔭 Overview

This project runs two versions of the same web application simultaneously:
1.  **Vulnerable App (`v-app`)**: Intentionally riddled with SQL Injection flaws (Admin bypass, Data leaks).
2.  **Secure App (`s-app`)**: Implements specific defenses (Input Validation, Parameterized Queries, Least Privilege).

By comparing them, you can clearly see *how* attacks work and *why* defenses succeed.

---

## ✨ Key Features

| Feature | Vulnerable App (v-app) | Secure App (s-app) |
| :--- | :--- | :--- |
| **Input Handling** | Unsafe String Concatenation | ✅ Input Validation & Parameterization |
| **Authentication** | Bypassable via SQLi | ✅ Secure Auth with Rate Limiting |
| **Database Access** | Root Privilege | ✅ Least Privilege (Read-Only Roles) |
| **Passwords** | Plain Text Storage | ✅ Bcrypt Hashing |
| **Error Handling** | Full Stack Traces (Info Leak) | ✅ Generic Error Messages |
| **Session Control** | Predictable/Insecure | ✅ Secure, HttpOnly Cookies |

---

## 📸 Screenshots

*(Add screenshots here demonstrating the UI comparison or an attack in action)*

> *Note: While screens are being added, proceed to Quick Start to see it live!*

---

## 🚀 Quick Start

### Prerequisites
- **Docker** & **Docker Compose** installed.
- Ports `3000`, `3001`, `5432`, `5555` available.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hnatien/code-injection-defense.git
    cd code-injection-defense
    ```

2.  **Launch the Lab:**
    ```bash
    docker-compose up --build
    ```
    *This starts the database, both applications, and Prisma Studio.*

3.  **Access the Apps:**
    - 🔴 **Vulnerable App**: [http://localhost:3000](http://localhost:3000)
    - 🟢 **Secure App**: [http://localhost:3001](http://localhost:3001)
    - 🗄️ **Database Viewer**: [http://localhost:5555](http://localhost:5555)

4.  **Stop the Lab:**
    ```bash
    docker-compose down
    # To reset data completely: docker-compose down -v
    ```

---

## 🧪 The Lab: How to Test

### 🔴 The Vulnerable App (Port 3000)

**1. Auth Bypass (Login)**
- **Goal**: Log in as `admin` without a password.
- **Payload** (Username): `admin'--`
- **Password**: *Any text*
- **Result**: Immediate access. The query becomes `SELECT * FROM users WHERE username = 'admin'--' AND ...`

**2. Data Exfiltration (Search)**
- **Goal**: Steal sensitive notes from other users.
- **Payload**: `' UNION SELECT id, username, password, sensitive_note FROM users--`
- **Result**: The user table is dumped into the search results.

**3. Privileged Registration**
- **Goal**: Inject malicious data.
- **Payload** (Sensitive Note): `My note'); DROP TABLE logs;--`
- **Result**: Executes arbitrary SQL commands due to lack of sanitization.

### 🟢 The Secure App (Port 3001)

**1. Attempt the Same Attacks**
- Try the `admin'--` login.
- **Result**: `{"error": "System Error: Invalid input detected."}` or simply `Invalid credentials`.
- **Why**: The Input Validation Middleware detects the quote `'` and comment `--`, blocking the request before it hits the database. Even if it passed, Parameterized Queries would treat it as a literal string.

**2. Verify Password Security**
- Register a user in **s-app**. Check [Prisma Studio](http://localhost:5555).
- **Result**: Password is saved as a bcrypt hash (e.g., `$2b$10$...`), unlike the plain text in v-app.

**3. Least Privilege Defense**
- Even if an injection was possible in a SELECT query, the `app_readonly` database role prevents modification (INSERT/UPDATE/DELETE) of data.

---

## 🏗 Architecture & Tech Stack

### Project Structure
```
code-injection-defense/
├── 📂 v-app/          # The Prey (Vulnerable React/Express App)
├── 📂 s-app/          # The Shield (Secure React/Express App)
├── 📂 database/       # Init scripts & Role definitions
└── 🐳 docker-compose.yml
```

### Technologies
- **Frontend**: React 18, Vite, Tailwind CSS (via Lucide/Clsx).
- **Backend**: Express.js (REST API).
- **Database**: PostgreSQL 15.
- **Security**: Helmet, Rate-Limit, Bcrypt, Crypto.

---

## 🔧 Troubleshooting

- **Port Conflicts**: If ports 3000/3001 are taken, edit `docker-compose.yml` (e.g., change `"3000:3000"` to `"4000:3000"`).
- **Database Errors**: If the DB fails to start, ensure no local Postgres instance is running on port 5432, or use `docker-compose down -v` to reset the volume.
- **Hot Reload**: Both apps support hot-reloading for React changes.

---

## ⚠️ Disclaimer

**EDUCATIONAL PURPOSE ONLY.**
This application contains intentionally vulnerable code (`v-app`). **DO NOT** deploy the vulnerable application to a production environment or an internet-accessible server. The author is not responsible for any misuse of this code.
