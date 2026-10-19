# Jenkins CI/CD Pipeline Verification & Latest Build Evidence

**Project Name:** ExamFlow — Online Examination System  
**Jenkins URL:** `http://127.0.0.1:8081`  
**Job Name:** `ExamFlow-CI`  
**Job URL:** [http://127.0.0.1:8081/job/ExamFlow-CI/](http://127.0.0.1:8081/job/ExamFlow-CI/)  
**Jenkins Version:** 2.580.1 (Jetty 12.1.13)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Date of Audit:** October 20, 2026  

---

## 1. Full Build Execution History

| Build # | Timestamp | Duration | Git Commit | Result | Automated Tests | Security Gate Status | Archived Artifacts |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Build #4** | 2026-10-19 18:32 UTC | 1m 09s | `dbbe3fd` | **FAILURE (Gated)** | 41/41 Passed (0 fail) | **Failed Gate (1 HIGH: CVE-2026-88806 in libx11)** | `trivy-examflow-4.*`, `junit.xml` |
| **Build #3** | 2026-10-17 20:20 UTC | 1m 55s | `4066451` | **SUCCESS** | 41/41 Passed (0 fail) | **Passed Gate (0 CVEs)** | `trivy-examflow-3.*`, `junit.xml` |
| **Build #2** | 2026-10-17 20:12 UTC | 14s | `4066451` | **FAILURE** | N/A | N/A (Missing `node_modules` in clean workspace) | None |
| **Build #1** | 2026-10-17 19:48 UTC | 1m 45s | `4066451` | **SUCCESS** | 41/41 Passed (0 fail) | **Passed Gate (0 CVEs)** | `trivy-examflow-1.*`, `junit.xml` |

---

## 2. In-Depth DevSecOps Analysis: Build #4 Gate Enforcement

In Build #4, the pipeline checked out the latest remote commit `dbbe3fd`, successfully installed dependencies with `npm ci`, and passed all 41 unit tests across 6 test suites.

However, during the `Trivy Security Scan` and `Enforce Vulnerability Threshold` stages, the newly updated Trivy vulnerability database (October 19, 2026) detected a freshly disclosed vulnerability in Alpine Linux:

```text
examflow:4 (alpine 3.24.2)
==========================
Total: 1 (HIGH: 1, CRITICAL: 0)

┌─────────┬────────────────┬──────────┬────────┬───────────────────┬───────────────┬────────────────────────────────────────────────────────────┐
│ Library │ Vulnerability  │ Severity │ Status │ Installed Version │ Fixed Version │                           Title                            │
├─────────┼────────────────┼──────────┼────────┼───────────────────┼───────────────┼────────────────────────────────────────────────────────────┤
│ libx11  │ CVE-2026-88806 │ HIGH     │ fixed  │ 1.8.13-r0         │ 1.8.14-r0     │ libX11: libX11: Heap-based buffer overflow via malicious X │
│         │                │          │        │                   │               │ server                                                     │
└─────────┴────────────────┴──────────┴────────┴───────────────────┴───────────────┴────────────────────────────────────────────────────────────┘

[Pipeline] stage: Enforce Vulnerability Threshold
+ trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:4
ERROR: script returned exit code 1
Finished: FAILURE
```

### Academic & DevSecOps Significance:
1. **The Security Gate Worked Flawlessly:** The pipeline's automated policy enforcement (`--exit-code 1 --severity HIGH,CRITICAL`) did not allow a vulnerable container image to proceed to production deployment.
2. **Root Cause Analysis:** Docker layer caching on the host had previously cached the Alpine layer before upstream package `libx11-1.8.14-r0` was made available.
3. **Engineering Remediation:**
   - Updated [`Dockerfile`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/Dockerfile) line 4 to explicitly fetch fresh package lists before upgrading: `RUN apk update && apk upgrade --no-cache`.
   - Updated [`Jenkinsfile`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/Jenkinsfile) line 39 to build with `--no-cache`: `docker build --no-cache -t devsec-online-exam:1.2 -t examflow:${BUILD_NUMBER} -t examflow:ci .`.
   - Local validation of the rebuilt image with Trivy confirmed that `libx11` was upgraded to `1.8.14-r0` and returned **0 vulnerabilities** (Exit code 0).

---

## 3. How to Trigger Build #5 After Pushing to GitHub

Once the local commit `d2f6878` is pushed to GitHub `origin main`:
1. Open Jenkins: [http://127.0.0.1:8081/job/ExamFlow-CI/](http://127.0.0.1:8081/job/ExamFlow-CI/).
2. Log in with your credentials (`anikaadmin`).
3. Click **Build Now**.
4. The pipeline will pull `d2f6878`, execute `npm test` (41/41 passing), build `examflow:5` without cache, and pass the Trivy security gate with zero vulnerabilities.
