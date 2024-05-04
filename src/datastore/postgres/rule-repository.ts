import type { CreateRuleDTO } from "../../api/models";
import type { Rule } from "../../domain/rule";
import { Repository } from "./repository";
import type { Pool } from "pg";

export class RuleRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_rules");
  }

  async list(): Promise<Rule[]> {
    return (
      await this.tx.query(
        `
        SELECT
          id,
          name,
          description,
          user_managed AS "userManaged",
          condition,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM ${this.tblName};
        `,
      )
    ).rows as Rule[];
  }

  async create(rule: CreateRuleDTO): Promise<Rule> {
    return (
      await this.tx.exec(
        `
        INSERT INTO ${this.tblName} (name, description, user_managed, condition)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          name,
          description,
          user_managed AS "userManaged",
          condition,
          created_at AS "createdAt",
          updated_at AS "updatedAt";
        `,
        [rule.name, rule.description, rule.userManaged, rule.condition],
      )
    ).rows[0] as Rule;
  }
}
