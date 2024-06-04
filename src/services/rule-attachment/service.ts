import type { Datastore } from "../../datastore";
import type { GroupID, RuleID } from "../../domain";
import { RuleNotFoundError } from "../errors";

export class RuleAttachmentService {
  private db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async attachRule(groupId: GroupID, ruleId: RuleID): Promise<void> {
    const rule = await this.db.getRule(ruleId);
    if (rule === undefined) {
      throw new RuleNotFoundError(ruleId);
    }

    await this.db.attachRule(groupId, rule.id);

    /**
     * TODO: At this point there is an established relationship between a group and rule,
     * e.g. a "group" now has an associated "rule" which describes the properties of its
     * desired members. We must now apply this rule to all users in the system to determine
     * who should be in this group.
     *
     * Ideas:
     * 1. Do it here in this method as part of a larger "transaction", i.e. "attaching a rule"
     *    includes applying that rule to the user base
     * 2. Do it asychronously by publishing an event or making a call to another subsystem to
     *    indicate that the members need to be determined
     *
     * Followup Tasks:
     * - Maintain membership based on rule
     *   - Explore event-driven model, e.g. on change to user or rule, update membership
     *   - Alternatively, update membership on a scheduled basis
     */
  }

  async detachRule(groupId: GroupID): Promise<void> {
    await this.db.detachRule(groupId);
  }
}
