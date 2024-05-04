import { Transactor } from "../datastore/postgres/transactor";
import { logger } from "./telemtery";
import { readFileSync, readdirSync } from "fs";
import { basename, join } from "path";
import type { Pool } from "pg";

export class Migrator {
  // TODO: Seriously invest in this or replace with drizzle
  readonly migrationTable: string = "tbl_migrations";
  readonly upPaths: string[] = [];
  readonly downPaths: string[] = [];
  private tx: Transactor;

  /**
   * Create a new Migrator instance.
   *
   * Searches the file system for SQL migration files in the given migration
   * directory.
   *
   * @param pool A configued database pool
   * @param migrationDir The file directory where SQL migration files are located
   * @param migrationTable The name of the SQL table to store migration state
   */
  constructor(pool: Pool, migrationDir: string, migrationTable?: string) {
    if (migrationTable) {
      this.migrationTable = migrationTable;
    }

    this.tx = new Transactor(pool);

    logger.debug({ migrationDir }, "looking for sql migration files");

    for (const path of readdirSync(migrationDir)) {
      const fullPath = join(migrationDir, path);
      path.endsWith(".up.sql") ? this.upPaths.push(fullPath) : this.downPaths.push(fullPath);
    }

    // Ensure migrations are sorted by their \d{6} prefix
    this.upPaths.sort((a, b) => (a < b ? -1 : 1));
    this.downPaths.sort((a, b) => (a < b ? 1 : -1)); // reverse order for down

    logger.debug({ upPaths: this.upPaths, downPaths: this.downPaths }, "found sql migration files");
  }

  async initMigrations(): Promise<string | null> {
    await this.tx.query("CREATE TABLE IF NOT EXISTS tbl_migrations(name TEXT);");

    const lastMigration = (
      (await this.tx.query("SELECT name FROM tbl_migrations;")).rows[0] as { name: string | null }
    )?.name;

    if (lastMigration) {
      logger.info(`found existing migrations table, last migration was '${lastMigration}'`);
    }

    return lastMigration;
  }

  async up(): Promise<boolean> {
    const lastMigration = await this.initMigrations();
    const toDo = this.upPaths.filter((mig) => basename(mig) > (lastMigration ?? ""));

    if (toDo.length === 0) {
      logger.info("no migrations to run");
      return true;
    }

    for (const mig of toDo) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      logger.debug({ migration: name }, "executing migration");
      try {
        await this.tx.query(sql);
      } catch (err) {
        logger.error({ err, migration: name }, "failed to run migration");
        return false;
      }
      logger.debug({ migration: name }, "successfully executed migration");

      await this.tx.query(`INSERT INTO ${this.migrationTable} (name) VALUES ($1)`, [name]);
    }

    logger.info("successfully completed all migrations");
    return true;
  }

  async down(): Promise<boolean> {
    for (const mig of this.downPaths) {
      const sql = readFileSync(mig, "utf-8");
      const name = basename(mig);

      logger.debug({ migration: name }, "executing migration");
      try {
        await this.tx.query(sql);
      } catch (err) {
        logger.error({ err, migration: name }, "failed to run migration");
        return false;
      }

      logger.debug({ migration: name }, "successfully executed migration");
      await this.tx.query(`INSERT INTO ${this.migrationTable} (name) VALUES ($1)`, [name]);
    }

    logger.info("successfully completed all migrations");
    return true;
  }
}
