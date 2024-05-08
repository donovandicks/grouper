import type { GroupID, Membership, UserID } from "../../domain";
import { Repository } from "./repository";
import type { Pool } from "pg";

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
