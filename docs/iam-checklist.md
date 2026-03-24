# IAM Least Privilege Checklist

## Principles

- Grant only required actions
- Avoid wildcard (*) permissions
- Use resource-level permissions
- Separate roles per service

## Lambda Permissions

### DynamoDB
- dynamodb:PutItem
- dynamodb:GetItem

### S3 (later)
- s3:PutObject
- s3:GetObject

## Logging
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents

## Best Practices

- One role per Lambda
- No admin access
- Rotate credentials
- Use environment variables securely