import { mustGetEnvVar } from "../utils/env";
import { Migrator } from "../utils/migration";
import { logger } from "../utils/telemtery";
import { join, resolve } from "path";
import type { ClientConfig, Pool, PoolClient } from "pg";

export const Config: ClientConfig = {
  user: mustGetEnvVar("POSTGRES_USER"),
  password: mustGetEnvVar("POSTGRES_PASSWORD"),
  host: mustGetEnvVar("POSTGRES_HOST"),
  port: Number(mustGetEnvVar("POSTGRES_PORT")),
  database: mustGetEnvVar("POSTGRES_DB"),
};

export async function runMigrations(
  dbPool: Pool,
  direction: "up" | "down" = "up",
): Promise<boolean> {
  let client: PoolClient | undefined = undefined;

  try {
    logger.info("connecting to database");
    client = await dbPool.connect();
    const migrator = new Migrator(client, join(resolve(__dirname, ".."), "migrations"));
    if (direction === "up") {
      return await migrator.up();
    } else {
      return await migrator.down();
    }
  } catch (err) {
    logger.error({ err }, "error running migrations");
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}
