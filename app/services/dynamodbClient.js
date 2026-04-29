const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

AWSXRay.setContextMissingStrategy("LOG_ERROR");

const client = AWSXRay.captureAWSv3Client(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
  })
);

const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;