import type { CreateRuleDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import type { Rule } from "../../domain/rule";

export class RuleService {
  private db: Datastore;
  // private cache: Cache;

  constructor(db: Datastore /* cache: Cache */) {
    this.db = db;
    // this.cache = cache;
  }

  async listRules(): Promise<Rule[]> {
    const rules = await this.db.listRules();

    // TODO: Support query params

    return rules;
  }

  async createRule(rule: CreateRuleDTO): Promise<Rule> {
    return await this.db.createRule(rule);
    // try {
    //   await this.cache.publish(EventChannels.RuleCreated, JSON.stringify(created));
    // } catch (err) {
    //   logger.error({ err, rule }, "failed to publish message about rule creation");
    // }
  }
}
