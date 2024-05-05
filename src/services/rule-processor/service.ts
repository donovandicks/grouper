import { EventChannels, type Cache } from "../../cache";
import type { Datastore } from "../../datastore";
import type { Rule } from "../../domain/rule";
import { processCondition } from "../../utils/rules";
import { logger } from "../../utils/telemtery";

export class RuleProcessorService {
  private db: Datastore;
  private cache: Cache;

  constructor(db: Datastore, cache: Cache) {
    this.db = db;
    this.cache = cache;
  }

  async subscribeToChannels(): Promise<void> {
    logger.info(
      { channels: [EventChannels.RuleCreated] },
      "subscribing rule processor to channel(s)",
    );
    /* eslint-disable @typescript-eslint/no-misused-promises */
    await this.cache.subscribe(EventChannels.RuleCreated, this.processRuleCreation.bind(this));
    /* eslint-enable @typescript-eslint/no-misused-promises */
  }

  async processRuleCreation(message: string, channel: string): Promise<void> {
    const rule = JSON.parse(message) as Rule;
    logger.info({ rule, channel }, "rule creation triggered");

    const allUsers = await this.db.listUsers();
    const filteredUsers = allUsers.filter((u) => processCondition(rule.condition, u.attributes));

    logger.info({ users: filteredUsers, rule }, "processed rule");
  }
}
