const { verifyToken } = require("./jwtVerifier");

const withAuth = (handler) => {
  return async (event) => {
    try {
      const authHeader = event.headers?.Authorization;

      if (!authHeader) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: "Missing Authorization header" }),
        };
      }

      const token = authHeader.split(" ")[1];

      const decoded = await verifyToken(token);

      event.user = decoded;

      return handler(event);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }
  };
};

module.exports = {
  withAuth,
};