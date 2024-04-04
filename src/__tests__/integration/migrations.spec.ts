import { runMigrations } from "../../config/database";
import { initLogger } from "../../utils/telemtery";
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
const expectedTables = ["tbl_users", "tbl_audit", "tbl_group_members", "tbl_groups"];

describe("postgres integration tests", () => {
  beforeAll(() => {
    pool = new Pool(TestConfig);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("successfully runs migrations", async () => {
    const client = await pool.connect();

    const upResult = await runMigrations(TestConfig);
    expect(upResult).toBe(true);

    let tbls = (
      await client.query(
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

    const downResult = await runMigrations(TestConfig, "down");
    expect(downResult).toBe(true);

    tbls = (
      await client.query(
        `
        SELECT table_schema AS schema, table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('${expectedTables.join("', '")}')
        `,
      )
    ).rows;

    expect(tbls).toEqual([]);

    client.release();
  });
});
