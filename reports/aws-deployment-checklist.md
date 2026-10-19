# ExamFlow DevSecOps CIAP — AWS Deployment & Verification Checklist

**Project:** ExamFlow — Equivalence Class and Special Value Testing of an Online Examination System  
**Student:** Anika Vinit Talavadekar (`124BTCS1036`)  
**Course & Outcome:** DevSecOps Lab — CIAP Microproject (CO5, SDG 4: Quality Education)  
**Target AWS Region:** `ap-south-1` (Asia Pacific — Mumbai)  
**Host Application Port:** `8080` (Container internal: `80`)  
**Docker Image Tag:** `devsec-online-exam:1.2` / `examflow:6`  
**Git Commit Baseline:** `4018cdda8f415bcbe5eb4e8e2d0b82be60675d54`  
**Last Updated:** 2026-10-20T01:20:00+05:30  

---

## 1. Implementation & Verification Matrix

| Phase | Description | Status | Evidence & Verification Reference |
|---|---|:---:|---|
| **Phase A** | Environment & Baseline Inspection | **COMPLETED** | Git HEAD matches `origin/main` at `4018cdd`. Clean working tree. Docker containers running on ports 8080, 8081, 9000. |
| **Phase B** | Local Tooling & AWS CLI Diagnosis | **IN PROGRESS (Action Needed)** | AWS CLI v2.37.4 verified with `aws login` support. Terraform v1.16.6 installed and verified via winget. Awaiting browser `aws login`. |
| **Phase C** | Application Validation & Unit Tests | **COMPLETED** | 41/41 unit tests passed across 6 test suites (`npm test` in 265ms). Local HTTP probes return 200 OK for HTML and JS assets. |
| **Phase D** | Trivy Container Security Gate | **COMPLETED** | Clean Trivy scans: 0 vulnerabilities across 71 Alpine packages (`reports/trivy-devsec-online-exam-1.2.json`, `reports/trivy-examflow-6.json`). |
| **Phase E** | SonarQube SAST Analysis | **DOCUMENTED** | SonarQube Community 26.10.0 live on 127.0.0.1:9000. Project `ExamFlow` configured with 100% test coverage and 0 security hotspots. |
| **Phase F** | Jenkins CI/CD Automation | **COMPLETED** | Jenkins Build #6 verified SUCCESS (54s). Pipeline automatically checks out Git, tests, builds Docker image, executes Trivy, and archives JUnit reports. |
| **Phase G** | Amazon ECR Image Registry | **PENDING AWS AUTH** | Code configured in `terraform/main.tf` (`aws_ecr_repository.app`). ECR docker login and image push commands prepared. |
| **Phase H** | Terraform Ubuntu EC2 IaC | **COMPLETED (Validated)** | Terraform configuration formatted (`fmt -check`), initialized (`v5.100.0` AWS provider), and validated (`terraform validate` returned SUCCESS). Port updated to `8080`. |
| **Phase I** | Live EC2 Cloud Deployment | **PAUSED (Rule 11 Checkpoint)** | Awaiting student AWS authorization and explicit deployment approval before running `terraform plan` / `terraform apply`. |
| **Phase J** | Academic Documentation & Reports | **COMPLETED / UPDATED** | Final submission report, checklist, Jenkins evidence, and deployment procedures documented in `reports/`. |
| **Phase K** | Git Repository Synchronization | **COMPLETED** | Local HEAD and `origin/main` synchronized. No uncommitted secrets or credentials. |
| **Phase L** | Cost Control & Deprovisioning Plan | **READY** | Estimated runtime cost: ~$0.01 for 2 hours (t3.micro). Automated `terraform destroy` cleanup plan prepared. |

---

## 2. Phase-by-Phase Technical Evidence

### Phase A: Baseline Inspection
- **Git Commit:** `4018cdda8f415bcbe5eb4e8e2d0b82be60675d54` (synchronized with `origin/main`).
- **Containers Active:**
  - `devsec-exam-portal`: Nginx 1.30.6 serving ExamFlow on `0.0.0.0:8080->80/tcp` (healthy).
  - `examflow-jenkins`: Jenkins 2.580.1 on `0.0.0.0:8081->8080/tcp`.
  - `examflow-sonarqube`: SonarQube Community 26.10.0 on `127.0.0.1:9000->9000/tcp`.
- **Directory Structure:** All project assets (`src/`, `tests/`, `terraform/`, `reports/`) intact.

### Phase B: Local Tooling & Authentication
- **Terraform:** HashiCorp Terraform `v1.16.6` installed via Microsoft winget at `C:\Users\anika\AppData\Local\Microsoft\WinGet\Packages\Hashicorp.Terraform_Microsoft.Winget.Source_8wekyb3d8bbwe\terraform.exe` and added to User PATH.
- **AWS CLI:** Version `2.37.4` verified.
- **AWS Login Support:** Verified `aws login` command is natively available in AWS CLI v2.37.4, enabling seamless browser console session pairing without managing static IAM user secret access keys.

### Phase C: Application & Test Suite
- Automated unit test execution:
  - 6 suites, 41 tests, 0 failures, 0 skipped.
  - Duration: 265ms.
- Asset verification on local port 8080:
  - `GET /` -> HTTP 200 OK (`text/html`, 12,421 bytes).
  - `GET /js/validator.js` -> HTTP 200 OK (`application/javascript`, 10,395 bytes).

### Phase D: Vulnerability Management
- Container base image upgraded with `RUN apk update && apk upgrade --no-cache`.
- Trivy scan verified:
  - Image: `devsec-online-exam:1.2` (ID: `4548f49ac02f`).
  - Total vulnerabilities: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0).
  - Exit code: 0 with `--severity HIGH,CRITICAL --exit-code 1`.

### Phase H: Infrastructure as Code (Terraform)
- **Directory:** `terraform/`
- **Provider:** `hashicorp/aws` v5.100.0 (Windows and Linux plugin packages cached).
- **Format:** `terraform fmt -check` passed.
- **Validation:** `terraform validate` returned `Success! The configuration is valid.`
- **Security Guardrails Configured:**
  - `http_tokens = "required"` (Enforces IMDSv2).
  - EBS root volume: 20 GB `gp3`, encrypted (`encrypted = true`), `delete_on_termination = true`.
  - Security Group: Ingress restricted to port `8080` (HTTP) from `0.0.0.0/0`.
  - SSH port 22: Disabled by default (`ssh_allowed_cidr = null`); AWS Systems Manager (SSM Session Manager) used for secure terminal access via `AmazonSSMManagedInstanceCore`.
  - IAM Instance Profile: Minimal read-only ECR access (`AmazonEC2ContainerRegistryReadOnly`).
  - Bootstrapping: Automated in `scripts/user-data.sh` using official Docker CE and AWS CLI v2.

---

## 3. Immediate Action Required

To authenticate your AWS environment for ECR and EC2 deployment:
1. Open PowerShell in `C:\Users\anika\OneDrive\Desktop\DevSec`.
2. Run:
   ```powershell
   aws login --region ap-south-1
   ```
3. A browser tab will open to link with your active AWS Management Console session in `ap-south-1`.
4. Confirm successful authentication with:
   ```powershell
   aws sts get-caller-identity
   ```
