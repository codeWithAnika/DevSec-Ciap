# Terraform Cloud Infrastructure Deployment Report

**Project Name:** ExamFlow — Online Examination System  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Deployment Tool:** Terraform v1.16.6 on Linux/amd64 (via Docker container)  
**AWS Provider:** `hashicorp/aws` v5.100.0  
**Target Region:** `ap-south-1` (Mumbai)  
**Date of Report:** October 20, 2026  

---

## 1. Executive Summary

This report documents the Infrastructure as Code (IaC) design, syntax formatting, module initialization, and configuration validation for the automated cloud deployment of ExamFlow to Amazon Web Services (AWS).

The deployment architecture provisions an encrypted private **Amazon Elastic Container Registry (ECR)** to store verified Docker container images, alongside an **Ubuntu 22.04 LTS EC2 Host** (`t3.micro`) configured with Docker and automated cloud-init bootstrap to pull and run the application.

---

## 2. Terraform Codebase Structure (`terraform/`)

The following modular files were constructed in `terraform/`:

| File Name | Purpose & Implementation Details |
| :--- | :--- |
| [`versions.tf`](../terraform/versions.tf) | Declares Terraform `>= 1.5.0` requirement and pins the `hashicorp/aws` provider to `~> 5.0`. |
| [`variables.tf`](../terraform/variables.tf) | Parameterizes AWS region, project identifiers, EC2 instance type (`t3.micro`), port (`80`), and security settings. |
| [`main.tf`](../terraform/main.tf) | Provisions the ECR repository, EC2 instance, IAM role, security group, and IMDSv2 configuration. |
| [`outputs.tf`](../terraform/outputs.tf) | Exports ECR repository URL, instance ID, public IP, and application access URL. |
| [`terraform.tfvars.example`](../terraform/terraform.tfvars.example) | Safe, uncommitted template with sample parameter values. |
| [`scripts/user-data.sh`](../terraform/scripts/user-data.sh) | Cloud-init shell script installing Docker, authenticating to ECR via instance IAM role, and running the container. |
| [`README.md`](../terraform/README.md) | Comprehensive architecture guide, deployment instructions, and cost analysis. |

---

## 3. Terraform Validation Results

### 3.1 Code Formatting (`terraform fmt -check`):
```text
Exit Code: 0 (All Terraform files comply strictly with canonical HCL formatting standards).
```

### 3.2 Provider Initialization (`terraform init -backend=false`):
```text
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.100.0...
- Installed hashicorp/aws v5.100.0 (signed by HashiCorp)

Terraform has been successfully initialized!
```

### 3.3 Configuration Validation (`terraform validate`):
```text
Success! The configuration is valid.
```

---

## 4. Security Controls & Best Practices

1. **Least-Privilege IAM Authentication:** The EC2 host does not store AWS Access Keys. It authenticates to ECR via an attached IAM Role with the managed policy `AmazonEC2ContainerRegistryReadOnly`.
2. **Keyless Administration via AWS SSM:** Attached `AmazonSSMManagedInstanceCore` allows administrators to connect to the EC2 terminal using AWS Systems Manager Session Manager, eliminating the need to expose SSH port 22 to `0.0.0.0/0`.
3. **IMDSv2 Enforced:** Instance metadata options require tokens (`http_tokens = "required"`, hop limit: 1) to prevent SSRF credential theft.
4. **Encrypted Storage:** The 20 GB gp3 root volume is encrypted at rest using default AWS KMS encryption.
5. **Private Image Lifecycle:** ECR is configured with scan-on-push and a lifecycle rule expiring all but the 5 latest image layers to avoid storage bloat.

---

## 5. Deployment Checkpoint & Current AWS Status

- **AWS CLI:** Installed (`aws-cli/2.37.4 Python/3.14.6 Windows/11`).
- **AWS Authentication Status:** Unauthenticated (`aws: [ERROR]: An error occurred (NoCredentials)`).
- **Compliance Rule 11 Checkpoint:** Per project rules, no chargeable cloud resources are created until AWS credentials are provided and the resource plan has received explicit student approval.
