import { isEmpty } from "lodash";
import { createLogger, format, transports } from "winston";
import Sentry from "winston-sentry-log";

import { ENV } from "#utils/env";
import { isObject } from "#utils/object";

const { combine, timestamp, printf, colorize, errors, metadata } = format;

const withTimestampFormat = printf(({ level, message, metadata }) => {
  const formattedMessage = isObject(message)
    ? JSON.stringify(message, null, 4)
    : message;

  const { timestamp, ...rest } = metadata;

  return `${timestamp} [${level}]: ${formattedMessage} ${
    !!rest && !isEmpty(rest) ? JSON.stringify(rest, null, 4) : ""
  }`;
});

const loggerFormat = combine(
  colorize(),
  errors({ stack: true }),
  timestamp(),
  metadata(),
  withTimestampFormat
);

const logger = createLogger({
  transports: [
    new transports.File({
      format: loggerFormat,
      filename: "error.log",
      level: "error",
    }),
    new transports.File({ format: loggerFormat, filename: "combined.log" }),
  ],
});

if (ENV.ENABLE_SENTRY_TRANSPORT && ENV.SENTRY_DSN) {
  logger.add(
    new Sentry({
      config: {
        dsn: ENV.SENTRY_DSN,
        tags: { key: ENV.SENTRY_TAGS_KEY },
      },
    })
  );
}

if (ENV.ENABLE_CONSOLE_TRANSPORT) {
  logger.add(
    new transports.Console({
      format: loggerFormat,
    })
  );
}

export default logger;
