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

Inspection of the Jenkins job [`ExamFlow-CI`](http://127.0.0.1:8081/job/ExamFlow-CI/) confirms successful pipeline execution:

| Build Attribute | Recorded Evidence |
| :--- | :--- |
| **Job Name** | `ExamFlow-CI` |
| **Build Number** | **Build #1** |
| **Result** | **SUCCESS** |
| **Duration** | 1 minute 45 seconds (105,023 ms) |
| **Trigger Mechanism** | User / Web UI (`submitter=anikaadmin`) |
| **Workspace Path** | `/var/jenkins_home/workspace/ExamFlow-CI` |
| **Test Results** | 41 Tests Executed (41 Passed, 0 Failed across 6 test suites) |
| **Docker Build Result** | Successfully built image `examflow:1` (`b8e13c62379a`) |
| **Trivy Findings** | 0 Vulnerabilities across 71 Alpine OS packages |
| **Trivy Gate Outcome** | Exit Code 0 (0 HIGH, 0 CRITICAL) |
| **Archived Artifacts** | `reports/trivy-examflow-1.json`, `reports/trivy-examflow-1.txt` |

### Console Output Excerpt from Verified Build #1:
```text
[Pipeline] stage: Run Automated Tests
+ node --version
v20.19.2
+ npm --version
9.2.0
+ npm test
# pass 41
# fail 0
# duration_ms 772.52

[Pipeline] stage: Build Docker Image
+ docker build -t examflow:1 -t examflow:ci .
Step 1/8 : FROM nginx:stable-alpine
Step 2/8 : RUN apk upgrade --no-cache
...
Successfully built b8e13c62379a
Successfully tagged examflow:1
Successfully tagged examflow:ci

[Pipeline] stage: Enforce Vulnerability Threshold
+ trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:1
Report Summary
┌────────────────────────────┬────────┬─────────────────┬─────────┐
│           Target           │  Type  │ Vulnerabilities │ Secrets │
├────────────────────────────┼────────┼─────────────────┼─────────┤
│ examflow:1 (alpine 3.24.2) │ alpine │        0        │    -    │
└────────────────────────────┴────────┴─────────────────┴─────────┘
[Pipeline] archiveArtifacts
Archiving artifacts
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
