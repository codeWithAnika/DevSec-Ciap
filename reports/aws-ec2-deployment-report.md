# AWS EC2 Cloud Host Deployment Specification Report

**Project Name:** ExamFlow — Online Examination System  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Instance Type:** `t3.micro` (AWS Free Tier eligible)  
**Operating System:** Ubuntu 22.04 LTS (HVM, SSD, amd64)  
**Target Region:** `ap-south-1`  
**Date of Report:** October 20, 2026  

---

## 1. Instance Configuration & Hardening

| Parameter | Specification | Purpose / DevSecOps Security Standard |
| :--- | :--- | :--- |
| **Compute Type** | `t3.micro` (2 vCPU, 1 GiB RAM) | Minimizes cloud expenditure; eligible for AWS Free Tier. |
| **Operating System** | Ubuntu 22.04 Jammy LTS | Officially supported Long Term Support release from Canonical. |
| **Root Volume** | 20 GiB gp3 EBS | Encrypted at rest; deleted on termination (`delete_on_termination = true`). |
| **Metadata Protection** | IMDSv2 Enforced (`http_tokens = required`) | Prevents SSRF attacks from accessing instance credentials. |
| **IAM Instance Profile** | `examflow-ec2-profile` | Grants read-only pull permissions to ECR and AWS Systems Manager connectivity. |

---

## 2. Automated Bootstrap Process (`user-data.sh`)

Upon initial instance launch, cloud-init executes [`terraform/scripts/user-data.sh`](../terraform/scripts/user-data.sh):

1. **System Update:** Runs `apt-get update` and upgrades base system packages.
2. **Container Engine Installation:** Installs official Docker CE and enables the systemd service.
3. **AWS CLI v2 Installation:** Installs official AWS CLI to handle ECR credential helper interactions.
4. **Metadata Discovery:** Uses IMDSv2 to resolve the current AWS region dynamically.
5. **Private ECR Authentication:** Calls `aws ecr get-login-password` using the attached IAM instance role.
6. **Container Startup:** Executes `docker run -d --name examflow-portal --restart unless-stopped -p 80:80 <ECR_IMAGE_URI>:<TAG>`.
7. **Health Verification:** Verifies local HTTP 200 response on `http://127.0.0.1:80/` and logs execution to `/var/log/examflow-bootstrap.log`.

---

## 3. Remote Verification & Troubleshooting Commands

Once applied via Terraform, administrators can verify the live deployment:

```bash
# 1. Inspect public application endpoint
curl -I http://<EC2_PUBLIC_IP>/

# 2. Connect securely without opening SSH port 22 (via AWS SSM)
aws ssm start-session --target <EC2_INSTANCE_ID> --region ap-south-1

# 3. Inside the instance, inspect cloud-init logs
cat /var/log/examflow-bootstrap.log

# 4. Inspect running Docker container
docker ps
docker logs examflow-portal
```

---

## 4. Current Status

- **Terraform Configuration:** Validated and ready in `terraform/main.tf`.
- **AWS Deployment Status:** Awaiting student AWS credentials configuration and explicit approval before applying.
