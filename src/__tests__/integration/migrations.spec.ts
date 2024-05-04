import { runMigrations } from "../../config/database";
import { EventType } from "../../domain";
import { PostgresDatastore } from "../../services/datastore";
import { Transactor } from "../../services/datastore/postgres/transactor";
import { GroupMemberService } from "../../services/group-member";
import { GroupService } from "../../services/group/service";
import { UserService } from "../../services/user/user-service";
import { initLogger } from "../../utils/telemtery";
import { TestConfig } from "./constants";
import { sleepSync } from "bun";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Pool } from "pg";

initLogger("test");

let tx: Transactor;
let gs: GroupService;
let gms: GroupMemberService;
let us: UserService;
let pool: Pool;

const expectedTables = [
  "tbl_users",
  "tbl_audit",
  "tbl_group_members",
  "tbl_group_member_history",
  "tbl_groups",
];

const makeCleanTableSql = (name: string): string => {
  // annoying utility to delete from a table if it exists
  return `
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${name}')
    THEN
      DELETE FROM ${name};
    END IF;
  END $$
  `;
};

describe("service and database integration tests", () => {
  beforeAll(() => {
    pool = new Pool(TestConfig);
    const ds = new PostgresDatastore(pool);
    gs = new GroupService(ds);
    gms = new GroupMemberService(ds);
    us = new UserService(ds);
  });

  afterAll(async () => {
    await tx.query("DELETE FROM tbl_migrations;");
    await pool.end();
  });

  afterEach(async () => {
    await tx.withTransaction<void>(async () => {
      await tx.query(makeCleanTableSql("tbl_group_members"));
      await tx.query(makeCleanTableSql("tbl_group_member_history"));
      await tx.query(makeCleanTableSql("tbl_users"));
      await tx.query(makeCleanTableSql("tbl_groups"));
    });
  });

  it("successfully runs up migrations", async () => {
    tx = new Transactor(pool);

    const upResult = await runMigrations(pool);
    expect(upResult).toBe(true);

    const tbls = (
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
  });

  it("successfully captures group lifecycle", async () => {
    // GIVEN
    const group = await gs.createGroup({ name: "Test" });
    const user_1 = await us.createUser({ name: "John", email: "john@email.com" });
    const user_2 = await us.createUser({ name: "Jane", email: "jane@email.com" });
    const expectedHistoryData = [
      { type: EventType.Create, data: group },
      { type: EventType.AddMember, data: { userId: user_1.id } },
      { type: EventType.AddMember, data: { userId: user_2.id } },
      { type: EventType.RemoveMember, data: { userId: user_1.id } },
      { type: EventType.AddMember, data: { userId: user_1.id } },
    ];

    // WHEN
    await gms.addMemberToGroup(group.id, user_1.id);
    sleepSync(5);
    await gms.addMemberToGroup(group.id, user_2.id);
    sleepSync(5);
    await gms.removeMemberFromGroup(group.id, user_1.id);
    await gms.addMemberToGroup(group.id, user_1.id);
    const history = await gs.getGroupHistory(group.id);

    // THEN
    expect(history).not.toBe(undefined);
    expect(
      history?.map((h) => {
        return { type: h.type, data: h.data };
      }),
    ).toEqual(expectedHistoryData);
  });

  it("does not repeat idempotent events", async () => {
    // GIVEN
    const group = await gs.createGroup({ name: "Test" });
    const user = await us.createUser({ name: "John", email: "john@email.com" });
    const expectedHistoryData = [
      { type: EventType.Create, data: group },
      { type: EventType.AddMember, data: { userId: user.id } },
      { type: EventType.RemoveMember, data: { userId: user.id } },
    ];

    // WHEN
    await gms.addMemberToGroup(group.id, user.id);
    await gms.addMemberToGroup(group.id, user.id);
    await gms.removeMemberFromGroup(group.id, user.id);
    await gms.removeMemberFromGroup(group.id, user.id);
    const history = await gs.getGroupHistory(group.id);

    // THEN
    expect(history).not.toBe(undefined);
    expect(
      history?.map((h) => {
        return { type: h.type, data: h.data };
      }),
    ).toEqual(expectedHistoryData);
  });

  it("successfully runs down migrations", async () => {
    const downResult = await runMigrations(pool, "down");
    expect(downResult).toBe(true);

    const tbls = (
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
