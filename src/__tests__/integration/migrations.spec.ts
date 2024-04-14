import { runMigrations } from "../../config/database";
import { Transactor } from "../../services/datastore/postgres/transactor";
import { initLogger } from "../../utils/telemtery";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Pool } from "pg";

initLogger("local");

let pool: Pool;

const TestConfig = {
  host: "0.0.0.0",
  port: 5433,
  user: "test",
  password: "password",
  database: "test",
};

const expectedTables = [
  "tbl_users",
  "tbl_audit",
  "tbl_group_members",
  "tbl_group_member_history",
  "tbl_groups",
];

describe("postgres integration tests", () => {
  beforeAll(() => {
    pool = new Pool(TestConfig);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("successfully runs migrations", async () => {
    const tx = new Transactor(pool);

    const upResult = await runMigrations(pool);
    expect(upResult).toBe(true);

    let tbls = (
      await tx.query(
        `
        SELECT table_schema AS schema, table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('${expectedTables.join("', '")}')
        `,
      )
    ).rows;

    expect(tbls.length).toEqual(expectedTables.length);
    expect(
      tbls.every((tbl: { schema: string; name: string }) => expectedTables.includes(tbl.name)),
    ).toBe(true);

    const downResult = await runMigrations(pool, "down");
    expect(downResult).toBe(true);

    tbls = (
      await tx.query(
        `
        SELECT table_schema AS schema, table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('${expectedTables.join("', '")}')
        `,
      )
    ).rows;

    expect(tbls).toEqual([]);
  });
});
