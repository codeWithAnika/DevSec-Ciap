# DevSecOps Lab CIAP Microproject — Final Submission Checklist

**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Course:** DevSecOps Lab (Course Outcome: **CO5**, Sustainability Goal: **SDG 4 - Quality Education**)  
**Project Title:** Equivalence Class and Special Value Testing of an Online Examination System (*ExamFlow*)  
**Repository:** [https://github.com/codeWithAnika/DevSec-Ciap.git](https://github.com/codeWithAnika/DevSec-Ciap.git)  
**Date of Audit:** October 20, 2026  

---

## 1. Assignment Requirements & Execution Status Matrix

| Subsystem / Deliverable | Execution & Verification Status | Verified Evidence File / Artifact | Verification Command / URL |
| :--- | :---: | :--- | :--- |
| **1. Web Examination Platform** | **VERIFIED COMPLETE** | Production web portal in `src/` (semantic HTML5, CSS, ES6 JavaScript). Verified healthy in container `devsec-exam-portal`. | [`reports/docker-verification-report.md`](docker-verification-report.md) \| Live at `http://localhost:8080/` |
| **2. Formal Test Cases (ECP, BVA, SVT)** | **VERIFIED COMPLETE** | 41 systematic test cases covering Equivalence Class Partitioning, Boundary Value Analysis, and Special Value Testing. | [`docs/test-cases.md`](../docs/test-cases.md) \| Section 2 of [`reports/FINAL-SUBMISSION-REPORT.md`](FINAL-SUBMISSION-REPORT.md) |
| **3. Automated Test Suite & Coverage** | **VERIFIED COMPLETE** | Automated Node.js test runner: **41/41 passing tests** across 6 suites in ~571ms. JUnit XML and LCOV coverage generated. | [`test-results/junit.xml`](../test-results/junit.xml) \| [`coverage/lcov.info`](../coverage/lcov.info) \| `npm test` |
| **4. Dockerization & Trivy Security Gate** | **VERIFIED COMPLETE** | Base Alpine updated (`libx11` 1.8.14-r0). Trivy container scan: **0 vulnerabilities** (0 High, 0 Critical). Exit code 0. | [`reports/docker-verification-report.md`](docker-verification-report.md) \| [`reports/trivy-devsec-online-exam-1.2.txt`](trivy-devsec-online-exam-1.2.txt) |
| **5. Jenkins CI/CD Pipeline** | **VERIFIED COMPLETE** | Jenkins 2.580.1 at `http://127.0.0.1:8081`. Job `ExamFlow-CI` verified across Builds #1, #3 (SUCCESS), and #4 (gating test). | [`Jenkinsfile`](../Jenkinsfile) \| [`reports/jenkins-cicd-report.md`](jenkins-cicd-report.md) \| [`reports/jenkins-latest-build-evidence.md`](jenkins-latest-build-evidence.md) |
| **6. SonarQube SAST Static Analysis** | **PARTIALLY COMPLETE** | SonarQube 26.10 UP at `http://127.0.0.1:9000`. Java 21 LTS verified. 2 reliability bugs fixed. Awaiting user token for CLI scan. | [`reports/sonarqube-sast-report.md`](sonarqube-sast-report.md) \| [`reports/sonarqube-verification-evidence.md`](sonarqube-verification-evidence.md) |
| **7. Terraform IaC Configuration & Validation** | **VERIFIED COMPLETE** | IaC codebase in `terraform/` (`main.tf`, `variables.tf`, `outputs.tf`, `user-data.sh`). Formatted and validated (`Success! The configuration is valid.`). | [`terraform/`](../terraform/) \| [`reports/terraform-deployment-report.md`](terraform-deployment-report.md) |
| **8. Git Synchronization (GitHub Push)** | **BLOCKED — ACTION REQUIRED** | Local commits `d2f6878` and `cb1bd21` committed on `main`. Remote `origin/main` at `dbbe3fd`. Pending interactive terminal push. | Run `git push origin main` in PowerShell |
| **9. Amazon ECR Image Push** | **BLOCKED — ACTION REQUIRED** | Image `devsec-online-exam:1.2` clean and ready. Awaiting AWS credentials (`aws configure`) and student push approval. | [`reports/aws-ecr-report.md`](aws-ecr-report.md) |
| **10. Amazon EC2 Cloud Deployment** | **BLOCKED — ACTION REQUIRED** | Infrastructure designed and cost-modeled (~$0.0154/hr). Awaiting AWS credentials and student deployment approval. | [`reports/aws-ec2-deployment-report.md`](aws-ec2-deployment-report.md) \| [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) |

---

## 2. Outstanding Student Actions & Next Steps

1. **GitHub Push:**
   - Execute in an interactive PowerShell terminal (where Git Credential Manager can prompt for credentials):
     ```powershell
     cd C:\Users\anika\OneDrive\Desktop\DevSec
     git push origin main
     ```
2. **SonarQube Authenticated Scan:**
   - Generate a User Token in the SonarQube UI at `http://127.0.0.1:9000` (My Account ➔ Security).
   - In PowerShell, run:
     ```powershell
     $env:SONAR_TOKEN = "your_token_here"
     C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat
     ```
3. **Jenkins Build #5 Trigger:**
   - Once `cb1bd21` is pushed to GitHub, navigate to [http://127.0.0.1:8081/job/ExamFlow-CI/](http://127.0.0.1:8081/job/ExamFlow-CI/) and click **Build Now** to verify the clean Docker build with the upgraded Alpine packages.
4. **AWS Deployment Approval & Credentials:**
   - Configure AWS CLI credentials via `aws configure` or `aws sso login`.
   - Review the cost estimation in [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) (~$0.0154/hr) and approve running `terraform apply`.
