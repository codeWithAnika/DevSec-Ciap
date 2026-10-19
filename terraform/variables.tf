variable "aws_region" {
  description = "Target AWS region for deploying infrastructure"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project identifier for resource naming and tagging"
  type        = string
  default     = "examflow"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "devsecops-ciap"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is AWS Free Tier eligible in supported regions)"
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Host HTTP port on which the ExamFlow container will serve traffic"
  type        = number
  default     = 80
}

variable "ecr_image_tag" {
  description = "Immutable ECR container image tag to pull and run on the EC2 host"
  type        = string
  default     = "1.2"
}

variable "ssh_allowed_cidr" {
  description = "Optional CIDR block allowed for SSH access. Set to null to rely solely on AWS SSM Session Manager (recommended)."
  type        = string
  default     = null
}

variable "enable_public_http" {
  description = "Whether to create a Security Group rule allowing HTTP ingress on app_port from 0.0.0.0/0 for verification"
  type        = bool
  default     = true
}
