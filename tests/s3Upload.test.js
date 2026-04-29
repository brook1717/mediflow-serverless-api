const handler = require("../app/handlers/processUploadedFile").handler;
const db = require("../app/services/dynamodbClient");
const s3Service = require("../app/services/s3Service");

// Mock DB
jest.mock("../app/services/dynamodbClient", () => ({
  send: jest.fn().mockResolvedValue({}),
}));

// Mock S3 moveObject
jest.mock("../app/services/s3Service", () => ({
  ...jest.requireActual("../app/services/s3Service"),
  moveObject: jest.fn().mockResolvedValue({}),
}));

const makeEvent = (key) => ({
  Records: [{ s3: { bucket: { name: "mediflow-bucket" }, object: { key } } }],
});

describe("S3 Upload Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should process a supported file successfully", async () => {
    const event = makeEvent("uploads/report.pdf");

    await expect(handler(event)).resolves.not.toThrow();
    expect(db.send).toHaveBeenCalledTimes(1);
    expect(s3Service.moveObject).not.toHaveBeenCalled();
  });

  test("should move unsupported file type to failed/ prefix", async () => {
    const event = makeEvent("uploads/script.exe");

    await expect(handler(event)).resolves.not.toThrow();
    expect(db.send).not.toHaveBeenCalled();
    expect(s3Service.moveObject).toHaveBeenCalledWith(
      "mediflow-bucket",
      "uploads/script.exe",
      "failed/script.exe"
    );
  });

  test("should move file to failed/ and re-throw on DynamoDB error", async () => {
    db.send.mockRejectedValueOnce(new Error("DynamoDB timeout"));
    const event = makeEvent("uploads/scan.jpg");

    await expect(handler(event)).rejects.toThrow("DynamoDB timeout");
    expect(s3Service.moveObject).toHaveBeenCalledWith(
      "mediflow-bucket",
      "uploads/scan.jpg",
      "failed/scan.jpg"
    );
  });
});