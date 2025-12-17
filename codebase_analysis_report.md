# Vulnerability Analysis and Defense Mechanisms in Web Application Architectures: A Comparative Study of SQL Injection

**Abstract**

This technical report presents a comparative analysis of secure versus insecure web application architectures, specifically focusing on SQL Injection (SQLi) vulnerabilities. By developing and analyzing two parallel implementations—a Vulnerable Application (`v-app`) and a Secure Application (`s-app`)—this study demonstrates the critical impact of input sanitization, parameterized queries, and the principle of least privilege. The findings validate that architectural decisions made during the design phase are more effective in mitigating security risks than ad-hoc patches applied post-deployment.

---

## 1. Introduction

### 1.1 Problem Statement
SQL Injection remains one of the most prevalent and critical web application vulnerabilities, consistently ranked in the OWASP Top 10. It occurs when untrusted user input is directly concatenated into dynamic SQL queries, allowing attackers to manipulate the database structure, exfiltrate sensitive data, or bypass authentication mechanisms.

### 1.2 Research Objectives
This study aims to:
1.  **Analyze** the mechanics of SQL Injection in a controlled environment.
2.  **Evaluate** the effectiveness of defense-in-depth strategies, including Prepared Statements, Input Validation, and Database Permission restriction.
3.  **Provide** a reproducible implementation framework for educational and testing purposes.

---

## 2. Methodology and Implementation Framework

The research adopts a comparative experimental approach, utilizing a Monorepo architecture to maintain two distinct but functionally identical applications.

### 2.1 System Architecture
The system is containerized using Docker to ensure environment consistency. The architecture follows a typical three-tier web model:
*   **Presentation Layer**: React (Vite) with Tailwind CSS.
*   **Logic Layer**: Node.js with Express.js.
*   **Data Layer**: PostgreSQL Database.

### 2.2 Deployment Scenario
The deployment is orchestrated via `docker-compose`, isolating services while sharing a common network for communication.
*   **Container A (`v-app`)**: Represents a legacy or poorly connected system running on port 3000.
*   **Container B (`s-app`)**: Represents a modernized, hardened system running on port 3001.
*   **Container C (`db`)**: Shared PostgreSQL instance, demonstrating how different connection roles affect security scope.

---

## 3. Technical Analysis

### 3.1 Vulnerable Implementation (`v-app`)
The `v-app` serves as the control group, representing a system lacking security controls.

#### 3.1.1 Vulnerability Mechanism: String Concatenation
The core flaw lies in the authentication module (`server.js`). The application constructs SQL queries using direct string interpolation:

```javascript
// Critical Flaw: Direct Injection Scenario
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

This implementation allows "Tautology Attacks." An input of `admin' OR '1'='1` alters the boolean logic of the query to always evaluate to TRUE, ignoring the password check.

#### 3.1.2 Privilege Escalation Risk
The application connects to the database using the `postgres` superuser role. This violation of the Principle of Least Privilege means a successful injection could theoretically execute administrative commands (e.g., `DROP TABLE`, `COPY TO PROGRAM`), leading to total system compromise.

### 3.2 Secure Implementation (`s-app`)
The `s-app` represents the experimental group, implementing a defense-in-depth security model.

#### 3.2.1 Mitigation: Parameterized Queries
The primary defense mechanism is the use of Prepared Statements via the `pg` driver.

```javascript
// Remediation: Separation of Code and Data
const query = `INSERT INTO users (...) VALUES ($1, $2, $3, $4)`;
await fullPool.query(query, [username, hashedPassword, ...]);
```

**Technical Explanation**: The database engine parses, compiles, and optimizes the query plan *before* the data is bound. The input is treated strictly as a data literal, never as executable code, rendering standard SQLi payloads inert.

#### 3.2.2 Architectural Mitigation: Least Privilege
Two distinct database roles are defined in `init.sql`:
1.  **`app_readonly`**: Granted `SELECT` permissions only. Used for high-risk read operations (Search, Login).
2.  **`app_full`**: Granted `INSERT/UPDATE` permissions. Used strictly for Registration.

This compartmentalization ensures that even if an injection vector were found in the Search module, the attacker could not modify data.

#### 3.2.3 Cryptographic Standards
Passwords are protected using `bcrypt` (Salt Rounds = 10), replacing the plaintext storage found in `v-app`. This mitigation protects user credentials in the event of a database dump.

---

## 4. Evaluation and Discussion

### 4.1 Comparative Evaluation

| Metric | Vulnerable Architecture (`v-app`) | Secure Architecture (`s-app`) | Technical Delta |
| :--- | :--- | :--- | :--- |
| **Input Handling** | Dynamic SQL Construction | Static Prepared Statements | Compilation Phase Isolation |
| **Authentication Bypass** | Trivial (`' OR '1'='1`) | Mitigated | Logic/Data Separation |
| **Data Confidentiality** | Plaintext | Hashed (Bcrypt) | Cryptographic Transformation |
| **Database Access** | Unrestricted (Superuser) | Role-Based (RBAC) | Attack Surface Reduction |

### 4.2 Scalability and Limitations
*   **Scalability**: The `s-app` architecture is designed to scale. The use of connection pooling (`pg.Pool`) and stateless JWT-like sessions (or secure cookies) allows for horizontal scaling behind a load balancer. The separation of Read/Write roles (`app_readonly` vs `app_full`) facilitates future migration to a primary-replica database architecture.
*   **Container Security**: Both implementations currently execute as the root user within the Docker container. A production-ready enhancement for `s-app` would involve defining a non-privileged user (USER node) in the Dockerfile to mitigate container breakout risks.
*   **Limitations**: This is a Proof of Concept (PoC) environment. It lacks advanced features such as Web Application Firewall (WAF) integration, Multi-Factor Authentication (MFA), and comprehensive intrusion detection systems (IDS) that would be required in a customized enterprise deployment.

---

## 5. Conclusion

The comparative analysis confirms that reliance on input sanitization alone is insufficient for preventing SQL Injection. The only robust defense is architectural: the strict separation of control plane (SQL commands) and data plane (User Input) via Parameterized Queries. Furthermore, implementing the Principle of Least Privilege at the database layer provides a critical safety net, limiting the "Blast Radius" of a successful compromise.

This study validates that secure coding practices, when integrated into the initial system design, significantly reduce the attack surface without compromising system performance or usability.
