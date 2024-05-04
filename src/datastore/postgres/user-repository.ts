import type { CreateUserDTO } from "../../api/models";
import type { User, UserID } from "../../domain";
import { Repository } from "./repository";
import type { Pool } from "pg";

export class UserRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_users");
  }

  async list(filter?: (user: User) => boolean): Promise<User[]> {
    return (
      await this.tx.query(
        `
        SELECT
          id, name, email, attributes, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM ${this.tblName};
        `,
      )
    ).rows.filter(filter ?? (() => true)) as User[];
  }

  async create(user: CreateUserDTO): Promise<User> {
    return (
      await this.tx.exec(
        `
        INSERT INTO ${this.tblName} (name, email, attributes)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, attributes, created_at AS "createdAt", updated_at AS "updatedAt";
        `,
        [user.name, user.email, user.attributes ?? new Map()],
      )
    ).rows[0] as User;
  }

  async get(id: UserID): Promise<User | undefined> {
    return (
      await this.tx.query(
        `
        SELECT
          id, name, email, attributes, created_at AS "createdAt", updated_at AS "updatedAt"
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
