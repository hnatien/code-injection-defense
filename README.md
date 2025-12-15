# 🛡️ SQL Injection Defense Lab

A comparative Proof of Concept (PoC) demonstrating SQL Injection vulnerabilities alongside Defense-in-Depth strategies.

## 🚀 Quick Start

```bash
# Clone and run
git clone https://github.com/hnatien/code-injection-defense.git
cd code-injection-defense
docker-compose up --build
```

## 🏗 Architecture

| Service | Port | Description |
| :--- | :--- | :--- |
| **🔴 Vulnerable App** | `3000` | Unsafe string concatenation, root DB access, plain-text passwords. |
| **🟢 Secure App** | `3001` | Parameterized queries, least privilege (PoLP), Bcrypt, Input Validation. |
| **🗄️ Database** | `5555` | Prisma Studio (PostgreSQL viewer). |

## ⚔️ Attack & Defense Specs

| Vector | 🔴 Vulnerable Implementation | 🟢 Secure Implementation |
| :--- | :--- | :--- |
| **SQL Injection** | Direct String Concatenation | **Parameterized Queries (`pg`)** |
| **Wildcard DoS** | Vulnerable to `LIKE '%%'` dump | **Wildcard Escaping & `LIMIT`** |
| **DB Privilege** | `postgres` (Superuser) | **`app_readonly` (SELECT only)** |
| **Auth** | Plain Text Passwords | **Bcrypt Hashing** |
| **Input Sanitization** | None | **Allowlist Validation (Regex)** |

## ⚠️ Disclaimer
**Educational purpose only.** DO NOT deploy `v-app` to production.
