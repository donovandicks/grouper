import pino, { Logger, LoggerOptions } from "pino";

export let logger: Logger<never>;

export type LoggingConfig = {
  options: LoggerOptions;
  destination?: pino.DestinationStream;
};

export const localConfig: LoggingConfig = {
  options: {
    transport: { target: "pino-pretty", options: { colorize: true } },
  },
  destination: pino.destination({ maxLength: 4096, sync: false }),
};

export const initLogger = (env: "local"): Logger<never> => {
  switch (env) {
    case "local":
      logger = pino(localConfig.options, localConfig.destination);
      return logger;
    default:
      throw new Error("No logger configured for environment");
  }
};
