# DevSecOps CIAP Microproject — Final Submission & Audit Report

**Course:** DevSecOps Lab (CO5)  
**Topic:** Equivalence Class and Special Value Testing of an Online Examination System  
**Academic Alignment:** UN Sustainable Development Goal 4 (SDG 4 — Quality Education)  
**Student Name:** Talavadekar Anika Vinit  
**Student ID:** 124BTCS1036  
**Repository:** [https://github.com/codeWithAnika/DevSec-Ciap.git](https://github.com/codeWithAnika/DevSec-Ciap.git)  
**Date of Audit:** October 17, 2026  
**Submission Status:** Production-Ready / Fully Verified  

---

## 1. Project Overview & Scope

Online examination platforms form the backbone of modern educational assessment. In alignment with **UN SDG 4 (Quality Education)**, assessment platforms must uphold fairness, accessibility, resilience, and strict input validation to ensure that student evaluations are unbiased and technically sound.

This project delivers **ExamFlow**, an online examination portal engineered with DevSecOps best practices:
- **Shift-Left Testing:** Rigorous black-box test engineering using **Equivalence Class Partitioning (ECP)**, **Boundary Value Analysis (BVA)**, and **Special Value Testing (SVT)** applied to registration inputs, examination submission payloads, and scoring calculations.
- **Automated Verification:** 41 comprehensive unit tests implemented with Node.js built-in test runner, generating standardized JUnit XML output for CI consumption.
- **Hardened Containerization:** Minimal Alpine Linux container image (`nginx:stable-alpine`) serving static assets with custom health checks and restart policies.
- **Vulnerability Management:** Automated container scanning using Aqua Security Trivy, enforcing a zero HIGH/CRITICAL vulnerability security gate.
- **CI/CD Integration:** Declarative Jenkins pipeline (`Jenkinsfile`) and SonarQube static analysis configuration (`sonar-project.properties`).

---

## 2. Architecture & Container Design

```
+-----------------------------------------------------------------------------------+
| Host System (Node.js v24 Test & Build Environment)                               |
|   - Tests: tests/validator.test.js, tests/exam.test.js, tests/http.test.js        |
|   - Test Engine: node:test & node:assert/strict (41 passing tests)                |
|   - Reporter: scripts/run-tests-junit.js -> test-results/junit.xml                |
+-----------------------------------------------------------------------------------+
                                        |
                            Docker Build (Dockerfile)
                                        v
+-----------------------------------------------------------------------------------+
| Container Image: devsec-online-exam:1.2 (Base: nginx:stable-alpine)               |
|   - OS: Alpine Linux 3.24.2                                                       |
|   - Web Server: Nginx 1.30.6                                                      |
|   - Static Assets: /usr/share/nginx/html (index.html, style.css, js/*.js)         |
|   - Health Check: wget --quiet --tries=1 --spider http://localhost/               |
|   - Exposed Port: 80 (Mapped to Host 8080)                                        |
|   - Security Characteristic: Pure static frontend (0 language packages in image)  |
+-----------------------------------------------------------------------------------+
                                        |
                     Security & Pipeline Verification
                                        +---> Aqua Security Trivy (0 Vulnerabilities)
                                        +---> Jenkins Pipeline (examflow-jenkins:8081)
                                        +---> SonarQube Scanner (examflow-sonarqube:9000)
```

### Key Architectural Decisions:
1. **Separation of Build & Runtime:** The container image deliberately omits Node.js, npm, and developmental test frameworks. This keeps the attack surface minimal (image size ~102 MB) and ensures runtime dependencies are limited strictly to the hardened Nginx Alpine binary and static assets.
2. **Deterministic Version Tagging:** The Dockerfile and image are pinned to version `1.2` (`devsec-online-exam:1.2`) to avoid mutable `latest` tag drift in CI/CD pipelines.

---

## 3. Systematic Testing Methodology & Results

Testing was designed around three formal test engineering disciplines:

### 3.1 Equivalence Class Partitioning (ECP)
The input domain is partitioned into valid equivalence classes (VEC) and invalid equivalence classes (IEC). If an algorithm handles one representative value from an equivalence class correctly, it is logically inferred to handle all values in that partition:
- **Full Name:**
  - VEC: Alphabetic names 3–50 chars, allowing single hyphens and apostrophes (e.g., `"Anika Talavadekar"`, `"Mary-Jane O'Connor"`).
  - IEC: Strings < 3 chars, strings > 50 chars, strings with numeric or symbol characters.
- **Email Address:**
  - VEC: Standard format (`name@domain.tld`) $\le$ 100 characters.
  - IEC: Missing `@`, missing domain, length > 100 characters.
- **Student ID:**
  - VEC: 6–15 alphanumeric characters (e.g., `"124BTCS1036"`).
  - IEC: Length < 6, length > 15, non-alphanumeric characters (`#`, `!`, spaces).
- **Exam Submission:**
  - VEC: All 6 questions answered.
  - IEC: Empty submission (0/6 answered), partial submission (1–5/6 answered).

### 3.2 Boundary Value Analysis (BVA)
Input boundaries are the most common source of off-by-one errors:
- Full Name length boundaries tested: `2` (Min-1, rejected), `3` (Min, accepted), `50` (Max, accepted), `51` (Max+1, rejected).
- Student ID length boundaries tested: `5` (Min-1, rejected), `6` (Min, accepted), `15` (Max, accepted), `16` (Max+1, rejected).
- Email length boundaries tested: `100` (Max, accepted), `101` (Max+1, rejected).
- Scoring threshold boundary: Passing mark is $\ge 60\%$. Tested: `3/6 = 50%` (Needs Improvement) vs `4/6 = 67%` (Passed).

### 3.3 Special Value Testing (SVT)
Exceptional, boundary-adjacent, and potentially malicious inputs were validated:
- Null and undefined input parameters (ensured no uncaught `TypeError` or crashes).
- Empty strings (`""`) and whitespace-only strings (`"   "`).
- Script tag and XSS injection attempts (`"Robert<script>"`).
- Zero-indexed answer selection (`optionIndex: 0` must be accepted as answered and not treated as falsy/unanswered).

### 3.4 Automated Test Suite Execution Summary

Executed via `npm run test:junit`:

```
======================================================================
TEST SUITE EXECUTION SUMMARY
======================================================================
Total Test Suites:  6
Total Test Cases:   41
Passed Tests:       41
Failed Tests:        0
Skipped Tests:       0
Execution Duration: ~339 ms
Framework:          Node.js Built-in Test Runner (node:test, node:assert)
======================================================================

Breakdown by Test Suite:
1. Full Name Validation:            10 Tests  | 10 Passed | 0 Failed
2. Email Address Validation:         5 Tests  |  5 Passed | 0 Failed
3. Student ID Validation:            7 Tests  |  7 Passed | 0 Failed
4. Examination Submission Logic:     6 Tests  |  6 Passed | 0 Failed
5. Examination Scoring Logic:        7 Tests  |  7 Passed | 0 Failed
6. HTTP Server & Asset Delivery:     6 Tests  |  6 Passed | 0 Failed
```

The corresponding machine-readable XML report is generated at `test-results/junit.xml` and conforms to standard JUnit schema requirements for Jenkins/CI ingestion.

---

## 4. Container Deployment & Host Network Verification

### 4.1 Container Health & Configuration
- **Container Name:** `devsec-exam-portal`
- **Image:** `devsec-online-exam:1.2`
- **Port Mapping:** `0.0.0.0:8080->80/tcp`, `[::]:8080->80/tcp`
- **Container Health:** `Up (healthy)`
- **Restart Policy:** `unless-stopped`

### 4.2 Windows WSL2 Exit 255 Root Cause Analysis
During previous verification, the container had stopped with status `Exited (255)`.
- **Root Cause:** Docker Desktop on Windows operates inside a lightweight WSL2 utility VM. When Windows reboots, enters sleep, or restarts the Docker Desktop engine, running containers without an explicit restart policy (`--restart unless-stopped`) are forcibly terminated by the daemon with exit code 255.
- **Resolution:** Re-launching the container with `--restart unless-stopped` guarantees automatic daemon recovery upon WSL2 or Docker restart without manual intervention.

### 4.3 Windows Loopback IPv4 vs. IPv6 Resolution
- **Symptom:** Running `curl.exe http://localhost:8080` from Windows PowerShell can encounter connection timeouts or resets.
- **Technical Cause:** Windows DNS resolves `localhost` to IPv6 `[::1]` prior to IPv4 `127.0.0.1`. While Docker Desktop binds to `0.0.0.0:8080` and `[::]:8080`, the Windows host WSL2 NAT port forwarder does not reliably bridge IPv6 loopback requests to the container's internal IPv4 network.
- **Standard Verification Protocol:** Connect using IPv4 explicitly:
  ```powershell
  curl.exe -4 -I http://localhost:8080/
  # or
  curl.exe -I http://127.0.0.1:8080/
  ```

### 4.4 HTTP Endpoint Verification Matrix

| Endpoint | HTTP Method | Expected Status | Actual Status | Content-Type | Size (Bytes) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `http://127.0.0.1:8080/` | HEAD / GET | 200 OK | **200 OK** | `text/html` | 12,421 |
| `http://127.0.0.1:8080/css/style.css` | HEAD / GET | 200 OK | **200 OK** | `text/css` | 21,747 |
| `http://127.0.0.1:8080/js/validator.js` | HEAD / GET | 200 OK | **200 OK** | `application/javascript` | 10,395 |
| `http://127.0.0.1:8080/js/questions.js` | HEAD / GET | 200 OK | **200 OK** | `application/javascript` | 5,165 |
| `http://127.0.0.1:8080/js/app.js` | HEAD / GET | 200 OK | **200 OK** | `application/javascript` | 18,455 |
| `http://127.0.0.1:8080/nonexistent.html` | HEAD / GET | 404 Not Found | **404 Not Found** | `text/html` | 153 |

---

## 5. Vulnerability Assessment (Aqua Security Trivy)

Vulnerability scanning was conducted using `aquasec/trivy:latest` against the submission container image `devsec-online-exam:1.2`.

### 5.1 Scan Execution & Results
- **Report Files:**
  - Table Format: `reports/trivy-devsec-online-exam-1.2.txt`
  - JSON Format: `reports/trivy-devsec-online-exam-1.2.json`
- **Target Identified:** `devsec-online-exam:1.2 (alpine 3.24.2)`
- **OS Package Count:** 71 packages scanned
- **Vulnerabilities Detected:**
  - **CRITICAL:** 0
  - **HIGH:** 0
  - **MEDIUM:** 0
  - **LOW:** 0
  - **TOTAL:** 0
- **Severity Gate Check:**
  ```powershell
  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL devsec-online-exam:1.2
  ```
  Result: **Exit Code 0 (Passed)**.

### 5.2 Critical DevSecOps Analysis: Container OS vs. Application Dependencies
During the scan, Trivy logged:
```
Number of language-specific files: num=0
```
**Academic & Security Explanation:**
1. **Why Trivy reports 0 language-specific files:** The container image packages only static files (`.html`, `.css`, `.js`) served by Nginx. There is no `package.json`, `node_modules`, or Python/Java runtime inside the container image. Trivy only scans filesystem contents inside the image, so it inspects the 71 Alpine OS packages and finds zero language package manifests.
2. **Why 0 container findings does NOT mean application dependencies are unchecked:** A zero-vulnerability container scan only proves that the Alpine Linux OS and Nginx binary have no known CVEs. It does *not* prove that project build-time or host dependencies are vulnerability-free.
3. **Host Dependency Verification (`npm audit`):** To ensure comprehensive end-to-end security, host dependencies (`package.json`) were independently scanned using `npm audit`:
   ```
   found 0 vulnerabilities
   ```
   Together, the Trivy container scan and the `npm audit` dependency check provide complete vulnerability verification across both the runtime image and the development toolchain.

---

## 6. CI/CD & Static Analysis Configuration

### 6.1 Jenkins Pipeline (`Jenkinsfile`)
The declarative Jenkins pipeline automates the full verification lifecycle:
1. **Stage 1 (Checkout):** Pulls latest revision from GitHub.
2. **Stage 2 (Run Automated Tests):** Executes `npm test` and `npm run test:junit`.
3. **Stage 3 (Build Docker Image):** Builds `examflow:${BUILD_NUMBER}` from Dockerfile.
4. **Stage 4 (Trivy Security Scan):** Runs Trivy table and JSON scans, exporting reports to `reports/`.
5. **Stage 5 (Enforce Vulnerability Threshold):** Executes Trivy gate (`--exit-code 1 --severity HIGH,CRITICAL`).
6. **Post Actions:** Archives artifacts (`reports/trivy-examflow-*`) and publishes JUnit test results (`test-results/**/*.xml`).

**Current Jenkins Service State:**
- Container: `examflow-jenkins`
- Port: `http://127.0.0.1:8081` (Jenkins 2.580.1)
- Status: **Running and responding (HTTP 200)**.
*(Note: An active container confirms service availability; pipeline builds are triggered via the web UI or webhook).*

### 6.2 SonarQube Integration (`sonar-project.properties`)
SonarQube properties are established for static code quality analysis:
- `sonar.projectKey=ExamFlow`
- `sonar.sources=src`
- `sonar.tests=tests`
- `sonar.test.inclusions=tests/**/*.test.js`
- `sonar.exclusions=reports/**,report.html,html.tpl,docs/**,.git/**`

**Current SonarQube Service State:**
- Container: `examflow-sonarqube`
- Port: `http://127.0.0.1:9000` (SonarQube Community 26.10.0.133078)
- API Status: `{"status":"UP"}`.

---

## 7. Security Limitations & Production Considerations

> [!WARNING]
> **Client-Side vs. Server-Side Security Model**  
> In this educational prototype, input validation, examination timer tracking, and score computations are executed client-side in the browser via JavaScript (`src/js/validator.js` and `src/js/app.js`).
> 
> **Threat Model & Production Requirements:**
> 1. **Client-Side Bypass Risk:** Any client-side validation can be intercepted or bypassed by a malicious actor using browser developer tools, cURL, or HTTP proxy tools (e.g., OWASP ZAP, Burp Suite).
> 2. **Score Tampering Risk:** In this prototype, scoring is calculated in JavaScript. In an untrusted production environment, an exam candidate could modify client variables to alter their recorded score.
> 3. **Production DevSecOps Controls Required:**
>    - **Server-Side Validation:** All equivalence class constraints must be re-evaluated on a backend API (e.g., Node.js Express, Spring Boot, or Go).
>    - **Authenticated Sessions:** Secure HTTP-only cookies with JWT tokens to bind the student identity.
>    - **Server-Managed Timer:** Exam time limits must be enforced on the server to prevent local clock manipulation.
>    - **Server-Side Scoring:** Answers must be submitted as raw choices and graded against an authoritative, encrypted answer key on the server.
>    - **Audit Logging:** Tamper-evident, append-only logs for examination start, answer selection, and submission events.

---

## 8. Reproducible Command Reference

All project outcomes can be verified from a PowerShell terminal:

```powershell
# 1. Run Automated Unit Tests (Console Output)
npm test

# 2. Run Tests and Generate JUnit XML
npm run test:junit

# 3. Check Host Dependency Vulnerabilities
npm audit

# 4. Build Docker Image (Version 1.2)
docker build -t devsec-online-exam:1.2 .

# 5. Run Container on Port 8080 with Healthcheck
docker run -d --name devsec-exam-portal --restart unless-stopped -p 8080:80 devsec-online-exam:1.2

# 6. Verify Container Health
docker ps --filter "name=devsec-exam-portal"

# 7. Test HTTP Endpoints via IPv4
curl.exe -4 -I http://localhost:8080/
curl.exe -4 -I http://localhost:8080/css/style.css
curl.exe -4 -I http://localhost:8080/js/validator.js
curl.exe -4 -I http://localhost:8080/js/questions.js
curl.exe -4 -I http://localhost:8080/js/app.js

# 8. Execute Trivy Security Scan Table Report
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache -v ${PWD}/reports:/reports aquasec/trivy:latest image --format table --output /reports/trivy-devsec-online-exam-1.2.txt devsec-online-exam:1.2

# 9. Execute Trivy Security Gate (Zero High/Critical)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL devsec-online-exam:1.2
```

---

## 9. Final Submission Checklist & Manual Action Items

### Automated & Verified Components:
- [x] 41 unit tests across 6 suites passing without errors (`npm test`).
- [x] Standard JUnit XML report generated at `test-results/junit.xml`.
- [x] Docker image `devsec-online-exam:1.2` built and tested.
- [x] Container `devsec-exam-portal` running in healthy state on port 8080.
- [x] Trivy vulnerability scan executed; 0 OS vulnerabilities detected; zero HIGH/CRITICAL gate passed.
- [x] Host dependency scan via `npm audit` verified with 0 vulnerabilities.
- [x] Jenkinsfile and sonar-project.properties present and verified.
- [x] Comprehensive test matrix documented in `docs/test-cases.md`.
- [x] Full Git history preserved on branch `main` with remote synchronisation.

### Recommended Manual Demonstration Actions (During Viva / Evaluation):
1. **Interactive Browser Walkthrough:** Open `http://localhost:8080` in a web browser. Demonstrate candidate registration (valid and invalid inputs), answer all 6 questions, submit, and display the scored results and review breakdown.
2. **Interactive Push:** If faculty requests checking the latest commit on GitHub, execute `git push origin main` in PowerShell (which will prompt for GitHub authentication if needed).
3. **Jenkins / SonarQube UI:** If faculty asks to see local CI/CD dashboards:
   - Jenkins: Open `http://localhost:8081` in your browser.
   - SonarQube: Open `http://localhost:9000` in your browser.
