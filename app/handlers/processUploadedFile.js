const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../services/dynamodbClient");
const { withEventMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const TABLE_NAME = process.env.TABLE_NAME || "ItemsTable";

const handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

  const item = {
    id: key,
    bucket,
    key,
    processedAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  logger.info("File processed", { item });
};

exports.handler = withEventMiddleware(handler);