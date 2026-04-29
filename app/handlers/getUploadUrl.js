const { getUploadUrl } = require("../services/s3Service");
const { withMiddleware } = require("../utils/middleware");
const logger = require("../utils/logger");

const handler = async (event) => {
  const { fileName } = event.body || {};

  if (!fileName) {
    const error = new Error("fileName is required");
    error.statusCode = 400;
    throw error;
  }

  const key = `uploads/${Date.now()}-${fileName}`;

  logger.info("Generating upload URL", { key });

  const url = await getUploadUrl(key);

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl: url, key }),
  };
};

exports.handler = withMiddleware(handler);