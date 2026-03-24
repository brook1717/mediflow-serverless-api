const { updateItem } = require("../services/itemService");
const { withAuth } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body || "{}");

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing item id" }),
      };
    }

    logger.info("Updating item", { id, user: event.user });

    const updatedItem = await updateItem(id, body);

    if (!updatedItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updatedItem),
    };
  } catch (error) {
    logger.error("updateItem failed", { error });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update item" }),
    };
  }
};

exports.handler = withAuth(handler);