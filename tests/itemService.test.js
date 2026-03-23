const itemService = require("../app/services/itemService");

// Mock DB client
jest.mock("../app/services/dynamodbClient", () => ({
  send: jest.fn(),
}));

const db = require("../app/services/dynamodbClient");

(async () => {
  console.log("Running tests...");

  // Mock Put
  db.send.mockResolvedValueOnce({});

  const item = await itemService.createItem({ name: "Test" });

  if (!item.id) {
    throw new Error("createItem failed");
  }

  console.log("createItem passed");

  // Mock Get
  db.send.mockResolvedValueOnce({
    Item: { id: "123", name: "Test" },
  });

  const fetched = await itemService.getItem("123");

  if (!fetched) {
    throw new Error("getItem failed");
  }

  console.log("getItem passed");

  console.log("All tests passed");
})();