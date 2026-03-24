const itemService = require("../app/services/itemService");
const db = require("../app/services/dynamodbClient");

// Mock DB client
jest.mock("../app/services/dynamodbClient", () => ({
  send: jest.fn(),
}));

describe("Item Service Tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Resets mock history between tests
  });

  test("should create an item successfully", async () => {
    // Mock Put (DynamoDB returns an empty object on success)
    db.send.mockResolvedValueOnce({});

    const item = await itemService.createItem({ name: "Test" });

    // In Jest, we use 'expect' instead of 'if (error) throw'
    expect(item).toHaveProperty("id");
    expect(item.name).toBe("Test");
    expect(item).toHaveProperty("createdAt");
  });

  test("should get an item successfully by ID", async () => {
    // Mock Get
    const mockData = { id: "123", name: "Test" };
    db.send.mockResolvedValueOnce({
      Item: mockData,
    });

    const fetched = await itemService.getItem("123");

    expect(fetched).toBeDefined();
    expect(fetched.id).toBe("123");
    expect(fetched.name).toBe("Test");
  });

});

// const itemService = require("../app/services/itemService");
// const db = require("../app/services/dynamodbClient");

// // Mock DB client
// jest.mock("../app/services/dynamodbClient", () => ({
//   send: jest.fn(),
// }));

// describe("Item Service Tests", () => {
  
//   beforeEach(() => {
//     jest.clearAllMocks(); // Resets mock history between tests
//   });

//   test("should create an item successfully", async () => {
//     // Mock Put (DynamoDB returns an empty object on success)
//     db.send.mockResolvedValueOnce({});

//     const item = await itemService.createItem({ name: "Test" });

//     // In Jest, we use 'expect' instead of 'if (error) throw'
//     expect(item).toHaveProperty("id");
//     expect(item.name).toBe("Test");
//     expect(item).toHaveProperty("createdAt");
//   });

//   test("should get an item successfully by ID", async () => {
//     // Mock Get
//     const mockData = { id: "123", name: "Test" };
//     db.send.mockResolvedValueOnce({
//       Item: mockData,
//     });

//     const fetched = await itemService.getItem("123");

//     expect(fetched).toBeDefined();
//     expect(fetched.id).toBe("123");
//     expect(fetched.name).toBe("Test");
//   });

// });