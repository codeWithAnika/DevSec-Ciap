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
| **1. Web Examination Platform** | **PASS (VERIFIED COMPLETE)** | Production web portal in `src/` (semantic HTML5, CSS, ES6 JavaScript). Verified healthy in container `devsec-exam-portal`. | [`reports/docker-verification-report.md`](docker-verification-report.md) \| Live at `http://localhost:8080/` |
| **2. Formal Test Cases (ECP, BVA, SVT)** | **PASS (VERIFIED COMPLETE)** | 41 systematic test cases covering Equivalence Class Partitioning, Boundary Value Analysis, and Special Value Testing. | [`docs/test-cases.md`](../docs/test-cases.md) \| Section 2 of [`reports/FINAL-SUBMISSION-REPORT.md`](FINAL-SUBMISSION-REPORT.md) |
| **3. Automated Test Suite & Coverage** | **PASS (VERIFIED COMPLETE)** | Automated Node.js test runner: **41/41 passing tests** across 6 suites in ~571ms. JUnit XML and LCOV coverage generated. | [`test-results/junit.xml`](../test-results/junit.xml) \| [`coverage/lcov.info`](../coverage/lcov.info) \| `npm test` |
| **4. Dockerization & Trivy Security Gate** | **PASS (VERIFIED COMPLETE)** | Base Alpine updated (`libx11` 1.8.14-r0). Trivy container scan: **0 vulnerabilities** across 71 packages. Exit code 0. | [`reports/docker-verification-report.md`](docker-verification-report.md) \| [`reports/trivy-devsec-online-exam-1.2.txt`](trivy-devsec-online-exam-1.2.txt) |
| **5. Jenkins CI/CD Pipeline** | **PASS (VERIFIED COMPLETE)** | Jenkins 2.580.1 at `http://127.0.0.1:8081`. Job `ExamFlow-CI` verified: **Build #6 SUCCESS** (54s, commit `f0dc0f2`, 41 tests, 0 CVEs). | [`Jenkinsfile`](../Jenkinsfile) \| [`reports/jenkins-cicd-report.md`](jenkins-cicd-report.md) \| [`reports/jenkins-latest-build-evidence.md`](jenkins-latest-build-evidence.md) |
| **6. Git Synchronization (GitHub Push)** | **PASS (VERIFIED COMPLETE)** | Local HEAD matches `origin/main` at commit `f0dc0f253eed231120d048c3c4572232ef04499b`. Working tree clean. | `git status` \| [GitHub Repository](https://github.com/codeWithAnika/DevSec-Ciap.git) |
| **7. Terraform IaC Configuration & Validation** | **PASS (VERIFIED COMPLETE)** | IaC codebase in `terraform/` (`main.tf`, `variables.tf`, `outputs.tf`, `user-data.sh`). Formatted and validated (`Success! The configuration is valid.`). | [`terraform/`](../terraform/) \| [`reports/terraform-deployment-report.md`](terraform-deployment-report.md) |
| **8. SonarQube SAST Static Analysis** | **PENDING (AWAITING USER TOKEN)** | SonarQube 26.10 UP at `http://127.0.0.1:9000`. Java 21 LTS verified. 2 reliability bugs fixed. Awaiting user token for CLI scan. | [`reports/sonarqube-sast-report.md`](sonarqube-sast-report.md) \| [`reports/sonarqube-verification-evidence.md`](sonarqube-verification-evidence.md) |
| **9. Amazon ECR Image Push** | **PENDING (AWAITING CREDENTIALS)** | Image `devsec-online-exam:1.2` clean and ready. Awaiting AWS credentials (`aws configure`) and student push approval. | [`reports/aws-ecr-report.md`](aws-ecr-report.md) |
| **10. Amazon EC2 Cloud Deployment** | **PENDING (AWAITING APPROVAL)** | Infrastructure designed and cost-modeled (~$0.0154/hr). Awaiting AWS credentials and student deployment approval. | [`reports/aws-ec2-deployment-report.md`](aws-ec2-deployment-report.md) \| [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) |

---

## 2. Outstanding Student Actions & Next Steps

1. **SonarQube Authenticated Scan (Requirement 5):**
   - Log in to the SonarQube UI at `http://127.0.0.1:9000` (`admin`).
   - Navigate to **My Account** ➔ **Security** and generate a token named `ExamFlow-Local-Scan`.
   - In an interactive PowerShell terminal, run:
     ```powershell
     $env:SONAR_TOKEN = "your_token_here"
     C:\Users\anika\Downloads\sonar-scanner-cli-5.0.1.3006-windows\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner-java21.bat
     ```
2. **AWS Deployment Approval & Credentials (Requirement 7):**
   - Configure AWS CLI credentials via `aws configure` or `aws sso login`.
   - Review the cost estimation in [`reports/aws-cost-and-cleanup.md`](aws-cost-and-cleanup.md) (~$0.0154/hr On-Demand, or $0.005/hr under Free Tier).
   - If approved, apply the infrastructure from `terraform/`:
     ```powershell
     cd C:\Users\anika\OneDrive\Desktop\DevSec\terraform
     terraform apply -auto-approve
     ```
   - When finished with evaluation, tear down immediately:
     ```powershell
     terraform destroy -auto-approve
     ```

