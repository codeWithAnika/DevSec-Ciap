provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Course      = "DevSecOps-Lab-CO5"
      Student     = "124BTCS1036-Anika-Talavadekar"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical official Ubuntu owner ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 1. Elastic Container Registry (ECR) for ExamFlow Docker Image
resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Retain only the last 5 untagged/tagged deployment images to control storage costs"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# 2. IAM Role and Instance Profile for EC2 Host (Least-Privilege Security)
resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

# Attach read-only ECR pull permission (least privilege)
resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Attach AWS SSM Managed Core policy (secure terminal access via Session Manager without public SSH)
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# 3. Security Group for ExamFlow Web Server
resource "aws_security_group" "app" {
  name        = "${var.project_name}-web-sg"
  description = "Security group for ExamFlow web portal container instance"
  vpc_id      = data.aws_vpc.default.id

  # Application HTTP Ingress: restricted to authorized IP by default, or 0.0.0.0/0 if public access is enabled
  ingress {
    description = var.enable_public_http ? "Public HTTP access to ExamFlow web portal" : "ExamFlow HTTP access from authorized IP"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = var.enable_public_http ? ["0.0.0.0/0"] : [var.authorized_ip_cidr]
  }

  # Optional SSH Ingress (Restricted to explicit CIDR; AWS SSM is preferred)
  dynamic "ingress" {
    for_each = var.ssh_allowed_cidr != null ? [var.ssh_allowed_cidr] : []

    content {
      description = "Administrative SSH access restricted to authorized IP"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  # Outbound Egress (Required for apt updates, Docker Hub packages, and ECR pulls)
  egress {
    description = "Allow all outbound traffic for updates and image pulls"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
  }
}

# 4. Ubuntu EC2 Instance Hosting the ExamFlow Docker Container
resource "aws_instance" "web" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  vpc_security_group_ids      = [aws_security_group.app.id]
  associate_public_ip_address = true

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    encrypted             = true
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/scripts/user-data.sh", {
    ecr_registry   = split("/", aws_ecr_repository.app.repository_url)[0]
    ecr_repository = aws_ecr_repository.app.name
    image_tag      = var.ecr_image_tag
    app_port       = var.app_port
  })

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Enforce IMDSv2
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${var.project_name}-web-host"
  }

  depends_on = [
    aws_ecr_repository.app,
    aws_iam_role_policy_attachment.ecr_readonly,
    aws_iam_role_policy_attachment.ssm_core
  ]
}
