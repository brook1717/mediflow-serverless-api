const log = (level, message, meta = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
};

module.exports = {
  info: (msg, meta) => log("INFO", msg, meta),
  error: (msg, meta) => log("ERROR", msg, meta),
};