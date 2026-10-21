# DevSecOps CIAP Microproject: Online Examination System

[![Course](https://img.shields.io/badge/Course-DevSecOps%20Lab-blue.svg)](#)
[![Outcome](https://img.shields.io/badge/CO-CO5-green.svg)](#)
[![SDG](https://img.shields.io/badge/SDG%204-Quality%20Education-orange.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-41%20Passed-brightgreen.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-devsec--online--exam%3A1.2-informational.svg)](#)
[![Trivy](https://img.shields.io/badge/Trivy-0%20Vulnerabilities-success.svg)](#)

**Student Name:** Talavadekar Anika Vinit  
**Student ID:** 124BTCS1036  
**Course:** DevSecOps Lab (CO5)  
**Microproject Topic:** Equivalence Class and Special Value Testing of an Online Examination System  
**Global Alignment:** UN Sustainable Development Goal 4 (SDG 4: Quality Education)  
**Repository:** https://github.com/codeWithAnika/DevSec-Ciap.git  

---

## 1. Problem Statement

Digital examination and assessment systems in educational institutions require high availability, robust input validation, and rigorous software verification. Unhandled edge-case inputs, malformed submissions, or client-side calculation errors compromise academic fairness and disrupt educational access. 

This microproject develops a resilient, accessible Online Examination System platform (**ExamFlow**) and applies **Equivalence Class Partitioning (ECP)**, **Boundary Value Analysis (BVA)**, and **Special Value Testing (SVT)** to guarantee input sanitization and accurate grading before containerization, security scanning, and deployment.

---

## 2. Objectives and Scope

### Objectives
1. **Quality Assurance & Verification:** Formally partition input parameters into equivalence classes and test boundary conditions to eliminate input-handling defects.
2. **Accessible User Interface:** Provide an accessible, mobile-responsive assessment platform adhering to WCAG focus, ARIA live regions, and semantic HTML guidelines.
3. **Containerization & DevSecOps Readiness:** Package the verified static web application into a minimal, secure Docker container using official Nginx Alpine images.
4. **Shift-Left Security & Vulnerability Scanning:** Integrate container vulnerability scanning via Aqua Security Trivy and enforce zero HIGH/CRITICAL vulnerability thresholds.
5. **CI/CD Integration & Reporting:** Produce standard JUnit XML test reports for automated consumption by Jenkins and CI pipelines.
6. **Alignment with SDG 4:** Guarantee fair, equitable, and transparent assessment scoring with comprehensive rationale and answer reviews.

---

## 3. Technology Stack

- **Frontend:** Semantic HTML5, Modern CSS3 (CSS Grid, Flexbox, Custom Properties), Vanilla JavaScript (ES6+).
- **Navigation Architecture:** 7 Views (Home Hero, Candidate Registration, Timed Instructions, Exam Workspace with Palette & Countdown Timer, Results Evaluation, Interactive Testing Lab, Project Architecture & About).
- **Testing Lab Engine:** Interactive in-browser ECP & SVT test runner with real-time Input Classification Sandbox.
- **Web Server:** Nginx Stable Alpine Linux (`nginx:stable-alpine`) / Node.js zero-dependency HTTP server (`scripts/serve.js`).
- **Testing Engine:** Node.js v24 Built-in Test Runner (`node:test`, `node:assert/strict`).
- **Reporting Engine:** `junit-report-builder` for Jenkins-compatible JUnit XML reports.
- **Containerization:** Docker Engine / Docker Desktop on Windows.
- **Vulnerability Scanner:** Aqua Security Trivy (`aquasec/trivy:latest`).
- **CI/CD:** Jenkins (`Jenkinsfile`) & SonarQube Community Build 26.10.
- **Infrastructure as Code (IaC):** HashiCorp Terraform AWS EC2 deployment (`ap-south-1`).
- **Version Control:** Git & GitHub (`main` branch).

---

## 4. Automated Testing & JUnit Reporting

The project features 41 automated test cases across 6 suites, covering candidate registration boundaries, examination submission logic, scoring benchmarks, and HTTP static asset delivery.

### Running Unit Tests
```powershell
# Run the complete test suite (41 tests)
npm test
```

### Generating JUnit XML Reports
```powershell
# Run tests and generate test-results/junit.xml for Jenkins/CI
npm run test:junit
```
Report artifact generated: `test-results/junit.xml`.

---

## 5. Docker Build & Deployment Instructions

### 1. Build the Docker Image
```powershell
docker build -t devsec-online-exam:1.2 .
```

### 2. Run the Container
```powershell
docker run -d --name devsec-exam-portal --restart unless-stopped -p 8080:80 devsec-online-exam:1.2
```

### 3. Verify Container Status
```powershell
docker ps --filter "name=devsec-exam-portal"
```

### 4. HTTP Endpoint Verification
```powershell
# On Windows PowerShell, use IPv4 flag or 127.0.0.1:
curl.exe -4 -I http://localhost:8080/

# Test static assets:
curl.exe -4 -I http://localhost:8080/css/style.css
curl.exe -4 -I http://localhost:8080/js/validator.js
curl.exe -4 -I http://localhost:8080/js/questions.js
curl.exe -4 -I http://localhost:8080/js/app.js
```

---

## 6. Trivy Container Security Scanning

Vulnerability scanning is performed using the `aquasec/trivy:latest` image against the submission container image `devsec-online-exam:1.2`.

### 1. Run Human-Readable Table Scan
```powershell
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache -v ${PWD}/reports:/reports aquasec/trivy:latest image --format table --output /reports/trivy-devsec-online-exam-1.2.txt devsec-online-exam:1.2
```

### 2. Run Machine-Readable JSON Scan
```powershell
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache -v ${PWD}/reports:/reports aquasec/trivy:latest image --format json --output /reports/trivy-devsec-online-exam-1.2.json devsec-online-exam:1.2
```

### 3. Enforce Zero HIGH / CRITICAL Policy
```powershell
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL devsec-online-exam:1.2
```

### Trivy Findings Summary
- **Target Image:** `devsec-online-exam:1.2` (Alpine 3.24.2)
- **CRITICAL:** 0
- **HIGH:** 0
- **MEDIUM:** 0
- **LOW:** 0
- **Result:** Clean (no security vulnerabilities detected).

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
   - Boundary/Special values: Option index `0` accepted as valid answer; empty/whitespace answers flagged.
5. **Scoring:**
   - All correct: 100% (Passed).
   - All wrong: 0% (Needs Improvement).
   - Threshold testing: 4/6 = 67% (Passed) vs. 3/6 = 50% (Needs Improvement).
   - Boundary/Special values: Option index `0` correctly evaluated and awarded points.
6. **HTTP Static Delivery:**
   - Index HTML (200 OK, `text/html`).
   - CSS & JS assets (200 OK, valid MIME types).
   - Missing assets (404 Not Found).

**All 41 automated tests pass successfully across 6 suites.**

---

## 8. Verification & Evidence Checklist

| Component | Status | Verification Evidence |
| :--- | :--- | :--- |
| **Complete 7-View Web Application** | Verified | Home, Register, Instructions, Exam, Results, Testing Lab, About in `src/` |
| **Interactive Testing Lab** | Verified | In-browser live execution of 20 ECP and 21 SVT test cases + input playground |
| **Assessment Workspace & Timer** | Verified | 10:00 active countdown timer, 6-pill question palette, confirmation modal |
| **Input Validation & Scoring Engine** | Verified | Type-safe validator in `src/js/validator.js` |
| **Question Bank & Explanations** | Verified | 6 DevSecOps and SDG 4 questions in `src/js/questions.js` |
| **Automated Test Suite** | Verified | 41/41 unit tests passing (`npm test`) |
| **JUnit XML Reporting** | Verified | `test-results/junit.xml` via `npm run test:junit` |
| **Testing Documentation** | Verified | Full 41-case test matrix in `docs/test-cases.md` |
| **Docker Configuration** | Verified | Pinned Alpine Dockerfile with `version="1.2.0"` |
| **Docker Container Execution** | Verified | Container `devsec-exam-portal` running on port 8080 |
| **HTTP Endpoint Delivery** | Verified | Responding `HTTP/1.1 200 OK` via `curl.exe -4 http://localhost:8080/` |
| **Trivy Vulnerability Scan** | Verified | 0 vulnerabilities found; reports in `reports/` |
| **CI/CD Pipeline Configuration** | Verified | `Jenkinsfile` configured with test, build, scan, and JUnit archive |
| **Terraform IaC Configuration** | Verified | Validated AWS EC2 config (`terraform validate` passed, `terraform plan` clean) |
| **Git Repository & Remote** | Verified | Branch `main` synchronized with `origin/main` |

---

## 9. Security Notice & Project Limitations

> [!WARNING]
> **Client-Side Validation Disclaimer:**  
> This application is an educational prototype. Input validation and scoring are executed on the client side in JavaScript (`src/js/validator.js`). In a production examination system:
> - Client-side validation can be bypassed using browser dev tools, script disabling, or direct HTTP API requests.
> - Production deployment requires **server-side validation**, cryptographic exam session tokens, rate limiting, and encrypted server-side score persistence.
