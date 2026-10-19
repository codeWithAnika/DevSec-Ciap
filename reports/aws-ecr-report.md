# Amazon ECR Registry Configuration & Specification Report

**Project Name:** ExamFlow — Online Examination System  
**Course:** DevSecOps Lab (CO5, SDG 4)  
**Student:** Talavadekar Anika Vinit (`124BTCS1036`)  
**Repository Name:** `examflow-devsecops-ciap`  
**Target Region:** `ap-south-1`  
**Date of Report:** October 20, 2026  

---

## 1. Registry Specifications

The Amazon Elastic Container Registry (ECR) for ExamFlow is configured via Terraform with production DevSecOps controls:

| Configuration Property | Value | Security / Operational Rationale |
| :--- | :--- | :--- |
| **Repository Name** | `examflow-devsecops-ciap` | Namespaced to prevent collision with other projects. |
| **Image Tag Mutability** | `MUTABLE` | Enables release tagging (`1.2`, `latest`, `build-number`). |
| **At-Rest Encryption** | `AES256` | KMS-managed server-side encryption for stored container layers. |
| **Vulnerability Scanning** | `scan_on_push = true` | Automatically triggers AWS Inspector vulnerability scan upon every push. |
| **Lifecycle Policy** | `expire after 5 images` | Prevents unnecessary accumulation of obsolete image layers and controls storage costs. |

---

## 2. Local Container Image Baseline

The image to be published to ECR has been verified locally:
- **Local Tag:** `devsec-online-exam:1.2`
- **Base OS:** Alpine Linux 3.24.2
- **Trivy Vulnerability Scan:** **0 Vulnerabilities** (0 Low, 0 Medium, 0 High, 0 Critical)
- **Unit Test Suite:** 41/41 passing tests across 6 test suites
- **HTTP Endpoints:** Verified serving HTTP 200 on all static routes

---

## 3. Verified Commands to Push to ECR

Once AWS credentials are authenticated in PowerShell:

```powershell
# 1. Resolve Account ID and ECR URI
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$REGION = "ap-south-1"
$ECR_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/examflow-devsecops-ciap"

# 2. Authenticate Docker Engine to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# 3. Tag Local Verified Image
docker tag devsec-online-exam:1.2 "$ECR_URI:1.2"
docker tag devsec-online-exam:1.2 "$ECR_URI:latest"

# 4. Push Image to ECR
docker push "$ECR_URI:1.2"
docker push "$ECR_URI:latest"

# 5. Confirm Image Digest
aws ecr describe-images --repository-name examflow-devsecops-ciap --region $REGION --query "imageDetails[*].[imageTags,imageDigest,imagePushedAt]" --output table
```

---

## 4. Current Status

- **Terraform Resource Definition:** Complete and validated in [`terraform/main.tf`](../terraform/main.tf).
- **AWS Authentication:** Pending interactive AWS login / credentials configuration by student.
