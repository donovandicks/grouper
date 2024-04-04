import type { Logger, LoggerOptions } from "pino";
import pino from "pino";

export let logger: Logger<never>;

export type LoggingConfig = {
  options: LoggerOptions;
  destination?: pino.DestinationStream;
};

export const localConfig: LoggingConfig = {
  options: {
    transport: { target: "pino-pretty", options: { colorize: true } },
    level: "debug",
  },
  destination: pino.destination({ maxLength: 4096, sync: false }),
};

export const testConfig: LoggingConfig = {
  options: {
    transport: { target: "pino-pretty", options: { colorize: true } },
    level: "error",
  },
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
