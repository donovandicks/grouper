import type { Environment } from "./env";
import type { Logger, LoggerOptions } from "pino";
import pino from "pino";
import PinoPretty from "pino-pretty";

export let logger: Logger<never>;

// const fileTransport: pino.DestinationStream = pino.transport({
//   target: "pino/file",
//   options: { destinations: "/var/grouper/grouper.log" },
// }) as pino.DestinationStream; // Can't run with current state of bun<>node compatibility

export type LoggingConfig = {
  options: LoggerOptions;
  destination?: pino.DestinationStream;
};

export const prodConfig: LoggingConfig = {
  options: {
    level: process.env["LOG_LEVEL"] || "info",
    formatters: {
      level: (label) => {
        return { level: label.toLocaleUpperCase() };
      },
    },
  },
};

export const localConfig: LoggingConfig = {
  options: {
    level: process.env["LOG_LEVEL"] || "debug",
  },
  destination: PinoPretty({ sync: false, colorize: true }),
};

export const testConfig: LoggingConfig = {
  options: {
    level: "error",
  },
  destination: PinoPretty({ sync: true, colorize: true }),
};

export const initLogger = (env: Environment): Logger<never> => {
  switch (env) {
    case "prod":
      logger = pino(prodConfig.options /* fileTransport */);
      return logger;
    case "local":
      logger = pino(localConfig.options, localConfig.destination);
      return logger;
    case "test":
      logger = pino(testConfig.options);
      return logger;
    default:
      throw new Error("No logger configured for environment");
  }
};
