import type { CreateGroupDTO } from "../../api/models";
import type { Group, GroupID } from "../../domain";
import { toKebab } from "../../utils/domain";
import { Repository } from "./repository";
import type { Pool } from "pg";

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
