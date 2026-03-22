const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("./dynamodbClient");

const TABLE_NAME = process.env.TABLE_NAME || "ItemsTable";

const createItem = async (data) => {
  const item = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
};

const getItem = async (id) => {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  return result.Item;
};

module.exports = {
  createItem,
  getItem,
};