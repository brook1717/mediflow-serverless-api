let _correlationId = null;

const setCorrelationId = (id) => {
  _correlationId = id;
};

const getCorrelationId = () => _correlationId;

const log = (level, message, meta = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    correlationId: _correlationId || undefined,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
};

module.exports = {
  info: (msg, meta) => log("INFO", msg, meta),
  warn: (msg, meta) => log("WARN", msg, meta),
  error: (msg, meta) => log("ERROR", msg, meta),
  setCorrelationId,
  getCorrelationId,
};