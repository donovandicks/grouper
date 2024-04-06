import type { Logger, LoggerOptions } from "pino";
import pino from "pino";
import PinoPretty from "pino-pretty";

export let logger: Logger<never>;

export type LoggingConfig = {
  options: LoggerOptions;
  destination?: pino.DestinationStream;
};

export const localConfig: LoggingConfig = {
  options: {
    level: "debug",
  },
  destination: PinoPretty({ sync: false, colorize: true }),
};

export const testConfig: LoggingConfig = {
  options: {
    level: "error",
  },
  destination: PinoPretty({ sync: true, colorize: true }),
};

export const initLogger = (env: "local" | "test"): Logger<never> => {
  switch (env) {
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
