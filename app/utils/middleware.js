const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");

// ---------------------------------------------------------------------------
// Middleware: Correlation-ID
// Extracts from incoming header, falls back to awsRequestId or a new UUID.
// Sets it on event.correlationId and on the shared logger context.
// ---------------------------------------------------------------------------
const correlationIdMiddleware = () => ({
  before: (request) => {
    const { event, context } = request;
    const headers = event.headers || {};
    const id =
      headers["x-correlation-id"] ||
      headers["X-Correlation-Id"] ||
      context?.awsRequestId ||
      uuidv4();

    event.correlationId = id;
    logger.setCorrelationId(id);
  },
});

// ---------------------------------------------------------------------------
// Middleware: JWT Authentication
// ---------------------------------------------------------------------------
const authMiddleware = () => ({
  before: async (request) => {
    const { event } = request;
    const headers = event.headers || {};
    const authHeader = headers.Authorization || headers.authorization;

    if (!authHeader) {
      const err = new Error("Missing Authorization header");
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];

    try {
      const { verifyToken } = require("./jwtVerifier");
      const decoded = await verifyToken(token);
      event.user = decoded;
    } catch (e) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
  },
});

// ---------------------------------------------------------------------------
// Middleware: Centralized HTTP Error Handler
// Logs every 4xx / 5xx with the Correlation-ID and returns it in the response.
// ---------------------------------------------------------------------------
const httpErrorHandler = () => ({
  onError: (request) => {
    const { error, event } = request;
    const correlationId = event?.correlationId || "unknown";
    const statusCode = error.statusCode || 500;
    const isServer = statusCode >= 500;

    logger.error(error.message, {
      correlationId,
      statusCode,
      errorName: error.name,
      stack: error.stack,
    });

    request.response = {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId,
      },
      body: JSON.stringify({
        error: isServer ? "Internal Server Error" : error.message,
        correlationId,
      }),
    };
  },
});

// ---------------------------------------------------------------------------
// Middleware: Attach Correlation-ID header to successful responses
// ---------------------------------------------------------------------------
const responseHeadersMiddleware = () => ({
  after: (request) => {
    const correlationId = request.event?.correlationId;
    if (request.response) {
      request.response.headers = {
        "Content-Type": "application/json",
        ...(request.response.headers || {}),
        "x-correlation-id": correlationId,
      };
    }
  },
});

// ---------------------------------------------------------------------------
// Factory: wrap an API Gateway handler with the full middleware stack
// ---------------------------------------------------------------------------
const withMiddleware = (handler, { auth = false } = {}) => {
  const wrapped = middy(handler).use(correlationIdMiddleware());

  if (auth) {
    wrapped.use(authMiddleware());
  }

  wrapped
    .use(httpJsonBodyParser({ disableContentTypeError: true }))
    .use(responseHeadersMiddleware())
    .use(httpErrorHandler());

  return wrapped;
};

// ---------------------------------------------------------------------------
// Factory: wrap an event-driven handler (S3, SQS, etc.)
// ---------------------------------------------------------------------------
const withEventMiddleware = (handler) => {
  return middy(handler)
    .use(correlationIdMiddleware())
    .use({
      onError: (request) => {
        const { error, event } = request;
        const correlationId = event?.correlationId || "unknown";

        logger.error(error.message, {
          correlationId,
          errorName: error.name,
          stack: error.stack,
        });

        // Re-throw so Lambda marks the invocation as failed (enables retries)
        throw error;
      },
    });
};

module.exports = {
  withMiddleware,
  withEventMiddleware,
};