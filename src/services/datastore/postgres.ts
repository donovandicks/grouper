import type { CreateGroupDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupID, User, UserID } from "../../domain/index";
import { logger } from "../../utils/telemtery";
import type { Datastore } from "./index";
import type { PoolClient, QueryResult } from "pg";
import { Pool } from "pg";

class Repository {
  pool: Pool;
  tbl_name: string;

  constructor(pool: Pool, tbl_name: string) {
    this.pool = pool;
    this.tbl_name = tbl_name;
  }

  async exec(sql: string, params?: string[]): Promise<QueryResult> {
    let conn: PoolClient | undefined = undefined;

    try {
      conn = await this.pool.connect();
      const res = await conn.query(sql, params);
      logger.info(`query returned ${res.rowCount} rows`);
      return res;
    } catch (err) {
      logger.error({ err, queryString: sql }, "failed executing database call");
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

const toKebab = (raw: string): string => {
  return raw.toLocaleLowerCase().replaceAll(" ", "-");
};

class GroupRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_groups");
  }

  async get(id: GroupID): Promise<Group | undefined> {
    return (
      await this.exec(
        `
      SELECT id, name, handle, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tbl_name}
      WHERE ${this.tbl_name}.id = $1;
      `,
        [id],
      )
    ).rows[0] as Group;
  }

  async list(): Promise<Group[]> {
    return (
      await this.exec(`
      SELECT id, name, handle, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tbl_name};
      `)
    ).rows as Group[];
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    return (
      await this.exec(
        `
      INSERT INTO ${this.tbl_name} (name, handle)
      VALUES ($1, $2)
      RETURNING id, name, handle, created_at AS createdAt, updated_at AS updatedAt;
      `,
        [group.name, group.handle ?? toKebab(group.name)],
      )
    ).rows[0] as Group;
  }

  async delete(id: GroupID): Promise<Group | undefined> {
    return (
      await this.exec(
        `DELETE FROM ${this.tbl_name}
        WHERE id = $1
        RETURNING id, name, handle;`,
        [id],
      )
    ).rows[0] as Group;
  }
}

class GroupMemberRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_group_members");
  }

  async getGroupMembers(groupId: GroupID): Promise<UserID[]> {
    return (
      await this.exec(
        `
      SELECT user_id
      FROM ${this.tbl_name}
      WHERE group_id = $1;
      `,
        [groupId],
      )
    ).rows.map((r: { user_id: string }) => r.user_id as UserID);
  }

  async addGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    await this.exec(
      `
      INSERT INTO ${this.tbl_name} (group_id, user_id)
      VALUES ($1, $2);
      `,
      [groupId, userId],
    );
  }

  async removeGroupMember(groupId: GroupID, userId: UserID): Promise<void> {
    await this.exec(
      `
      DELETE FROM ${this.tbl_name}
      WHERE group_id = $1 AND user_id = $2;
      `,
      [groupId, userId],
    );
  }
}

class UserRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_users");
  }

  async list(filter?: (user: User) => boolean): Promise<User[]> {
    return (
      await this.exec(`
      SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt
      FROM ${this.tbl_name};
      `)
    ).rows.filter(filter ?? (() => true)) as User[];
  }

  async create(user: CreateUserDTO): Promise<User> {
    return (
      await this.exec(
        `
      INSERT INTO ${this.tbl_name} (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at AS createdAt, updated_at AS updatedAt;
      `,
        [user.name, user.email],
      )
    ).rows[0] as User;
  }

  async get(id: UserID): Promise<User | undefined> {
    return (
      await this.exec(
        `SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt
        FROM ${this.tbl_name}
        WHERE id = $1;`,
        [id],
      )
    ).rows[0] as User;
  }

  async delete(id: UserID): Promise<User | undefined> {
    return (
      await this.exec(
        `DELETE FROM ${this.tbl_name}
        WHERE id = $1
        RETURNING id, name, email;`,
        [id],
      )
    ).rows[0] as User;
  }
}

export class PostgresDatastore implements Datastore {
  private groupMembers: GroupMemberRepository;
  private users: UserRepository;
  private groups: GroupRepository;

  constructor(pool: Pool) {
    this.groupMembers = new GroupMemberRepository(pool);
    this.users = new UserRepository(pool);
    this.groups = new GroupRepository(pool);
  }

  // Members //
  async getGroupMembers(group: GroupID): Promise<User[]> {
    const userIds = await this.groupMembers.getGroupMembers(group);
    return await this.users.list((u) => userIds.includes(u.id));
  }

  async addGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.addGroupMember(group, user);
  }

  async removeGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.removeGroupMember(group, user);
  }

  // Groups //
  async createGroup(group: CreateGroupDTO): Promise<Group> {
    return this.groups.create(group);
  }

  async listGroups(): Promise<Group[]> {
    return this.groups.list();
  }

  async getGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async deleteGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.delete(id);
  }

  // Users //
  async createUser(user: CreateUserDTO): Promise<User> {
    return this.users.create(user);
  }

  async listUsers(): Promise<User[]> {
    return this.users.list();
  }

  async getUser(id: UserID): Promise<User | undefined> {
    return this.users.get(id);
  }

  async deleteUser(id: UserID): Promise<User | undefined> {
    return this.users.delete(id);
  }
}
