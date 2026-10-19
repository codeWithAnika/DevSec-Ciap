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
| **Build #6** | 2026-10-19 19:07 UTC | 54s (54,057 ms) | `f0dc0f2` | **SUCCESS** | **41/41 Passed (0 fail, 0 skip)** | **Passed Gate (0 CVEs across 71 pkgs)** | `trivy-examflow-6.*`, `junit.xml` |
| **Build #5** | 2026-10-19 19:06 UTC | 56s (56,231 ms) | `f0dc0f2` | **SUCCESS** | **41/41 Passed (0 fail, 0 skip)** | **Passed Gate (0 CVEs across 71 pkgs)** | `trivy-examflow-5.*`, `junit.xml` |
| **Build #4** | 2026-10-19 18:32 UTC | 1m 09s | `dbbe3fd` | **FAILURE (Gated)** | 41/41 Passed (0 fail, 0 skip) | **Failed Gate (1 HIGH: CVE-2026-88806 in libx11)** | `trivy-examflow-4.*`, `junit.xml` |
| **Build #3** | 2026-10-17 20:20 UTC | 1m 55s | `4066451` | **SUCCESS** | 41/41 Passed (0 fail, 0 skip) | **Passed Gate (0 CVEs)** | `trivy-examflow-3.*`, `junit.xml` |
| **Build #2** | 2026-10-17 20:12 UTC | 14s | `4066451` | **FAILURE** | N/A | N/A (Missing `node_modules` in clean workspace) | None |
| **Build #1** | 2026-10-17 19:48 UTC | 1m 45s | `4066451` | **SUCCESS** | 41/41 Passed (0 fail, 0 skip) | **Passed Gate (0 CVEs)** | `trivy-examflow-1.*`, `junit.xml` |

---

## 2. In-Depth DevSecOps Analysis: Build #4 Gate Enforcement & Remediation

In Build #4, the pipeline checked out commit `dbbe3fd`, installed dependencies with `npm ci`, and passed all 41 unit tests.

During the `Trivy Security Scan` stage, the freshly updated vulnerability database detected an upstream Alpine Linux vulnerability:

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

### DevSecOps Policy Enforcement:
1. **Automated Security Gate Functioned as Designed:** The pipeline terminated immediately upon detecting a HIGH-severity CVE, preventing untrusted deployment.
2. **Root Cause:** Host Docker layer caching retained an older Alpine base layer prior to the release of `libx11-1.8.14-r0`.
3. **Engineering Remediation Applied:**
   - Updated [`Dockerfile`](../Dockerfile) line 4: `RUN apk update && apk upgrade --no-cache`.
   - Updated [`Jenkinsfile`](../Jenkinsfile) line 39: `docker build --no-cache -t devsec-online-exam:1.2 -t examflow:${BUILD_NUMBER} -t examflow:ci .`.
   - Committed changes in `d2f6878` and pushed to GitHub `origin/main`.

---

## 3. Verified Latest Pipeline Execution Evidence (Build #6)

Build #6 executed against remote commit `f0dc0f253eed231120d048c3c4572232ef04499b` on branch `main`:

```text
[Pipeline] stage: Checkout
Checking out Revision f0dc0f253eed231120d048c3c4572232ef04499b (refs/remotes/origin/main)
Commit message: "docs: update submission checklist matrix and record fresh Trivy zero-vulnerability report"

[Pipeline] stage: Environment & Dependencies
+ node --version
v20.19.2
+ npm --version
9.2.0
+ npm ci --prefer-offline
added 5 packages, and audited 6 packages in 1s
found 0 vulnerabilities

[Pipeline] stage: Run Automated Tests
+ npm test
# pass 41
# fail 0
# duration_ms 571.99
+ npm run test:junit
[junit-report-builder] XML written to test-results/junit.xml

[Pipeline] stage: Build Docker Image
+ docker build --no-cache -t devsec-online-exam:1.2 -t examflow:6 -t examflow:ci .
(2/4) Upgrading libx11 (1.8.13-r0 -> 1.8.14-r0)
Successfully built b8e13c62379a
Successfully tagged devsec-online-exam:1.2
Successfully tagged examflow:6
Successfully tagged examflow:ci

[Pipeline] stage: Trivy Security Scan
+ trivy image --format json --output reports/trivy-examflow-6.json examflow:6
+ trivy image --format table --output reports/trivy-examflow-6.txt examflow:6

[Pipeline] stage: Enforce Vulnerability Threshold
+ trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:6
Report Summary
┌────────────────────────────┬────────┬─────────────────┬─────────┐
│           Target           │  Type  │ Vulnerabilities │ Secrets │
├────────────────────────────┼────────┼─────────────────┼─────────┤
│ examflow:6 (alpine 3.24.2) │ alpine │        0        │    -    │
└────────────────────────────┴────────┴─────────────────┴─────────┘

[Pipeline] archiveArtifacts
Archiving artifacts
[Pipeline] junit
Recording test results: 41 tests, 0 failures, 0 errors
[Pipeline] echo
ExamFlow tests, Docker build, and Trivy security checks completed successfully.
Finished: SUCCESS
```

---

## 4. How to Trigger Additional Builds in Jenkins

To trigger future builds via the supported web interface:
1. Open [http://127.0.0.1:8081/job/ExamFlow-CI/](http://127.0.0.1:8081/job/ExamFlow-CI/) in your web browser.
2. Sign in with user `anika-admin`.
3. Click **Build Now** in the left-hand navigation sidebar.
4. Monitor the stage view as the pipeline checks out the latest commit, runs the automated test suites, builds the image, executes Trivy security gating, and records JUnit test reports.
