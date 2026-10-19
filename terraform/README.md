# ExamFlow — AWS ECR & EC2 Cloud Deployment Architecture (Terraform)

**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Project:** Equivalence Class and Special Value Testing of an Online Examination System  

---

## 1. Architectural Overview

```
                                +--------------------------------------------+
                                |               AWS Cloud                    |
                                |                                            |
[Developer / CI Pipeline]       |   +------------------------------------+   |
       │                        |   |      Amazon ECR Repository         |   |
       │ 1. docker push         |   |   (examflow-devsecops-ciap:1.2)    |   |
       └────────────────────────┼──>|   - AES-256 Encrypted              |   |
                                |   |   - Scan-on-push enabled           |   |
                                |   +-----------------+------------------+   |
                                |                     │                      |
                                |                     │ 2. IAM Instance Role |
                                |                     │    Pull Image        |
                                |                     v                      |
                                |   +------------------------------------+   |
                                |   |         Ubuntu 22.04 LTS           |   |
                                |   |      EC2 Host (t3.micro)           |   |
                                |   |                                    |   |
                                |   |   Docker Engine                    |   |
                                |   |   +----------------------------+   |   |
                                |   |   | examflow-portal (Nginx)    |   |   |
                                |   |   | Port 80:80                 |   |   |
                                |   |   +----------------------------+   |   |
                                |   |   - IMDSv2 Enforced            |   |   |
                                |   |   - 20 GB gp3 Encrypted EBS    |   |   |
                                |   |   - AWS SSM Managed Core       |   |   |
                                |   +-----------------+------------------+   |
                                |                     ^                      |
                                +─────────────────────┼──────────────────────+
                                                      │
[Student / Examiner Web Browser]                      │ 3. HTTP Port 80
──────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure as Code (IaC) Components

| Component | Resource Type | Purpose / Security Control |
| :--- | :--- | :--- |
| **Amazon ECR** | `aws_ecr_repository` | Private container registry with AES256 encryption, scan-on-push, and lifecycle policy (max 5 images). |
| **EC2 Host** | `aws_instance` | Ubuntu 22.04 LTS running Docker, bootstrapped via cloud-init `user-data.sh`. |
| **IAM Instance Role** | `aws_iam_role` | Grants least-privilege `AmazonEC2ContainerRegistryReadOnly` and `AmazonSSMManagedInstanceCore`. |
| **Security Group** | `aws_security_group` | Allows inbound HTTP (port 80) for evaluation; denies SSH by default (SSM preferred). |
| **EBS Storage** | `root_block_device` | 20 GB gp3 volume encrypted at rest. |

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Configure AWS Credentials Securely
Configure temporary credentials via AWS IAM Identity Center or AWS CLI:
```powershell
aws configure
# Or using SSO:
aws sso login --profile devsec-student
```
Verify authentication:
```powershell
aws sts get-caller-identity
```

### Step 2: Build and Push Docker Image to ECR
1. Create or confirm the ECR repository via Terraform:
   ```bash
   terraform init
   terraform apply -target=aws_ecr_repository.app
   ```
2. Authenticate local Docker to ECR:
   ```powershell
   $AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
   $AWS_REGION = "ap-south-1"
   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
   ```
3. Tag and push the verified, vulnerability-free image:
   ```powershell
   docker tag devsec-online-exam:1.2 "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/examflow-devsecops-ciap:1.2"
   docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/examflow-devsecops-ciap:1.2"
   ```

### Step 3: Deploy the EC2 Host
Review and apply the full Terraform execution plan:
```bash
terraform plan
terraform apply -auto-approve
```
Retrieve the live deployment outputs:
```bash
terraform output application_url
```

---

## 4. Cost Analysis & Resource Estimates

| Resource | Free Tier Status | Estimated Monthly Cost | Cost Drivers & Mitigations |
| :--- | :--- | :--- | :--- |
| **EC2 `t3.micro`** | 750 hrs/month free for 12 months | \$0.00 (within Free Tier) / ~\$7.50/mo | Stop or terminate instance after lab verification. |
| **EBS 20 GB gp3** | 30 GB/month free | \$0.00 (within Free Tier) / ~\$1.60/mo | Volume is deleted on termination (`delete_on_termination = true`). |
| **ECR Storage** | 500 MB/month private free | \$0.00 (< 60 MB image) | Managed by lifecycle policy (expires beyond 5 images). |
| **Public IPv4** | \$0.005/hr (~\$3.60/mo) | ~\$0.005 / hour while running | Release or terminate promptly after evaluation. |

---

## 5. Teardown & Safe Resource Cleanup

To prevent recurring charges, execute:
```bash
terraform destroy -auto-approve
```
This safely removes:
- The EC2 instance and associated encrypted EBS root volume.
- The Security Group and IAM instance profile.
- The ECR repository and uploaded image layers.
