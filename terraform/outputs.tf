output "public_image_uri" {
  description = "Full URI of the Amazon ECR Public container image deployed to EC2"
  value       = "${var.public_image_repository}:${var.ecr_image_tag}"
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.web.id
}

output "ec2_public_ip" {
  description = "Public IPv4 address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "application_url" {
  description = "HTTP URL to access the deployed ExamFlow application"
  value       = "http://${aws_instance.web.public_ip}:${var.app_port}/"
}

output "authorized_ip_cidr" {
  description = "Authorized IPv4 CIDR configured for restricted access"
  value       = var.authorized_ip_cidr
}

output "aws_region" {
  description = "AWS region of deployment"
  value       = var.aws_region
}
