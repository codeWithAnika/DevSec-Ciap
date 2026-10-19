# DevSecOps Lab CIAP Microproject — Final Submission Checklist

**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Course:** DevSecOps Lab (Course Outcome: **CO5**, Sustainability Goal: **SDG 4 - Quality Education**)  
**Project Title:** Equivalence Class and Special Value Testing of an Online Examination System (*ExamFlow*)  
**Repository:** [https://github.com/codeWithAnika/DevSec-Ciap.git](https://github.com/codeWithAnika/DevSec-Ciap.git)  
**Date of Audit:** October 20, 2026  

---

## 1. Assignment Requirements Compliance Matrix

| Req # | Assignment Requirement Area | Implementation & Verification Status | Verified Evidence File / Artifact | Verification Command / URL |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Online Examination Web Platform** | **VERIFIED COMPLETE** | Production static web application in `src/` (HTML5, CSS, ES6 JavaScript). | [`reports/docker-verification-report.md`](docker-verification-report.md) \| Live at `http://localhost:8080/` |
| **2** | **Formal Test Engineering (ECP, BVA, SVT)** | **VERIFIED COMPLETE** | 41 systematic test cases covering Equivalence Class Partitioning, Boundary Value Analysis, and Special Value Testing. | [`docs/test-cases.md`](../docs/test-cases.md) \| Section 2 of [`reports/FINAL-SUBMISSION-REPORT.md`](FINAL-SUBMISSION-REPORT.md) |
| **3** | **Automated Test Suite & JUnit XML** | **VERIFIED COMPLETE** | Automated Node.js test runner: **41/41 passing tests** across 6 suites in ~681ms. JUnit XML and LCOV coverage generated. | [`test-results/junit.xml`](../test-results/junit.xml) \| [`coverage/lcov.info`](../coverage/lcov.info) \| `npm test` |
| **4** | **Dockerization & Container Security Gating** | **VERIFIED COMPLETE** | Multi-stage Docker image `devsec-online-exam:1.2`. Live container healthy on port 8080. Trivy container scan: **0 vulnerabilities**. Host dependencies: 0 vulnerabilities. | [`reports/docker-verification-report.md`](docker-verification-report.md) \| [`reports/trivy-devsec-online-exam-1.2.txt`](trivy-devsec-online-exam-1.2.txt) |
| **5** | **SonarQube SAST Static Analysis** | **PARTIALLY COMPLETE** | SonarQube Community 26.10 live at `http://127.0.0.1:9000`. Java 21 wrapper validated. 2 reliability bugs remediated in `src/js/validator.js`. Awaiting student user token for authenticated CLI scan. | [`reports/sonarqube-sast-report.md`](sonarqube-sast-report.md) \| [`reports/sonarqube-verification-evidence.md`](sonarqube-verification-evidence.md) \| [Dashboard](http://127.0.0.1:9000/dashboard?id=ExamFlow) |
| **6** | **Jenkins CI/CD Declarative Pipeline** | **VERIFIED COMPLETE** | Jenkins 2.580.1 live at `http://127.0.0.1:8081`. Declarative job `ExamFlow-CI` verified. Build #1 SUCCESS, Build #3 SUCCESS (41/41 tests, Trivy 0 CVEs). Build #4 verified security gate enforcement on upstream CVE. | [`Jenkinsfile`](../Jenkinsfile) \| [`reports/jenkins-cicd-report.md`](jenkins-cicd-report.md) \| [`reports/jenkins-latest-build-evidence.md`](jenkins-latest-build-evidence.md) \| [Job](http://127.0.0.1:8081/job/ExamFlow-CI/) |
| **7** | **Cloud Deployment (Terraform, AWS ECR & EC2)** | **BLOCKED — ACTION REQUIRED** | Complete IaC codebase in `terraform/` (`main.tf`, `variables.tf`, `outputs.tf`, `user-data.sh`). Formatted and validated (`Success! The configuration is valid.`). Awaiting student AWS credentials and explicit deployment approval. | [`terraform/`](../terraform/) \| [`reports/terraform-deployment-report.md`](terraform-deployment-report.md) \| [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) |

---

## 2. Outstanding Student Actions & Next Steps

1. **GitHub Push (Phase 1 / Phase 7):**
   - The local Git repository has commits staged and committed on branch `main` (`d2f6878`).
   - Run `git push origin main` in an interactive PowerShell terminal to complete synchronization.
2. **SonarQube Authenticated Scan (Phase 2):**
   - Generate a User Token in the SonarQube UI at `http://127.0.0.1:9000` (My Account ➔ Security).
   - In PowerShell, run:
     ```powershell
     $env:SONAR_TOKEN = "your_token_here"
     C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat
     ```
3. **Jenkins Build #5 Trigger (Phase 3):**
   - Once `d2f6878` is pushed to GitHub, navigate to [http://127.0.0.1:8081/job/ExamFlow-CI/](http://127.0.0.1:8081/job/ExamFlow-CI/) and click **Build Now** to verify the fresh build.
4. **AWS Deployment Approval & Credentials (Phase 5):**
   - Configure AWS CLI credentials via `aws configure` or `aws sso login`.
   - Review the cost estimation in [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) (~$0.0154/hr) and approve running `terraform apply`.
