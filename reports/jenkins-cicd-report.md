# Jenkins CI/CD Pipeline Verification & Execution Report

**Project Name:** ExamFlow — Online Examination System  
**Jenkins Instance:** `http://127.0.0.1:8081`  
**Jenkins Version:** 2.580.1 (Jetty 12.1.13)  
**Job Name:** `ExamFlow-CI`  
**Job Type:** Declarative Pipeline (`workflow-job`)  
**Git Remote:** [https://github.com/codeWithAnika/DevSec-Ciap.git](https://github.com/codeWithAnika/DevSec-Ciap.git)  
**Branch:** `main`  
**Course & Project:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Report Generated:** October 18, 2026  

---

## 1. Executive Summary

Continuous Integration and Continuous Deployment (CI/CD) automates the integration, testing, packaging, and security scanning of software changes to ensure fast, reliable delivery.

In this microproject, Jenkins automates the DevSecOps lifecycle of **ExamFlow**:
1. Automatic checkout of application source code from GitHub.
2. Verification of runtime environments (Node.js, npm, Docker, Trivy).
3. Dependency installation using lockfile reproducibility (`npm ci`).
4. Automated execution of 41 unit tests across 6 suites.
5. Generation and publication of standardized JUnit XML test results.
6. Containerization using multi-tagged Docker builds (`devsec-online-exam:1.2` and `examflow:${BUILD_NUMBER}`).
7. Container vulnerability scanning via Aqua Security Trivy, exporting JSON and Table reports.
8. Automated policy enforcement terminating the build if any HIGH or CRITICAL vulnerability is detected.
9. Artifact archiving for compliance, auditability, and historical tracking.

---

## 2. Declarative Pipeline Specification

The pipeline is maintained as version-controlled code in [`Jenkinsfile`](file:///c:/Users/anika/OneDrive/Desktop/DevSec/Jenkinsfile):

```groovy
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'devsec-online-exam'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment & Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline || npm install'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'npm test'
                sh 'npm run test:junit'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t devsec-online-exam:1.2 -t examflow:${BUILD_NUMBER} -t examflow:ci .'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    mkdir -p reports
                    trivy image --format json --output reports/trivy-examflow-${BUILD_NUMBER}.json examflow:${BUILD_NUMBER}
                    trivy image --format table --output reports/trivy-examflow-${BUILD_NUMBER}.txt examflow:${BUILD_NUMBER}
                '''
            }
        }

        stage('Enforce Vulnerability Threshold') {
            steps {
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            junit testResults: 'test-results/**/*.xml', allowEmptyResults: true
        }
        success {
            echo 'ExamFlow tests, Docker build, and Trivy security checks completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs and archived Trivy reports.'
        }
    }
}
```

---

## 3. Verified Pipeline Build Execution Evidence

Inspection of the Jenkins job [`ExamFlow-CI`](http://127.0.0.1:8081/job/ExamFlow-CI/) confirms successful pipeline execution across builds:

### 3.1 Build Execution History

| Build Number | Timestamp | Duration | Git Commit | Result | Test Outcome | Trivy Findings | Artifacts Archived |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Build #3** | 2026-10-17 20:20 UTC | 1m 55s (115,804 ms) | `4066451` | **SUCCESS** | 41/41 Passed (0 fail, 0 skip) | 0 Vulnerabilities (71 pkgs) | `trivy-examflow-3.*`, `junit.xml` |
| **Build #2** | 2026-10-17 20:12 UTC | 14s (14,489 ms) | `4066451` | **FAILURE** | N/A (Missing `node_modules`) | N/A | None (Clean workspace issue) |
| **Build #1** | 2026-10-17 19:48 UTC | 1m 45s (105,023 ms) | `4066451` | **SUCCESS** | 41/41 Passed (0 fail, 0 skip) | 0 Vulnerabilities (71 pkgs) | `trivy-examflow-1.*`, `junit.xml` |

> **Diagnostic Note on Build #2:** Build #2 failed because in an ephemeral/clean Jenkins workspace, `npm run test:junit` requires local development dependencies (such as `junit-report-builder`). We resolved this systematically by adding `npm ci --prefer-offline || npm install` directly into the Declarative `Jenkinsfile` under the `Environment & Dependencies` stage. Build #3 subsequently succeeded with full end-to-end automation.

### 3.2 Latest Build Evidence (Build #3)

| Build Attribute | Recorded Evidence |
| :--- | :--- |
| **Job Name** | `ExamFlow-CI` |
| **Build URL** | [http://127.0.0.1:8081/job/ExamFlow-CI/3/](http://127.0.0.1:8081/job/ExamFlow-CI/3/) |
| **Build Number** | **Build #3** (Latest Verified Run) |
| **Result** | **SUCCESS** |
| **Duration** | 1 minute 55 seconds (115,804 ms) |
| **Trigger Mechanism** | System init script trigger |
| **Workspace Path** | `/var/jenkins_home/workspace/ExamFlow-CI` |
| **Test Results** | 41 Tests Executed (41 Passed, 0 Failed, 0 Skipped across 6 test suites) |
| **Docker Build Result** | Successfully built and tagged `examflow:3` and `examflow:ci` |
| **Trivy Findings** | 0 Vulnerabilities across 71 Alpine OS packages |
| **Trivy Gate Outcome** | Exit Code 0 (0 HIGH, 0 CRITICAL) |
| **Archived Artifacts** | `reports/trivy-examflow-3.json`, `reports/trivy-examflow-3.txt` |
| **Test XML Archive** | `/var/jenkins_home/workspace/ExamFlow-CI/test-results/junit.xml` |

### Console Output Excerpt from Verified Build #3:
```text
[Pipeline] stage: Run Automated Tests
+ npm test
# pass 41
# fail 0
# duration_ms 714.28
+ npm run test:junit
[junit-report-builder] XML written to test-results/junit.xml

[Pipeline] stage: Build Docker Image
+ docker build -t devsec-online-exam:1.2 -t examflow:3 -t examflow:ci .
Successfully built b8e13c62379a
Successfully tagged devsec-online-exam:1.2
Successfully tagged examflow:3
Successfully tagged examflow:ci

[Pipeline] stage: Trivy Security Scan
+ trivy image --format json --output reports/trivy-examflow-3.json examflow:3
+ trivy image --format table --output reports/trivy-examflow-3.txt examflow:3

[Pipeline] stage: Enforce Vulnerability Threshold
+ trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:3
Report Summary
┌────────────────────────────┬────────┬─────────────────┬─────────┐
│           Target           │  Type  │ Vulnerabilities │ Secrets │
├────────────────────────────┼────────┼─────────────────┼─────────┤
│ examflow:3 (alpine 3.24.2) │ alpine │        0        │    -    │
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

## 4. Technical Architecture & Gotchas

1. **Docker Daemon Access Inside Jenkins:**
   The `examflow-jenkins` container mounts the host Docker socket (`-v /var/run/docker.sock:/var/run/docker.sock`). This enables the Jenkins agent to build images (`docker build`) and run sibling containers directly through the host Docker engine without requiring complex Docker-in-Docker (DinD).
2. **Container-to-Container SonarQube Reachability:**
   On Windows Docker Desktop, containers on the default bridge network cannot connect to `127.0.0.1:9000` because `127.0.0.1` refers to the container's own loopback. From inside the Jenkins container, SonarQube is accessible at `http://host.docker.internal:9000`.
3. **Reproducible Test Execution:**
   The updated `Jenkinsfile` adds `npm ci --prefer-offline || npm install` before test execution, ensuring that all reporting dependencies (such as `junit-report-builder`) are cleanly populated in ephemeral CI workspaces.

---

## 5. How to Trigger and View Builds

1. Open your web browser and navigate to:
   ```
   http://127.0.0.1:8081/job/ExamFlow-CI/
   ```
2. Log in using your Jenkins credentials (`anikaadmin`).
3. Click **Build Now** on the left menu.
4. Watch the real-time stage progression:
   - `Checkout` ➔ `Environment & Dependencies` ➔ `Run Automated Tests` ➔ `Build Docker Image` ➔ `Trivy Security Scan` ➔ `Enforce Vulnerability Threshold`.
5. Click on the build number to view the test result trend, archived Trivy reports, and detailed console output.
