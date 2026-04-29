const { updateItem } = require("../services/itemService");
const { withMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    const error = new Error("Missing item id");
    error.statusCode = 400;
    throw error;
  }

  logger.info("Updating item", { id, user: event.user });

  const updatedItem = await updateItem(id, event.body || {});

  if (!updatedItem) {
    const error = new Error("Item not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedItem),
  };
};

exports.handler = withMiddleware(handler, { auth: true });