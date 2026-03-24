const { createItem } = require("../services/itemService");
const { withAuth } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    logger.info("Creating item", { user: event.user });

    const item = await createItem(body);

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (error) {
    logger.error("createItem failed", { error });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create item" }),
    };
  }
};

exports.handler = withAuth(handler);