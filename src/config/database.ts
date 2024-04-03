import { logger } from "../utils/telemtery";
import migrate from "node-pg-migrate";
import { join, resolve } from "path";
import { ClientConfig } from "pg";

export const Config: ClientConfig = {
  user: process.env["POSTGRES_USER"],
  password: process.env["POSTGRES_PASSWORD"],
  host: process.env["POSTGRES_HOST"],
  port: Number(process.env["POSTGRES_PORT"]),
  database: process.env["POSTGRES_DB"],
};

export async function runMigrations(
  config: ClientConfig = Config,
  direction: "up" | "down" = "up",
  verbose: boolean = true,
): Promise<boolean> {
  try {
    await migrate({
      schema: "public",
      direction,
      verbose,
      dir: join(resolve(__dirname, ".."), "migrations"),
      migrationsTable: "tbl_migrations",
      databaseUrl: config,
    });
    logger.info("migrations ran successfully.");
    return true;
  } catch (err) {
    logger.error({ err }, "error running migrations");
    return false;
  }
}
