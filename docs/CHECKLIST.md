# Week 8: Injection Attacks and Defenses Checklist

Based on the PPTX "Week 8: Injection Attacks and Defenses" by PhD. Ngoc-Tu Nguyen.

## 1. Core Injection Vulnerabilities to Demo
Implement these in the **`v-app`** (Vulnerable Application):

### A. SQL Injection (SQLi)
- [ ] **Bypass Login:** Using `' OR '1'='1` (Slide 7-8).
- [ ] **Union-Based SQLi:** Extracting data from other tables (Slide 13).
- [ ] **Blind SQLi:** Boolean-based or Time-based inference (Slide 16-17).

### B. Command Injection
- [ ] **Arbitrary Command Execution:** Using operators like `;`, `&`, `|` in input fields that execute system commands (e.g., a ping tool) (Slide 18-28).

### C. File Inclusion
- [ ] **Local File Inclusion (LFI):** Accessing sensitive system files like `/etc/passwd` or `.env` via directory traversal `../../` (Slide 44-53).
- [ ] **Remote File Inclusion (RFI):** Loading scripts from external URLs (Slide 54-56).

### D. Cross-Site Scripting (XSS)
- [ ] **Reflected XSS:** Payload in URL parameters echoed back to user (Slide 29-37).
- [ ] **Stored XSS:** Malicious script saved in database and served to other users (Slide 38-39).

---

## 2. Defensive Mechanisms to Implement
Implement these in the **`s-app`** (Secure Application):

### A. Input/Output Security
- [ ] **Parameterized Queries:** Use prepared statements for ALL database interactions (Slide 142, 253).
- [ ] **Input Whitelisting:** Validate all input against strict regular expressions (Slide 144-147).
- [ ] **Output Encoding:** Encode untrusted data before rendering in HTML to prevent XSS (Slide 244-251).
- [ ] **Secure Command Execution:** Use `execFile` instead of `exec` and validate all arguments (Slide 148).

### B. AAA Model & Authentication (Slide 184-236)
- [ ] **Authentication:** Secure login with password hashing (Bcrypt).
- [ ] **Authorization (RBAC):** Implement Role-Based Access Control (Admin vs. User).
- [ ] **Accounting (Logging):** Log all security-relevant events and suspicious activities.

### C. Web Security Headers
- [ ] **Content Security Policy (CSP):** Restrict sources for scripts and styles (Slide 293-308).
- [ ] **Anti-Brute Force:** Implement rate limiting on login endpoints.

---

## 3. Incident Response & Monitoring (Slide 350-400)
- [ ] **Security Dashboard:** A central view for admins to monitor system health and logs.
- [ ] **Detection Mechanisms:** Logic to identify and block repeated injection attempts.
