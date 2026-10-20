output "ecr_repository_url" {
  description = "URL of the Amazon ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_registry_id" {
  description = "The registry ID where the repository was created"
  value       = aws_ecr_repository.app.registry_id
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
