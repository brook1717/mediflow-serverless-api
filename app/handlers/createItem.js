const { createItem } = require("../services/itemService");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const item = await createItem(body);

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("createItem error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to create item",
      }),
    };
  }
};