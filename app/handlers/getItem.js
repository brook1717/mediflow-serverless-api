const { getItem } = require("../services/itemService");
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

    logger.info("Fetching item", { id, user: event.user });

    const item = await getItem(id);

    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    logger.error("getItem failed", { error });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get item" }),
    };
  }
};

exports.handler = withAuth(handler);