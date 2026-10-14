# DevSecOps CIAP Microproject: Online Examination System

[![Course](https://img.shields.io/badge/Course-DevSecOps%20Lab-blue.svg)](#)
[![Outcome](https://img.shields.io/badge/CO-CO5-green.svg)](#)
[![SDG](https://img.shields.io/badge/SDG%204-Quality%20Education-orange.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-31%20Passed-brightgreen.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-nginx%3A1.27.4--alpine-informational.svg)](#)

**Student Name:** Talavadekar Anika Vinit  
**Student ID:** 124BTCS1036  
**Course:** DevSecOps Lab (CO5)  
**Microproject Topic:** Equivalence Class and Special Value Testing of an Online Examination System  
**Global Alignment:** UN Sustainable Development Goal 4 (SDG 4: Quality Education)  

---

## 1. Problem Statement

Digital examination and assessment systems in educational institutions require high availability, robust input validation, and rigorous software verification. Unhandled edge-case inputs, malformed submissions, or client-side calculation errors compromise academic fairness and disrupt educational access. 

This microproject develops a resilient, accessible Online Examination System prototype and applies **Equivalence Class Partitioning (ECP)**, **Boundary Value Analysis (BVA)**, and **Special Value Testing (SVT)** to guarantee input sanitization and accurate grading before containerization and deployment.

---

## 2. Objectives and Scope

### Objectives
1. **Quality Assurance & Verification:** Formally partition input parameters into equivalence classes and test boundary conditions to eliminate input-handling defects.
2. **Accessible User Interface:** Provide an accessible, mobile-responsive assessment platform adhering to WCAG focus, ARIA live regions, and semantic HTML guidelines.
3. **Containerization & DevSecOps Readiness:** Package the verified static web application into a minimal, secure Docker container using official Nginx Alpine images.
4. **Alignment with SDG 4:** Guarantee fair, equitable, and transparent assessment scoring with comprehensive rationale and answer reviews.

### Scope
- **In-Scope (Current Phase):**
  - Interactive multi-step examination workflow (Student Registration $\rightarrow$ Exam Interface $\rightarrow$ Automated Scoring & Detailed Review $\rightarrow$ Retake/New Candidate Lifecycle).
  - Client-side validation enforcing equivalence class bounds on Full Name, Email, and Student ID.
  - Multi-choice question bank (6 questions) covering DevSecOps, testing concepts, and SDG 4 principles.
  - Automated unit test suite (31 tests) executed with Node.js built-in test runner.
  - Pinned Nginx Alpine Dockerfile and configuration.
  - Repository configuration (`.gitignore`, `.dockerignore`, `README.md`, `docs/test-cases.md`).
- **Out-of-Scope (Deferred to Future Stages):**
  - Server-side database integration (PostgreSQL / MongoDB).
  - Production OAuth2/JWT session management and biometric proctoring.
  - CI/CD pipelines (Jenkins / GitHub Actions), automated Trivy vulnerability scanning, and cloud hosting.

---

## 3. Key Features

- **Candidate Registration:** Validation of Full Name (3–50 chars, alphabetic), Institutional Email (RFC 5322 format, $\le 100$ chars), and Student ID (6–15 alphanumeric chars).
- **Interactive Examination Interface:** Clear question numbering, accessible radio selection cards, live progress tracker, and unanswered-question alerts.
- **Automated Instant Evaluation:** Computes percentage score against a 60% passing benchmark.
- **Educational Review & Explanations:** Color-coded itemized breakdown showing user answer vs. correct answer with detailed explanations.
- **Candidate Lifecycle Management:** Ability to retake the test with preserved credentials or register a new candidate.
- **Accessibility & Responsive Design:** High-contrast focus outlines (`:focus-visible`), ARIA landmarks, mobile-first responsive layout (works across mobile, tablet, and desktop).

---

## 4. Technology Stack

- **Frontend:** Semantic HTML5, Modern CSS3 (CSS Grid, Flexbox, Custom Properties), Vanilla JavaScript (ES6+).
- **Web Server:** Nginx 1.27.4 Alpine (`nginx:1.27.4-alpine`).
- **Testing Engine:** Node.js v24 Built-in Test Runner (`node:test`, `node:assert/strict`).
- **Version Control:** Git & GitHub (`main` branch).
- **Containerization:** Docker Engine / Docker Desktop.

---

## 5. Local Execution Instructions (Without Docker)

Because the project is built with standard vanilla web standards, it can be tested directly without external dependencies:

### Prerequisites
- Node.js (v18+ recommended; project verified on v24.16.0) or any static HTTP file server.

### Running Automated Tests
```powershell
# Run the complete test suite (31 tests)
node --test tests/validator.test.js tests/exam.test.js

# Or using npm
npm test
```

### Serving the Website Locally
You can open `src/index.html` directly in any modern browser, or launch a local HTTP server:
```powershell
# Using Node.js built-in server or npx http-server
npx http-server src -p 8080
```
Then navigate to: `http://localhost:8080`

---

## 6. Docker Build & Run Instructions

The application is containerized using an Alpine-based Nginx image.

### 1. Build the Docker Image
```powershell
docker build -t devsec-online-exam:1.0 .
```

### 2. Run the Container
```powershell
docker run -d --name devsec-exam-portal -p 8080:80 devsec-online-exam:1.0
```

### 3. Verify Container Status
```powershell
docker ps --filter "name=devsec-exam-portal"
```

### 4. Access the Running Application
Open your browser and visit:  
**`http://localhost:8080`**

### 5. Inspect Container Logs & Health
```powershell
# View logs
docker logs devsec-exam-portal

# Stop and remove container when finished
docker stop devsec-exam-portal
docker rm devsec-exam-portal
```

---

## 7. Testing Approach & Equivalence Class Matrix

The testing strategy is documented in full detail in [`docs/test-cases.md`](docs/test-cases.md).

### Summary of Tested Partitions:
1. **Full Name:**
   - Valid: 3–50 chars, alphabetic with allowed hyphens/spaces.
   - Boundaries tested: 2 (fail), 3 (pass), 50 (pass), 51 (fail).
   - Special values: empty string `""`, whitespace `"   "`, null/undefined, script injection `"Robert<script>"`.
2. **Email Address:**
   - Valid: `anika.talavadekar24@sakec.ac.in`.
   - Boundaries: 100 chars (pass), 101 chars (fail).
   - Special values: missing `@`, missing domain, whitespace.
3. **Student ID:**
   - Valid: `124BTCS1036`.
   - Boundaries: 5 chars (fail), 6 chars (pass), 15 chars (pass), 16 chars (fail).
   - Special values: special characters (`#`, `!`), embedded whitespace.
4. **Exam Submission:**
   - Empty submission (0/6 answered) $\rightarrow$ rejected, alerts all 6 missing.
   - Partial submission (3/6 answered) $\rightarrow$ rejected, alerts missing [4, 5, 6].
   - Complete submission (6/6 answered) $\rightarrow$ accepted, graded immediately.
5. **Scoring:**
   - All correct: 100% (Passed).
   - All wrong: 0% (Needs Improvement).
   - Threshold testing: 4/6 = 67% (Passed) vs. 3/6 = 50% (Needs Improvement).

**All 31 automated tests pass successfully.**

---

## 8. Security Notice & Project Limitations

> [!WARNING]
> **Client-Side Validation Disclaimer:**  
> This application is an educational prototype. Input validation and scoring are executed on the client side in JavaScript (`src/js/validator.js`). In a production examination system:
> - Client-side validation can be bypassed using browser dev tools, script disabling, or HTTP API proxies.
> - Production deployment requires **server-side validation**, cryptographic exam session tokens, rate limiting, and encrypted server-side score persistence.

---

## 9. Current Implementation Status

| Component | Status | Verification Evidence |
| :--- | :--- | :--- |
| **Static Web Application** | Verified | Complete HTML5, CSS3, Vanilla JS application in `src/` |
| **Input Validation & Scoring Engine** | Verified | Universal validator module in `src/js/validator.js` |
| **Question Bank & Explanations** | Verified | 6 DevSecOps and SDG 4 questions in `src/js/questions.js` |
| **Automated Test Suite** | Verified | 31/31 unit tests passing (`tests/validator.test.js`, `tests/exam.test.js`) |
| **Testing Documentation** | Verified | Full 31-case test matrix in `docs/test-cases.md` |
| **Docker Configuration** | Ready | Pinned Alpine Dockerfile and `.dockerignore` created |
| **Docker Desktop Engine Execution** | Pending | Requires Docker Desktop to be installed on host |
| **Local Git Repository** | Initialized | Git initialized, verified `.gitignore`, committed to `main` |
| **GitHub Remote Push** | Pending URL | Ready to push as soon as user provides repository URL |

---

## 10. Future DevSecOps Roadmap

1. **Phase 2 (CI/CD Pipeline):** Integrate GitHub Actions workflow to run automated unit tests on every pull request.
2. **Phase 3 (Static Security Analysis):** Add SonarQube / ESLint security rules to catch code smells and vulnerabilities.
3. **Phase 4 (Container Vulnerability Scanning):** Implement Trivy container scans in the build pipeline to check base images.
4. **Phase 5 (Backend API & Database):** Introduce a secure Node.js/Go backend to process exam submissions server-side with anti-tamper controls.
