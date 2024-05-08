import type { GroupID, RuleID } from "../../domain";
import { Repository } from "./repository";
import type { Pool } from "pg";

export class RuleAttachmentRepository extends Repository {
  constructor(pool: Pool) {
    super(pool, "tbl_rule_attachments");
  }

  async attachRule(groupId: GroupID, ruleId: RuleID): Promise<void> {
    await this.tx.exec(
      `
      INSERT INTO ${this.tblName} (group_id, rule_id)
        VALUES ($1, $2)
      ON CONFLICT (group_id) DO
        UPDATE SET rule_id = $2;
      `,
      [groupId, ruleId],
    );
  }

  async detachRule(groupId: GroupID): Promise<void> {
    await this.tx.exec(
      `
      DELETE FROM ${this.tblName}
      WHERE group_id = $1;
      `,
      [groupId],
    );
  }
}
