resource "aws_apigatewayv2_api" "api" {
  name          = "mediflow-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_authorizer" "jwt_authorizer" {
  api_id          = aws_apigatewayv2_api.api.id
  name            = "cognito-authorizer"
  authorizer_type = "JWT"

  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = ["example-client-id"]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/example-pool-id"
  }
}