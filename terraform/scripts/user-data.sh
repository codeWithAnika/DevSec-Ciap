#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/examflow-bootstrap.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "ExamFlow EC2 Cloud-Init Bootstrap Starting"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=========================================="

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confold"

# 2. Install prerequisites, Docker, and AWS CLI v2
apt-get install -y ca-certificates curl gnupg lsb-release unzip

# Install official Docker CE repository
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

UBUNTU_CODENAME=$(lsb_release -cs)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $UBUNTU_CODENAME stable" > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io

systemctl enable docker
systemctl start docker

# Install AWS CLI v2 if not already present
if ! command -v aws &> /dev/null; then
  echo "Installing AWS CLI v2..."
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
fi

# 3. Resolve metadata and region via IMDSv2
IMDS_TOKEN=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
AWS_REGION=$(curl -s -S -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" "http://169.254.169.254/latest/meta-data/placement/region")

echo "Detected AWS Region: $AWS_REGION"
echo "Target Public ECR Repository: ${public_image_repository}"
echo "Target Image Tag: ${image_tag}"
echo "Host Port: ${app_port}"

# 4. Pull and run the ExamFlow container from Amazon ECR Public (no authentication required)
FULL_IMAGE="${public_image_repository}:${image_tag}"
echo "Pulling public container image: $FULL_IMAGE"

if ! docker pull "$FULL_IMAGE"; then
  echo "ERROR: Failed to pull public container image $FULL_IMAGE." >&2
  echo "Diagnostics: Check internet connectivity and ensure the repository and tag exist." >&2
  exit 1
fi

echo "Stopping any existing container..."
docker rm -f examflow-portal || true

echo "Starting ExamFlow container on port ${app_port}:80..."
if ! docker run -d \
  --name examflow-portal \
  --restart unless-stopped \
  -p "${app_port}:80" \
  "$FULL_IMAGE"; then
  echo "ERROR: Failed to start examflow-portal container with image $FULL_IMAGE." >&2
  docker logs --tail 50 examflow-portal 2>/dev/null || true
  exit 1
fi

# 5. Verify local loopback response
sleep 3
if curl -fsSL -o /dev/null "http://127.0.0.1:${app_port}/"; then
  echo "ExamFlow application container is healthy and responding with HTTP 200 on port ${app_port}!"
else
  echo "WARNING: Loopback health check did not return HTTP 200. Diagnostic container logs:"
  docker logs --tail 20 examflow-portal || true
fi

echo "=========================================="
echo "ExamFlow EC2 Cloud-Init Bootstrap Complete"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=========================================="
