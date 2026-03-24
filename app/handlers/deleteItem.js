const { deleteItem } = require("../services/itemService");
const { withAuth } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing item id" }),
      };
    }

    logger.info("Deleting item", { id, user: event.user });

    const deleted = await deleteItem(id);

    if (!deleted) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item deleted successfully" }),
    };
  } catch (error) {
    logger.error("deleteItem failed", { error });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete item" }),
    };
  }
};

exports.handler = withAuth(handler);