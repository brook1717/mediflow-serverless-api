const handler = require("../app/handlers/processUploadedFile").handler;

// Mock DB
jest.mock("../app/services/dynamodbClient", () => ({
  send: jest.fn().mockResolvedValue({}),
}));

describe("S3 Upload Processing", () => {
  test("should process an uploaded file successfully", async () => {
    const event = require("../events/s3-put.json");

    await expect(handler(event)).resolves.not.toThrow();
  });
});