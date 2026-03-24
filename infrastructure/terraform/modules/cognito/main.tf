resource "aws_cognito_user_pool" "this" {
  name = "mediflow-user-pool"
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "mediflow-client"
  user_pool_id = aws_cognito_user_pool.this.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}