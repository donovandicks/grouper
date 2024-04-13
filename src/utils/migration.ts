import { logger } from "./telemtery";
import { readFileSync, readdirSync } from "fs";
import { basename, join } from "path";
import type { PoolClient } from "pg";

export class Migrator {
  // TODO: Extend to handle picking up from existing migrations

  private client: PoolClient;
  readonly migrationTable: string = "tbl_migrations";
  upPaths: string[] = [];
  downPaths: string[] = [];

  constructor(client: PoolClient, migrationDir: string, migrationTable?: string) {
    this.client = client;
    if (migrationTable) {
      this.migrationTable = migrationTable;
    }

    logger.debug({ migrationDir }, "looking for sql migration files");

    for (const path of readdirSync(migrationDir).sort((a, b) => (a < b ? 0 : 1))) {
      if (path.endsWith(".up.sql")) {
        this.upPaths.push(join(migrationDir, path));
        continue;
      }

      this.downPaths.unshift(join(migrationDir, path)); // reverse order for down
    }

    logger.debug({ upPaths: this.upPaths, downPaths: this.downPaths }, "found sql migration files");
  }

  async up(): Promise<boolean> {
    await this.client.query("CREATE TABLE IF NOT EXISTS tbl_migrations(name TEXT);");

    const lastMigration = (
      (await this.client.query("SELECT name FROM tbl_migrations;")).rows[0] as { name: string }
    )?.name;
    if (lastMigration) {
      logger.info(`found existing migrations table, last migration was '${lastMigration}'`);
    }

    for (const mig of this.upPaths) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      if (name == lastMigration) {
        logger.info(`skipping migration '${name}' because it was already run`);
        continue;
      }

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
    for (const mig of this.downPaths) {
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
}
