import pino from "pino";
import pinoHTTP from "pino-http";

export const log = pino({
  level: process.env.LOG_LEVEL || "info",
});

export const requestLog = pinoHTTP();

process.on(
  "uncaughtException",
  pino.final(log, (err, finalLogger) => {
    finalLogger.error(err, "uncaughtException");
    process.exit(1);
  })
);

process.on(
  "unhandledRejection",
  pino.final(log, (err, finalLogger) => {
    finalLogger.error(err, "unhandledRejection");
    process.exit(1);
  })
);
