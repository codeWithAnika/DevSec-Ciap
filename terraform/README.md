# ExamFlow — AWS Public ECR & EC2 Cloud Deployment Architecture (Terraform)

**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Project:** Equivalence Class and Special Value Testing of an Online Examination System  

---

## 1. Architectural Overview

```
                                +--------------------------------------------+
                                |               AWS Cloud                    |
                                |                                            |
[Existing Public ECR]           |   +------------------------------------+   |
(public.ecr.aws/u2v8m6a3/       |   |      Amazon ECR Public Repository  |   |
 examflow:1.0)                  |   |   (public.ecr.aws/u2v8m6a3/        |   |
                                |   |    examflow:1.0)                   |   |
                                |   |   - Unauthenticated public pull    |   |
                                |   +-----------------+------------------+   |
                                |                     │                      |
                                |                     │ 1. Docker Pull Image |
                                |                     │    (No ECR login)    |
                                |                     v                      |
                                |   +------------------------------------+   |
                                |   |         Ubuntu 22.04 LTS           |   |
                                |   |      EC2 Host (t3.micro)           |   |
                                |   |                                    |   |
                                |   |   Docker Engine                    |   |
                                |   |   +----------------------------+   |   |
                                |   |   | examflow-portal (Nginx)    |   |   |
                                |   |   | Port 8080:80               |   |   |
                                |   |   +----------------------------+   |   |
                                |   |   - IMDSv2 Enforced            |   |   |
                                |   |   - 20 GB gp3 Encrypted EBS    |   |   |
                                |   |   - AWS SSM Managed Core       |   |   |
                                |   +-----------------+------------------+   |
                                |                     ^                      |
                                +─────────────────────┼──────────────────────+
                                                      │
[Student / Examiner Web Browser]                      │ 2. HTTP Port 8080 (Restricted to Authorized IP)
──────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure as Code (IaC) Components

| Component | Resource Type | Purpose / Security Control |
| :--- | :--- | :--- |
| **Public Container Image** | Amazon ECR Public | Pre-existing public repository `public.ecr.aws/u2v8m6a3/examflow:1.0`. No private ECR repository creation needed. |
| **EC2 Host** | `aws_instance` | Ubuntu 22.04 LTS running Docker, bootstrapped via cloud-init `user-data.sh`. |
| **IAM Instance Role** | `aws_iam_role` | Grants least-privilege `AmazonSSMManagedInstanceCore` and optional ECR read-only policy. |
| **Security Group** | `aws_security_group` | Restricts inbound HTTP (port 8080) to authorized IP (`49.43.24.82/32`) by default; denies SSH by default (SSM preferred). |
| **EBS Storage** | `root_block_device` | 20 GB gp3 volume encrypted at rest. |

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Configure AWS Credentials Securely
Configure temporary credentials via AWS IAM Identity Center or AWS CLI:
```powershell
aws configure
```
Verify authentication:
```powershell
aws sts get-caller-identity
```

### Step 2: Deploy the EC2 Host
Review and apply the Terraform execution plan:
```bash
terraform plan
terraform apply
```
Retrieve the live deployment outputs:
```bash
terraform output application_url
terraform output public_image_uri
```

---

## 4. Cost Analysis & Resource Estimates

| Resource | Free Tier Status | Estimated Monthly Cost | Cost Drivers & Mitigations |
| :--- | :--- | :--- | :--- |
| **EC2 `t3.micro`** | 750 hrs/month free for 12 months | \$0.00 (within Free Tier) / ~\$7.50/mo | Stop or terminate instance after lab verification. |
| **EBS 20 GB gp3** | 30 GB/month free | \$0.00 (within Free Tier) / ~\$1.60/mo | Volume is deleted on termination (`delete_on_termination = true`). |
| **ECR Storage** | Public ECR (0 AWS storage charge to your account) | \$0.00 | Uses public image `public.ecr.aws/u2v8m6a3/examflow:1.0`. |
| **Public IPv4** | \$0.005/hr (~\$3.60/mo) | ~\$0.005 / hour while running | Release or terminate promptly after evaluation. |

---

## 5. Teardown & Safe Resource Cleanup

To prevent recurring charges, execute:
```bash
terraform destroy
```
This safely removes:
- The EC2 instance and associated encrypted EBS root volume.
- The Security Group and IAM instance profile.
