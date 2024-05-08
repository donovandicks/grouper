import type { Datastore } from "../../datastore";
import type { GroupID, RuleID } from "../../domain";

export class RuleAttachmentService {
  private db: Datastore;
  // private cache: Cache;

  constructor(db: Datastore /* cache: Cache */) {
    this.db = db;
    // this.cache = cache;
  }

  // async subscribeToChannels(): Promise<void> {
  //   logger.info(
  //     { channels: [EventChannels.RuleCreated] },
  //     "subscribing rule processor to channel(s)",
  //   );
  //   /* eslint-disable @typescript-eslint/no-misused-promises */
  //   await this.cache.subscribe(EventChannels.RuleCreated, this.processRuleCreation.bind(this));
  //   /* eslint-enable @typescript-eslint/no-misused-promises */
  // }

  async attachRule(groupId: GroupID, ruleId: RuleID): Promise<void> {
    await this.db.attachRule(groupId, ruleId);
  }

  async detachRule(groupId: GroupID): Promise<void> {
    await this.db.detachRule(groupId);
  }
}
