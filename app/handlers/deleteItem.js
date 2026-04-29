const { deleteItem } = require("../services/itemService");
const { withMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    const error = new Error("Missing item id");
    error.statusCode = 400;
    throw error;
  }

  logger.info("Deleting item", { id, user: event.user });

  const deleted = await deleteItem(id);

  if (!deleted) {
    const error = new Error("Item not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Item deleted successfully" }),
  };
};

exports.handler = withMiddleware(handler, { auth: true });