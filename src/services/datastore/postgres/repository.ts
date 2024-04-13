import type { CreateGroupDTO, CreateUserDTO } from "../../../api/models";
import type { Group, GroupID, User, UserID } from "../../../domain";
import { GroupEvent } from "../../../domain";
import type { GroupHistoryEvent } from "../../../domain/group";
import { toKebab } from "../../../utils/domain";
import { Transactor } from "./transactor";
import type { Pool } from "pg";

class Repository {
  protected tx: Transactor;
  tblName: string;

  constructor(pool: Pool, tblName: string) {
    this.tblName = tblName;
    this.tx = new Transactor(pool);
  }
}

export class GroupRepository extends Repository {
  historyTable: string = "tbl_group_history";

  constructor(pool: Pool) {
    super(pool, "tbl_groups");
  }

  async get(id: GroupID): Promise<Group | undefined> {
    return (
      await this.tx.exec(
        `
      SELECT id, name, handle, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tblName}
      WHERE ${this.tblName}.id = $1;
      `,
        [id],
      )
    ).rows[0] as Group;
  }

  async list(): Promise<Group[]> {
    return (
      await this.tx.exec(`
      SELECT id, name, handle, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tblName};
      `)
    ).rows as Group[];
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    return await this.tx.withTransaction<Group>(async () => {
      const created = (
        await this.tx.query(
          `
        INSERT INTO ${this.tblName} (name, handle, group_type)
        VALUES ($1, $2, $3)
        RETURNING id, name, handle, group_type AS type, created_at AS createdAt, updated_at AS updatedAt;
        `,
          [group.name, group.handle ?? toKebab(group.name), group.type ?? null],
        )
      ).rows[0] as Group;

      await this.tx.query(
        `INSERT INTO ${this.historyTable} (group_id, event, data) VALUES ($1, $2, $3)`,
        [created.id, GroupEvent.Create, JSON.stringify(created)],
      );

      return created;
    });
  }

  async delete(id: GroupID): Promise<Group | undefined> {
    return await this.tx.withTransaction<Group | undefined>(async () => {
      const deleted = (
        await this.tx.query(
          `DELETE FROM ${this.tblName}
          WHERE id = $1 RETURNING id, name, handle, group_type AS type, created_at AS createdAt, updated_at AS updatedAt;`,
          [id],
        )
      ).rows[0] as Group;

      await this.tx.query(
        `INSERT INTO ${this.historyTable} (group_id, event, data) VALUES ($1, $2, $3)`,
        [deleted.id, GroupEvent.Delete, JSON.stringify(deleted)],
      );

      return deleted;
    });
  }

  async getHistory(id: GroupID): Promise<GroupHistoryEvent[]> {
    return (
      await this.tx.exec(
        `
    SELECT
      group_id AS groupId, event, event_time AS timestamp, data
    FROM ${this.historyTable}
    WHERE group_id = $1;
    `,
        [id],
      )
    ).rows as GroupHistoryEvent[];
  }
}

export class GroupMemberRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_group_members");
  }

  async getGroupMembers(groupId: GroupID): Promise<UserID[]> {
    return (
      await this.tx.exec(
        `
      SELECT user_id
      FROM ${this.tblName}
      WHERE group_id = $1 AND end_date IS NULL;
      `,
        [groupId],
      )
    ).rows.map((r: { user_id: string }) => r.user_id as UserID);
  }

  async addGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    return await this.tx.withTransaction(async () => {
      const startDate = (
        await this.tx.query(
          `
          INSERT INTO tbl_group_members AS tgm (group_id, user_id) VALUES ($1, $2)
          ON CONFLICT (group_id, user_id) DO UPDATE SET
            start_date = CASE
              WHEN tgm.end_date IS NULL THEN tgm.start_date
              ELSE NOW()
            END,
            end_date = NULL
          RETURNING start_date AS startDate;
          `,
          [groupId, userId],
        )
      ).rows[0] as { startDate: Date };

      await this.tx.query(
        "INSERT INTO tbl_group_history (group_id, event, data) VALUES ($1, $2, $3);",
        [groupId, GroupEvent.AddMember, JSON.stringify({ userId, ...startDate })],
      );
    });
  }

  async removeGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    return await this.tx.withTransaction(async () => {
      const timeline = (
        await this.tx.query(
          `
        UPDATE ${this.tblName}
        SET end_date = NOW()
        WHERE group_id = $1 AND user_id = $2
        RETURNING start_date AS startDate, end_date AS endDate;
        `,
          [groupId, userId],
        )
      ).rows[0] as { start_date: Date; end_date: Date };

      await this.tx.query(
        "INSERT INTO tbl_group_history (group_id, event, data) VALUES ($1, $2, $3)",
        [groupId, GroupEvent.RemoveMember, JSON.stringify({ userId, ...timeline })],
      );
    });
  }
}

export class UserRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_users");
  }

  async list(filter?: (user: User) => boolean): Promise<User[]> {
    return (
      await this.tx.exec(`
      SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tblName};
      `)
    ).rows.filter(filter ?? (() => true)) as User[];
  }

  async create(user: CreateUserDTO): Promise<User> {
    return (
      await this.tx.exec(
        `
      INSERT INTO ${this.tblName} (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at AS createdAt, updated_at AS updatedAt;
      `,
        [user.name, user.email],
      )
    ).rows[0] as User;
  }

  async get(id: UserID): Promise<User | undefined> {
    return (
      await this.tx.exec(
        `SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt
        FROM ${this.tblName}
        WHERE id = $1;`,
        [id],
      )
    ).rows[0] as User;
  }

  async delete(id: UserID): Promise<User | undefined> {
    return (
      await this.tx.exec(
        `DELETE FROM ${this.tblName}
        WHERE id = $1
        RETURNING id, name, email;`,
        [id],
      )
    ).rows[0] as User;
  }
}
