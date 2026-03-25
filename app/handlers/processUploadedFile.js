const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../services/dynamodbClient");

const TABLE_NAME = process.env.TABLE_NAME || "ItemsTable";

exports.handler = async (event) => {
  try {
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

    console.log("File processed:", item);
  } catch (error) {
    console.error("processUploadedFile error:", error);
    throw error;
  }
};