import type { CreateGroupDTO, CreateUserDTO } from "../../../api/models";
import type { Group, GroupID, Membership, User, UserID } from "../../../domain";
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
  constructor(pool: Pool) {
    super(pool, "tbl_groups");
  }

  async get(id: GroupID): Promise<Group | undefined> {
    return (
      await this.tx.query(
        `
        SELECT id, name, handle, group_type AS type, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM ${this.tblName}
        WHERE ${this.tblName}.id = $1;
        `,
        [id],
      )
    ).rows[0] as Group;
  }

  async list(): Promise<Group[]> {
    return (
      await this.tx.query(
        `SELECT id, name, handle, group_type AS type, created_at AS "createdAt", updated_at AS "updatedAt" FROM ${this.tblName};`,
      )
    ).rows as Group[];
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    return (
      await this.tx.query(
        `
        INSERT INTO ${this.tblName} (name, handle, group_type)
        VALUES ($1, $2, $3)
        RETURNING id, name, handle, group_type AS type, created_at AS "createdAt", updated_at AS "updatedAt";
        `,
        [group.name, group.handle ?? toKebab(group.name), group.type ?? null],
      )
    ).rows[0] as Group;
  }

  async delete(id: GroupID): Promise<Group | undefined> {
    return (
      await this.tx.query(
        `
        DELETE FROM ${this.tblName}
        WHERE id = $1
        RETURNING id, name, handle, group_type AS type, created_at AS "createdAt", updated_at AS "updatedAt";
        `,
        [id],
      )
    ).rows[0] as Group;
  }
}

export class GroupMemberRepository extends Repository {
  historicalTable: string = "tbl_group_member_history";

  constructor(pool: Pool) {
    super(pool, "tbl_group_members");
  }

  async getGroupMembers(groupId: GroupID): Promise<UserID[]> {
    return (
      await this.tx.query(`SELECT user_id FROM ${this.tblName} WHERE group_id = $1;`, [groupId])
    ).rows.map((r: { user_id: UserID }) => r.user_id);
  }

  async getGroupMemberHistory(groupId: GroupID): Promise<Membership[]> {
    return (
      await this.tx.query(
        `
      SELECT group_id AS "groupId", user_id AS "userId", start_date AS "startDate", end_date AS "endDate"
      FROM ${this.historicalTable}
      WHERE group_id = $1;
      `,
        [groupId],
      )
    ).rows as Membership[];
  }

  async addGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    await this.tx.withTransaction(async () => {
      const { id: historicalId } = (
        await this.tx.query(
          `
          INSERT INTO ${this.historicalTable} (group_id, user_id) VALUES ($1, $2)
          RETURNING id;
          `,
          [groupId, userId],
        )
      ).rows[0] as { id: number };

      await this.tx.query(
        `
        INSERT INTO ${this.tblName} (group_id, user_id, historical_id) VALUES ($1, $2, $3)
          ON CONFLICT (group_id, user_id) DO NOTHING
        RETURNING start_date AS "startDate";
        `,
        [groupId, userId, historicalId],
      );
    });
  }

  async removeGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    return await this.tx.withTransaction(async () => {
      const { historicalId } = (
        await this.tx.query(
          `
          DELETE FROM ${this.tblName}
          WHERE group_id = $1 AND user_id = $2
          RETURNING historical_id AS "historicalId";
          `,
          [groupId, userId],
        )
      ).rows[0] as { historicalId: number };

      await this.tx.query(
        `
        UPDATE ${this.historicalTable}
        SET end_date = NOW()
        WHERE id = $1;
        `,
        [historicalId],
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
      await this.tx.query(
        `SELECT id, name, email, created_at AS "createdAt", updated_at AS "updatedAt" FROM ${this.tblName};`,
      )
    ).rows.filter(filter ?? (() => true)) as User[];
  }

  async create(user: CreateUserDTO): Promise<User> {
    return (
      await this.tx.exec(
        `
        INSERT INTO ${this.tblName} (name, email)
        VALUES ($1, $2)
        RETURNING id, name, email, created_at AS "createdAt", updated_at AS "updatedAt";
        `,
        [user.name, user.email],
      )
    ).rows[0] as User;
  }

  async get(id: UserID): Promise<User | undefined> {
    return (
      await this.tx.query(
        `
        SELECT id, name, email, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM ${this.tblName}
        WHERE id = $1;
        `,
        [id],
      )
    ).rows[0] as User;
  }

  async delete(id: UserID): Promise<User | undefined> {
    return (
      await this.tx.exec(
        `
        DELETE FROM ${this.tblName}
        WHERE id = $1
        RETURNING id, name, email;
        `,
        [id],
      )
    ).rows[0] as User;
  }
}
