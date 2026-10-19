# Docker Application and Container Security Verification Report

**Project Name:** ExamFlow — Online Examination System  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Report Date:** October 20, 2026  
**Image Tag:** `devsec-online-exam:1.2`  
**Container Name:** `devsec-exam-portal`  
**Host Port Mapping:** `0.0.0.0:8080 -> 80/tcp`  

---

## 1. Executive Summary

This report documents the containerization, runtime health, HTTP endpoint verification, and vulnerability assessment of the **ExamFlow** production Docker container (`devsec-online-exam:1.2`). The container is built from `nginx:stable-alpine` with an automated package upgrade layer, minimizing the attack surface and maintaining zero known vulnerabilities.

---

## 2. Docker Image & Container Specifications

| Attribute | Verified Value |
| :--- | :--- |
| **Base Image** | `nginx:stable-alpine` (Alpine Linux v3.24.2) |
| **Image Name & Tag** | `devsec-online-exam:1.2` |
| **Image Architecture** | `linux/amd64` |
| **Image Size** | 59.1 MiB (71 Alpine packages) |
| **Exposed Port** | TCP Port 80 (Host Port 8080) |
| **Container Status** | `Up (healthy)` |
| **Restart Policy** | `unless-stopped` |
| **Healthcheck Configuration** | `wget --quiet --tries=1 --spider http://localhost:80/ \|\| exit 1` (interval: 30s, timeout: 5s, retries: 3) |

---

## 3. Verified HTTP Endpoint Probes

Probing the live container on port 8080 yielded:

| Endpoint Tested | Expected Status | Actual Status | Content-Type | Size / Response Time |
| :--- | :---: | :---: | :--- | :--- |
| `GET /` | 200 OK | **200 OK** | `text/html` | 12,421 bytes |
| `GET /css/style.css` | 200 OK | **200 OK** | `text/css` | 15,283 bytes |
| `GET /js/validator.js` | 200 OK | **200 OK** | `application/javascript` | 10,772 bytes |
| `GET /js/questions.js` | 200 OK | **200 OK** | `application/javascript` | 3,194 bytes |
| `GET /js/app.js` | 200 OK | **200 OK** | `application/javascript` | 16,981 bytes |
| `GET /invalid-route-404` | 404 Not Found | **404 Not Found** | `text/html` | Standard Nginx 404 |

### Curl Header Verification (`curl.exe -4 -I http://localhost:8080/`):
```http
HTTP/1.1 200 OK
Server: nginx/1.30.6
Date: Mon, 19 Oct 2026 18:24:02 GMT
Content-Type: text/html
Content-Length: 12421
Connection: keep-alive
ETag: "6ad086b9-3085"
Accept-Ranges: bytes
```

---

## 4. Automated Testing Verification

The containerized static application codebase is verified by an automated Node.js test suite:
- **Total Tests:** 41
- **Passed:** 41 (100%)
- **Failed:** 0
- **Suites:** 6
  - `Full Name Validation` (10 tests)
  - `Email Address Validation` (5 tests)
  - `Student ID Validation` (7 tests)
  - `Examination Submission Validation` (6 tests)
  - `Examination Scoring Logic` (7 tests)
  - `HTTP Server & Static Asset Verification` (6 tests)
- **Artifacts:** Standard JUnit XML at `test-results/junit.xml` and LCOV coverage at `coverage/lcov.info`.

---

## 5. Container Vulnerability Assessment (Trivy Scan)

An automated vulnerability scan was conducted against `devsec-online-exam:1.2` using Aqua Security Trivy:

```text
Report Summary
┌────────────────────────────────────────┬────────┬─────────────────┬─────────┐
│                 Target                 │  Type  │ Vulnerabilities │ Secrets │
├────────────────────────────────────────┼────────┼─────────────────┼─────────┤
│ devsec-online-exam:1.2 (alpine 3.24.2) │ alpine │        0        │    -    │
└────────────────────────────────────────┴────────┴─────────────────┴─────────┘
```

- **Severity Breakdown:**
  - Critical: **0**
  - High: **0**
  - Medium: **0**
  - Low: **0**
- **Security Gate Result:** **PASSED** (`--exit-code 1 --severity HIGH,CRITICAL` returned exit code 0).
- **Remediation Applied:** The base `nginx:stable-alpine` layer was updated via `RUN apk update && apk upgrade --no-cache`, which proactively upgraded `libx11` (1.8.13-r0 -> 1.8.14-r0) and eliminated newly announced upstream vulnerability CVE-2026-88806.

---

## 6. Security Architecture Disclaimer & Production Scope

> [!WARNING]
> **Client-Side Prototype Constraints**  
> In this educational prototype, input validation, timer countdown, and scoring are evaluated in client-side JavaScript. For production deployment in high-stakes environments:
> 1. Form inputs and constraints must be strictly re-validated on a trusted backend API.
> 2. Student authentication must be backed by secure HTTP-only session cookies or OAuth2 tokens.
> 3. Exam timers and answer evaluations must be server-managed to prevent client-side inspection or tampering.
