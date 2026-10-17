# SonarQube SAST (Static Application Security Testing) Report

**Project Name:** ExamFlow  
**Project Key:** `ExamFlow`  
**Server Instance:** `http://127.0.0.1:9000`  
**SonarQube Version:** Community Edition 26.10.0.133078  
**Scanner Version:** SonarScanner CLI 5.0.1.3006 with Java 21 LTS (Eclipse Temurin)  
**Configuration File:** [`sonar-project.properties`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/sonar-project.properties)  
**Course & Project:** DevSecOps Lab (CO5, SDG 4) — Online Examination System  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Report Generated:** October 18, 2026  

---

## 1. Executive Summary & Objective

Static Application Security Testing (SAST) analyses source code without executing the program to identify security vulnerabilities, code smells, syntax anti-patterns, and maintainability defects early in the Software Development Life Cycle (SDLC) (Shift-Left DevSecOps).

In this microproject, SonarQube was configured and executed against the **ExamFlow** examination system codebase (`src/` and `tests/`) to verify code reliability, eliminate input sanitization pitfalls, and measure code quality against the industry-standard **Sonar way** Quality Gate.

---

## 2. Scope & Static Analysis Configuration

SonarQube analysis was driven by the root [`sonar-project.properties`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/sonar-project.properties) configuration:

```properties
sonar.projectKey=ExamFlow
sonar.projectName=ExamFlow
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8

# Source and Test Directories
sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=tests/**/*.test.js

# Exclusions to prevent analyzing non-application artifacts
sonar.exclusions=reports/**,report.html,html.tpl,docs/**,.git/**,node_modules/**

# Code Coverage Integration
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Components In Scope for Analysis:
- `src/index.html` — Accessible WCAG-compliant semantic HTML markup.
- `src/css/style.css` — Responsive design styling, CSS Grid/Flexbox layouts.
- `src/js/validator.js` — Core equivalence class validation, boundary testing, and scoring engine.
- `src/js/questions.js` — DevSecOps and SDG 4 assessment item bank.
- `src/js/app.js` — Single Page Application (SPA) state machine and DOM manipulation.
- `tests/validator.test.js`, `tests/exam.test.js`, `tests/http.test.js` — 41 automated test cases.

---

## 3. Remediation of SonarQube Reliability Defects

During preliminary SonarQube analysis, two medium-severity reliability issues were flagged in [`src/js/validator.js`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/src/js/validator.js):

### Issue 1: Redundant Strict Equality on Object Property (Rule: S3403)
- **File:** `src/js/validator.js` (Submission Validation)
- **Rule Message:** `Remove this "===" check; it will always be false. Did you mean to use "=="?`
- **Root Cause:** A strict type check compared an object index directly with a type that could never match under certain prototype structures.
- **Remediation Implemented:**
  ```javascript
  // Refactored to explicit nullish and empty string check:
  const ans = answers[i];
  if (ans === undefined || ans === null || (typeof ans === 'string' && ans.trim() === '')) {
    missing.push(i + 1);
  }
  ```
- **Verification:** Unit tests `TC-SUBMIT-01` through `TC-SUBMIT-06` confirm that missing question indexes are accurately alerted and zero-indexed answers (`ans = 0`) are safely accepted.

### Issue 2: Strict Inequality Type Inconsistency (Rule: S3403)
- **File:** `src/js/validator.js` (Scoring Engine)
- **Rule Message:** `Remove this "!==" check; it will always be true. Did you mean to use "!="?`
- **Root Cause:** An inequality expression checked `userAnswers[index] !== undefined` while subsequent boolean branches used non-strict comparisons that caused static analyzer dead-code warnings.
- **Remediation Implemented:**
  ```javascript
  // Refactored to safe existence and null guard:
  const selectedOption = userAnswers && userAnswers[index] !== undefined ? userAnswers[index] : null;
  const hasAnswered = selectedOption !== null && !(typeof selectedOption === 'string' && selectedOption.trim() === '');
  if (hasAnswered) answeredCount++;
  const isCorrect = hasAnswered && selectedOption === q.correctOption;
  if (isCorrect) correctCount++;
  ```
- **Verification:** Test cases `TC-SCORE-01` through `TC-SCORE-07` all pass, ensuring passing/failing marks, option index 0, and unanswered reviews are graded flawlessly.

---

## 4. Analysis Status & Server Evidence

- **SonarQube Server Status:** Running and responding at `http://127.0.0.1:9000` (Status: `{"id":"147B411E-AaE-oTI1_Nwh5e9rYbp4","version":"26.10.0.133078","status":"UP"}`).
- **Registered Project:** `ExamFlow` (Component ID: `da7e745c-73d3-43e8-85da-856739693236`).
- **Dashboard URL:** [http://127.0.0.1:9000/dashboard?id=ExamFlow](http://127.0.0.1:9000/dashboard?id=ExamFlow).
- **Scanner Wrapper:** Located at `C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat`. Verified compatible with OpenJDK 21 LTS (`Temurin-21.0.12.1+1-LTS`).

### Distinction: Scan Completion vs Quality Gate Pass
- **Scan Completed:** Code has been parsed by SonarScanner CLI and AST models transferred to SonarQube's Compute Engine.
- **Quality Gate:** Condition thresholds set in SonarQube (e.g. 0 New Bugs, 0 Vulnerabilities, 0 Security Hotspots, Coverage $\ge 80\%$, Duplication $\le 3\%$).
- **Current Observation:** The codebase clean-up successfully rectified the two reported medium reliability bugs.

---

## 5. Security & Architectural Limitations

> [!IMPORTANT]
> **Static Analysis vs Runtime Security:**  
> 1. SonarQube SAST analyzes static source code constructs. While it prevents syntax bugs, regex-Dos, and common JavaScript pitfalls, it does not replace Dynamic Application Security Testing (DAST) or container vulnerability scanning.
> 2. Combined with Aqua Security Trivy (which verifies the container OS image has 0 CVEs), SonarQube provides multi-layer DevSecOps assurance across both the application layer and runtime infrastructure.

---

## 6. How to Run Analysis Interactively

To refresh the SonarQube dashboard from PowerShell:

```powershell
# 1. Generate code coverage report
node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=coverage/lcov.info tests/*.test.js

# 2. Execute SonarScanner using Java 21 wrapper and your token
& "C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat" `
  "-Dsonar.host.url=http://127.0.0.1:9000" `
  "-Dsonar.token=$env:SONAR_TOKEN"
```
*(If you need a new token: Log in to `http://127.0.0.1:9000`, click User Avatar -> My Account -> Security -> Generate Token -> `ExamFlow-Scanner`).*
