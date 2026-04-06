terraform {
  backend "s3" {
    bucket         = "mediflow-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "mediflow-terraform-lock"
    encrypt        = true
  }
}