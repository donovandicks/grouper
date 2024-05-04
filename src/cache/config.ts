import { mustGetEnvVar } from "../utils/env";
import { logger } from "../utils/telemtery";
import type { RedisClientOptions } from "redis";

export const REDIS_HOST = mustGetEnvVar("REDIS_HOST");
export const REDIS_PORT = mustGetEnvVar("REDIS_PORT");

export const getCacheConfig = (): RedisClientOptions => {
  const cfg: RedisClientOptions = {
    url: `redis://${REDIS_HOST}:${REDIS_PORT}/0`,
    disableOfflineQueue: true,
  };

  logger.info({ config: { ...cfg } }, "got cache config options");

  return cfg;
};

export const EventChannels = {
  RuleCreated: "events:ruleCreated",
};
