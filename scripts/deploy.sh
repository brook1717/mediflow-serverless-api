#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-dev}"
TF_DIR="infrastructure/terraform"

echo "==> Deploying environment: $ENVIRONMENT"

echo "==> Terraform init..."
terraform -chdir="$TF_DIR" init

echo "==> Terraform plan..."
terraform -chdir="$TF_DIR" plan -out=tfplan

echo "==> Terraform apply..."
terraform -chdir="$TF_DIR" apply tfplan

echo "==> Deployment complete."
