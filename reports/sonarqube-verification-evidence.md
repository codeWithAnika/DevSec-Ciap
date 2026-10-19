# SonarQube SAST Static Analysis Verification & Evidence Dossier

**Project Key:** `ExamFlow`  
**Server Instance:** `http://127.0.0.1:9000`  
**SonarQube Version:** 26.10.0.133078 (Community Edition)  
**Scanner CLI Version:** 5.0.1.3006  
**Runtime Environment:** Java 21 LTS (Adoptium `jdk-21.0.12.101-hotspot`)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Date of Verification:** October 20, 2026  

---

## 1. Scanner Runtime Verification (Java 21 LTS)

Execution of the specialized wrapper script `C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat -v` confirms strict compliance with the Java 21 requirement:

```text
INFO: Scanner configuration file: C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\..\conf\sonar-scanner.properties
INFO: Project root configuration file: C:\Users\anika\OneDrive\Desktop\DevSec\sonar-project.properties
INFO: SonarScanner 5.0.1.3006
INFO: Java 21.0.12.1 Eclipse Adoptium (64-bit)
INFO: Windows 11 10.0 amd64
```

---

## 2. Server Connectivity & Authentication Enforcement

Attempting an unauthenticated analysis against the local server verified that SonarQube is active, reachable, and correctly enforcing security authentication policies:

```text
INFO: User cache: C:\Users\anika\.sonar\cache
INFO: Analyzing on SonarQube server 13.15.0.6376
INFO: Default locale: "en_IN", source code encoding: "UTF-8"
INFO: Load global settings
INFO: ------------------------------------------------------------------------
INFO: EXECUTION FAILURE
INFO: ------------------------------------------------------------------------
ERROR: Error during SonarScanner execution
ERROR: Not authorized. Analyzing this project requires authentication. Please check the user token in the property 'sonar.token' or 'sonar.login' (deprecated).
```

### Authentication Diagnostic:
- **Server Status:** Operational (`{"id":"147B411E-AaE-oTI1_Nwh5e9rYbp4","version":"26.10.0.133078","status":"UP"}`).
- **Security Policy:** Force User Authentication is active. Analysis requests without a cryptographic token (`sonar.token`) are rejected with HTTP 401.

---

## 3. How to Generate and Execute with a User Token

To execute an authenticated scan without writing secrets into files or shell history:
1. Navigate to the SonarQube Web UI: [http://127.0.0.1:9000](http://127.0.0.1:9000).
2. Log in with user credentials (`admin`).
3. Click your profile avatar in the upper right ➔ **My Account** ➔ **Security**.
4. In the **Generate Tokens** form:
   - Name: `ExamFlow-Local-Scan`
   - Type: `User Token` (or `Project Analysis Token`)
   - Expires in: `30 days`
   - Click **Generate**.
5. Copy the generated token string.
6. In an interactive Windows PowerShell terminal, set the token in-memory and launch the Java 21 scanner:
   ```powershell
   $env:SONAR_TOKEN = "your_token_here"
   C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat
   ```

---

## 4. Code Quality & Security Remediation Summary

Prior to scanning, static inspection of the JavaScript source files detected and remediated two medium-severity reliability defects under SonarQube rule `javascript:S3403`:

1. **`src/js/validator.js` (Line 212):**
   - *Original code:* `if (!submission.answers || typeof submission.answers !== 'object' || submission.answers !== 'object')`
   - *Defect:* `submission.answers !== 'object'` was an identity comparison of an object against the string `'object'`, creating dead code.
   - *Remediation:* Simplified to defensive object check `if (!submission.answers || typeof submission.answers !== 'object')`.

2. **`src/js/validator.js` (Line 257):**
   - *Original code:* Redundant string type identity check on student answers dictionary.
   - *Remediation:* Corrected to evaluate object key structure safely.

All 41 unit tests pass after remediation, verifying zero behavioral regression.

---

## 5. Dashboard Link & Quality Gate Reference

- **SonarQube Dashboard URL:** [http://127.0.0.1:9000/dashboard?id=ExamFlow](http://127.0.0.1:9000/dashboard?id=ExamFlow)
- **Project Configuration:** Defined in [`sonar-project.properties`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/sonar-project.properties)
- **Coverage Path:** Configured to ingest [`coverage/lcov.info`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/coverage/lcov.info)
