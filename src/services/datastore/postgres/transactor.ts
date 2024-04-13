import { logger } from "../../../utils/telemtery";
import type { Pool, PoolClient, QueryResult } from "pg";

export class Transactor {
  private pool: Pool;
  private conn: PoolClient | undefined;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async acquire(): Promise<PoolClient> {
    if (!this.conn) {
      this.conn = await this.pool.connect();
    }

    return this.conn;
  }

  /**
   * Execute a single SQL query.
   *
   * @param sql Raw query string
   * @param params Optional array of parameters to for the SQL query
   * @returns QueryResult containing affected rows or requested return data
   */
  async query(sql: string, params: Array<string | null> = []): Promise<QueryResult> {
    logger.debug({ queryString: sql }, "executing query");
    // @ts-expect-error Parameters _can_ be a nullable array
    const res = await (await this.acquire()).query(sql, params);
    logger.debug({ rowCount: res.rowCount, queryString: sql }, "executed query");
    return res;
  }

  async start(): Promise<void> {
    await this.query("BEGIN;");
  }

  async commit(): Promise<void> {
    await this.query("COMMIT;");
  }

  async rollback(): Promise<void> {
    await this.query("ROLLBACK;");
  }

  release(): void {
    if (this.conn) {
      this.conn.release();
      delete this.conn;
    }
  }

  /**
   * Executes a single SQL query wrapped in a transaction.
   *
   * If the query fails to execute, the transaction is rolled back. Successful
   * queries are committed. The connection is released back to the pool in either
   * case.
   *
   * @param sql Raw query string
   * @param params Optional array of parameters for the SQL query
   * @returns QueryResult containing affected rows or requested return data
   */
  async exec(sql: string, params?: Array<string | null>): Promise<QueryResult> {
    try {
      await this.start();
      const res = await this.query(sql, params);
      await this.commit();
      return res;
    } catch (err) {
      logger.error({ err, queryString: sql }, "failed to execute database call");
      await this.rollback();
      throw err;
    } finally {
      this.release();
    }
  }

  /**
   * Executes multiple SQL queries wrapped in one overarching transaction.
   *
   * Use when multiple queries need to be executed as a group in an "all or nothing"
   * fashion. If any query fails, the entire transaction is rolled back. The
   * transaction will be committed only if all queries execute successfully. The
   * connection is released back to the pool in either case.
   *
   * @param callback A collection of queries to wrap in a single transaction
   * @returns The desired return type
   */
  async withTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      await this.start();
      const result = await callback();
      await this.commit();
      return result;
    } catch (err) {
      logger.error({ err }, "failed to execute database call");
      await this.rollback();
      throw err;
    } finally {
      this.release();
    }
  }
}
