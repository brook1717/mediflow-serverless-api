const { createItem } = require("../services/itemService");
const { withMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  logger.info("Creating item", { user: event.user });

  const item = await createItem(event.body || {});

  return {
    statusCode: 201,
    body: JSON.stringify(item),
  };
};

exports.handler = withMiddleware(handler, { auth: true });