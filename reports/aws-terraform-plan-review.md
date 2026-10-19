# ExamFlow DevSecOps CIAP — AWS Infrastructure Plan & Security Review Report

**Project:** ExamFlow — Equivalence Class and Special Value Testing of an Online Examination System  
**Student:** Anika Vinit Talavadekar (`124BTCS1036`)  
**Course & Outcome:** DevSecOps Lab — CIAP Microproject (CO5, SDG 4: Quality Education)  
**Date & Time:** 2026-10-20T01:54:00+05:30  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Authenticated Identity:** `arn:aws:iam::494118670361:user/yatin-cli`  
**Account ID:** `494118670361`  
**Git Baseline Commit:** `47d50a5`  
**Terraform Version:** v1.16.6 (Windows AMD64)  
**AWS Provider Version:** hashicorp/aws v5.100.0  

---

## 1. Executive Summary

A fresh, non-destructive Terraform execution plan (`tfplan`) was generated successfully in `terraform/`.
- **Planned Actions:** **8 to add, 0 to change, 0 to destroy**.
- **Current Status:** **AWAITING USER APPROVAL & IAM POLICY PREREQUISITE**.
- Per Operating Rules and Project Safety Rules, `terraform apply` was **NOT** executed, no AWS resources were created, no images were pushed to ECR, and zero AWS charges were incurred.

---

## 2. Resource-by-Resource Execution Plan

| # | Terraform Resource | Type | Purpose & Security Configuration |
|---|-------------------|------|-----------------------------------|
| 1 | `aws_ecr_repository.app` | Amazon ECR | Private container repository named `examflow-devsecops-ciap`. Image scan-on-push enabled (`scan_on_push = true`), AES-256 server-side encryption enabled. |
| 2 | `aws_ecr_lifecycle_policy.cleanup` | ECR Lifecycle | Enforces retention rule expiring older images to keep only the last 5 deployment revisions, minimizing registry storage costs. |
| 3 | `aws_iam_role.ec2` | AWS IAM Role | EC2 assume-role trust relationship (`ec2.amazonaws.com`) for the web server instance. Avoids hardcoding long-lived AWS access keys on the instance. |
| 4 | `aws_iam_role_policy_attachment.ecr_readonly` | IAM Policy Attachment | Grants least-privilege read-only ECR access (`AmazonEC2ContainerRegistryReadOnly`) for pulling the `devsec-online-exam:1.2` image. |
| 5 | `aws_iam_role_policy_attachment.ssm_core` | IAM Policy Attachment | Grants AWS Systems Manager Session Manager access (`AmazonSSMManagedInstanceCore`) for remote administration without requiring open SSH ports. |
| 6 | `aws_iam_instance_profile.ec2` | IAM Instance Profile | Associates `examflow-ec2-role` with the EC2 instance host. |
| 7 | `aws_security_group.app` | EC2 Security Group | Named `examflow-web-sg` on default VPC `vpc-05ccabf69a7e13079`. Ingress: TCP port `8080` from `0.0.0.0/0`. Unrestricted SSH (`0.0.0.0/0:22`) is **completely disabled**. Outbound: all traffic allowed for system updates and Docker registry pulls. |
| 8 | `aws_instance.web` | EC2 Instance | Ubuntu 22.04 LTS (`ami-0644c826df601fd4f`), `t3.micro` architecture (x86_64). 20 GB gp3 encrypted root volume. IMDSv2 enforced (`http_tokens = "required"`, hop limit 1). Bootstraps Docker CE, authenticates to ECR, and starts the container on port `8080:80` with `--restart unless-stopped`. |

---

## 3. Planned Terraform Outputs

Upon successful `terraform apply`, Terraform will emit the following live endpoints:
- `application_url`: `http://<EC2_PUBLIC_IPV4>:8080/`
- `ec2_public_ip`: `<EC2_PUBLIC_IPV4>`
- `ec2_instance_id`: `i-<INSTANCE_ID>`
- `ecr_repository_url`: `494118670361.dkr.ecr.ap-south-1.amazonaws.com/examflow-devsecops-ciap`
- `ecr_registry_id`: `494118670361`
- `aws_region`: `ap-south-1`

---

## 4. Cost Estimation & Financial Guardrails

The deployment has been engineered to minimize AWS expenditure and fit within standard AWS Free Tier allocations:

| Service Component | Sizing & Specifications | Estimated Cost (2-Hour Demonstration) | Free Tier Eligibility |
|-------------------|-------------------------|--------------------------------------|-----------------------|
| **EC2 Compute** | `t3.micro` (2 vCPU, 1 GiB RAM) | ~$0.021 ($0.0104 / hour) | 750 hours/month free for 12 months |
| **Public IPv4 Address** | 1 Associated IPv4 | ~$0.010 ($0.005 / hour) | Not covered by Free Tier since Feb 2024 |
| **EBS Storage** | 20 GB gp3 SSD (Encrypted) | ~$0.005 ($0.096 / GB-month pro-rated) | Up to 30 GB/month free |
| **ECR Container Registry** | 1 Image (~112 MB) | < $0.001 ($0.10 / GB-month pro-rated) | 500 MB/month free |
| **Data Transfer Out** | < 100 MB for web assets | $0.000 | 100 GB/month free |
| **Total Estimated Cost** | **2-Hour Evaluation Window** | **~$0.02 – $0.04 USD** | Minimal temporary expenditure |

> [!TIP]
> Executing `terraform destroy -auto-approve` immediately following faculty review ensures that all hourly compute, storage, and IP address charges terminate completely.

---

## 5. Security & Risk Assessment

1. **Public Exposure on Port 8080:**
   - Ingress is open to `0.0.0.0/0` on TCP port 8080 to satisfy the faculty requirement for remote browser access.
   - **Risk:** Traffic is plain HTTP without TLS. The application is an educational client-side testing demonstration. No sensitive student passwords, real exam session data, or confidential academic records should be input on this public endpoint.
2. **Administrative Access (SSH Guardrail):**
   - Unrestricted SSH (`0.0.0.0/0` on port 22) is **not allowed**.
   - Remote access is handled through AWS Systems Manager Session Manager (SSM) via `AmazonSSMManagedInstanceCore`, requiring AWS IAM authentication rather than public key exchange on the open internet.
3. **Metadata Protection (SSRF Mitigation):**
   - Instance Metadata Service Version 2 (IMDSv2) is strictly enforced (`http_tokens = "required"`, `http_put_response_hop_limit = 1`). This blocks SSRF attacks attempting to harvest IAM role credentials.
4. **Least-Privilege ECR Permissions:**
   - The instance role is granted only `AmazonEC2ContainerRegistryReadOnly`, preventing any compromised workload on the host from modifying or deleting container images in the registry.

---

## 6. Permissions Audit & Findings

A read-only and dry-run check of the authenticated identity (`arn:aws:iam::494118670361:user/yatin-cli`) identified:

1. **EC2 Permissions (Verified):**
   - `ec2:Describe*` -> **PASS**
   - `ec2:CreateSecurityGroup` -> **PASS** (Dry-run confirmed)
   - `ec2:RunInstances` -> **PASS** (Dry-run confirmed)
2. **ECR & IAM Permissions (Action Required):**
   - `ecr:DescribeRepositories`, `ecr:DescribeImages`, `ecr:GetAuthorizationToken` -> **AccessDeniedException**
   - `iam:CreateRole`, `iam:CreateInstanceProfile` -> Untested in dry-run, but standard CLI queries returned `AccessDenied`.
   - **Remediation:** In the AWS Management Console, the administrator of account `494118670361` must ensure `yatin-cli` has the required policies to manage ECR and IAM roles (e.g. `AmazonEC2ContainerRegistryFullAccess` and IAM permissions to create `examflow*` roles), or create the ECR repository directly.

---

## 7. Artifact Safety & Version Control Protection

- Binary plan file `terraform/tfplan` was generated.
- `.gitignore` was updated with `*.tfplan`, `**/*.tfplan`, `tfplan`, and `**/tfplan` to guarantee that compiled plans and embedded environment tokens are **never** committed to Git.
- Working tree remains clean with zero exposed secrets.
