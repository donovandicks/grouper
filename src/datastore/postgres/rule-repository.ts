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
        SELECT id, name, description, condition, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM ${this.tblName};
        `,
      )
    ).rows as Rule[];
  }

  async create(rule: CreateRuleDTO): Promise<Rule> {
    return (
      await this.tx.exec(
        `
        INSERT INTO ${this.tblName} (name, description, condition)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, condition, created_at AS "createdAt", updated_at AS "updatedAt";
        `,
        [rule.name, rule.description, rule.condition],
      )
    ).rows[0] as Rule;
  }
}
