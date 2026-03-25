const handler = require("../app/handlers/processUploadedFile").handler;

// Mock DB
jest.mock("../app/services/dynamodbClient", () => ({
  send: jest.fn().mockResolvedValue({}),
}));

(async () => {
  console.log("Running S3 event test...");

  const event = require("../events/s3-put.json");

  await handler(event);

  console.log("S3 event processed successfully");
})();