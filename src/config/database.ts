import { mustGetEnvVar } from "../utils/env";
import { Migrator } from "../utils/migration";
import { logger } from "../utils/telemtery";
import { join, resolve } from "path";
import type { ClientConfig, Pool } from "pg";

export const getConfig = (options?: {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
}): ClientConfig => {
  const cfg = {
    user: options?.user ?? mustGetEnvVar("POSTGRES_USER"),
    password: options?.password ?? mustGetEnvVar("POSTGRES_PASSWORD"),
    host: options?.host ?? mustGetEnvVar("POSTGRES_HOST"),
    port: options?.port ?? Number(mustGetEnvVar("POSTGRES_PORT")),
    database: options?.database ?? mustGetEnvVar("POSTGRES_DB"),
  };

  logger.info({ config: { ...cfg, password: "***" } }, "got database config options");

  return cfg;
};

export async function runMigrations(
  dbPool: Pool,
  direction: "up" | "down" = "up",
): Promise<boolean> {
  try {
    const migrator = new Migrator(dbPool, join(resolve(__dirname, ".."), "migrations"));
    if (direction === "up") {
      return await migrator.up();
    } else {
      return await migrator.down();
    }
  } catch (err) {
    logger.error({ err }, "error running migrations");
    return false;
  }
}
