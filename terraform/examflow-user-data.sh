#!/bin/bash
set -eux
exec > >(tee -a /var/log/examflow-setup.log) 2>&1

apt-get update
apt-get install -y docker.io
systemctl enable --now docker

docker pull public.ecr.aws/u2v8m6a3/examflow:1.0

docker rm -f examflow 2>/dev/null || true
docker run -d \
  --name examflow \
  --restart unless-stopped \
  -p 8080:80 \
  public.ecr.aws/u2v8m6a3/examflow:1.0
