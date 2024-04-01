import { logger } from "../utils/telemtery";
import migrate from "node-pg-migrate";
import { join, resolve } from "path";
import { ClientConfig, Pool } from "pg";

export const config: ClientConfig = {
  user: "username",
  password: "password",
  host: "database",
  port: 5432,
  database: "grouper",
};

export const client: Pool = new Pool(config);

export async function runMigrations() {
  try {
    await migrate({
      schema: "public",
      direction: "up",
      verbose: true,
      dir: join(resolve(__dirname, ".."), "migrations"),
      migrationsTable: "migrations",
      databaseUrl: config,
    });
    logger.info("migrations ran successfully.");
  } catch (err) {
    logger.error({ err }, "error running migrations");
    throw err;
  }
}
