# AWS Resource Cost Estimation and Safe Cleanup Protocol

**Project Name:** ExamFlow — Online Examination System  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Deployment Region:** `ap-south-1` (Mumbai)  
**Date of Report:** October 20, 2026  

---

## 1. Projected AWS Cloud Cost Analysis

To ensure complete cost transparency and prevent unexpected charges, all resources requested by the Terraform configuration have been cost-analyzed for the `ap-south-1` region:

| AWS Resource | Proposed Configuration | AWS Free Tier Coverage | Standard On-Demand Rate (ap-south-1) | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- | :--- |
| **EC2 Compute** | 1 x `t3.micro` (2 vCPU, 1 GiB) | **750 hours/month free** for new accounts (12 months) | \$0.0104 per hour | **\$0.00** (Free Tier) / ~\$7.50/mo |
| **EBS Storage** | 20 GiB gp3 root volume | **30 GiB/month free** (gp2/gp3) | \$0.08 per GiB-month | **\$0.00** (Free Tier) / ~\$1.60/mo |
| **Public IPv4 Address** | 1 x Auto-assigned public IP | *Not covered under Free Tier* | \$0.005 per hour | **~\$0.12 for 24-hr test** / ~\$3.60/mo |
| **Amazon ECR Storage** | 1 repository (~60 MiB compressed) | **500 MB/month free** private storage | \$0.10 per GB-month | **\$0.00** (< 60 MiB) |
| **Data Transfer** | Ingress free, < 1 GB egress | **100 GB/month free** internet egress | \$0.109 per GB | **\$0.00** |

> **Cost Summary:**
> - If operating within the AWS Free Tier, the sole non-free charge is the standard AWS public IPv4 address fee of **\$0.005 per hour** (~₹0.42/hour).
> - For a typical 2-hour demonstration and grading evaluation, total incurred cloud cost is **less than \$0.02 (under ₹2.00 INR)**.
> - For non-Free-Tier accounts, total running cost is approximately **\$0.0154 per hour** (~₹1.30/hour).

---

## 2. Mandatory Approval Checkpoint

In accordance with Operating Rule 11:
- No AWS infrastructure has been created yet.
- The Terraform configuration and automated scripts have been formatted, initialized, and validated locally.
- The student must provide explicit approval before `terraform apply` is executed.

---

## 3. Safe Teardown and Cleanup Instructions

To completely deprovision all cloud resources and stop all billing:

### Method 1: Using Terraform (Recommended)
From the `terraform/` directory:
```bash
terraform destroy -auto-approve
```

### Verification via AWS CLI:
Verify that all resources have been cleanly removed:
```powershell
# 1. Verify no running EC2 instances exist for ExamFlow
aws ec2 describe-instances --filters "Name=tag:Project,Values=examflow" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].[InstanceId,State.Name]" --output table

# 2. Verify Security Group is deleted
aws ec2 describe-security-groups --group-names "examflow-web-sg" --output table

# 3. Verify ECR repository is deleted (if deleted by terraform destroy)
aws ecr describe-repositories --repository-names "examflow-devsecops-ciap"
```
