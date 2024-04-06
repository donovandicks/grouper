import { logger } from "../utils/telemtery";
import { readFileSync, readdirSync } from "fs";
import { basename, join, resolve } from "path";
import type { ClientConfig, Pool, PoolClient } from "pg";

export const Config: ClientConfig = {
  user: process.env["POSTGRES_USER"],
  password: process.env["POSTGRES_PASSWORD"],
  host: process.env["POSTGRES_HOST"],
  port: Number(process.env["POSTGRES_PORT"]),
  database: process.env["POSTGRES_DB"],
};

class Migrator {
  private client: PoolClient;
  readonly migrationTable: string = "tbl_migrations";
  upPaths: string[] = [];
  downPaths: string[] = [];

  constructor(client: PoolClient, migrationDir: string, migrationTable?: string) {
    this.client = client;
    if (migrationTable) {
      this.migrationTable = migrationTable;
    }

    for (const path of readdirSync(migrationDir).sort((a, b) => (a < b ? 0 : 1))) {
      if (path.endsWith(".up.sql")) {
        this.upPaths.push(join(migrationDir, path));
        continue;
      }

      this.downPaths.push(join(migrationDir, path));
    }
  }

  async up(): Promise<boolean> {
    await this.client.query("CREATE TABLE IF NOT EXISTS tbl_migrations(name TEXT);");

    for (const mig of this.upPaths) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      logger.info({ migration: name }, "executing migration");
      try {
        await this.client.query(sql);
      } catch (err) {
        logger.error({ err, migration: name }, "failed to run migration");
        return false;
      }

      logger.info({ migration: name }, "successfully executed migration");
      await this.client.query(`INSERT INTO ${this.migrationTable} (name) VALUES ($1)`, [name]);
    }

    return true;
  }

  async down(): Promise<boolean> {
    await Promise.resolve();
    throw new Error("Not implemented");
  }
}

export async function runMigrations(
  dbPool: Pool,
  direction: "up" | "down" = "up",
): Promise<boolean> {
  let client: PoolClient | undefined = undefined;

  try {
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
