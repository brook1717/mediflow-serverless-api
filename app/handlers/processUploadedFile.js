const path = require("path");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../services/dynamodbClient");
const { moveObject } = require("../services/s3Service");
const { withEventMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const TABLE_NAME = process.env.TABLE_NAME || "ItemsTable";
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".pdf", ".tiff"];

const handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

  const ext = path.extname(key).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    logger.warn("Unsupported file type, moving to failed/", { key, ext });
    const failedKey = key.replace(/^uploads\//, "failed/");
    await moveObject(bucket, key, failedKey);
    return;
  }

  try {
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
  } catch (error) {
    logger.error("Processing failed, moving file to failed/", {
      key,
      errorMessage: error.message,
    });

    const failedKey = key.replace(/^uploads\//, "failed/");
    await moveObject(bucket, key, failedKey);

    throw error;
  }
};

exports.handler = withEventMiddleware(handler);