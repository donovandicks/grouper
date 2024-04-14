import { Transactor } from "../services/datastore/postgres/transactor";
import { logger } from "./telemtery";
import { readFileSync, readdirSync } from "fs";
import { basename, join } from "path";
import type { Pool } from "pg";

export class Migrator {
  readonly migrationTable: string = "tbl_migrations";
  upPaths: string[] = [];
  downPaths: string[] = [];
  tx: Transactor;

  constructor(pool: Pool, migrationDir: string, migrationTable?: string) {
    if (migrationTable) {
      this.migrationTable = migrationTable;
    }

    this.tx = new Transactor(pool);

    logger.debug({ migrationDir }, "looking for sql migration files");

    for (const path of readdirSync(migrationDir).sort((a, b) => (a < b ? 0 : 1))) {
      if (path.endsWith(".up.sql")) {
        this.upPaths.push(join(migrationDir, path));
        continue;
      }

      this.downPaths.unshift(join(migrationDir, path)); // reverse order for down
    }

    // Ensure migrations are sorted by their \d{6} prefix
    this.upPaths = this.upPaths.sort((a, b) => (a < b ? -1 : 1));
    this.downPaths = this.downPaths.sort((a, b) => (a < b ? 1 : -1)); // reverse order for down

    logger.debug({ upPaths: this.upPaths, downPaths: this.downPaths }, "found sql migration files");
  }

  async up(): Promise<boolean> {
    await this.tx.query("CREATE TABLE IF NOT EXISTS tbl_migrations(name TEXT);");

    const lastMigration = (
      (await this.tx.query("SELECT name FROM tbl_migrations;")).rows[0] as { name: string | null }
    )?.name;

    if (lastMigration) {
      logger.info(`found existing migrations table, last migration was '${lastMigration}'`);
    }

    const toDo = this.upPaths.filter((mig) => basename(mig) > (lastMigration ?? ""));

    if (toDo.length === 0) {
      logger.info("no migrations to run");
      return true;
    }

    for (const mig of toDo) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      if (name == lastMigration) {
        logger.debug(`skipping migration '${name}' because it was already run`);
        continue;
      }

      logger.info({ migration: name }, "executing migration");
      try {
        await this.tx.query(sql);
      } catch (err) {
        logger.error({ err, migration: name }, "failed to run migration");
        return false;
      }

      logger.info({ migration: name }, "successfully executed migration");
      await this.tx.query(`INSERT INTO ${this.migrationTable} (name) VALUES ($1)`, [name]);
    }

    return true;
  }

  async down(): Promise<boolean> {
    for (const mig of this.downPaths) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      logger.info({ migration: name }, "executing migration");
      try {
        await this.tx.query(sql);
      } catch (err) {
        logger.error({ err, migration: name }, "failed to run migration");
        return false;
      }

      logger.info({ migration: name }, "successfully executed migration");
      await this.tx.query(`INSERT INTO ${this.migrationTable} (name) VALUES ($1)`, [name]);
    }

    return true;
  }
}
