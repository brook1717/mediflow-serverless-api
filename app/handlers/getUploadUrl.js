const { getUploadUrl } = require("../services/s3Service");

exports.handler = async (event) => {
  try {
    const { fileName } = JSON.parse(event.body || "{}");

    if (!fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileName is required" }),
      };
    }

    const key = `uploads/${Date.now()}-${fileName}`;

    const url = await getUploadUrl(key);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url,
        key,
      }),
    };
  } catch (error) {
    console.error("getUploadUrl error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate upload URL" }),
    };
  }
};